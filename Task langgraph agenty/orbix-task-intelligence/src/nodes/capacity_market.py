"""
Capacity Market Node

This node implements the human-in-the-loop capacity market.

Performance: Async (does not block)
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def capacity_market_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Offer work (accept/defer/decline).
    
    This node:
    1. For each assignment, offer work to the candidate
    2. This is async - does not block the graph
    3. In production, this would send notifications
    4. For now, we'll simulate immediate acceptance for high-confidence assignments
    
    Performance: Async (non-blocking)
    """
    orbix_state = state["state"]
    assignments = orbix_state.assignments
    market_signals = orbix_state.market_signals
    
    if not assignments:
        print("[CapacityMarket] No assignments found, skipping")
        return state
    
    print(f"[CapacityMarket] Processing {len(assignments)} work offers")
    
    # In production, this would:
    # 1. Send notifications to users
    # 2. Wait for responses (async)
    # 3. Track accept/defer/decline signals
    
    # For now, simulate responses based on confidence and risk
    from ..schemas import MarketResponse, JustificationCode
    
    for assignment in assignments:
        # Simulation logic:
        # - High confidence (>0.8) + Low risk → ACCEPT
        # - Medium confidence (0.5-0.8) → DEFER (needs review)
        # - Low confidence (<0.5) or High risk → DECLINE
        
        if assignment.confidence_score >= 0.8 and assignment.risk_level.value == "LOW":
            assignment.market_response = MarketResponse.ACCEPT
            assignment.justification_codes.append(JustificationCode.HUMAN_ACCEPTED)
            print(f"[CapacityMarket] {assignment.recommended_user_id} → ACCEPT (confidence: {assignment.confidence_score:.2f})")
        
        elif assignment.confidence_score >= 0.5:
            assignment.market_response = MarketResponse.DEFER
            print(f"[CapacityMarket] {assignment.recommended_user_id} → DEFER (needs review)")
        
        else:
            assignment.market_response = MarketResponse.DECLINE
            assignment.justification_codes.append(JustificationCode.HUMAN_DECLINED)
            print(f"[CapacityMarket] {assignment.recommended_user_id} → DECLINE (low confidence)")
    
    print(f"[CapacityMarket] Market processing complete")
    
    return state
