"""
CORTEXA AI - Task Intelligence System - Core Orchestration

This is the main LangGraph state machine that orchestrates the entire system.

Authority Contract:
- LangGraph is the Boss (deterministic orchestration)
- CrewAI is a Thinking Sandbox (bounded reasoning, no execution authority)
- AI never writes to DB (all writes through service layer)
"""

import time
from typing import Annotated, Literal, TypedDict, Optional
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

from .schemas import (
    CortexaState,
    RawIntent,
    OrgContext,
    CapacityData,
    MarketSignals,
    Mission,
    Deliverable,
    Action,
    Decision,
    AuditEntry,
    DecisionMode,
    CortexaOutput,
)


class CortexaGraphState(TypedDict):
    """
    LangGraph state container.
    
    This wraps our CortexaState and provides the interface for LangGraph.
    """
    # Core state (using CortexaState schema)
    state: CortexaState
    performance_metrics: dict
    error: Optional[str]
    
    # Performance tracking
    node_start_times: dict[str, float]
    node_end_times: dict[str, float]
    
    # Error handling
    errors: list[str]
    fallback_triggered: bool


class CortexaTaskIntelligenceCoordinator:
    """
    CORTEXA AI Task Intelligence System - Main Coordinator for the Orbix Task Intelligence System.
    
    This class builds and executes the LangGraph state machine.
    
    Authority Contract:
    - Allowed: CREATE_MISSION, CREATE_DELIVERABLE, PROPOSE_ACTION, 
               PROPOSE_ASSIGNMENT, REQUEST_APPROVAL, ESCALATE_RISK, 
               RECOMMEND_DELAY
    - Forbidden: Direct DB writes, Silent assignment, Deadline changes,
                 Role changes, Self-modification
    """
    
    def __init__(self):
        """Initialize the coordinator and build the graph"""
        self.graph = self._build_graph()
        self.version = "v1.0.0"
    
    def _build_graph(self) -> StateGraph:
        """
        Build the LangGraph state machine.
        
        Flow:
        1. IntentUnderstanding
        2. MissionBuilder
        3. DeliverableDecomposition
        4. ActionDecomposition
        5. EligibilityFilter
        6. CapacityVector
        7. CapacityMarket
        8. Reasoning (conditional - CrewAI)
        9. PolicyGate
        10. ExecutionRouter
        11. AuditSink
        """
        # Create the graph
        workflow = StateGraph(CortexaGraphState)
        
        # Import nodes (will be implemented in separate files)
        from .nodes.intent_understanding import intent_understanding_node
        from .nodes.mission_builder import mission_builder_node
        from .nodes.deliverable_decomposition import deliverable_decomposition_node
        from .nodes.action_decomposition import action_decomposition_node
        from .nodes.eligibility_filter import eligibility_filter_node
        from .nodes.capacity_vector import capacity_vector_node
        from .nodes.capacity_market import capacity_market_node
        from .nodes.reasoning import reasoning_node
        from .nodes.policy_gate import policy_gate_node
        from .nodes.execution_router import execution_router_node
        from .nodes.audit_sink import audit_sink_node
        
        # Add nodes to the graph
        workflow.add_node("intent_understanding", self._wrap_node(intent_understanding_node, "IntentUnderstanding"))
        workflow.add_node("mission_builder", self._wrap_node(mission_builder_node, "MissionBuilder"))
        workflow.add_node("deliverable_decomposition", self._wrap_node(deliverable_decomposition_node, "DeliverableDecomposition"))
        workflow.add_node("action_decomposition", self._wrap_node(action_decomposition_node, "ActionDecomposition"))
        workflow.add_node("eligibility_filter", self._wrap_node(eligibility_filter_node, "EligibilityFilter"))
        workflow.add_node("capacity_vector", self._wrap_node(capacity_vector_node, "CapacityVector"))
        workflow.add_node("capacity_market", self._wrap_node(capacity_market_node, "CapacityMarket"))
        workflow.add_node("reasoning", self._wrap_node(reasoning_node, "Reasoning"))
        workflow.add_node("policy_gate", self._wrap_node(policy_gate_node, "PolicyGate"))
        workflow.add_node("execution_router", self._wrap_node(execution_router_node, "ExecutionRouter"))
        workflow.add_node("audit_sink", self._wrap_node(audit_sink_node, "AuditSink"))
        
        # Define the flow
        workflow.set_entry_point("intent_understanding")
        
        # Linear flow for most nodes
        workflow.add_edge("intent_understanding", "mission_builder")
        workflow.add_edge("mission_builder", "deliverable_decomposition")
        workflow.add_edge("deliverable_decomposition", "action_decomposition")
        workflow.add_edge("action_decomposition", "eligibility_filter")
        workflow.add_edge("eligibility_filter", "capacity_vector")
        workflow.add_edge("capacity_vector", "capacity_market")
        
        # Conditional: Invoke reasoning if needed
        workflow.add_conditional_edges(
            "capacity_market",
            self._should_invoke_reasoning,
            {
                "reasoning": "reasoning",
                "policy_gate": "policy_gate"
            }
        )
        
        workflow.add_edge("reasoning", "policy_gate")
        workflow.add_edge("policy_gate", "execution_router")
        workflow.add_edge("execution_router", "audit_sink")
        workflow.add_edge("audit_sink", END)
        
        return workflow.compile()
    
    def _wrap_node(self, node_func, node_name: str):
        """
        Wrap a node function with performance tracking and error handling.
        
        This ensures:
        - Performance metrics are captured
        - Errors are caught and logged
        - State is properly updated
        """
        def wrapped(state: CortexaGraphState) -> CortexaGraphState:
            # Record start time
            start_time = time.time()
            state["node_start_times"][node_name] = start_time
            
            # Update current node in state
            state["state"].current_node = node_name
            
            try:
                # Execute the node
                state = node_func(state)
                
            except Exception as e:
                # Log error
                error_msg = f"Error in {node_name}: {str(e)}"
                state["errors"].append(error_msg)
                
                # Trigger fallback
                state["fallback_triggered"] = True
                
                # For critical nodes, we need to handle gracefully
                # For now, we'll continue with existing state
                print(f"[ERROR] {error_msg}")
            
            finally:
                # Record end time
                end_time = time.time()
                state["node_end_times"][node_name] = end_time
                
                # Calculate duration
                duration_ms = (end_time - start_time) * 1000
                
                # Store in state for audit
                if "performance_metrics" not in state["state"].audit_trail[-1].performance_metrics if state["state"].audit_trail else {}:
                    # We'll add this to audit in the audit_sink node
                    pass
                
                # Log performance
                print(f"[PERF] {node_name}: {duration_ms:.2f}ms")
            
            return state
        
        return wrapped
    
    def _should_invoke_reasoning(self, state: CortexaGraphState) -> Literal["reasoning", "policy_gate"]:
        """
        Determine if CrewAI reasoning should be invoked.
        
        Reasoning is invoked if:
        - Ambiguous intent detected
        - Conflicting constraints
        - Trade-off decisions needed
        - Complex org dynamics
        
        Otherwise, skip directly to policy gate.
        """
        orbix_state = state["state"]
        
        # Check if policy config says to invoke reasoning
        # For now, we'll use a simple heuristic:
        # - If there are multiple eligible candidates for any action
        # - If capacity is tight (high utilization)
        # - If there are conflicting constraints
        
        # TODO: Implement proper reasoning triggers based on policy
        # For now, always go to policy_gate (reasoning is optional)
        
        return "policy_gate"
    
    async def execute(
        self,
        raw_intent: RawIntent,
        org_context: OrgContext,
        capacity_data: CapacityData,
        market_signals: MarketSignals = None
    ) -> CortexaOutput:
        """
        Execute the Orbix Task Intelligence System.
        
        Args:
            raw_intent: Raw intent from user/client
            org_context: Organization context and policies
            capacity_data: Capacity data for all org members
            market_signals: Optional market signals from previous interactions
        
        Returns:
            CortexaOutput: Complete output with mission, deliverables, actions, decisions
        
        Raises:
            Exception: If critical error occurs and fallback fails
        """
        # Initialize state
        initial_state = CortexaState(
            raw_intent=raw_intent,
            org_context=org_context,
            capacity_data=capacity_data,
            market_signals=market_signals or MarketSignals()
        )
        
        graph_state: CortexaGraphState = {
            "state": initial_state,
            "node_start_times": {},
            "node_end_times": {},
            "errors": [],
            "fallback_triggered": False
        }
        
        # Execute the graph
        print(f"[ORBIX] Starting execution for intent: {raw_intent.description[:50]}...")
        
        try:
            # Run the graph
            final_state = await self.graph.ainvoke(graph_state)
            
            # Extract the result
            orbix_state = final_state["state"]
            
            # Build output
            output = CortexaOutput(
                mission=orbix_state.mission,
                deliverables=orbix_state.deliverables,
                actions=[
                    {
                        "action": action,
                        "decision": decision,
                        "explanation": explanation
                    }
                    for action, decision, explanation in zip(
                        orbix_state.actions,
                        orbix_state.decisions,
                        orbix_state.explanations
                    )
                ],
                audit=orbix_state.audit_trail
            )
            
            # Log completion
            total_time = sum(
                final_state["node_end_times"][node] - final_state["node_start_times"][node]
                for node in final_state["node_end_times"]
            ) * 1000
            
            print(f"[ORBIX] Execution complete in {total_time:.2f}ms")
            print(f"[ORBIX] Mission: {output.mission.mission_id}")
            print(f"[ORBIX] Deliverables: {len(output.deliverables)}")
            print(f"[ORBIX] Actions: {len(output.actions)}")
            
            # Check for errors
            if final_state["errors"]:
                print(f"[ORBIX] Errors encountered: {len(final_state['errors'])}")
                for error in final_state["errors"]:
                    print(f"  - {error}")
            
            return output
            
        except Exception as e:
            print(f"[ORBIX] Critical error: {str(e)}")
            raise
    
    def execute_sync(
        self,
        raw_intent: RawIntent,
        org_context: OrgContext,
        capacity_data: CapacityData,
        market_signals: MarketSignals = None
    ) -> CortexaOutput:
        """
        Synchronous version of execute().
        
        This is a convenience wrapper for non-async contexts.
        """
        import asyncio
        return asyncio.run(self.execute(raw_intent, org_context, capacity_data, market_signals))


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

async def process_intent(
    description: str,
    org_id: str,
    org_context: OrgContext,
    capacity_data: CapacityData,
    documents: list[str] = None,
    meeting_notes: list[str] = None
) -> CortexaOutput:
    """
    Convenience function to process an intent.
    
    Args:
        description: Intent description
        org_id: Organization ID
        org_context: Organization context
        capacity_data: Capacity data
        documents: Optional document IDs
        meeting_notes: Optional meeting note IDs
    
    Returns:
        CortexaOutput: Complete output
    """
    coordinator = CortexaTaskIntelligenceCoordinator()
    
    raw_intent = RawIntent(
        description=description,
        documents=documents or [],
        meeting_notes=meeting_notes or []
    )
    
    return await coordinator.execute(
        raw_intent=raw_intent,
        org_context=org_context,
        capacity_data=capacity_data
    )
