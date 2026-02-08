"""
Project Orchestrator - Main integration between Projects and CORTEXA AI

This orchestrator:
1. Fetches project from database
2. Fetches employees and capacity
3. Builds AI inputs (RawIntent, OrgContext, CapacityData)
4. Executes CORTEXA AI pipeline
5. Stores assignments in database
6. Returns complete results
"""

from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import ProjectStatusEnum
from ..schemas import OrgContext, PolicyConfig, RiskLevel
from ..orbix_core import CortexaTaskIntelligenceCoordinator
from .project_service import ProjectService
from .employee_service import EmployeeService
from .assignment_service import AssignmentService


class ProjectOrchestrator:
    """Main orchestrator for project-based AI task assignment"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        self.coordinator = CortexaTaskIntelligenceCoordinator()
    
    async def confirm_and_assign(
        session: AsyncSession,
        project_id: str,
        org_id: str,
        policy_config: PolicyConfig = None
    ) -> Dict[str, Any]:
        """
        Confirm a project and trigger AI-based task assignment
        
        This is the main entry point for the project-based workflow.
        
        Args:
            session: Database session
            project_id: Project ID to confirm
            org_id: Organization ID
            policy_config: Optional policy configuration (uses default if not provided)
            
        Returns:
            Dictionary with complete results including mission, deliverables, assignments
        """
        print(f"\n{'='*80}")
        print(f"PROJECT ORCHESTRATOR - Starting for project: {project_id}")
        print(f"{'='*80}\n")
        
        # Step 1: Fetch and confirm project
        print("[Step 1/6] Fetching project...")
        project = await ProjectService.get_project(session, project_id)
        
        if not project:
            raise ValueError(f"Project not found: {project_id}")
        
        if project.org_id != org_id:
            raise ValueError(f"Project {project_id} does not belong to organization {org_id}")
        
        # Confirm project
        project = await ProjectService.confirm_project(session, project_id)
        print(f"✓ Project confirmed: {project.name}")
        
        # Step 2: Fetch employees
        print("\n[Step 2/6] Fetching employees...")
        employees = await EmployeeService.get_all_employees(session, org_id, is_active=True)
        print(f"✓ Found {len(employees)} active employees")
        
        if not employees:
            raise ValueError(f"No active employees found for organization {org_id}")
        
        # Step 3: Build AI inputs
        print("\n[Step 3/6] Building AI inputs...")
        
        # Convert project to RawIntent
        raw_intent = ProjectService.project_to_raw_intent(project)
        print(f"✓ Created RawIntent from project")
        
        # Convert employees to OrgContext
        org_members = await EmployeeService.employees_to_org_context(session, employees)
        
        # Use provided policy or default
        if not policy_config:
            policy_config = PolicyConfig(
                auto_assign_enabled=True,
                min_confidence=0.8,
                max_risk=RiskLevel.LOW
            )
        
        org_context = OrgContext(
            org_id=org_id,
            policies=policy_config,
            org_graph=org_members
        )
        print(f"✓ Created OrgContext with {len(org_members)} members")
        
        # Convert employees to CapacityData
        capacity_data = await EmployeeService.employees_to_capacity_data(session, employees)
        print(f"✓ Created CapacityData for {len(capacity_data.capacity_map)} employees")
        
        # Step 4: Execute CORTEXA AI
        print("\n[Step 4/6] Executing CORTEXA AI pipeline...")
        result = await ProjectOrchestrator().coordinator.execute(
            raw_intent=raw_intent,
            org_context=org_context,
            capacity_data=capacity_data
        )
        print(f"✓ AI execution complete")
        print(f"  - Mission: {result.mission.mission_id}")
        print(f"  - Deliverables: {len(result.deliverables)}")
        print(f"  - Actions: {len(result.actions)}")
        
        # Step 5: Store assignments in database
        print("\n[Step 5/6] Storing assignments...")
        
        # Extract actions and decisions
        actions = [ad.action for ad in result.actions]
        decisions = [ad.decision for ad in result.actions]
        
        # Create assignments
        assignments = await AssignmentService.create_assignments_bulk(
            session, project_id, actions, decisions
        )
        print(f"✓ Created {len(assignments)} assignments")
        
        # Update employee capacity
        for assignment in assignments:
            if assignment.estimated_hours:
                await EmployeeService.allocate_hours(
                    session, assignment.user_id, assignment.estimated_hours
                )
        print(f"✓ Updated employee capacity")
        
        # Step 6: Update project status
        print("\n[Step 6/6] Updating project status...")
        await ProjectService.update_project_status(session, project_id, ProjectStatusEnum.IN_PROGRESS)
        print(f"✓ Project status updated to IN_PROGRESS")
        
        # Build response
        print(f"\n{'='*80}")
        print(f"PROJECT ORCHESTRATOR - Complete")
        print(f"{'='*80}\n")
        
        # Calculate summary statistics
        auto_assigned = sum(1 for d in decisions if d.mode.value == "AUTO_ASSIGN")
        proposed = sum(1 for d in decisions if d.mode.value == "PROPOSE")
        escalated = sum(1 for d in decisions if d.mode.value == "ESCALATE")
        total_hours = sum(a.estimated_hours or 0 for a in actions)
        employees_involved = len(set(a.user_id for a in assignments))
        
        return {
            "success": True,
            "project_id": project_id,
            "project_name": project.name,
            "status": project.status.value,
            "mission": {
                "mission_id": result.mission.mission_id,
                "goal": result.mission.goal,
                "success_criteria": result.mission.success_criteria
            },
            "deliverables": [
                {
                    "deliverable_id": d.deliverable_id,
                    "outcome": d.outcome,
                    "estimated_effort_hours": d.estimated_effort_hours
                }
                for d in result.deliverables
            ],
            "assignments": [
                {
                    "assignment_id": a.assignment_id,
                    "action_id": a.action_id,
                    "action_description": a.action_description,
                    "assigned_to": {
                        "user_id": a.user_id,
                        "name": next((e.name for e in employees if e.user_id == a.user_id), "Unknown")
                    },
                    "decision_mode": a.decision_mode.value,
                    "confidence_score": a.confidence_score,
                    "risk_level": a.risk_level.value,
                    "estimated_hours": a.estimated_hours,
                    "status": a.status.value,
                    "explanation": a.metadata.get("reasoning_summary", "")
                }
                for a in assignments
            ],
            "summary": {
                "total_actions": len(actions),
                "auto_assigned": auto_assigned,
                "proposed": proposed,
                "escalated": escalated,
                "total_estimated_hours": total_hours,
                "employees_involved": employees_involved
            }
        }
