"""
Employee API Routes

Endpoints for employee and capacity management
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database import get_session
from ...services.employee_service import EmployeeService
from ...services.assignment_service import AssignmentService
from ...models import AssignmentStatusEnum


router = APIRouter(prefix="/api/v1/employees", tags=["employees"])


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("", response_model=dict)
async def get_employees(
    org_id: str,
    is_active: bool = True,
    session: AsyncSession = Depends(get_session)
):
    """
    Get all employees for an organization
    """
    employees = await EmployeeService.get_all_employees(session, org_id, is_active)
    
    return {
        "success": True,
        "data": {
            "total": len(employees),
            "employees": [
                {
                    "user_id": e.user_id,
                    "name": e.name,
                    "email": e.email,
                    "role": e.role,
                    "team": e.team,
                    "skills": e.skills,
                    "seniority_level": e.seniority_level.value if e.seniority_level else None,
                    "is_active": e.is_active
                }
                for e in employees
            ]
        }
    }


@router.get("/{user_id}", response_model=dict)
async def get_employee(
    user_id: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Get employee details by user ID
    """
    employee = await EmployeeService.get_employee(session, user_id)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee not found: {user_id}"
        )
    
    return {
        "success": True,
        "data": {
            "user_id": employee.user_id,
            "name": employee.name,
            "email": employee.email,
            "role": employee.role,
            "team": employee.team,
            "skills": employee.skills,
            "seniority_level": employee.seniority_level.value if employee.seniority_level else None,
            "hourly_rate": employee.hourly_rate,
            "manager_id": employee.manager_id,
            "org_id": employee.org_id,
            "is_active": employee.is_active,
            "created_at": employee.created_at.isoformat()
        }
    }


@router.get("/{user_id}/capacity", response_model=dict)
async def get_employee_capacity(
    user_id: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Get current capacity for an employee
    """
    employee = await EmployeeService.get_employee(session, user_id)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee not found: {user_id}"
        )
    
    capacity = await EmployeeService.get_employee_capacity(session, user_id)
    
    if not capacity:
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "message": "No capacity record found for current week",
                "default_capacity": {
                    "total_hours_available": 40.0,
                    "hours_allocated": 0.0,
                    "effective_free_hours": 40.0,
                    "overload_risk": "LOW"
                }
            }
        }
    
    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "week_start_date": capacity.week_start_date.isoformat(),
            "total_hours_available": capacity.total_hours_available,
            "hours_allocated": capacity.hours_allocated,
            "effective_free_hours": capacity.effective_free_hours,
            "volatility_index": capacity.volatility_index,
            "overload_risk": capacity.overload_risk.value,
            "last_updated": capacity.last_updated.isoformat()
        }
    }


@router.get("/availability", response_model=dict)
async def get_available_employees(
    org_id: str,
    min_free_hours: float = 5.0,
    session: AsyncSession = Depends(get_session)
):
    """
    Get employees with available capacity
    """
    employees = await EmployeeService.get_available_employees(session, org_id, min_free_hours)
    
    return {
        "success": True,
        "data": {
            "total": len(employees),
            "min_free_hours": min_free_hours,
            "available_employees": [
                {
                    "user_id": e.user_id,
                    "name": e.name,
                    "role": e.role,
                    "team": e.team,
                    "skills": e.skills
                }
                for e in employees
            ]
        }
    }


@router.get("/{user_id}/assignments", response_model=dict)
async def get_user_assignments(
    user_id: str,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """
    Get all assignments for a user
    """
    employee = await EmployeeService.get_employee(session, user_id)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee not found: {user_id}"
        )
    
    # Parse status if provided
    status_enum = None
    if status:
        try:
            status_enum = AssignmentStatusEnum[status.upper()]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    assignments = await AssignmentService.get_user_assignments(session, user_id, status_enum)
    
    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "total_assignments": len(assignments),
            "assignments": [
                {
                    "assignment_id": a.assignment_id,
                    "project_id": a.project_id,
                    "action_id": a.action_id,
                    "action_description": a.action_description,
                    "required_skills": a.required_skills,
                    "estimated_hours": a.estimated_hours,
                    "decision_mode": a.decision_mode.value,
                    "confidence_score": a.confidence_score,
                    "risk_level": a.risk_level.value,
                    "status": a.status.value,
                    "assigned_at": a.assigned_at.isoformat(),
                    "accepted_at": a.accepted_at.isoformat() if a.accepted_at else None,
                    "completed_at": a.completed_at.isoformat() if a.completed_at else None
                }
                for a in assignments
            ]
        }
    }
