"""
Capacity Vector Node

This node computes real capacity metrics using pure math (no LLM).

Performance Target: <100ms
"""

from typing import TYPE_CHECKING
from ..schemas import RiskLevel, JustificationCode
import statistics

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def capacity_vector_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Compute real capacity (math only).
    
    This node:
    1. For each assignment, get user's capacity vector
    2. Assess overload risk based on capacity
    3. Adjust confidence score based on capacity
    4. Update risk level
    5. Add capacity justification codes
    
    Performance: <100ms (pure computation)
    """
    orbix_state = state["state"]
    assignments = orbix_state.assignments
    capacity_data = orbix_state.capacity_data
    actions = orbix_state.actions
    
    if not assignments:
        print("[CapacityVector] No assignments found, skipping")
        return state
    
    print(f"[CapacityVector] Computing capacity for {len(assignments)} assignments")
    
    # Create action lookup for effort estimation
    action_map = {action.action_id: action for action in actions}
    
    for assignment in assignments:
        user_id = assignment.recommended_user_id
        action = action_map.get(assignment.action_id)
        
        # Get capacity vector
        capacity_vector = capacity_data.capacity_map.get(user_id)
        
        if not capacity_vector:
            # No capacity data, mark as medium risk
            assignment.risk_level = RiskLevel.MEDIUM
            assignment.confidence_score *= 0.7  # Reduce confidence
            continue
        
        # Check if user has enough capacity
        estimated_hours = action.estimated_hours if action and action.estimated_hours else 8.0
        
        if estimated_hours > capacity_vector.effective_free_hours:
            # Not enough capacity
            assignment.risk_level = RiskLevel.HIGH
            assignment.confidence_score *= 0.5  # Significantly reduce confidence
            assignment.justification_codes.append(JustificationCode.CAPACITY_CONSTRAINT)
            print(f"[CapacityVector] {user_id}: Insufficient capacity ({capacity_vector.effective_free_hours}h available, {estimated_hours}h needed)")
        
        elif capacity_vector.overload_risk == RiskLevel.HIGH:
            # User already at high overload risk
            assignment.risk_level = RiskLevel.HIGH
            assignment.confidence_score *= 0.6
            assignment.justification_codes.append(JustificationCode.CAPACITY_CONSTRAINT)
            print(f"[CapacityVector] {user_id}: High overload risk")
        
        elif capacity_vector.overload_risk == RiskLevel.MEDIUM:
            # User at medium overload risk
            assignment.risk_level = RiskLevel.MEDIUM
            assignment.confidence_score *= 0.8
        
        else:
            # User has safe capacity
            assignment.risk_level = RiskLevel.LOW
            assignment.justification_codes.append(JustificationCode.CAPACITY_SAFE)
            print(f"[CapacityVector] {user_id}: Safe capacity ({capacity_vector.effective_free_hours}h available)")
    
    print(f"[CapacityVector] Capacity assessment complete")
    
    return state
