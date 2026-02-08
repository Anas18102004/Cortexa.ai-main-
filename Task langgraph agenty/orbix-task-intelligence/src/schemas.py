"""
Orbix Task Intelligence System - Core Schemas

This module defines all Pydantic models for the system.
These schemas enforce strict typing and validation throughout the system.

Philosophy: Intent → Motion → Outcome
- Mission (replaces Epic): Business/client intent
- Deliverable (replaces Story): Concrete outcome
- Action (replaces Task): Executable work
- Step (replaces Subtask): Atomic unit
- Anomaly (replaces Bug): Deviation
- Pulse (replaces Sprint): Time focus window
- SignalPool (replaces Backlog): Uncommitted signals
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from uuid import uuid4


# ============================================================================
# ENUMS - Controlled Vocabularies
# ============================================================================

class RiskLevel(str, Enum):
    """Risk assessment levels for actions and decisions"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class DecisionMode(str, Enum):
    """Decision modes for action assignment"""
    AUTO_ASSIGN = "AUTO_ASSIGN"  # Confidence >= 0.8, Risk <= LOW
    PROPOSE = "PROPOSE"           # Requires manager review
    ESCALATE = "ESCALATE"         # High risk or all declined


class MarketResponse(str, Enum):
    """Human responses to work offers in the capacity market"""
    ACCEPT = "ACCEPT"
    DEFER = "DEFER"
    DECLINE = "DECLINE"
    PENDING = "PENDING"


class ActionStatus(str, Enum):
    """Action lifecycle states"""
    PROPOSED = "PROPOSED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MissionStatus(str, Enum):
    """Mission lifecycle states"""
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class OrgRole(str, Enum):
    """Organization member roles"""
    IC = "IC"                    # Individual Contributor
    TECH_LEAD = "TECH_LEAD"
    MANAGER = "MANAGER"
    DIRECTOR = "DIRECTOR"
    EXECUTIVE = "EXECUTIVE"


class JustificationCode(str, Enum):
    """Standardized justification codes for audit trail"""
    SKILL_MATCH = "SKILL_MATCH"
    CAPACITY_SAFE = "CAPACITY_SAFE"
    HUMAN_ACCEPTED = "HUMAN_ACCEPTED"
    HISTORICAL_SUCCESS = "HISTORICAL_SUCCESS"
    TEAM_CONTINUITY = "TEAM_CONTINUITY"
    CROSS_TEAM_RISK = "CROSS_TEAM_RISK"
    CAPACITY_CONSTRAINT = "CAPACITY_CONSTRAINT"
    SKILL_GAP = "SKILL_GAP"
    HUMAN_DECLINED = "HUMAN_DECLINED"
    POLICY_VIOLATION = "POLICY_VIOLATION"


# ============================================================================
# INPUT SCHEMAS - System Inputs
# ============================================================================

class RawIntent(BaseModel):
    """Raw intent from user/client - the starting point"""
    description: str = Field(..., description="Free text project/client description")
    documents: List[str] = Field(default_factory=list, description="Document IDs for context")
    meeting_notes: List[str] = Field(default_factory=list, description="Meeting note IDs")
    
    @field_validator('description')
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()


class PolicyConfig(BaseModel):
    """Organization-level policy configuration"""
    auto_assign_enabled: bool = Field(default=True, description="Enable auto-assignment")
    min_confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Minimum confidence for auto-assign")
    max_risk: RiskLevel = Field(default=RiskLevel.LOW, description="Maximum acceptable risk for auto-assign")
    require_human_approval_for: List[str] = Field(
        default_factory=lambda: ["CROSS_TEAM_ASSIGNMENT", "HIGH_EFFORT_ACTION", "CRITICAL_PATH_ACTION"],
        description="Scenarios requiring human approval"
    )


class OrgMember(BaseModel):
    """Organization member profile"""
    user_id: str = Field(..., description="Unique user identifier")
    role: OrgRole = Field(..., description="Organization role")
    manager_id: Optional[str] = Field(None, description="Manager's user ID")
    skills: List[str] = Field(default_factory=list, description="Skill tags")
    team: Optional[str] = Field(None, description="Team identifier")


class OrgContext(BaseModel):
    """Organization context for decision-making"""
    org_id: str = Field(..., description="Organization identifier")
    policies: PolicyConfig = Field(..., description="Policy configuration")
    org_graph: List[OrgMember] = Field(..., description="Organization structure")


class CapacityVector(BaseModel):
    """Computed capacity metrics for a user"""
    user_id: str = Field(..., description="User identifier")
    effective_free_hours: float = Field(..., ge=0.0, description="Available hours after commitments")
    volatility_index: float = Field(..., ge=0.0, le=1.0, description="Workload volatility (0=stable, 1=chaotic)")
    overload_risk: RiskLevel = Field(..., description="Risk of overload")
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class CapacityData(BaseModel):
    """Capacity data for all organization members"""
    capacity_map: Dict[str, CapacityVector] = Field(..., description="User ID -> Capacity Vector")


class MarketSignal(BaseModel):
    """Market signal from capacity market interactions"""
    action_id: str
    user_id: str
    response: MarketResponse
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    reason: Optional[str] = None


class MarketSignals(BaseModel):
    """Aggregated market signals for learning"""
    accepted: List[MarketSignal] = Field(default_factory=list)
    declined: List[MarketSignal] = Field(default_factory=list)
    deferred: List[MarketSignal] = Field(default_factory=list)


# ============================================================================
# CORE DOMAIN MODELS - The New Vocabulary
# ============================================================================

