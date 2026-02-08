"""
Employee Service - Business logic for employee and capacity management

This service handles:
- Employee CRUD operations
- Capacity tracking and updates
- Availability checking
- Converting employees to OrgContext for AI
"""

from typing import Optional, List, Dict
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Employee, EmployeeCapacity, RiskLevelEnum
from ..schemas import OrgMember, OrgRole, CapacityVector, CapacityData


class EmployeeService:
    """Service for managing employees and capacity"""
    
    @staticmethod
    async def get_employee(
        session: AsyncSession,
        user_id: str
    ) -> Optional[Employee]:
        """
        Get employee by user_id
        
        Args:
            session: Database session
            user_id: User ID
            
        Returns:
            Employee object or None
        """
        result = await session.execute(
            select(Employee).where(Employee.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_all_employees(
        session: AsyncSession,
        org_id: str,
        is_active: bool = True
    ) -> List[Employee]:
        """
        Get all employees for an organization
        
        Args:
            session: Database session
            org_id: Organization ID
            is_active: Filter by active status
            
        Returns:
            List of Employee objects
        """
        query = select(Employee).where(Employee.org_id == org_id)
        
        if is_active:
            query = query.where(Employee.is_active == True)
        
        result = await session.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_employee_capacity(
        session: AsyncSession,
        user_id: str,
        week_start_date: Optional[datetime] = None
    ) -> Optional[EmployeeCapacity]:
        """
        Get employee capacity for a specific week
        
        Args:
            session: Database session
            user_id: User ID
            week_start_date: Week start date (defaults to current week)
            
        Returns:
            EmployeeCapacity object or None
        """
        if not week_start_date:
            # Get current week start (Monday)
            today = datetime.utcnow()
            week_start_date = today - timedelta(days=today.weekday())
            week_start_date = week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        result = await session.execute(
            select(EmployeeCapacity).where(
                and_(
                    EmployeeCapacity.user_id == user_id,
                    EmployeeCapacity.week_start_date == week_start_date
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_or_update_capacity(
        session: AsyncSession,
        user_id: str,
        week_start_date: datetime,
        total_hours_available: float = 40.0,
        hours_allocated: float = 0.0,
        volatility_index: float = 0.0,
        overload_risk: RiskLevelEnum = RiskLevelEnum.LOW
    ) -> EmployeeCapacity:
        """
        Create or update employee capacity
        
        Args:
            session: Database session
            user_id: User ID
            week_start_date: Week start date
            total_hours_available: Total available hours
            hours_allocated: Hours already allocated
            volatility_index: Volatility index (0.0 to 1.0)
            overload_risk: Overload risk level
            
        Returns:
            EmployeeCapacity object
        """
        capacity = await EmployeeService.get_employee_capacity(session, user_id, week_start_date)
        
        if capacity:
            # Update existing
            capacity.total_hours_available = total_hours_available
            capacity.hours_allocated = hours_allocated
            capacity.volatility_index = volatility_index
            capacity.overload_risk = overload_risk
            capacity.last_updated = datetime.utcnow()
        else:
            # Create new
            capacity = EmployeeCapacity(
                user_id=user_id,
                week_start_date=week_start_date,
                total_hours_available=total_hours_available,
                hours_allocated=hours_allocated,
                volatility_index=volatility_index,
                overload_risk=overload_risk
            )
            session.add(capacity)
        
        await session.commit()
        await session.refresh(capacity)
        
        return capacity
    
    @staticmethod
    async def allocate_hours(
        session: AsyncSession,
        user_id: str,
        hours: float,
        week_start_date: Optional[datetime] = None
    ) -> EmployeeCapacity:
        """
        Allocate hours to an employee (increase hours_allocated)
        
        Args:
            session: Database session
            user_id: User ID
            hours: Hours to allocate
            week_start_date: Week start date (defaults to current week)
            
        Returns:
            Updated EmployeeCapacity object
        """
        if not week_start_date:
            today = datetime.utcnow()
            week_start_date = today - timedelta(days=today.weekday())
            week_start_date = week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        capacity = await EmployeeService.get_employee_capacity(session, user_id, week_start_date)
        
        if not capacity:
            # Create new capacity record
            capacity = await EmployeeService.create_or_update_capacity(
                session, user_id, week_start_date, hours_allocated=hours
            )
        else:
            capacity.hours_allocated += hours
            
            # Update overload risk based on allocation
            effective_free = capacity.effective_free_hours
            if effective_free < 5:
                capacity.overload_risk = RiskLevelEnum.HIGH
            elif effective_free < 15:
                capacity.overload_risk = RiskLevelEnum.MEDIUM
            else:
                capacity.overload_risk = RiskLevelEnum.LOW
            
            await session.commit()
            await session.refresh(capacity)
        
        print(f"[EmployeeService] Allocated {hours}h to {user_id}. Free hours: {capacity.effective_free_hours}")
        
        return capacity
    
    @staticmethod
    async def get_available_employees(
        session: AsyncSession,
        org_id: str,
        min_free_hours: float = 5.0
    ) -> List[Employee]:
        """
        Get employees with available capacity
        
        Args:
            session: Database session
            org_id: Organization ID
            min_free_hours: Minimum free hours required
            
        Returns:
            List of available Employee objects
        """
        # Get current week
        today = datetime.utcnow()
        week_start_date = today - timedelta(days=today.weekday())
        week_start_date = week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get all active employees with their capacity
        result = await session.execute(
            select(Employee)
            .options(selectinload(Employee.capacity_records))
            .where(
                and_(
                    Employee.org_id == org_id,
                    Employee.is_active == True
                )
            )
        )
        employees = result.scalars().all()
        
        # Filter by capacity
        available = []
        for emp in employees:
            # Find current week capacity
            current_capacity = next(
                (c for c in emp.capacity_records if c.week_start_date == week_start_date),
                None
            )
            
            if current_capacity and current_capacity.effective_free_hours >= min_free_hours:
                available.append(emp)
            elif not current_capacity:
                # No capacity record means full availability
                available.append(emp)
        
        return available
    
    @staticmethod
    async def employees_to_org_context(
        session: AsyncSession,
        employees: List[Employee]
    ) -> List[OrgMember]:
        """
        Convert Employee objects to OrgMember schemas for CORTEXA AI
        
        Args:
            session: Database session
            employees: List of Employee objects
            
        Returns:
            List of OrgMember objects
        """
        org_members = []
        
        for emp in employees:
            # Map role string to OrgRole enum
            role_mapping = {
                "IC": OrgRole.IC,
                "SENIOR_IC": OrgRole.IC,
                "TECH_LEAD": OrgRole.TECH_LEAD,
                "LEAD": OrgRole.TECH_LEAD,
                "MANAGER": OrgRole.MANAGER,
                "DIRECTOR": OrgRole.DIRECTOR,
                "EXECUTIVE": OrgRole.EXECUTIVE
            }
            
            role = role_mapping.get(emp.role, OrgRole.IC)
            
            org_member = OrgMember(
                user_id=emp.user_id,
                role=role,
                manager_id=emp.manager_id,
                skills=emp.skills,
                team=emp.team
            )
            org_members.append(org_member)
        
        return org_members
    
    @staticmethod
    async def employees_to_capacity_data(
        session: AsyncSession,
        employees: List[Employee],
        week_start_date: Optional[datetime] = None
    ) -> CapacityData:
        """
        Convert Employee capacity to CapacityData for CORTEXA AI
        
        Args:
            session: Database session
            employees: List of Employee objects
            week_start_date: Week start date (defaults to current week)
            
        Returns:
            CapacityData object
        """
        if not week_start_date:
            today = datetime.utcnow()
            week_start_date = today - timedelta(days=today.weekday())
            week_start_date = week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        capacity_map: Dict[str, CapacityVector] = {}
        
        for emp in employees:
            capacity = await EmployeeService.get_employee_capacity(session, emp.user_id, week_start_date)
            
            if capacity:
                capacity_vector = CapacityVector(
                    user_id=emp.user_id,
                    effective_free_hours=capacity.effective_free_hours,
                    volatility_index=capacity.volatility_index,
                    overload_risk=capacity.overload_risk
                )
            else:
                # Default capacity if no record exists
                capacity_vector = CapacityVector(
                    user_id=emp.user_id,
                    effective_free_hours=40.0,
                    volatility_index=0.0,
                    overload_risk=RiskLevelEnum.LOW
                )
            
            capacity_map[emp.user_id] = capacity_vector
        
        return CapacityData(capacity_map=capacity_map)
