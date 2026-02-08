"""
Test Suite - Policy Gate Node

Tests for the PolicyGateNode.
"""

import pytest
from src.nodes.policy_gate import policy_gate_node
from src.schemas import (
    OrbixState,
    RawIntent,
    OrgContext,
    PolicyConfig,
    CapacityData,
    Action,
    Assignment,
    RiskLevel,
    MarketResponse,
    JustificationCode,
    DecisionMode,
)


def test_policy_gate_auto_assign():
    """Test AUTO_ASSIGN decision"""
    # Create test data
    action = Action(
        deliverable_id="d_001",
        mission_id="m_001",
        description="Build login UI",
        required_skills=["React"],
        estimated_hours=8.0
    )
    
    assignment = Assignment(
        action_id=action.action_id,
        recommended_user_id="u_001",
        confidence_score=0.9,  # High confidence
        risk_level=RiskLevel.LOW,  # Low risk
        market_response=MarketResponse.ACCEPT,  # Accepted
        justification_codes=[JustificationCode.SKILL_MATCH, JustificationCode.CAPACITY_SAFE]
    )
    
    orbix_state = OrbixState(
        raw_intent=RawIntent(description="test"),
        org_context=OrgContext(
            org_id="test",
            policies=PolicyConfig(auto_assign_enabled=True, min_confidence=0.8),
            org_graph=[]
        ),
        capacity_data=CapacityData(capacity_map={}),
        actions=[action],
        assignments=[assignment]
    )
    
    graph_state = {
        "state": orbix_state,
        "node_start_times": {},
        "node_end_times": {},
        "errors": [],
        "fallback_triggered": False
    }
    
    # Execute node
    result_state = policy_gate_node(graph_state)
    
    # Verify AUTO_ASSIGN decision
    assert len(result_state["state"].decisions) == 1
    decision = result_state["state"].decisions[0]
    
    assert decision.mode == DecisionMode.AUTO_ASSIGN
    assert decision.assignee == "u_001"
    assert decision.confidence_score == 0.9


def test_policy_gate_propose():
    """Test PROPOSE decision (low confidence)"""
    action = Action(
        deliverable_id="d_001",
        mission_id="m_001",
        description="Build login UI",
        required_skills=["React"],
        estimated_hours=8.0
    )
    
    assignment = Assignment(
        action_id=action.action_id,
        recommended_user_id="u_001",
        confidence_score=0.6,  # Below threshold
        risk_level=RiskLevel.LOW,
        market_response=MarketResponse.ACCEPT,
        justification_codes=[JustificationCode.SKILL_MATCH]
    )
    
    orbix_state = OrbixState(
        raw_intent=RawIntent(description="test"),
        org_context=OrgContext(
            org_id="test",
            policies=PolicyConfig(auto_assign_enabled=True, min_confidence=0.8),
            org_graph=[]
        ),
        capacity_data=CapacityData(capacity_map={}),
        actions=[action],
        assignments=[assignment]
    )
    
    graph_state = {
        "state": orbix_state,
        "node_start_times": {},
        "node_end_times": {},
        "errors": [],
        "fallback_triggered": False
    }
    
    result_state = policy_gate_node(graph_state)
    
    # Verify PROPOSE decision
    decision = result_state["state"].decisions[0]
    assert decision.mode == DecisionMode.PROPOSE
    assert decision.assignee is None  # No assignee for PROPOSE


def test_policy_gate_escalate():
    """Test ESCALATE decision (high risk or declined)"""
    action = Action(
        deliverable_id="d_001",
        mission_id="m_001",
        description="Build login UI",
        required_skills=["React"],
        estimated_hours=8.0
    )
    
    assignment = Assignment(
        action_id=action.action_id,
        recommended_user_id="u_001",
        confidence_score=0.9,
        risk_level=RiskLevel.HIGH,  # High risk
        market_response=MarketResponse.ACCEPT,
        justification_codes=[JustificationCode.SKILL_MATCH]
    )
    
    orbix_state = OrbixState(
        raw_intent=RawIntent(description="test"),
        org_context=OrgContext(
            org_id="test",
            policies=PolicyConfig(auto_assign_enabled=True, min_confidence=0.8),
            org_graph=[]
        ),
        capacity_data=CapacityData(capacity_map={}),
        actions=[action],
        assignments=[assignment]
    )
    
    graph_state = {
        "state": orbix_state,
        "node_start_times": {},
        "node_end_times": {},
        "errors": [],
        "fallback_triggered": False
    }
    
    result_state = policy_gate_node(graph_state)
    
    # Verify ESCALATE decision
    decision = result_state["state"].decisions[0]
    assert decision.mode == DecisionMode.ESCALATE


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
