"""
Execution Router Node

This node routes decisions to appropriate handlers (create/propose/escalate).

Performance Target: <100ms (excluding DB I/O)
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def execution_router_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Create records or proposals.
    
    This node:
    1. Routes based on decision mode
    2. AUTO_ASSIGN → Call service layer to create Action + Assignment
    3. PROPOSE → Create Proposal record
    4. ESCALATE → Create Escalation record
    
    NEVER writes to DB directly - always through service layer.
    
    Performance: <100ms (excluding DB I/O)
    """
    orbix_state = state["state"]
    decisions = orbix_state.decisions
    
    if not decisions:
        print("[ExecutionRouter] No decisions found, skipping")
        return state
    
    print(f"[ExecutionRouter] Routing {len(decisions)} decisions")
    
    # In production, this would call service layer methods:
    # - action_service.create_action_with_assignment()
    # - proposal_service.create_proposal()
    # - escalation_service.create_escalation()
    
    # For now, we'll just log the routing
    from ..schemas import DecisionMode
    
    for decision in decisions:
        if decision.mode == DecisionMode.AUTO_ASSIGN:
            print(f"[ExecutionRouter] AUTO_ASSIGN: {decision.action_id} → {decision.assignee}")
            # TODO: await action_service.create_action_with_assignment(...)
        
        elif decision.mode == DecisionMode.PROPOSE:
            print(f"[ExecutionRouter] PROPOSE: {decision.action_id}")
            # TODO: await proposal_service.create_proposal(...)
        
        elif decision.mode == DecisionMode.ESCALATE:
            print(f"[ExecutionRouter] ESCALATE: {decision.action_id}")
            # TODO: await escalation_service.create_escalation(...)
    
    print(f"[ExecutionRouter] Routing complete")
    
    return state
