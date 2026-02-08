"""
Mission Service - Database abstraction for Missions

This service handles all CRUD operations for Missions.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError

from ..schemas import Mission, MissionStatus
from ..models import Mission as MissionModel


class MissionService:
    """Service layer for Mission operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_mission(self, mission: Mission) -> Mission:
        """Create a new mission in the database"""
        try:
            print(f"[MissionService] Creating mission: {mission.mission_id}")
            
            db_mission = MissionModel(
                mission_id=mission.mission_id,
                org_id=mission.org_id,
                goal=mission.goal,
                success_criteria=mission.success_criteria,
                constraints=mission.constraints,
                status=mission.status.value,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.session.add(db_mission)
            await self.session.commit()
            await self.session.refresh(db_mission)
            
            print(f"[MissionService] Mission created successfully")
            return mission
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[MissionService] Error creating mission: {str(e)}")
            raise
    
    async def get_mission_by_id(self, mission_id: str) -> Optional[Mission]:
        """Retrieve a mission by ID"""
        try:
            result = await self.session.execute(
                select(MissionModel).where(MissionModel.mission_id == mission_id)
            )
            db_mission = result.scalar_one_or_none()
            
            if db_mission:
                return Mission(
                    mission_id=db_mission.mission_id,
                    org_id=db_mission.org_id,
                    goal=db_mission.goal,
                    success_criteria=db_mission.success_criteria,
                    constraints=db_mission.constraints or [],
                    status=MissionStatus(db_mission.status)
                )
            
            return None
            
        except SQLAlchemyError as e:
            print(f"[MissionService] Error retrieving mission: {str(e)}")
            return None
    
    async def update_mission_status(
        self,
        mission_id: str,
        status: MissionStatus
    ) -> bool:
        """Update mission status"""
        try:
            result = await self.session.execute(
                update(MissionModel)
                .where(MissionModel.mission_id == mission_id)
                .values(status=status.value, updated_at=datetime.utcnow())
            )
            await self.session.commit()
            
            return result.rowcount > 0
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            print(f"[MissionService] Error updating mission: {str(e)}")
            return False
