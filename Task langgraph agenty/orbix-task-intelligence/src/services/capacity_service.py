"""
Capacity Service - Capacity data management

This service handles capacity calculations and historical workload analysis.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
import statistics

from ..schemas import CapacityVector, RiskLevel


class CapacityService:
    """
    Service layer for capacity management.
    
    Responsibilities:
    - Fetch current capacity data
    - Calculate capacity metrics
    - Update capacity after work completion
    - Analyze historical workload patterns
    """
    
    def __init__(self, session: AsyncSession):
        """
        Initialize the service with a database session.
        
        Args:
            session: SQLAlchemy async session
        """
        self.session = session
    
    async def get_user_capacity(self, user_id: str) -> Optional[CapacityVector]:
        """
        Get current capacity vector for a user.
        
        Args:
            user_id: User ID
        
        Returns:
            CapacityVector if available, None otherwise
        """
        print(f"[CapacityService] Fetching capacity for user: {user_id}")
        
        # In production, this would:
        # 1. Query current commitments
        # 2. Calculate effective free hours
        # 3. Get historical volatility
        # 4. Assess overload risk
        
        # TODO: Implement database query
        
        return None
    
    async def calculate_capacity_vector(
        self,
        user_id: str,
        total_hours_per_week: float = 40.0,
        buffer_hours: float = 8.0
    ) -> CapacityVector:
        """
        Calculate capacity vector for a user.
        
        Args:
            user_id: User ID
            total_hours_per_week: Total available hours per week
            buffer_hours: Buffer hours to reserve
        
        Returns:
            Calculated CapacityVector
        """
        print(f"[CapacityService] Calculating capacity for user: {user_id}")
        
        # Get committed hours
        committed_hours = await self._get_committed_hours(user_id)
        
        # Calculate effective free hours
        effective_free_hours = total_hours_per_week - committed_hours - buffer_hours
        effective_free_hours = max(0.0, effective_free_hours)  # Can't be negative
        
        # Get historical workload for volatility calculation
        historical_workload = await self._get_historical_workload(user_id, weeks=12)
        
        # Calculate volatility index
        volatility_index = self._calculate_volatility(historical_workload)
        
        # Assess overload risk
        overload_risk = self._assess_overload_risk(
            effective_free_hours,
            total_hours_per_week,
            volatility_index
        )
        
        return CapacityVector(
            user_id=user_id,
            effective_free_hours=effective_free_hours,
            volatility_index=volatility_index,
            overload_risk=overload_risk
        )
    
    async def _get_committed_hours(self, user_id: str) -> float:
        """Get currently committed hours for a user"""
        # TODO: Query database for active assignments
        # Sum estimated_hours for all IN_PROGRESS actions
        
        return 0.0  # Placeholder
    
    async def _get_historical_workload(
        self,
        user_id: str,
        weeks: int = 12
    ) -> List[float]:
        """
        Get historical weekly workload for a user.
        
        Args:
            user_id: User ID
            weeks: Number of weeks to look back
        
        Returns:
            List of weekly hours worked
        """
        # TODO: Query database for completed work
        # Group by week, sum hours
        
        # Placeholder: Return some sample data
        return [35.0, 42.0, 38.0, 45.0, 40.0, 36.0, 41.0, 39.0, 43.0, 37.0, 40.0, 38.0]
    
    def _calculate_volatility(self, weekly_hours: List[float]) -> float:
        """
        Calculate volatility index from historical workload.
        
        Volatility = std_dev / mean
        
        Args:
            weekly_hours: List of weekly hours
        
        Returns:
            Volatility index (0.0 to 1.0)
        """
        if not weekly_hours or len(weekly_hours) < 2:
            return 0.0
        
        mean_hours = statistics.mean(weekly_hours)
        
        if mean_hours == 0:
            return 0.0
        
        std_dev = statistics.stdev(weekly_hours)
        volatility = std_dev / mean_hours
        
        # Cap at 1.0
        return min(volatility, 1.0)
    
    def _assess_overload_risk(
        self,
        effective_free_hours: float,
        total_hours: float,
        volatility_index: float
    ) -> RiskLevel:
        """
        Assess overload risk based on capacity and volatility.
        
        Args:
            effective_free_hours: Available hours
            total_hours: Total hours per week
            volatility_index: Volatility index
        
        Returns:
            RiskLevel (LOW, MEDIUM, HIGH)
        """
        # Calculate utilization percentage
        utilization = ((total_hours - effective_free_hours) / total_hours) * 100
        
        # Risk assessment logic
        if utilization >= 90 or volatility_index >= 0.3:
            return RiskLevel.HIGH
        elif utilization >= 80 or volatility_index >= 0.15:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    async def update_capacity_after_completion(
        self,
        user_id: str,
        action_id: str,
        actual_hours: float
    ) -> None:
        """
        Update capacity metrics after action completion.
        
        Args:
            user_id: User ID
            action_id: Completed action ID
            actual_hours: Actual hours spent
        """
        print(f"[CapacityService] Updating capacity for {user_id} after completing {action_id}")
        
        # In production:
        # 1. Record actual hours in worklog
        # 2. Recalculate capacity vector
        # 3. Update volatility metrics
        # 4. Trigger learning if estimate was way off
        
        # TODO: Implement
        pass
    
    async def get_team_capacity(self, team: str) -> Dict[str, CapacityVector]:
        """
        Get capacity for all members of a team.
        
        Args:
            team: Team identifier
        
        Returns:
            Dictionary of user_id -> CapacityVector
        """
        print(f"[CapacityService] Fetching capacity for team: {team}")
        
        # TODO: Implement
        
        return {}
