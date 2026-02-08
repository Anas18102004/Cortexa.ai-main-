"""
Mission Builder Node

This node creates a Mission from structured intent.

Performance Target: <50ms (deterministic)
"""

from typing import TYPE_CHECKING
from datetime import datetime

from ..schemas import Mission, MissionStatus

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def mission_builder_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Create Mission from structured intent.
    
    This node:
    1. Takes structured intent from previous node
    2. Creates a Mission object
    3. Generates mission ID
    4. Sets initial status to DRAFT
    
    Performance: <50ms (deterministic, no LLM)
    """
    orbix_state = state["state"]
    
    print("[MissionBuilder] Creating mission...")
    
    # Get structured intent from previous node
    structured_intent = getattr(orbix_state, '_structured_intent', None)
    
    if not structured_intent:
        # Fallback: Use raw intent
        mission = Mission(
            goal=orbix_state.raw_intent.description,
            success_criteria=["Project completed successfully"],
            constraints=[],
            status=MissionStatus.DRAFT,
            org_id=orbix_state.org_context.org_id
        )
    else:
        # Create mission from structured intent
        mission = Mission(
            goal=structured_intent.goal,
            success_criteria=structured_intent.success_criteria,
            constraints=structured_intent.constraints,
            status=MissionStatus.DRAFT,
            org_id=orbix_state.org_context.org_id
        )
    
    # Store in state
    orbix_state.mission = mission
    
    print(f"[MissionBuilder] Created mission: {mission.mission_id}")
    print(f"[MissionBuilder] Goal: {mission.goal}")
    print(f"[MissionBuilder] Success criteria: {len(mission.success_criteria)}")
    
    return state
