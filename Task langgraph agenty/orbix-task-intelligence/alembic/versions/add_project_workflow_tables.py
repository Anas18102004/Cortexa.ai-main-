"""
Database Migration: Add Project-Based Workflow Tables

This migration adds:
- projects table
- employees table
- employee_capacity table
- project_assignments table

Run with: alembic revision --autogenerate -m "add_project_workflow_tables"
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers
revision = 'add_project_workflow'
down_revision = None  # Update this with your current revision
branch_labels = None
depends_on = None


def upgrade():
    """Add project workflow tables"""
    
    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('tech_stack', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=True),
        sa.Column('estimated_duration_days', sa.Integer(), nullable=True),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', name='projectstatusenum'), nullable=True),
        sa.Column('org_id', sa.String(length=50), nullable=False),
        sa.Column('created_by', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_project_id'), 'projects', ['project_id'], unique=True)
    op.create_index(op.f('ix_projects_org_id'), 'projects', ['org_id'], unique=False)
    
    # Create employees table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('team', sa.String(length=100), nullable=True),
        sa.Column('skills', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('seniority_level', sa.Enum('JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL', name='employeeseniorityen um'), nullable=True),
        sa.Column('hourly_rate', sa.Float(), nullable=True),
        sa.Column('manager_id', sa.String(length=50), nullable=True),
        sa.Column('org_id', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employees_user_id'), 'employees', ['user_id'], unique=True)
    op.create_index(op.f('ix_employees_email'), 'employees', ['email'], unique=True)
    op.create_index(op.f('ix_employees_org_id'), 'employees', ['org_id'], unique=False)
    
    # Create employee_capacity table
    op.create_table(
        'employee_capacity',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('week_start_date', sa.DateTime(), nullable=False),
        sa.Column('total_hours_available', sa.Float(), nullable=True),
        sa.Column('hours_allocated', sa.Float(), nullable=True),
        sa.Column('volatility_index', sa.Float(), nullable=True),
        sa.Column('overload_risk', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='risklevelenum'), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['employees.user_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_capacity_user_id'), 'employee_capacity', ['user_id'], unique=False)
    op.create_index(op.f('ix_employee_capacity_week_start_date'), 'employee_capacity', ['week_start_date'], unique=False)
    
    # Create project_assignments table
    op.create_table(
        'project_assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('assignment_id', sa.String(length=50), nullable=False),
        sa.Column('project_id', sa.String(length=50), nullable=False),
        sa.Column('action_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('action_description', sa.Text(), nullable=False),
        sa.Column('required_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('estimated_hours', sa.Float(), nullable=True),
        sa.Column('decision_mode', sa.Enum('AUTO_ASSIGN', 'PROPOSE', 'ESCALATE', name='decisionmodeenum'), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='risklevelenum'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', name='assignmentstatusenum'), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=True),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.project_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['employees.user_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_assignments_assignment_id'), 'project_assignments', ['assignment_id'], unique=True)
    op.create_index(op.f('ix_project_assignments_project_id'), 'project_assignments', ['project_id'], unique=False)
    op.create_index(op.f('ix_project_assignments_user_id'), 'project_assignments', ['user_id'], unique=False)


def downgrade():
    """Remove project workflow tables"""
    
    op.drop_index(op.f('ix_project_assignments_user_id'), table_name='project_assignments')
    op.drop_index(op.f('ix_project_assignments_project_id'), table_name='project_assignments')
    op.drop_index(op.f('ix_project_assignments_assignment_id'), table_name='project_assignments')
    op.drop_table('project_assignments')
    
    op.drop_index(op.f('ix_employee_capacity_week_start_date'), table_name='employee_capacity')
    op.drop_index(op.f('ix_employee_capacity_user_id'), table_name='employee_capacity')
    op.drop_table('employee_capacity')
    
    op.drop_index(op.f('ix_employees_org_id'), table_name='employees')
    op.drop_index(op.f('ix_employees_email'), table_name='employees')
    op.drop_index(op.f('ix_employees_user_id'), table_name='employees')
    op.drop_table('employees')
    
    op.drop_index(op.f('ix_projects_org_id'), table_name='projects')
    op.drop_index(op.f('ix_projects_project_id'), table_name='projects')
    op.drop_table('projects')
    
    # Drop enums
    sa.Enum(name='projectstatusenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='employeeseniorityen um').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='assignmentstatusenum').drop(op.get_bind(), checkfirst=True)
