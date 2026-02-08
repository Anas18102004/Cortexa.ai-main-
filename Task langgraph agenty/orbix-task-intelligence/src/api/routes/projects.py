"""
Project API Routes

Endpoints for project management and AI-based task assignment
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from ...database import get_session
from ...models import ProjectStatusEnum
from ...services.project_service import ProjectService
from ...services.assignment_service import AssignmentService
from ...integrations.project_orchestrator import ProjectOrchestrator
from ...schemas import PolicyConfig, RiskLevel


router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class CreateProjectRequest(BaseModel):
    """Request schema for creating a project"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    tech_stack: List[str] = Field(..., min_items=1)
    requirements: Optional[str] = None
    priority: str = Field(default="MEDIUM", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    estimated_duration_days: Optional[int] = Field(None, gt=0)
    budget: Optional[float] = Field(None, gt=0)
    org_id: str
    created_by: str
    metadata: Optional[dict] = None


class ConfirmProjectRequest(BaseModel):
    """Request schema for confirming a project"""
    org_id: str
    policy_config: Optional[PolicyConfig] = None


class ProjectResponse(BaseModel):
    """Response schema for project"""
    project_id: str
    name: str
    description: str
    tech_stack: List[str]
    status: str
    created_at: str
    confirmed_at: Optional[str] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_project(
    request: CreateProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new project
    
    This creates a project in DRAFT status. Use the confirm endpoint to trigger AI assignment.
    """
    try:
        project = await ProjectService.create_project(
            session=session,
            name=request.name,
            description=request.description,
            tech_stack=request.tech_stack,
            org_id=request.org_id,
            created_by=request.created_by,
            requirements=request.requirements,
            priority=request.priority,
            estimated_duration_days=request.estimated_duration_days,
            budget=request.budget,
            metadata=request.metadata
        )
        
        return {
            "success": True,
            "data": {
                "project_id": project.project_id,
                "name": project.name,
                "status": project.status.value,
                "created_at": project.created_at.isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Get project details by ID
    """
    project = await ProjectService.get_project(session, project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project not found: {project_id}"
        )
    
    return {
        "success": True,
        "data": {
            "project_id": project.project_id,
            "name": project.name,
            "description": project.description,
            "tech_stack": project.tech_stack,
            "requirements": project.requirements,
            "priority": project.priority,
            "estimated_duration_days": project.estimated_duration_days,
            "budget": project.budget,
            "status": project.status.value,
            "org_id": project.org_id,
            "created_by": project.created_by,
            "created_at": project.created_at.isoformat(),
            "confirmed_at": project.confirmed_at.isoformat() if project.confirmed_at else None,
            "metadata": project.metadata
        }
    }


@router.post("/{project_id}/confirm", response_model=dict)
async def confirm_project(
    project_id: str,
    request: ConfirmProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Confirm a project and trigger AI-based task assignment
    
    This is the main endpoint that:
    1. Confirms the project
    2. Fetches employees and capacity
    3. Runs CORTEXA AI pipeline
    4. Creates assignments
    5. Returns complete results
    """
    try:
        result = await ProjectOrchestrator.confirm_and_assign(
            session=session,
            project_id=project_id,
            org_id=request.org_id,
            policy_config=request.policy_config
        )
        
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm project: {str(e)}"
        )


@router.get("/{project_id}/assignments", response_model=dict)
async def get_project_assignments(
    project_id: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Get all assignments for a project
    """
    # Verify project exists
    project = await ProjectService.get_project(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project not found: {project_id}"
        )
    
    assignments = await AssignmentService.get_project_assignments(session, project_id)
    
    return {
        "success": True,
        "data": {
            "project_id": project_id,
            "total_assignments": len(assignments),
            "assignments": [
                {
                    "assignment_id": a.assignment_id,
                    "action_id": a.action_id,
                    "user_id": a.user_id,
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
