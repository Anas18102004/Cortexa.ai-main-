"""
Example: Project-Based Workflow with CORTEXA AI

This script demonstrates the complete project-based workflow:
1. Create sample employees
2. Create a project
3. Confirm project (triggers AI)
4. View assignments
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.database import init_db
from src.models import Employee, EmployeeSeniorityEnum, EmployeeCapacity, RiskLevelEnum
from src.services.project_service import ProjectService
from src.services.employee_service import EmployeeService
from src.integrations.project_orchestrator import ProjectOrchestrator


# Database URL
DATABASE_URL = "postgresql+asyncpg://orbix:password@localhost:5432/orbix_db"


async def setup_database():
    """Initialize database and create tables"""
    print("Setting up database...")
    await init_db()
    print("✓ Database initialized\n")


async def seed_employees(session: AsyncSession):
    """Create sample employees"""
    print("Creating sample employees...")
    
    # Get current week start
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    employees_data = [
        {
            "user_id": "emp_001",
            "name": "Sarah Johnson",
            "email": "sarah.johnson@company.com",
            "role": "SENIOR_IC",
            "team": "Frontend",
            "skills": ["React", "TypeScript", "UI/UX", "Figma", "CSS"],
            "seniority_level": EmployeeSeniorityEnum.SENIOR,
            "hourly_rate": 85.0,
            "manager_id": "mgr_001",
            "org_id": "org_001",
            "capacity": {"total": 40.0, "allocated": 5.0, "volatility": 0.12, "risk": RiskLevelEnum.LOW}
        },
        {
            "user_id": "emp_002",
            "name": "Michael Chen",
            "email": "michael.chen@company.com",
            "role": "IC",
            "team": "Backend",
            "skills": ["Node.js", "TypeScript", "PostgreSQL", "Redis", "JWT"],
            "seniority_level": EmployeeSeniorityEnum.MID,
            "hourly_rate": 70.0,
            "manager_id": "mgr_001",
            "org_id": "org_001",
            "capacity": {"total": 40.0, "allocated": 22.0, "volatility": 0.25, "risk": RiskLevelEnum.MEDIUM}
        },
        {
            "user_id": "emp_003",
            "name": "Emily Rodriguez",
            "email": "emily.rodriguez@company.com",
            "role": "SENIOR_IC",
            "team": "Frontend",
            "skills": ["React Native", "JavaScript", "Mobile Development", "Animation"],
            "seniority_level": EmployeeSeniorityEnum.SENIOR,
            "hourly_rate": 90.0,
            "manager_id": "mgr_001",
            "org_id": "org_001",
            "capacity": {"total": 40.0, "allocated": 8.0, "volatility": 0.08, "risk": RiskLevelEnum.LOW}
        },
        {
            "user_id": "emp_004",
            "name": "David Kim",
            "email": "david.kim@company.com",
            "role": "IC",
            "team": "Backend",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            "seniority_level": EmployeeSeniorityEnum.MID,
            "hourly_rate": 75.0,
            "manager_id": "mgr_001",
            "org_id": "org_001",
            "capacity": {"total": 40.0, "allocated": 10.0, "volatility": 0.15, "risk": RiskLevelEnum.LOW}
        },
        {
            "user_id": "emp_005",
            "name": "Jessica Martinez",
            "email": "jessica.martinez@company.com",
            "role": "TECH_LEAD",
            "team": "Full Stack",
            "skills": ["React", "Node.js", "TypeScript", "System Design", "Leadership"],
            "seniority_level": EmployeeSeniorityEnum.STAFF,
            "hourly_rate": 110.0,
            "manager_id": "mgr_001",
            "org_id": "org_001",
            "capacity": {"total": 40.0, "allocated": 15.0, "volatility": 0.18, "risk": RiskLevelEnum.LOW}
        }
    ]
    
    for emp_data in employees_data:
        capacity_data = emp_data.pop("capacity")
        
        # Create employee
        employee = Employee(**emp_data)
        session.add(employee)
        
        # Create capacity record
        capacity = EmployeeCapacity(
            user_id=emp_data["user_id"],
            week_start_date=week_start,
            total_hours_available=capacity_data["total"],
            hours_allocated=capacity_data["allocated"],
            volatility_index=capacity_data["volatility"],
            overload_risk=capacity_data["risk"]
        )
        session.add(capacity)
        
        print(f"  ✓ Created: {emp_data['name']} ({emp_data['role']}) - {capacity.effective_free_hours}h available")
    
    await session.commit()
    print(f"\n✓ Created {len(employees_data)} employees\n")


async def main():
    """Main execution"""
    print("\n" + "="*80)
    print("CORTEXA AI - PROJECT-BASED WORKFLOW EXAMPLE")
    print("="*80 + "\n")
    
    # Create engine and session
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Setup database
    await setup_database()
    
    async with async_session() as session:
        # Seed employees
        await seed_employees(session)
        
        # Step 1: Create a project
        print("="*80)
        print("STEP 1: Creating Project")
        print("="*80 + "\n")
        
        project = await ProjectService.create_project(
            session=session,
            name="E-Commerce Mobile App",
            description="""
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
            tech_stack=["React Native", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "Redis"],
            requirements="Must support iOS and Android, integrate with existing backend, implement secure payment flow",
            priority="HIGH",
            estimated_duration_days=60,
            budget=50000.0,
            org_id="org_001",
            created_by="mgr_001"
        )
        
        print(f"\n✓ Project created: {project.project_id}")
        print(f"  Name: {project.name}")
        print(f"  Status: {project.status.value}")
        print(f"  Tech Stack: {', '.join(project.tech_stack)}")
        print()
        
        # Step 2: Confirm project and trigger AI
        print("="*80)
        print("STEP 2: Confirming Project (Triggering AI Assignment)")
        print("="*80 + "\n")
        
        result = await ProjectOrchestrator.confirm_and_assign(
            session=session,
            project_id=project.project_id,
            org_id="org_001"
        )
        
        # Step 3: Display results
        print("\n" + "="*80)
        print("RESULTS")
        print("="*80 + "\n")
        
        print(f"Project: {result['project_name']}")
        print(f"Status: {result['status']}\n")
        
        print(f"Mission: {result['mission']['mission_id']}")
        print(f"  Goal: {result['mission']['goal']}")
        print(f"  Success Criteria:")
        for criterion in result['mission']['success_criteria']:
            print(f"    - {criterion}")
        print()
        
        print(f"Deliverables: {len(result['deliverables'])}")
        for deliverable in result['deliverables']:
            print(f"  - {deliverable['deliverable_id']}: {deliverable['outcome']}")
            print(f"    Estimated: {deliverable['estimated_effort_hours']}h")
        print()
        
        print(f"Assignments: {len(result['assignments'])}")
        for assignment in result['assignments']:
            print(f"\n  Assignment: {assignment['assignment_id']}")
            print(f"    Action: {assignment['action_description'][:80]}...")
            print(f"    Assigned To: {assignment['assigned_to']['name']}")
            print(f"    Decision: {assignment['decision_mode']} (confidence: {assignment['confidence_score']:.2f})")
            print(f"    Risk: {assignment['risk_level']}")
            print(f"    Hours: {assignment['estimated_hours']}")
            print(f"    Explanation: {assignment['explanation'][:100]}...")
        print()
        
        print("Summary:")
        print(f"  Total Actions: {result['summary']['total_actions']}")
        print(f"  Auto-Assigned: {result['summary']['auto_assigned']}")
        print(f"  Proposed: {result['summary']['proposed']}")
        print(f"  Escalated: {result['summary']['escalated']}")
        print(f"  Total Hours: {result['summary']['total_estimated_hours']}")
        print(f"  Employees Involved: {result['summary']['employees_involved']}")
        
        print("\n" + "="*80)
        print("EXAMPLE COMPLETE")
        print("="*80 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
