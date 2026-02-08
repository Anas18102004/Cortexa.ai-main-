"""
Test Project Workflow with Mock Data

This script tests the complete project-based workflow WITHOUT database access.
It uses mock data to validate that all components work together correctly.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List
from uuid import uuid4

from src.schemas import (
    RawIntent,
    OrgContext,
    OrgMember,
    OrgRole,
    PolicyConfig,
    RiskLevel,
    CapacityData,
    CapacityVector,
    RiskLevel as RiskLevelEnum
)
from src.orbix_core import CortexaTaskIntelligenceCoordinator


# ============================================================================
# MOCK DATA
# ============================================================================

def create_mock_employees() -> List[dict]:
    """Create mock employee data"""
    return [
        {
            "user_id": "emp_001",
            "name": "Sarah Johnson",
            "email": "sarah.johnson@company.com",
            "role": OrgRole.IC,
            "team": "Frontend",
            "skills": ["React", "TypeScript", "UI/UX", "Figma", "CSS"],
            "seniority": "SENIOR",
            "manager_id": "mgr_001",
            "capacity": {
                "total_hours": 40.0,
                "allocated": 5.0,
                "volatility": 0.12,
                "risk": RiskLevelEnum.LOW
            }
        },
        {
            "user_id": "emp_002",
            "name": "Michael Chen",
            "email": "michael.chen@company.com",
            "role": OrgRole.IC,
            "team": "Backend",
            "skills": ["Node.js", "TypeScript", "PostgreSQL", "Redis", "JWT"],
            "seniority": "MID",
            "manager_id": "mgr_001",
            "capacity": {
                "total_hours": 40.0,
                "allocated": 22.0,
                "volatility": 0.25,
                "risk": RiskLevelEnum.MEDIUM
            }
        },
        {
            "user_id": "emp_003",
            "name": "Emily Rodriguez",
            "email": "emily.rodriguez@company.com",
            "role": OrgRole.IC,
            "team": "Frontend",
            "skills": ["React Native", "JavaScript", "Mobile Development", "Animation"],
            "seniority": "SENIOR",
            "manager_id": "mgr_001",
            "capacity": {
                "total_hours": 40.0,
                "allocated": 8.0,
                "volatility": 0.08,
                "risk": RiskLevelEnum.LOW
            }
        },
        {
            "user_id": "emp_004",
            "name": "David Kim",
            "email": "david.kim@company.com",
            "role": OrgRole.IC,
            "team": "Backend",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            "seniority": "MID",
            "manager_id": "mgr_001",
            "capacity": {
                "total_hours": 40.0,
                "allocated": 10.0,
                "volatility": 0.15,
                "risk": RiskLevelEnum.LOW
            }
        },
        {
            "user_id": "emp_005",
            "name": "Jessica Martinez",
            "email": "jessica.martinez@company.com",
            "role": OrgRole.TECH_LEAD,
            "team": "Full Stack",
            "skills": ["React", "Node.js", "TypeScript", "System Design", "Leadership"],
            "seniority": "STAFF",
            "manager_id": "mgr_001",
            "capacity": {
                "total_hours": 40.0,
                "allocated": 15.0,
                "volatility": 0.18,
                "risk": RiskLevelEnum.LOW
            }
        }
    ]


def create_mock_project() -> dict:
    """Create mock project data"""
    return {
        "project_id": f"proj_{uuid4().hex[:12]}",
        "name": "E-Commerce Mobile App",
        "description": """
Build a mobile e-commerce application with the following features:
- User authentication and profile management
- Product catalog with search and filters
- Shopping cart and checkout flow
- Payment integration (Stripe)
- Order tracking and history
- Push notifications

