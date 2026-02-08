"""
Reasoning Node

This node invokes CrewAI for bounded reasoning (when needed).

Performance Target: <900ms
"""

from typing import TYPE_CHECKING

from ..crew.orbix_crew import CortexaCrew
from ..schemas import ReasoningOutput

if TYPE_CHECKING:
    from ..orbix_core import CortexaGraphState


def reasoning_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    CrewAI bounded reasoning sandbox.
    
    This node:
    1. Invokes CrewAI crew for complex decisions
    2. Crew debates internally (Workload, Risk, Org Dynamics analysts)
    3. Returns structured JSON recommendation
    4. NO memory, NO execution authority
    
    Performance: <900ms (p95)
    """
    orbix_state = state["state"]
    
    print("[Reasoning] CrewAI reasoning invoked")
    
    # Check if reasoning is needed based on policy
    policies = orbix_state.org_context.policies
    
    if not hasattr(policies, 'reasoning_enabled') or not policies.reasoning_enabled:
        print("[Reasoning] Reasoning disabled by policy, skipping")
        return state
    
    # Initialize CrewAI crew
    crew = OrbixCrew(temperature=0.0, timeout=10)
    
    # Process each assignment through reasoning
    reasoning_outputs = []
    
    for assignment in orbix_state.assignments:
        # Find the corresponding action
        action = next((a for a in orbix_state.actions if a.action_id == assignment.action_id), None)
        
        if not action:
            print(f"[Reasoning] Action not found for assignment: {assignment.action_id}")
            continue
        
        # Prepare candidates for reasoning
        candidates = []
        for member in orbix_state.org_context.org_graph:
            if member.user_id in orbix_state.capacity_data.capacity_map:
                capacity = orbix_state.capacity_data.capacity_map[member.user_id]
                candidates.append({
                    "user_id": member.user_id,
                    "skills": member.skills,
                    "team": member.team,
                    "role": member.role.value,
                    "capacity": {
                        "effective_free_hours": capacity.effective_free_hours,
                        "volatility_index": capacity.volatility_index,
                        "overload_risk": capacity.overload_risk.value
                    }
                })
        
        # Prepare org context
        org_context = {
            "org_id": orbix_state.org_context.org_id,
            "members": [
                {
                    "user_id": m.user_id,
                    "role": m.role.value,
                    "team": m.team,
                    "manager_id": m.manager_id
                }
                for m in orbix_state.org_context.org_graph
            ]
        }
        
        # Invoke CrewAI reasoning
        try:
            reasoning_output = crew.analyze_assignment(
                action=action,
                candidates=candidates,
                org_context=org_context,
                constraints=orbix_state.raw_intent.constraints if hasattr(orbix_state.raw_intent, 'constraints') else []
            )
            
            reasoning_outputs.append(reasoning_output)
            
            print(f"[Reasoning] Recommendation for {action.action_id}: {reasoning_output.recommendation}")
            print(f"[Reasoning] Confidence: {reasoning_output.confidence:.2f}, Risk: {reasoning_output.risk_level.value}")
            
        except Exception as e:
            print(f"[Reasoning] Error during reasoning for {action.action_id}: {str(e)}")
            # Continue with next assignment
    
    # Store reasoning outputs in state
    if not hasattr(orbix_state, '_reasoning_outputs'):
        orbix_state._reasoning_outputs = []
    orbix_state._reasoning_outputs.extend(reasoning_outputs)
    
    print(f"[Reasoning] Reasoning complete: {len(reasoning_outputs)} outputs generated")
    
    return state