class Mission(BaseModel):
    """Mission - Business/client intent (replaces Epic)"""
    mission_id: str = Field(default_factory=lambda: f"m_{uuid4().hex[:8]}")
    goal: str = Field(..., description="Clear business goal")
    success_criteria: List[str] = Field(..., min_length=1, description="Measurable success criteria")
    constraints: List[str] = Field(default_factory=list, description="Constraints and limitations")
    status: MissionStatus = Field(default=MissionStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    org_id: str = Field(..., description="Organization identifier")


class Deliverable(BaseModel):
    """Deliverable - Concrete outcome (replaces Story)"""
    deliverable_id: str = Field(default_factory=lambda: f"d_{uuid4().hex[:8]}")
    mission_id: str = Field(..., description="Parent mission")
    outcome: str = Field(..., description="Concrete outcome description")
    success_criteria: List[str] = Field(default_factory=list, description="Deliverable-specific success criteria")
    dependencies: List[str] = Field(default_factory=list, description="Dependent deliverable IDs")
    estimated_effort_hours: Optional[float] = Field(None, ge=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Action(BaseModel):
    """Action - Executable work (replaces Task)"""
    action_id: str = Field(default_factory=lambda: f"a_{uuid4().hex[:8]}")
    deliverable_id: str = Field(..., description="Parent deliverable")
    mission_id: str = Field(..., description="Root mission")
    description: str = Field(..., description="Action description")
    required_skills: List[str] = Field(default_factory=list, description="Required skills")
    estimated_hours: Optional[float] = Field(None, ge=0.0)
    dependencies: List[str] = Field(default_factory=list, description="Dependent action IDs")
    status: ActionStatus = Field(default=ActionStatus.PROPOSED)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Step(BaseModel):
    """Step - Atomic unit (replaces Subtask)"""
    step_id: str = Field(default_factory=lambda: f"s_{uuid4().hex[:8]}")
    action_id: str = Field(..., description="Parent action")
    description: str = Field(..., description="Step description")
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Anomaly(BaseModel):
    """Anomaly - Deviation from expected (replaces Bug)"""
    anomaly_id: str = Field(default_factory=lambda: f"an_{uuid4().hex[:8]}")
    action_id: Optional[str] = Field(None, description="Related action if applicable")
    description: str = Field(..., description="Anomaly description")
    severity: RiskLevel = Field(..., description="Severity level")
    detected_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# REASONING & DECISION SCHEMAS
# ============================================================================

class ReasoningOutput(BaseModel):
    """Output from CrewAI reasoning sandbox"""
    recommendation: str = Field(..., description="Recommended action")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    risk_level: RiskLevel = Field(..., description="Assessed risk level")
    tradeoffs: List[str] = Field(default_factory=list, description="Identified tradeoffs")
    why_not_others: Dict[str, str] = Field(default_factory=dict, description="Why other candidates were not chosen")


class Assignment(BaseModel):
    """Work assignment proposal"""
    action_id: str
    recommended_user_id: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: RiskLevel
    market_response: MarketResponse = Field(default=MarketResponse.PENDING)
    justification_codes: List[JustificationCode] = Field(default_factory=list)


class Decision(BaseModel):
    """Final decision for an action"""
    decision_id: str = Field(default_factory=lambda: f"dec_{uuid4().hex[:8]}")
    action_id: str
    mode: DecisionMode
    assignee: Optional[str] = Field(None, description="Assigned user ID if AUTO_ASSIGN")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: RiskLevel
    justification_codes: List[JustificationCode]
    reasoning_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HumanExplanation(BaseModel):
    """Human-readable explanation for a decision"""
    action_id: str
    explanation: str = Field(..., description="Why this decision was made")
    tradeoffs: List[str] = Field(default_factory=list)
    why_not_others: Dict[str, str] = Field(default_factory=dict)


# ============================================================================
# AUDIT & COMPLIANCE
# ============================================================================

class AuditEntry(BaseModel):
    """Immutable audit trail entry"""
    audit_id: str = Field(default_factory=lambda: f"audit_{uuid4().hex[:8]}")
    agent: str = Field(default="OrbixTaskIntelligenceCoordinator")
    version: str = Field(default="v1.0.0")
    decision_path: List[str] = Field(..., description="Nodes executed in order")
    final_decision: DecisionMode
    action_id: str
    confidence_score: float
    risk_level: RiskLevel
    justification_codes: List[JustificationCode]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    performance_metrics: Dict[str, float] = Field(default_factory=dict, description="Node execution times")


# ============================================================================
# OUTPUT SCHEMAS - System Outputs
# ============================================================================

class ActionDecision(BaseModel):
    """Complete action with decision"""
    action: Action
    decision: Decision
    explanation: HumanExplanation


class CortexaOutput(BaseModel):
    """Final output from the CORTEXA AI system"""
    mission: Mission
    deliverables: List[Deliverable]
    actions: List[ActionDecision]
    audit: List[AuditEntry]


# ============================================================================
# LANGGRAPH STATE
# ============================================================================

class CortexaState(BaseModel):
    """Main state object that flows through the CORTEXA AI graph"""
    # Inputs
    raw_intent: RawIntent
    org_context: OrgContext
    capacity_data: CapacityData
    market_signals: MarketSignals = Field(default_factory=MarketSignals)
    
    # Intermediate state
    mission: Optional[Mission] = None
    deliverables: List[Deliverable] = Field(default_factory=list)
    actions: List[Action] = Field(default_factory=list)
    assignments: List[Assignment] = Field(default_factory=list)
    reasoning_outputs: Dict[str, ReasoningOutput] = Field(default_factory=dict)
    
    # Outputs
    decisions: List[Decision] = Field(default_factory=list)
    explanations: List[HumanExplanation] = Field(default_factory=list)
    audit_trail: List[AuditEntry] = Field(default_factory=list)
    
    # Metadata
    execution_start: datetime = Field(default_factory=datetime.utcnow)
    current_node: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True
