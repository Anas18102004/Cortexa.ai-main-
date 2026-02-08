"""
Assignment Service - Business logic for project assignments

This service handles:
- Creating assignments from AI decisions
- Updating assignment status
- Tracking assignment lifecycle
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from ..models import ProjectAssignment, AssignmentStatusEnum, DecisionModeEnum, RiskLevelEnum
from ..schemas import Decision, Action


class AssignmentService:
    """Service for managing project assignments"""
    
    @staticmethod
    async def create_assignment(
        session: AsyncSession,
        project_id: str,
        action: Action,
        decision: Decision,
        user_id: str
    ) -> ProjectAssignment:
        """
        Create a project assignment from AI decision
        
        Args:
            session: Database session
            project_id: Project ID
            action: Action object from AI
            decision: Decision object from AI
            user_id: Assigned user ID
            
        Returns:
            Created ProjectAssignment object
        """
        assignment = ProjectAssignment(
            assignment_id=f"assign_{uuid4().hex[:12]}",
            project_id=project_id,
            action_id=action.action_id,
            user_id=user_id,
            action_description=action.description,
            required_skills=action.required_skills,
            estimated_hours=action.estimated_hours,
            decision_mode=decision.mode,
            confidence_score=decision.confidence_score,
            risk_level=decision.risk_level,
            status=AssignmentStatusEnum.PENDING,
            metadata={
                "justification_codes": [code.value for code in decision.justification_codes],
                "reasoning_summary": decision.reasoning_summary
            }
        )
        
        session.add(assignment)
        await session.commit()
        await session.refresh(assignment)
        
        print(f"[AssignmentService] Created assignment: {assignment.assignment_id} for {user_id}")
        
        return assignment
    
    @staticmethod
    async def create_assignments_bulk(
        session: AsyncSession,
        project_id: str,
        actions: List[Action],
        decisions: List[Decision]
    ) -> List[ProjectAssignment]:
        """
        Create multiple assignments from AI decisions
        
        Args:
            session: Database session
            project_id: Project ID
            actions: List of Action objects
            decisions: List of Decision objects
            
        Returns:
            List of created ProjectAssignment objects
        """
        # Create action lookup
        action_map = {action.action_id: action for action in actions}
        
        assignments = []
        
        for decision in decisions:
            action = action_map.get(decision.action_id)
            
            if not action:
                print(f"[AssignmentService] Warning: Action {decision.action_id} not found")
                continue
            
            # Only create assignment if there's an assignee
            if decision.assignee:
                assignment = await AssignmentService.create_assignment(
                    session, project_id, action, decision, decision.assignee
                )
                assignments.append(assignment)
            else:
                print(f"[AssignmentService] Skipping {decision.action_id}: No assignee (mode: {decision.mode.value})")
        
        return assignments
    
    @staticmethod
    async def get_assignment(
        session: AsyncSession,
        assignment_id: str
    ) -> Optional[ProjectAssignment]:
        """
        Get assignment by ID
        
        Args:
            session: Database session
            assignment_id: Assignment ID
            
        Returns:
            ProjectAssignment object or None
        """
        result = await session.execute(
            select(ProjectAssignment).where(ProjectAssignment.assignment_id == assignment_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_project_assignments(
        session: AsyncSession,
        project_id: str
    ) -> List[ProjectAssignment]:
        """
        Get all assignments for a project
        
        Args:
            session: Database session
            project_id: Project ID
            
        Returns:
            List of ProjectAssignment objects
        """
        result = await session.execute(
            select(ProjectAssignment).where(ProjectAssignment.project_id == project_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def update_assignment_status(
        session: AsyncSession,
        assignment_id: str,
        status: AssignmentStatusEnum
    ) -> ProjectAssignment:
        """
        Update assignment status
        
        Args:
            session: Database session
            assignment_id: Assignment ID
            status: New status
            
        Returns:
            Updated ProjectAssignment object
        """
        assignment = await AssignmentService.get_assignment(session, assignment_id)
        
        if not assignment:
            raise ValueError(f"Assignment not found: {assignment_id}")
        
        assignment.status = status
        
        if status == AssignmentStatusEnum.ACCEPTED:
            assignment.accepted_at = datetime.utcnow()
        elif status == AssignmentStatusEnum.COMPLETED:
            assignment.completed_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(assignment)
        
        print(f"[AssignmentService] Updated assignment {assignment_id} status to {status.value}")
        
        return assignment
    
    @staticmethod
    async def get_user_assignments(
        session: AsyncSession,
        user_id: str,
        status: Optional[AssignmentStatusEnum] = None
    ) -> List[ProjectAssignment]:
        """
        Get all assignments for a user
        
        Args:
            session: Database session
            user_id: User ID
            status: Optional status filter
            
        Returns:
            List of ProjectAssignment objects
        """
        query = select(ProjectAssignment).where(ProjectAssignment.user_id == user_id)
        
        if status:
            query = query.where(ProjectAssignment.status == status)
        
        result = await session.execute(query)
        return result.scalars().all()
