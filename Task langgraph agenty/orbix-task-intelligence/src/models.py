"""
Database Models - SQLAlchemy ORM Models

This module defines the database schema for the Orbix system.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Enum, JSON, ForeignKey, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


# ============================================================================
# ENUMS
# ============================================================================

class MissionStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ActionStatusEnum(str, enum.Enum):
    PROPOSED = "PROPOSED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class DecisionModeEnum(str, enum.Enum):
    AUTO_ASSIGN = "AUTO_ASSIGN"
    PROPOSE = "PROPOSE"
    ESCALATE = "ESCALATE"


class RiskLevelEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class MarketResponseEnum(str, enum.Enum):
    ACCEPT = "ACCEPT"
    DEFER = "DEFER"
    DECLINE = "DECLINE"
    PENDING = "PENDING"


class ProjectStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class EmployeeSeniorityEnum(str, enum.Enum):
    JUNIOR = "JUNIOR"
    MID = "MID"
    SENIOR = "SENIOR"
    STAFF = "STAFF"
    PRINCIPAL = "PRINCIPAL"


class AssignmentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


# ============================================================================
# MODELS
# ============================================================================

class Mission(Base):
    """Mission table"""
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_id = Column(String(50), unique=True, nullable=False, index=True)
    org_id = Column(String(50), nullable=False, index=True)
    goal = Column(Text, nullable=False)
    success_criteria = Column(JSON, nullable=False)  # List of strings
    constraints = Column(JSON, default=[])  # List of strings
    status = Column(Enum(MissionStatusEnum), default=MissionStatusEnum.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    deliverables = relationship("Deliverable", back_populates="mission", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="mission")


class Deliverable(Base):
    """Deliverable table"""
    __tablename__ = "deliverables"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    deliverable_id = Column(String(50), unique=True, nullable=False, index=True)
    mission_id = Column(String(50), ForeignKey("missions.mission_id"), nullable=False)
    outcome = Column(Text, nullable=False)
    success_criteria = Column(JSON, default=[])  # List of strings
    dependencies = Column(JSON, default=[])  # List of deliverable IDs
    estimated_effort_hours = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    mission = relationship("Mission", back_populates="deliverables")
    actions = relationship("Action", back_populates="deliverable", cascade="all, delete-orphan")


class Action(Base):
    """Action table"""
    __tablename__ = "actions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    action_id = Column(String(50), unique=True, nullable=False, index=True)
    deliverable_id = Column(String(50), ForeignKey("deliverables.deliverable_id"), nullable=False)
    mission_id = Column(String(50), ForeignKey("missions.mission_id"), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=[])  # List of strings
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    dependencies = Column(JSON, default=[])  # List of action IDs
    status = Column(Enum(ActionStatusEnum), default=ActionStatusEnum.PROPOSED)
    assigned_to = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    deliverable = relationship("Deliverable", back_populates="actions")
    mission = relationship("Mission", back_populates="actions")
    assignment = relationship("Assignment", back_populates="action", uselist=False)
    decision = relationship("Decision", back_populates="action", uselist=False)


class Assignment(Base):
    """Assignment table"""
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(String(50), unique=True, nullable=False, index=True)
    action_id = Column(String(50), ForeignKey("actions.action_id"), nullable=False)
    user_id = Column(String(50), nullable=False, index=True)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevelEnum), nullable=False)
    market_response = Column(Enum(MarketResponseEnum), default=MarketResponseEnum.PENDING)
    justification_codes = Column(JSON, default=[])  # List of codes
    assigned_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    
    # Relationships
    action = relationship("Action", back_populates="assignment")


class Decision(Base):
    """Decision table"""
    __tablename__ = "decisions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(String(50), unique=True, nullable=False, index=True)
    action_id = Column(String(50), ForeignKey("actions.action_id"), nullable=False)
    mode = Column(Enum(DecisionModeEnum), nullable=False)
    assignee = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevelEnum), nullable=False)
    justification_codes = Column(JSON, default=[])
    reasoning_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    action = relationship("Action", back_populates="decision")
    audit_entry = relationship("AuditEntry", back_populates="decision", uselist=False)


class AuditEntry(Base):
    """Audit trail table (time-series)"""
    __tablename__ = "audit_entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(String(50), unique=True, nullable=False, index=True)
    decision_id = Column(String(50), ForeignKey("decisions.decision_id"), nullable=False)
    agent = Column(String(100), default="OrbixTaskIntelligenceCoordinator")
    version = Column(String(20), default="v1.0.0")
    decision_path = Column(JSON, nullable=False)  # List of node names
    final_decision = Column(Enum(DecisionModeEnum), nullable=False)
    action_id = Column(String(50), nullable=False, index=True)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevelEnum), nullable=False)
    justification_codes = Column(JSON, default=[])
    performance_metrics = Column(JSON, default={})  # Dict of node -> duration_ms
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    decision = relationship("Decision", back_populates="audit_entry")


class CapacityMetric(Base):
    """Capacity metrics table (time-series)"""
    __tablename__ = "capacity_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    effective_free_hours = Column(Float, nullable=False)
    volatility_index = Column(Float, nullable=False)
    overload_risk = Column(Enum(RiskLevelEnum), nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow, index=True)


class WorkLog(Base):
    """Work log table for tracking actual hours"""
    __tablename__ = "work_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    action_id = Column(String(50), nullable=False)
    hours_worked = Column(Float, nullable=False)
    work_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Proposal(Base):
    """Proposal table (for PROPOSE mode)"""
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    proposal_id = Column(String(50), unique=True, nullable=False, index=True)
    action_id = Column(String(50), nullable=False)
    proposed_assignee = Column(String(50), nullable=False)
    status = Column(String(20), default="pending_approval")
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(50), nullable=True)
    approved = Column(Boolean, nullable=True)


class Escalation(Base):
    """Escalation table (for ESCALATE mode)"""
    __tablename__ = "escalations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    escalation_id = Column(String(50), unique=True, nullable=False, index=True)
    action_id = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    priority = Column(String(20), default="HIGH")
    status = Column(String(20), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(50), nullable=True)


# ============================================================================
# PROJECT-BASED WORKFLOW MODELS
# ============================================================================

class Project(Base):
    """Project table - stores project details and requirements"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack = Column(JSON, nullable=False)  # List of technologies
    requirements = Column(Text, nullable=True)
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    estimated_duration_days = Column(Integer, nullable=True)
    budget = Column(Float, nullable=True)
    status = Column(Enum(ProjectStatusEnum), default=ProjectStatusEnum.DRAFT)
    org_id = Column(String(50), nullable=False, index=True)
    created_by = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(JSON, default={})  # Additional project-specific data
    
    # Relationships
    project_assignments = relationship("ProjectAssignment", back_populates="project", cascade="all, delete-orphan")


