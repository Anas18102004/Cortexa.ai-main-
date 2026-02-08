"""
Policy Gate Node

This node decides AUTO / PROPOSE / ESCALATE based on policies.

Performance Target: <50ms (pure logic)
"""

from typing import TYPE_CHECKING
from ..schemas import Decision, DecisionMode, HumanExplanation

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def policy_gate_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Decide AUTO / PROPOSE / ESCALATE.
    
    This node:
    1. For each assignment, apply policy rules
    2. Decide: AUTO_ASSIGN, PROPOSE, or ESCALATE
    3. Create Decision objects
    4. Create HumanExplanation objects
    
    Performance: <50ms (pure logic)
    """
    orbix_state = state["state"]
    assignments = orbix_state.assignments
    actions = orbix_state.actions
    org_context = orbix_state.org_context
    
    if not assignments:
        print("[PolicyGate] No assignments found, skipping")
        return state
    
    print(f"[PolicyGate] Applying policies to {len(assignments)} assignments")
    
    # Get policy config
    policies = org_context.policies
    
    # Create action lookup
    action_map = {action.action_id: action for action in actions}
    
    decisions = []
    explanations = []
    
    # Group assignments by action (take best assignment per action)
    action_assignments = {}
    for assignment in assignments:
        action_id = assignment.action_id
        if action_id not in action_assignments or assignment.confidence_score > action_assignments[action_id].confidence_score:
            action_assignments[action_id] = assignment
    
    for action_id, assignment in action_assignments.items():
        action = action_map.get(action_id)
        
        # Determine decision mode using policy
        from ..schemas import MarketResponse
        
        # Check for escalation conditions
        if assignment.market_response == MarketResponse.DECLINE:
            mode = DecisionMode.ESCALATE
            explanation_text = f"Assignment declined by {assignment.recommended_user_id}. Requires manager intervention."
        
        elif assignment.risk_level.value == "HIGH":
            mode = DecisionMode.ESCALATE
            explanation_text = f"High risk detected. Requires manager review."
        
        elif assignment.confidence_score < policies.min_confidence:
            mode = DecisionMode.PROPOSE
            explanation_text = f"Confidence ({assignment.confidence_score:.2f}) below threshold ({policies.min_confidence}). Requires approval."
        
        elif assignment.market_response == MarketResponse.ACCEPT:
            # Check if auto-assign is allowed
            if policies.auto_assign_enabled and assignment.confidence_score >= policies.min_confidence:
                mode = DecisionMode.AUTO_ASSIGN
                explanation_text = f"Auto-assigned to {assignment.recommended_user_id} based on skill match and capacity availability."
            else:
                mode = DecisionMode.PROPOSE
                explanation_text = f"Proposed assignment to {assignment.recommended_user_id}. Awaiting manager approval."
        
        else:
            # DEFER or PENDING
            mode = DecisionMode.PROPOSE
            explanation_text = f"Assignment deferred. Requires manager review."
        
        # Create decision
        decision = Decision(
            action_id=action_id,
            mode=mode,
            assignee=assignment.recommended_user_id if mode == DecisionMode.AUTO_ASSIGN else None,
            confidence_score=assignment.confidence_score,
            risk_level=assignment.risk_level,
            justification_codes=assignment.justification_codes,
            reasoning_summary=explanation_text
        )
        decisions.append(decision)
        
        # Create human explanation
        explanation = HumanExplanation(
            action_id=action_id,
            explanation=explanation_text,
            tradeoffs=[],
            why_not_others={}
        )
        explanations.append(explanation)
        
        print(f"[PolicyGate] {action_id} → {mode.value}")
    
    orbix_state.decisions = decisions
    orbix_state.explanations = explanations
    
    print(f"[PolicyGate] Decisions: {len(decisions)}")
    print(f"  - AUTO_ASSIGN: {sum(1 for d in decisions if d.mode == DecisionMode.AUTO_ASSIGN)}")
    print(f"  - PROPOSE: {sum(1 for d in decisions if d.mode == DecisionMode.PROPOSE)}")
    print(f"  - ESCALATE: {sum(1 for d in decisions if d.mode == DecisionMode.ESCALATE)}")
    
    return state
