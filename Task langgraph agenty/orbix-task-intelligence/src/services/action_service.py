"""
Action Service - Database abstraction for Actions

This service handles all CRUD operations for Actions.
AI agents NEVER write to DB directly - always through this service.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError

from ..schemas import Action, ActionStatus, Decision, DecisionMode
from ..models import Action as ActionModel, Assignment as AssignmentModel


class ActionService:
    """
    Service layer for Action operations.
    
    All database writes go through this service to ensure:
    - Transactional integrity
    - Validation
    - Audit trail
    - Rollback capability
    """
    
    def __init__(self, session: AsyncSession):
        """
        Initialize the service with a database session.
        
        Args:
            session: SQLAlchemy async session
        """
        self.session = session
    
    async def create_action(self, action: Action) -> Action:
        """
        Create a new action in the database.
        
        Args:
            action: Action object to create
        
        Returns:
            Created Action with database ID
        
        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            print(f"[ActionService] Creating action: {action.action_id}")
            
            # Convert Pydantic model to ORM model
            db_action = ActionModel(
                action_id=action.action_id,
                deliverable_id=action.deliverable_id,
                mission_id=action.mission_id,
                description=action.description,
                required_skills=action.required_skills,
                estimated_hours=action.estimated_hours,
                actual_hours=action.actual_hours,
                dependencies=action.dependencies,
                status=action.status.value,
                assigned_to=action.assigned_to,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.session.add(db_action)
            await self.session.commit()
            await self.session.refresh(db_action)
            
            print(f"[ActionService] Action created successfully: {db_action.id}")
            
            # Convert back to Pydantic model
            return Action(
                action_id=db_action.action_id,
                deliverable_id=db_action.deliverable_id,
                mission_id=db_action.mission_id,
                description=db_action.description,
                required_skills=db_action.required_skills or [],
                estimated_hours=db_action.estimated_hours,
                actual_hours=db_action.actual_hours,
                dependencies=db_action.dependencies or [],
                status=ActionStatus(db_action.status),
                assigned_to=db_action.assigned_to
            )
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[ActionService] Error creating action: {str(e)}")
            raise
    
    async def create_action_with_assignment(
        self,
        action: Action,
        assignee: str,
        decision: Decision
    ) -> dict:
        """
        Atomically create an action and assignment.
        
        This is used for AUTO_ASSIGN decisions.
        
        Args:
            action: Action to create
            assignee: User ID of assignee
            decision: Decision object
        
        Returns:
            Dictionary with action and assignment IDs
        
        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            print(f"[ActionService] Creating action with assignment: {action.action_id} → {assignee}")
            
            # Start transaction
            async with self.session.begin_nested():
                # 1. Create action with assigned_to set
                action.assigned_to = assignee
                action.status = ActionStatus.ACCEPTED
                
                db_action = ActionModel(
                    action_id=action.action_id,
                    deliverable_id=action.deliverable_id,
                    mission_id=action.mission_id,
                    description=action.description,
                    required_skills=action.required_skills,
                    estimated_hours=action.estimated_hours,
                    status=ActionStatus.ACCEPTED.value,
                    assigned_to=assignee,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                self.session.add(db_action)
                await self.session.flush()
                
                # 2. Create assignment
                assignment_id = f"assign_{action.action_id}"
                db_assignment = AssignmentModel(
                    assignment_id=assignment_id,
                    action_id=action.action_id,
                    user_id=assignee,
                    confidence_score=decision.confidence_score,
                    risk_level=decision.risk_level.value,
                    market_response="ACCEPT",
                    justification_codes=[j.value for j in decision.justification_codes],
                    assigned_at=datetime.utcnow()
                )
                self.session.add(db_assignment)
            
            await self.session.commit()
            
            print(f"[ActionService] Action and assignment created successfully")
            
            return {
                "action_id": action.action_id,
                "assignment_id": assignment_id,
                "assignee": assignee,
                "status": "created"
            }
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[ActionService] Error creating action with assignment: {str(e)}")
            raise
    
    async def get_action_by_id(self, action_id: str) -> Optional[Action]:
        """
        Retrieve an action by ID.
        
        Args:
            action_id: Action ID
        
        Returns:
            Action if found, None otherwise
        """
        try:
            print(f"[ActionService] Retrieving action: {action_id}")
            
            result = await self.session.execute(
                select(ActionModel).where(ActionModel.action_id == action_id)
            )
            db_action = result.scalar_one_or_none()
            
            if db_action:
                return Action(
                    action_id=db_action.action_id,
                    deliverable_id=db_action.deliverable_id,
                    mission_id=db_action.mission_id,
                    description=db_action.description,
                    required_skills=db_action.required_skills or [],
                    estimated_hours=db_action.estimated_hours,
                    actual_hours=db_action.actual_hours,
                    dependencies=db_action.dependencies or [],
                    status=ActionStatus(db_action.status),
                    assigned_to=db_action.assigned_to
                )
            
            return None
            
        except SQLAlchemyError as e:
            print(f"[ActionService] Error retrieving action: {str(e)}")
            return None
        
        return None
    
    async def update_action_status(
        self,
        action_id: str,
        status: ActionStatus
    ) -> bool:
        """
        Update action status.
        
        Args:
            action_id: Action ID
            status: New status
        
        Returns:
            True if updated, False otherwise
        """
        try:
            print(f"[ActionService] Updating action {action_id} status to {status.value}")
            
            result = await self.session.execute(
                update(ActionModel)
                .where(ActionModel.action_id == action_id)
                .values(status=status.value, updated_at=datetime.utcnow())
            )
            await self.session.commit()
            
            updated = result.rowcount > 0
            print(f"[ActionService] Action status updated: {updated}")
            return updated
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[ActionService] Error updating action status: {str(e)}")
            return False
    
    async def get_actions_by_mission(self, mission_id: str) -> List[Action]:
        """
        Get all actions for a mission.
        
        Args:
            mission_id: Mission ID
        
        Returns:
            List of actions
        """
        try:
            print(f"[ActionService] Retrieving actions for mission: {mission_id}")
            
            result = await self.session.execute(
                select(ActionModel).where(ActionModel.mission_id == mission_id)
            )
            db_actions = result.scalars().all()
            
            actions = []
            for db_action in db_actions:
                actions.append(Action(
                    action_id=db_action.action_id,
                    deliverable_id=db_action.deliverable_id,
                    mission_id=db_action.mission_id,
                    description=db_action.description,
                    required_skills=db_action.required_skills or [],
                    estimated_hours=db_action.estimated_hours,
                    actual_hours=db_action.actual_hours,
                    dependencies=db_action.dependencies or [],
                    status=ActionStatus(db_action.status),
                    assigned_to=db_action.assigned_to
                ))
            
            print(f"[ActionService] Found {len(actions)} actions")
            return actions
            
        except SQLAlchemyError as e:
            print(f"[ActionService] Error retrieving actions: {str(e)}")
            return []
    
    async def get_actions_by_assignee(self, user_id: str) -> List[Action]:
        """
        Get all actions assigned to a user.
        
        Args:
            user_id: User ID
        
        Returns:
            List of actions
        """
        try:
            print(f"[ActionService] Retrieving actions for user: {user_id}")
            
            result = await self.session.execute(
                select(ActionModel).where(ActionModel.assigned_to == user_id)
            )
            db_actions = result.scalars().all()
            
            actions = []
            for db_action in db_actions:
                actions.append(Action(
                    action_id=db_action.action_id,
                    deliverable_id=db_action.deliverable_id,
                    mission_id=db_action.mission_id,
                    description=db_action.description,
                    required_skills=db_action.required_skills or [],
                    estimated_hours=db_action.estimated_hours,
                    actual_hours=db_action.actual_hours,
                    dependencies=db_action.dependencies or [],
                    status=ActionStatus(db_action.status),
                    assigned_to=db_action.assigned_to
                ))
            
            print(f"[ActionService] Found {len(actions)} actions")
            return actions
            
        except SQLAlchemyError as e:
            print(f"[ActionService] Error retrieving actions: {str(e)}")
            return []
        
        return []


class ProposalService:
    """Service for managing action proposals (PROPOSE mode)"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_proposal(
        self,
        action: Action,
        decision: Decision
    ) -> dict:
        """
        Create a proposal for manager review.
        
        Args:
            action: Action to propose
            decision: Decision object
        
        Returns:
            Proposal ID and status
        """
        print(f"[ProposalService] Creating proposal for action: {action.action_id}")
        
        # In production:
        # 1. Create proposal record
        # 2. Notify manager
        # 3. Set status to PENDING_APPROVAL
        
        return {
            "proposal_id": f"prop_{action.action_id}",
            "action_id": action.action_id,
            "status": "pending_approval"
        }


class EscalationService:
    """Service for managing escalations (ESCALATE mode)"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_escalation(
        self,
        action: Action,
        decision: Decision,
        reason: str
    ) -> dict:
        """
        Create an escalation for manager intervention.
        
        Args:
            action: Action to escalate
            decision: Decision object
            reason: Escalation reason
        
        Returns:
            Escalation ID and status
        """
        print(f"[EscalationService] Creating escalation for action: {action.action_id}")
        print(f"[EscalationService] Reason: {reason}")
        
        # In production:
        # 1. Create escalation record
        # 2. Notify manager and stakeholders
        # 3. Set priority based on risk level
        
        return {
            "escalation_id": f"esc_{action.action_id}",
            "action_id": action.action_id,
            "reason": reason,
            "status": "escalated"
        }