class Employee(Base):
    """Employee table - stores employee profiles and skills"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), nullable=False)  # IC, SENIOR_IC, LEAD, MANAGER
    team = Column(String(100), nullable=True)
    skills = Column(JSON, nullable=False)  # List of skills
    seniority_level = Column(Enum(EmployeeSeniorityEnum), nullable=True)
    hourly_rate = Column(Float, nullable=True)
    manager_id = Column(String(50), nullable=True)
    org_id = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    capacity_records = relationship("EmployeeCapacity", back_populates="employee", cascade="all, delete-orphan")
    project_assignments = relationship("ProjectAssignment", back_populates="employee")


class EmployeeCapacity(Base):
    """Employee capacity table - tracks weekly capacity and availability"""
    __tablename__ = "employee_capacity"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("employees.user_id"), nullable=False, index=True)
    week_start_date = Column(DateTime, nullable=False, index=True)
    total_hours_available = Column(Float, default=40.0)
    hours_allocated = Column(Float, default=0.0)
    # effective_free_hours is calculated: total_hours_available - hours_allocated
    volatility_index = Column(Float, default=0.0)  # 0.0 to 1.0
    overload_risk = Column(Enum(RiskLevelEnum), default=RiskLevelEnum.LOW)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee", back_populates="capacity_records")
    
    @property
    def effective_free_hours(self):
        """Calculate effective free hours"""
        return max(0.0, self.total_hours_available - self.hours_allocated)


class ProjectAssignment(Base):
    """Project assignment table - links projects to employees with AI decisions"""
    __tablename__ = "project_assignments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(String(50), unique=True, nullable=False, index=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), nullable=False, index=True)
    action_id = Column(String(50), nullable=False)
    user_id = Column(String(50), ForeignKey("employees.user_id"), nullable=False, index=True)
    action_description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=[])
    estimated_hours = Column(Float, nullable=True)
    decision_mode = Column(Enum(DecisionModeEnum), nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevelEnum), nullable=False)
    status = Column(Enum(AssignmentStatusEnum), default=AssignmentStatusEnum.PENDING)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    metadata = Column(JSON, default={})  # Additional assignment data
    
    # Relationships
    project = relationship("Project", back_populates="project_assignments")
    employee = relationship("Employee", back_populates="project_assignments")
