"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2026-02-02 23:42:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial schema"""
    
    # Missions table
    op.create_table(
        'missions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('mission_id', sa.String(50), nullable=False),
        sa.Column('org_id', sa.String(50), nullable=False),
        sa.Column('goal', sa.Text(), nullable=False),
        sa.Column('success_criteria', sa.JSON(), nullable=False),
        sa.Column('constraints', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('mission_id')
    )
    op.create_index('ix_missions_mission_id', 'missions', ['mission_id'])
    op.create_index('ix_missions_org_id', 'missions', ['org_id'])
    
    # Deliverables table
    op.create_table(
        'deliverables',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('deliverable_id', sa.String(50), nullable=False),
        sa.Column('mission_id', sa.String(50), nullable=False),
        sa.Column('outcome', sa.Text(), nullable=False),
        sa.Column('success_criteria', sa.JSON(), nullable=True),
        sa.Column('dependencies', sa.JSON(), nullable=True),
        sa.Column('estimated_effort_hours', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('deliverable_id'),
        sa.ForeignKeyConstraint(['mission_id'], ['missions.mission_id'])
    )
    op.create_index('ix_deliverables_deliverable_id', 'deliverables', ['deliverable_id'])
    
    # Actions table
    op.create_table(
        'actions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('deliverable_id', sa.String(50), nullable=False),
        sa.Column('mission_id', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('required_skills', sa.JSON(), nullable=True),
        sa.Column('estimated_hours', sa.Float(), nullable=True),
        sa.Column('actual_hours', sa.Float(), nullable=True),
        sa.Column('dependencies', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('assigned_to', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('action_id'),
        sa.ForeignKeyConstraint(['deliverable_id'], ['deliverables.deliverable_id']),
        sa.ForeignKeyConstraint(['mission_id'], ['missions.mission_id'])
    )
    op.create_index('ix_actions_action_id', 'actions', ['action_id'])
    op.create_index('ix_actions_assigned_to', 'actions', ['assigned_to'])
    
    # Assignments table
    op.create_table(
        'assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('assignment_id', sa.String(50), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('user_id', sa.String(50), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.String(20), nullable=False),
        sa.Column('market_response', sa.String(20), nullable=False),
        sa.Column('justification_codes', sa.JSON(), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=False),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('assignment_id'),
        sa.ForeignKeyConstraint(['action_id'], ['actions.action_id'])
    )
    op.create_index('ix_assignments_assignment_id', 'assignments', ['assignment_id'])
    op.create_index('ix_assignments_user_id', 'assignments', ['user_id'])
    
    # Decisions table
    op.create_table(
        'decisions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('decision_id', sa.String(50), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('mode', sa.String(20), nullable=False),
        sa.Column('assignee', sa.String(50), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.String(20), nullable=False),
        sa.Column('justification_codes', sa.JSON(), nullable=True),
        sa.Column('reasoning_summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('decision_id'),
        sa.ForeignKeyConstraint(['action_id'], ['actions.action_id'])
    )
    op.create_index('ix_decisions_decision_id', 'decisions', ['decision_id'])
    
    # Audit entries table
    op.create_table(
        'audit_entries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('audit_id', sa.String(50), nullable=False),
        sa.Column('decision_id', sa.String(50), nullable=False),
        sa.Column('agent', sa.String(100), nullable=False),
        sa.Column('version', sa.String(20), nullable=False),
        sa.Column('decision_path', sa.JSON(), nullable=False),
        sa.Column('final_decision', sa.String(20), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.String(20), nullable=False),
        sa.Column('justification_codes', sa.JSON(), nullable=True),
        sa.Column('performance_metrics', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('audit_id'),
        sa.ForeignKeyConstraint(['decision_id'], ['decisions.decision_id'])
    )
    op.create_index('ix_audit_entries_audit_id', 'audit_entries', ['audit_id'])
    op.create_index('ix_audit_entries_action_id', 'audit_entries', ['action_id'])
    op.create_index('ix_audit_entries_timestamp', 'audit_entries', ['timestamp'])
    
    # Capacity metrics table
    op.create_table(
        'capacity_metrics',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(50), nullable=False),
        sa.Column('effective_free_hours', sa.Float(), nullable=False),
        sa.Column('volatility_index', sa.Float(), nullable=False),
        sa.Column('overload_risk', sa.String(20), nullable=False),
        sa.Column('calculated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_capacity_metrics_user_id', 'capacity_metrics', ['user_id'])
    op.create_index('ix_capacity_metrics_calculated_at', 'capacity_metrics', ['calculated_at'])
    
    # Work logs table
    op.create_table(
        'work_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(50), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('hours_worked', sa.Float(), nullable=False),
        sa.Column('work_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_work_logs_user_id', 'work_logs', ['user_id'])
    op.create_index('ix_work_logs_work_date', 'work_logs', ['work_date'])
    
    # Proposals table
    op.create_table(
        'proposals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('proposal_id', sa.String(50), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('proposed_assignee', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_by', sa.String(50), nullable=True),
        sa.Column('approved', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('proposal_id')
    )
    op.create_index('ix_proposals_proposal_id', 'proposals', ['proposal_id'])
    
    # Escalations table
    op.create_table(
        'escalations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('escalation_id', sa.String(50), nullable=False),
        sa.Column('action_id', sa.String(50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_by', sa.String(50), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('escalation_id')
    )
    op.create_index('ix_escalations_escalation_id', 'escalations', ['escalation_id'])


def downgrade() -> None:
    """Drop all tables"""
    op.drop_table('escalations')
    op.drop_table('proposals')
    op.drop_table('work_logs')
    op.drop_table('capacity_metrics')
    op.drop_table('audit_entries')
    op.drop_table('decisions')
    op.drop_table('assignments')
    op.drop_table('actions')
    op.drop_table('deliverables')
    op.drop_table('missions')