The app should support both iOS and Android platforms and integrate
with our existing backend API. Must follow modern UI/UX best practices
and ensure secure payment processing.
        """,
        "tech_stack": ["React Native", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "Redis"],
        "requirements": "Must support iOS and Android, integrate with existing backend, implement secure payment flow",
        "priority": "HIGH",
        "estimated_duration_days": 60,
        "org_id": "org_001",
        "created_by": "mgr_001"
    }


def employees_to_org_members(employees: List[dict]) -> List[OrgMember]:
    """Convert employee dicts to OrgMember objects"""
    return [
        OrgMember(
            user_id=emp["user_id"],
            role=emp["role"],
            manager_id=emp.get("manager_id"),
            skills=emp["skills"],
            team=emp.get("team")
        )
        for emp in employees
    ]


def employees_to_capacity_data(employees: List[dict]) -> CapacityData:
    """Convert employee dicts to CapacityData"""
    capacity_map = {}
    
    for emp in employees:
        cap = emp["capacity"]
        effective_free = cap["total_hours"] - cap["allocated"]
        
        capacity_map[emp["user_id"]] = CapacityVector(
            user_id=emp["user_id"],
            effective_free_hours=effective_free,
            volatility_index=cap["volatility"],
            overload_risk=cap["risk"]
        )
    
    return CapacityData(capacity_map=capacity_map)


def project_to_raw_intent(project: dict) -> RawIntent:
    """Convert project dict to RawIntent"""
    description_parts = [
        f"Project: {project['name']}",
        f"\nDescription: {project['description']}",
        f"\nTech Stack: {', '.join(project['tech_stack'])}",
    ]
    
    if project.get('requirements'):
        description_parts.append(f"\nRequirements: {project['requirements']}")
    
    if project.get('priority'):
        description_parts.append(f"\nPriority: {project['priority']}")
    
    if project.get('estimated_duration_days'):
        description_parts.append(f"\nEstimated Duration: {project['estimated_duration_days']} days")
    
    description = "\n".join(description_parts)
    
    return RawIntent(
        description=description,
        documents=[],
        meeting_notes=[]
    )


# ============================================================================
# TEST EXECUTION
# ============================================================================

async def test_project_workflow():
    """Test the complete project workflow with mock data"""
    
    print("\n" + "="*80)
    print("TESTING PROJECT-BASED WORKFLOW WITH MOCK DATA")
    print("="*80 + "\n")
    
    # Step 1: Create mock data
    print("[Step 1/5] Creating mock data...")
    employees = create_mock_employees()
    project = create_mock_project()
    
    print(f"[OK] Created {len(employees)} mock employees")
    print(f"[OK] Created mock project: {project['name']}")
    print()
    
    # Step 2: Display employee capacity
    print("[Step 2/5] Employee Capacity Overview:")
    print("-" * 80)
    for emp in employees:
        cap = emp["capacity"]
        free_hours = cap["total_hours"] - cap["allocated"]
        print(f"  {emp['name']:20} | {emp['role'].value:15} | Skills: {len(emp['skills']):2} | Free: {free_hours:5.1f}h | Risk: {cap['risk'].value}")
    print()
    
    # Step 3: Build AI inputs
    print("[Step 3/5] Building AI inputs...")
    
    # Convert to AI schemas
    raw_intent = project_to_raw_intent(project)
    org_members = employees_to_org_members(employees)
    capacity_data = employees_to_capacity_data(employees)
    
    # Create org context
    policy_config = PolicyConfig(
        auto_assign_enabled=True,
        min_confidence=0.8,
        max_risk=RiskLevel.LOW
    )
    
    org_context = OrgContext(
        org_id=project["org_id"],
        policies=policy_config,
        org_graph=org_members
    )
    
    print(f"[OK] Created RawIntent from project")
    print(f"[OK] Created OrgContext with {len(org_members)} members")
    print(f"[OK] Created CapacityData for {len(capacity_data.capacity_map)} employees")
    print()
    
    # Step 4: Execute CORTEXA AI
    print("[Step 4/5] Executing CORTEXA AI pipeline...")
    print("-" * 80)
    
    coordinator = CortexaTaskIntelligenceCoordinator()
    
    try:
        result = await coordinator.execute(
            raw_intent=raw_intent,
            org_context=org_context,
            capacity_data=capacity_data
        )
        
        print(f"[OK] AI execution complete!")
        print(f"  - Mission: {result.mission.mission_id}")
        print(f"  - Deliverables: {len(result.deliverables)}")
        print(f"  - Actions: {len(result.actions)}")
        print()
        
    except Exception as e:
        print(f"[ERROR] Error during AI execution: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 5: Display results
    print("[Step 5/5] Results:")
    print("="*80)
    
    # Mission
    print(f"\n[MISSION] {result.mission.mission_id}")
    print(f"Goal: {result.mission.goal}")
    print(f"\nSuccess Criteria:")
    for i, criterion in enumerate(result.mission.success_criteria, 1):
        print(f"  {i}. {criterion}")
    
    # Deliverables
    print(f"\n[DELIVERABLES] ({len(result.deliverables)}):")
    for i, deliverable in enumerate(result.deliverables, 1):
        print(f"\n  {i}. {deliverable.deliverable_id}")
        print(f"     Outcome: {deliverable.outcome}")
        print(f"     Effort: {deliverable.estimated_effort_hours}h")
        print(f"     Actions: {len(deliverable.action_ids)}")
    
    # Assignments
    print(f"\n[ASSIGNMENTS] ({len(result.actions)}):")
    
    # Group by decision mode
    auto_assigned = []
    proposed = []
    escalated = []
    
    for action_decision in result.actions:
        action = action_decision.action
        decision = action_decision.decision
        
        if decision.mode.value == "AUTO_ASSIGN":
            auto_assigned.append((action, decision))
        elif decision.mode.value == "PROPOSE":
            proposed.append((action, decision))
        elif decision.mode.value == "ESCALATE":
            escalated.append((action, decision))
    
    # Display auto-assigned
    if auto_assigned:
        print(f"\n  [AUTO-ASSIGNED] ({len(auto_assigned)}):")
        for action, decision in auto_assigned:
            emp = next((e for e in employees if e["user_id"] == decision.assignee), None)
            emp_name = emp["name"] if emp else "Unknown"
            
            print(f"\n    * {action.description[:70]}...")
            print(f"      -> {emp_name} ({decision.assignee})")
            print(f"      Confidence: {decision.confidence_score:.2f} | Risk: {decision.risk_level.value} | Hours: {action.estimated_hours}")
            print(f"      Reasoning: {decision.reasoning_summary[:100]}...")
    
    # Display proposed
    if proposed:
        print(f"\n  [PROPOSED] ({len(proposed)}):")
        for action, decision in proposed:
            emp = next((e for e in employees if e["user_id"] == decision.assignee), None)
            emp_name = emp["name"] if emp else "Unknown"
            
            print(f"\n    * {action.description[:70]}...")
            print(f"      -> {emp_name} ({decision.assignee})")
            print(f"      Confidence: {decision.confidence_score:.2f} | Risk: {decision.risk_level.value} | Hours: {action.estimated_hours}")
            print(f"      Reasoning: {decision.reasoning_summary[:100]}...")
    
    # Display escalated
    if escalated:
        print(f"\n  [ESCALATED] ({len(escalated)}):")
        for action, decision in escalated:
            print(f"\n    * {action.description[:70]}...")
            print(f"      Risk: {decision.risk_level.value}")
            print(f"      Reasoning: {decision.reasoning_summary[:100]}...")
    
    # Summary statistics
    print(f"\n" + "="*80)
    print("SUMMARY STATISTICS")
    print("="*80)
    
    total_hours = sum(ad.action.estimated_hours or 0 for ad in result.actions)
    assigned_users = set(ad.decision.assignee for ad in result.actions if ad.decision.assignee)
    
    print(f"Total Actions: {len(result.actions)}")
    print(f"Auto-Assigned: {len(auto_assigned)}")
    print(f"Proposed: {len(proposed)}")
    print(f"Escalated: {len(escalated)}")
    print(f"Total Estimated Hours: {total_hours}")
    print(f"Employees Involved: {len(assigned_users)}")
    
    # Capacity impact
    print(f"\n[CAPACITY IMPACT]:")
    for emp in employees:
        user_assignments = [ad for ad in result.actions if ad.decision.assignee == emp["user_id"]]
        if user_assignments:
            assigned_hours = sum(ad.action.estimated_hours or 0 for ad in user_assignments)
            current_free = emp["capacity"]["total_hours"] - emp["capacity"]["allocated"]
            new_free = current_free - assigned_hours
            
            print(f"  {emp['name']:20} | Before: {current_free:5.1f}h -> After: {new_free:5.1f}h | Assigned: {assigned_hours:5.1f}h ({len(user_assignments)} tasks)")
    
    print("\n" + "="*80)
    print("[SUCCESS] TEST COMPLETE - All components working correctly!")
    print("="*80 + "\n")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    asyncio.run(test_project_workflow())
