"""
Orbix Task Intelligence System - Policy Configuration

This module defines policy enforcement rules and configuration.
Policies gate all AI autonomy and ensure human oversight.

Philosophy: If a human manager cannot understand or defend a decision,
the AI must not automate it.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from ..schemas import RiskLevel, DecisionMode, JustificationCode


class AssignmentPolicy(BaseModel):
    """Policies for action assignment"""
    
    # Auto-assignment thresholds
    min_confidence_for_auto: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Minimum confidence score required for auto-assignment"
    )
    
    max_risk_for_auto: RiskLevel = Field(
        default=RiskLevel.LOW,
        description="Maximum risk level allowed for auto-assignment"
    )
    
    # Human approval triggers
    require_approval_for_cross_team: bool = Field(
        default=True,
        description="Require human approval for cross-team assignments"
    )
    
    require_approval_for_high_effort: bool = Field(
        default=True,
        description="Require approval for actions > threshold hours"
    )
    
    high_effort_threshold_hours: float = Field(
        default=40.0,
        description="Hours threshold for high-effort actions"
    )
    
    require_approval_for_critical_path: bool = Field(
        default=True,
        description="Require approval for critical path actions"
    )


class CapacityPolicy(BaseModel):
    """Policies for capacity management"""
    
    # Overload prevention
    max_utilization_percent: float = Field(
        default=85.0,
        ge=0.0,
        le=100.0,
        description="Maximum capacity utilization before overload risk"
    )
    
    buffer_hours_per_week: float = Field(
        default=8.0,
        description="Buffer hours reserved for unexpected work"
    )
    
    # Volatility thresholds
    high_volatility_threshold: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Volatility index threshold for high risk"
    )
    
    medium_volatility_threshold: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
        description="Volatility index threshold for medium risk"
    )


class EscalationPolicy(BaseModel):
    """Policies for escalation triggers"""
    
    # Escalation conditions
    escalate_on_all_declined: bool = Field(
        default=True,
        description="Escalate if all candidates decline"
    )
    
    escalate_on_high_risk: bool = Field(
        default=True,
        description="Escalate if risk level is HIGH"
    )
    
    escalate_on_low_confidence: bool = Field(
        default=True,
        description="Escalate if confidence is below threshold"
    )
    
    low_confidence_threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Confidence threshold for escalation"
    )
    
    max_decline_attempts: int = Field(
        default=3,
        description="Maximum number of decline attempts before escalation"
    )


class ReasoningPolicy(BaseModel):
    """Policies for when to invoke CrewAI reasoning"""
    
    # Reasoning triggers
    invoke_on_ambiguous_intent: bool = Field(
        default=True,
        description="Invoke reasoning for ambiguous intent"
    )
    
    invoke_on_conflicting_constraints: bool = Field(
        default=True,
        description="Invoke reasoning for conflicting constraints"
    )
    
    invoke_on_tradeoff_decisions: bool = Field(
        default=True,
        description="Invoke reasoning for tradeoff decisions"
    )
    
    invoke_on_complex_org_dynamics: bool = Field(
        default=True,
        description="Invoke reasoning for complex org dynamics"
    )
    
    # Reasoning constraints
    max_reasoning_time_ms: int = Field(
        default=900,
        description="Maximum time allowed for reasoning (milliseconds)"
    )


class AuditPolicy(BaseModel):
    """Policies for audit trail and compliance"""
    
    # Audit requirements
    require_justification_codes: bool = Field(
        default=True,
        description="Require justification codes for all decisions"
    )
    
    require_performance_metrics: bool = Field(
        default=True,
        description="Require performance metrics in audit trail"
    )
    
    audit_retention_days: int = Field(
        default=365,
        description="Days to retain audit records"
    )
    
    # Explainability
    require_human_explanation: bool = Field(
        default=True,
        description="Require human-readable explanation for all decisions"
    )
    
    min_explanation_length: int = Field(
        default=50,
        description="Minimum characters for explanation"
    )


class CortexaPolicyConfig(BaseModel):
    """Complete policy configuration for CORTEXA AI system"""
    
    assignment: AssignmentPolicy = Field(default_factory=AssignmentPolicy)
    capacity: CapacityPolicy = Field(default_factory=CapacityPolicy)
    escalation: EscalationPolicy = Field(default_factory=EscalationPolicy)
    reasoning: ReasoningPolicy = Field(default_factory=ReasoningPolicy)
    audit: AuditPolicy = Field(default_factory=AuditPolicy)
    
    # Global settings
    org_id: str = Field(..., description="Organization identifier")
    enabled: bool = Field(default=True, description="System enabled flag")
    
    def should_auto_assign(
        self,
        confidence: float,
        risk_level: RiskLevel,
        is_cross_team: bool,
        effort_hours: Optional[float],
        is_critical_path: bool
    ) -> bool:
        """
        Determine if action should be auto-assigned based on policies.
        
        Returns True only if ALL conditions are met:
        - Confidence >= min_confidence_for_auto
        - Risk <= max_risk_for_auto
        - No human approval triggers are active
        """
        # Check confidence threshold
        if confidence < self.assignment.min_confidence_for_auto:
            return False
        
        # Check risk threshold
        risk_order = {RiskLevel.LOW: 0, RiskLevel.MEDIUM: 1, RiskLevel.HIGH: 2}
        if risk_order[risk_level] > risk_order[self.assignment.max_risk_for_auto]:
            return False
        
        # Check cross-team policy
        if is_cross_team and self.assignment.require_approval_for_cross_team:
            return False
        
        # Check high-effort policy
        if (effort_hours is not None and 
            effort_hours > self.assignment.high_effort_threshold_hours and
            self.assignment.require_approval_for_high_effort):
            return False
        
        # Check critical path policy
        if is_critical_path and self.assignment.require_approval_for_critical_path:
            return False
        
        return True
    
    def should_escalate(
        self,
        confidence: float,
        risk_level: RiskLevel,
        decline_count: int,
        all_declined: bool
    ) -> bool:
        """
        Determine if action should be escalated based on policies.
        
        Returns True if ANY escalation condition is met.
        """
        # Check high risk
        if risk_level == RiskLevel.HIGH and self.escalation.escalate_on_high_risk:
            return True
        
        # Check low confidence
        if (confidence < self.escalation.low_confidence_threshold and
            self.escalation.escalate_on_low_confidence):
            return True
        
        # Check all declined
        if all_declined and self.escalation.escalate_on_all_declined:
            return True
        
        # Check max decline attempts
        if decline_count >= self.escalation.max_decline_attempts:
            return True
        
        return False
    
    def should_invoke_reasoning(
        self,
        has_ambiguous_intent: bool = False,
        has_conflicting_constraints: bool = False,
        has_tradeoffs: bool = False,
        has_complex_org_dynamics: bool = False
    ) -> bool:
        """
        Determine if CrewAI reasoning should be invoked.
        
        Returns True if ANY reasoning trigger is active.
        """
        if has_ambiguous_intent and self.reasoning.invoke_on_ambiguous_intent:
            return True
        
        if has_conflicting_constraints and self.reasoning.invoke_on_conflicting_constraints:
            return True
        
        if has_tradeoffs and self.reasoning.invoke_on_tradeoff_decisions:
            return True
        
        if has_complex_org_dynamics and self.reasoning.invoke_on_complex_org_dynamics:
            return True
        
        return False


# ============================================================================
# DEFAULT POLICY CONFIGURATIONS
# ============================================================================

def get_default_policy_config(org_id: str) -> CortexaPolicyConfig:
    """Get default policy configuration for an organization"""
    return CortexaPolicyConfig(
        org_id=org_id,
        assignment=AssignmentPolicy(),
        capacity=CapacityPolicy(),
        escalation=EscalationPolicy(),
        reasoning=ReasoningPolicy(),
        audit=AuditPolicy()
    )


def get_conservative_policy_config(org_id: str) -> CortexaPolicyConfig:
    """
    Get conservative policy configuration.
    Requires human approval for most decisions.
    """
    return CortexaPolicyConfig(
        org_id=org_id,
        assignment=AssignmentPolicy(
            min_confidence_for_auto=0.95,  # Very high confidence required
            max_risk_for_auto=RiskLevel.LOW,
            require_approval_for_cross_team=True,
            require_approval_for_high_effort=True,
            high_effort_threshold_hours=20.0,  # Lower threshold
            require_approval_for_critical_path=True
        ),
        capacity=CapacityPolicy(
            max_utilization_percent=75.0,  # More conservative
            buffer_hours_per_week=12.0,  # Larger buffer
            high_volatility_threshold=0.2,
            medium_volatility_threshold=0.1
        ),
        escalation=EscalationPolicy(
            escalate_on_all_declined=True,
            escalate_on_high_risk=True,
            escalate_on_low_confidence=True,
            low_confidence_threshold=0.7,  # Higher threshold
            max_decline_attempts=2  # Fewer attempts
        ),
        reasoning=ReasoningPolicy(
            invoke_on_ambiguous_intent=True,
            invoke_on_conflicting_constraints=True,
            invoke_on_tradeoff_decisions=True,
            invoke_on_complex_org_dynamics=True,
            max_reasoning_time_ms=900
        ),
        audit=AuditPolicy()
    )


def get_aggressive_policy_config(org_id: str) -> CortexaPolicyConfig:
    """
    Get aggressive policy configuration.
    Maximizes automation with minimal human intervention.
    """
    return CortexaPolicyConfig(
        org_id=org_id,
        assignment=AssignmentPolicy(
            min_confidence_for_auto=0.7,  # Lower confidence acceptable
            max_risk_for_auto=RiskLevel.MEDIUM,  # Accept medium risk
            require_approval_for_cross_team=False,
            require_approval_for_high_effort=False,
            high_effort_threshold_hours=80.0,  # Higher threshold
            require_approval_for_critical_path=False
        ),
        capacity=CapacityPolicy(
            max_utilization_percent=90.0,  # Higher utilization
            buffer_hours_per_week=4.0,  # Smaller buffer
            high_volatility_threshold=0.4,
            medium_volatility_threshold=0.2
        ),
        escalation=EscalationPolicy(
            escalate_on_all_declined=True,
            escalate_on_high_risk=True,
            escalate_on_low_confidence=False,  # Don't escalate on low confidence
            low_confidence_threshold=0.3,
            max_decline_attempts=5  # More attempts
        ),
        reasoning=ReasoningPolicy(
            invoke_on_ambiguous_intent=True,
            invoke_on_conflicting_constraints=True,
            invoke_on_tradeoff_decisions=False,  # Skip for speed
            invoke_on_complex_org_dynamics=False,  # Skip for speed
            max_reasoning_time_ms=500  # Faster reasoning
        ),
        audit=AuditPolicy()
    )
