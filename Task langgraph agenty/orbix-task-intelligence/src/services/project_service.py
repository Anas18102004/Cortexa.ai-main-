"""
Project Service - Business logic for project management

This service handles all project-related operations including:
- Creating and updating projects
- Confirming projects (triggering AI assignment)
- Fetching project details
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from ..models import Project, ProjectStatusEnum
from ..schemas import RawIntent


class ProjectService:
    """Service for managing projects"""
    
    @staticmethod
    async def create_project(
        session: AsyncSession,
        name: str,
        description: str,
        tech_stack: List[str],
        org_id: str,
        created_by: str,
        requirements: Optional[str] = None,
        priority: str = "MEDIUM",
        estimated_duration_days: Optional[int] = None,
        budget: Optional[float] = None,
        metadata: Optional[dict] = None
    ) -> Project:
        """
        Create a new project
        
        Args:
            session: Database session
            name: Project name
            description: Project description
            tech_stack: List of technologies
            org_id: Organization ID
            created_by: User ID who created the project
            requirements: Optional requirements
            priority: Priority level (LOW, MEDIUM, HIGH, CRITICAL)
            estimated_duration_days: Estimated duration
            budget: Project budget
            metadata: Additional metadata
            
        Returns:
            Created Project object
        """
        project = Project(
            project_id=f"proj_{uuid4().hex[:12]}",
            name=name,
            description=description,
            tech_stack=tech_stack,
            requirements=requirements,
            priority=priority,
            estimated_duration_days=estimated_duration_days,
            budget=budget,
            status=ProjectStatusEnum.DRAFT,
            org_id=org_id,
            created_by=created_by,
            metadata=metadata or {}
        )
        
        session.add(project)
        await session.commit()
        await session.refresh(project)
        
        print(f"[ProjectService] Created project: {project.project_id} - {project.name}")
        
        return project
    
    @staticmethod
    async def get_project(
        session: AsyncSession,
        project_id: str
    ) -> Optional[Project]:
        """
        Get project by ID
        
        Args:
            session: Database session
            project_id: Project ID
            
        Returns:
            Project object or None
        """
        result = await session.execute(
            select(Project).where(Project.project_id == project_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def confirm_project(
        session: AsyncSession,
        project_id: str
    ) -> Project:
        """
        Confirm a project (change status to CONFIRMED)
        
        This triggers the AI assignment process.
        
        Args:
            session: Database session
            project_id: Project ID
            
        Returns:
            Updated Project object
        """
        project = await ProjectService.get_project(session, project_id)
        
        if not project:
            raise ValueError(f"Project not found: {project_id}")
        
        if project.status != ProjectStatusEnum.DRAFT:
            raise ValueError(f"Project {project_id} is not in DRAFT status")
        
        project.status = ProjectStatusEnum.CONFIRMED
        project.confirmed_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(project)
        
        print(f"[ProjectService] Confirmed project: {project_id}")
        
        return project
    
    @staticmethod
    async def update_project_status(
        session: AsyncSession,
        project_id: str,
        status: ProjectStatusEnum
    ) -> Project:
        """
        Update project status
        
        Args:
            session: Database session
            project_id: Project ID
            status: New status
            
        Returns:
            Updated Project object
        """
        project = await ProjectService.get_project(session, project_id)
        
        if not project:
            raise ValueError(f"Project not found: {project_id}")
        
        project.status = status
        
        await session.commit()
        await session.refresh(project)
        
        print(f"[ProjectService] Updated project {project_id} status to {status.value}")
        
        return project
    
    @staticmethod
    async def get_projects_by_org(
        session: AsyncSession,
        org_id: str,
        status: Optional[ProjectStatusEnum] = None
    ) -> List[Project]:
        """
        Get all projects for an organization
        
        Args:
            session: Database session
            org_id: Organization ID
            status: Optional status filter
            
        Returns:
            List of Project objects
        """
        query = select(Project).where(Project.org_id == org_id)
        
        if status:
            query = query.where(Project.status == status)
        
        result = await session.execute(query)
        return result.scalars().all()
    
    @staticmethod
    def project_to_raw_intent(project: Project) -> RawIntent:
        """
        Convert a Project to RawIntent for CORTEXA AI processing
        
        Args:
            project: Project object
            
        Returns:
            RawIntent object
        """
        # Build comprehensive description
        description_parts = [
            f"Project: {project.name}",
            f"\nDescription: {project.description}",
            f"\nTech Stack: {', '.join(project.tech_stack)}",
        ]
        
        if project.requirements:
            description_parts.append(f"\nRequirements: {project.requirements}")
        
        if project.priority:
            description_parts.append(f"\nPriority: {project.priority}")
        
        if project.estimated_duration_days:
            description_parts.append(f"\nEstimated Duration: {project.estimated_duration_days} days")
        
        description = "\n".join(description_parts)
        
        return RawIntent(
            description=description,
            documents=[],
            meeting_notes=[]
        )
