"""
Audit Sink Node

This node creates immutable audit trail entries.

Performance: Fast (append-only)
"""

from typing import TYPE_CHECKING
from ..schemas import AuditEntry

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def audit_sink_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Create immutable audit trail.
    
    This node:
    1. Captures full decision path
    2. Records performance metrics
    3. Creates AuditEntry for each decision
    4. Stores in state for output
    
    Performance: Fast (append-only writes)
    """
    orbix_state = state["state"]
    decisions = orbix_state.decisions
    
    if not decisions:
        print("[AuditSink] No decisions found, skipping")
        return state
    
    print(f"[AuditSink] Creating audit trail for {len(decisions)} decisions")
    
    # Get performance metrics from state
    node_start_times = state.get("node_start_times", {})
    node_end_times = state.get("node_end_times", {})
    
    # Calculate performance metrics
    performance_metrics = {}
    for node_name in node_start_times:
        if node_name in node_end_times:
            duration_ms = (node_end_times[node_name] - node_start_times[node_name]) * 1000
            performance_metrics[node_name] = duration_ms
    
    # Get decision path (nodes executed)
    decision_path = list(node_start_times.keys())
    
    # Create audit entries
    audit_entries = []
    
    for decision in decisions:
        audit_entry = AuditEntry(
            agent="OrbixTaskIntelligenceCoordinator",
            version="v1.0.0",
            decision_path=decision_path,
            final_decision=decision.mode,
            action_id=decision.action_id,
            confidence_score=decision.confidence_score,
            risk_level=decision.risk_level,
            justification_codes=decision.justification_codes,
            performance_metrics=performance_metrics
        )
        audit_entries.append(audit_entry)
        
        print(f"[AuditSink] Audit entry created: {audit_entry.audit_id}")
    
    orbix_state.audit_trail = audit_entries
    
    # In production, write to time-series DB
    # TODO: await audit_service.log_decisions(audit_entries)
    
    print(f"[AuditSink] Audit trail complete: {len(audit_entries)} entries")
    
    return state
