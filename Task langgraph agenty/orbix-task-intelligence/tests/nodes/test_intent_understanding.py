"""
Test Suite - Intent Understanding Node

Tests for the IntentUnderstandingNode.
"""

import pytest
from src.nodes.intent_understanding import intent_understanding_node, StructuredIntent
from src.schemas import RawIntent, OrgContext, CapacityData, MarketSignals, OrbixState


@pytest.mark.asyncio
async def test_intent_understanding_basic():
    """Test basic intent understanding"""
    # Create test state
    raw_intent = RawIntent(
        description="Build a user login page with email and password fields",
        documents=[],
        meeting_notes=[]
    )
    
    orbix_state = OrbixState(
        raw_intent=raw_intent,
        org_context=OrgContext(org_id="test", policies={}, org_graph=[]),
        capacity_data=CapacityData(capacity_map={})
    )
    
    graph_state = {
        "state": orbix_state,
        "node_start_times": {},
        "node_end_times": {},
        "errors": [],
        "fallback_triggered": False
    }
    
    # Execute node
    result_state = intent_understanding_node(graph_state)
    
    # Verify structured intent was created
    assert hasattr(result_state["state"], '_structured_intent')
    structured_intent = result_state["state"]._structured_intent
    
    assert isinstance(structured_intent, StructuredIntent)
    assert len(structured_intent.goal) > 0
    assert len(structured_intent.success_criteria) >= 1


@pytest.mark.asyncio
async def test_intent_understanding_with_constraints():
    """Test intent understanding with constraints"""
    raw_intent = RawIntent(
        description="""
        Build a dashboard with the following constraints:
        - Must load in under 2 seconds
        - Must be mobile-responsive
        - Must support dark mode
        """,
        documents=[],
        meeting_notes=[]
    )
    
    orbix_state = OrbixState(
        raw_intent=raw_intent,
        org_context=OrgContext(org_id="test", policies={}, org_graph=[]),
        capacity_data=CapacityData(capacity_map={})
    )
    
    graph_state = {
        "state": orbix_state,
        "node_start_times": {},
        "node_end_times": {},
        "errors": [],
        "fallback_triggered": False
    }
    
    result_state = intent_understanding_node(graph_state)
    
    structured_intent = result_state["state"]._structured_intent
    
    # Should extract constraints
    assert len(structured_intent.constraints) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
