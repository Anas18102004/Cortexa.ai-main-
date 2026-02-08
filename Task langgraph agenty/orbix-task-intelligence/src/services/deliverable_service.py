"""
Deliverable Service - Database abstraction for Deliverables

This service handles all CRUD operations for Deliverables.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..schemas import Deliverable
from ..models import Deliverable as DeliverableModel


class DeliverableService:
    """Service layer for Deliverable operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_deliverable(self, deliverable: Deliverable) -> Deliverable:
        """Create a new deliverable in the database"""
        try:
            print(f"[DeliverableService] Creating deliverable: {deliverable.deliverable_id}")
            
            db_deliverable = DeliverableModel(
                deliverable_id=deliverable.deliverable_id,
                mission_id=deliverable.mission_id,
                outcome=deliverable.outcome,
                success_criteria=deliverable.success_criteria,
                dependencies=deliverable.dependencies,
                estimated_effort_hours=deliverable.estimated_effort_hours,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.session.add(db_deliverable)
            await self.session.commit()
            await self.session.refresh(db_deliverable)
            
            print(f"[DeliverableService] Deliverable created successfully")
            return deliverable
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[DeliverableService] Error creating deliverable: {str(e)}")
            raise
    
    async def create_deliverables_batch(
        self,
        deliverables: List[Deliverable]
    ) -> List[Deliverable]:
        """Create multiple deliverables in a single transaction"""
        try:
            print(f"[DeliverableService] Creating {len(deliverables)} deliverables")
            
            for deliverable in deliverables:
                db_deliverable = DeliverableModel(
                    deliverable_id=deliverable.deliverable_id,
                    mission_id=deliverable.mission_id,
                    outcome=deliverable.outcome,
                    success_criteria=deliverable.success_criteria,
                    dependencies=deliverable.dependencies,
                    estimated_effort_hours=deliverable.estimated_effort_hours,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                self.session.add(db_deliverable)
            
            await self.session.commit()
            
            print(f"[DeliverableService] All deliverables created successfully")
            return deliverables
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[DeliverableService] Error creating deliverables: {str(e)}")
            raise
    
    async def get_deliverables_by_mission(
        self,
        mission_id: str
    ) -> List[Deliverable]:
        """Get all deliverables for a mission"""
        try:
            result = await self.session.execute(
                select(DeliverableModel).where(DeliverableModel.mission_id == mission_id)
            )
            db_deliverables = result.scalars().all()
            
            deliverables = []
            for db_del in db_deliverables:
                deliverables.append(Deliverable(
                    deliverable_id=db_del.deliverable_id,
                    mission_id=db_del.mission_id,
                    outcome=db_del.outcome,
                    success_criteria=db_del.success_criteria or [],
                    dependencies=db_del.dependencies or [],
                    estimated_effort_hours=db_del.estimated_effort_hours
                ))
            
            return deliverables
            
        except SQLAlchemyError as e:
            print(f"[DeliverableService] Error retrieving deliverables: {str(e)}")
            return []
