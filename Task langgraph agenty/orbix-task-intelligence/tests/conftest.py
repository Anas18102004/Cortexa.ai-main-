"""Test configuration"""

import pytest
import asyncio


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_org_context():
    """Sample organization context for testing"""
    from src.schemas import OrgContext, PolicyConfig, OrgMember, OrgRole
    
    return OrgContext(
        org_id="test_org_001",
        policies=PolicyConfig(
            auto_assign_enabled=True,
            min_confidence=0.8
        ),
        org_graph=[
            OrgMember(
                user_id="u_001",
                role=OrgRole.IC,
                manager_id="u_100",
                skills=["React", "TypeScript"],
                team="Frontend"
            ),
            OrgMember(
                user_id="u_002",
                role=OrgRole.IC,
                manager_id="u_100",
                skills=["Python", "FastAPI"],
                team="Backend"
            ),
            OrgMember(
                user_id="u_100",
                role=OrgRole.MANAGER,
                manager_id=None,
                skills=["Product Management"],
                team="Engineering"
            ),
        ]
    )


@pytest.fixture
def sample_capacity_data():
    """Sample capacity data for testing"""
    from src.schemas import CapacityData, CapacityVector, RiskLevel
    
    return CapacityData(
        capacity_map={
            "u_001": CapacityVector(
                user_id="u_001",
                effective_free_hours=30.0,
                volatility_index=0.12,
                overload_risk=RiskLevel.LOW
            ),
            "u_002": CapacityVector(
                user_id="u_002",
                effective_free_hours=25.0,
                volatility_index=0.18,
                overload_risk=RiskLevel.MEDIUM
            ),
        }
    )
