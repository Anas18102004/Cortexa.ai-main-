"""
Integration Test - Full Flow

End-to-end test of the Orbix system.
"""

import pytest
import asyncio
from src.orbix_core import OrbixTaskIntelligenceCoordinator
from src.schemas import (
    RawIntent,
    OrgContext,
    PolicyConfig,
    OrgMember,
    OrgRole,
    CapacityData,
    CapacityVector,
    RiskLevel,
)


@pytest.mark.asyncio
async def test_full_flow_simple_project():
    """Test complete flow for a simple project"""
    # Setup
    coordinator = OrbixTaskIntelligenceCoordinator()
    
    raw_intent = RawIntent(
        description="Build a simple contact form with name, email, and message fields",
        documents=[],
        meeting_notes=[]
    )
    
    org_context = OrgContext(
        org_id="test_org",
        policies=PolicyConfig(
            auto_assign_enabled=True,
            min_confidence=0.8,
            max_risk=RiskLevel.LOW
        ),
        org_graph=[
            OrgMember(
                user_id="u_001",
                role=OrgRole.IC,
                manager_id="u_100",
                skills=["React", "TypeScript", "HTML", "CSS"],
                team="Frontend"
            )
        ]
    )
    
    capacity_data = CapacityData(
        capacity_map={
            "u_001": CapacityVector(
                user_id="u_001",
                effective_free_hours=40.0,
                volatility_index=0.1,
                overload_risk=RiskLevel.LOW
            )
        }
    )
    
    # Execute
    result = await coordinator.execute(
        raw_intent=raw_intent,
        org_context=org_context,
        capacity_data=capacity_data
    )
    
    # Verify
    assert result.mission is not None
    assert len(result.mission.mission_id) > 0
    assert len(result.mission.goal) > 0
    assert len(result.mission.success_criteria) >= 1
    
    assert len(result.deliverables) > 0
    assert all(d.mission_id == result.mission.mission_id for d in result.deliverables)
    
    assert len(result.actions) > 0
    
    # Verify audit trail
    assert len(result.audit) > 0
    assert all(a.agent == "OrbixTaskIntelligenceCoordinator" for a in result.audit)
    assert all(len(a.decision_path) > 0 for a in result.audit)


@pytest.mark.asyncio
async def test_full_flow_performance():
    """Test that full flow meets performance SLAs"""
    import time
    
    coordinator = OrbixTaskIntelligenceCoordinator()
    
    raw_intent = RawIntent(
        description="Build a user authentication system",
        documents=[],
        meeting_notes=[]
    )
    
    org_context = OrgContext(
        org_id="test_org",
        policies=PolicyConfig(),
        org_graph=[
            OrgMember(
                user_id="u_001",
                role=OrgRole.IC,
                manager_id="u_100",
                skills=["Python", "FastAPI", "PostgreSQL"],
                team="Backend"
            )
        ]
    )
    
    capacity_data = CapacityData(
        capacity_map={
            "u_001": CapacityVector(
                user_id="u_001",
                effective_free_hours=30.0,
                volatility_index=0.15,
                overload_risk=RiskLevel.LOW
            )
        }
    )
    
    # Measure execution time
    start_time = time.time()
    
    result = await coordinator.execute(
        raw_intent=raw_intent,
        org_context=org_context,
        capacity_data=capacity_data
    )
    
    end_time = time.time()
    total_time_ms = (end_time - start_time) * 1000
    
    # Verify performance (should be under 10 seconds for full flow)
    assert total_time_ms < 10000, f"Execution took {total_time_ms}ms, expected < 10000ms"
    
    print(f"Full flow completed in {total_time_ms:.2f}ms")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
