"""
Orbix Task Intelligence System - Example Usage

This script demonstrates how to use the Orbix system.
"""

import asyncio
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
from src.orbix_core import OrbixTaskIntelligenceCoordinator


async def main():
    """
    Example: Process a project intent and get work allocation decisions.
    """
    
    print("=" * 80)
    print("ORBIX TASK INTELLIGENCE SYSTEM - EXAMPLE")
    print("=" * 80)
    print()
    
    # Step 1: Define the raw intent
    raw_intent = RawIntent(
        description="""
        Build a user onboarding flow for our SaaS application.
        
        Requirements:
        - Welcome screen with product tour
        - User profile setup (name, avatar, preferences)
        - Team invitation flow
        - Integration setup wizard
        - Success confirmation
        
        The flow should be intuitive, mobile-responsive, and complete in under 5 minutes.
        Success metric: 80% completion rate.
        """,
        documents=[],
        meeting_notes=[]
    )
    
    # Step 2: Define organization context
    org_members = [
        OrgMember(
            user_id="u_001",
            role=OrgRole.IC,
            manager_id="u_100",
            skills=["React", "TypeScript", "UI/UX Design", "Figma"],
            team="Frontend"
        ),
        OrgMember(
            user_id="u_002",
            role=OrgRole.IC,
            manager_id="u_100",
            skills=["React", "JavaScript", "CSS", "Animation"],
            team="Frontend"
        ),
        OrgMember(
            user_id="u_003",
            role=OrgRole.IC,
            manager_id="u_100",
            skills=["Python", "FastAPI", "PostgreSQL", "Redis"],
            team="Backend"
        ),
        OrgMember(
            user_id="u_100",
            role=OrgRole.MANAGER,
            manager_id=None,
            skills=["Product Management", "Agile"],
            team="Engineering"
        ),
    ]
    
    org_context = OrgContext(
        org_id="org_demo_001",
        policies=PolicyConfig(
            auto_assign_enabled=True,
            min_confidence=0.8,
            max_risk=RiskLevel.LOW
        ),
        org_graph=org_members
    )
    
    # Step 3: Define capacity data
    capacity_data = CapacityData(
        capacity_map={
            "u_001": CapacityVector(
                user_id="u_001",
                effective_free_hours=30.0,  # 30 hours available
                volatility_index=0.12,       # Low volatility (stable)
                overload_risk=RiskLevel.LOW
            ),
            "u_002": CapacityVector(
                user_id="u_002",
                effective_free_hours=15.0,  # 15 hours available
                volatility_index=0.25,       # Medium volatility
                overload_risk=RiskLevel.MEDIUM
            ),
            "u_003": CapacityVector(
                user_id="u_003",
                effective_free_hours=40.0,  # 40 hours available
                volatility_index=0.08,       # Very low volatility
                overload_risk=RiskLevel.LOW
            ),
        }
    )
    
    # Step 4: Execute the Orbix system
    print("Initializing Orbix Task Intelligence Coordinator...")
    print()
    
    coordinator = OrbixTaskIntelligenceCoordinator()
    
    print("Processing intent...")
    print()
    
    result = await coordinator.execute(
        raw_intent=raw_intent,
        org_context=org_context,
        capacity_data=capacity_data
    )
    
    # Step 5: Display results
    print()
    print("=" * 80)
    print("RESULTS")
    print("=" * 80)
    print()
    
    print(f"Mission: {result.mission.mission_id}")
    print(f"  Goal: {result.mission.goal}")
    print(f"  Success Criteria:")
    for criterion in result.mission.success_criteria:
        print(f"    - {criterion}")
    print()
    
    print(f"Deliverables: {len(result.deliverables)}")
    for deliverable in result.deliverables:
        print(f"  - {deliverable.deliverable_id}: {deliverable.outcome}")
    print()
    
    print(f"Actions: {len(result.actions)}")
    for action_decision in result.actions:
        action = action_decision["action"]
        decision = action_decision["decision"]
        explanation = action_decision["explanation"]
        
        print(f"  - {action.action_id}: {action.description[:60]}...")
        print(f"    Decision: {decision.mode.value}")
        print(f"    Confidence: {decision.confidence_score:.2f}")
        print(f"    Risk: {decision.risk_level.value}")
        if decision.assignee:
            print(f"    Assignee: {decision.assignee}")
        print(f"    Explanation: {explanation.explanation}")
        print()
    
    print(f"Audit Trail: {len(result.audit)} entries")
    for audit in result.audit:
        print(f"  - {audit.audit_id}")
        print(f"    Decision: {audit.final_decision.value}")
        print(f"    Confidence: {audit.confidence_score:.2f}")
        print(f"    Justifications: {', '.join([j.value for j in audit.justification_codes])}")
        print()
    
    print("=" * 80)
    print("EXECUTION COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
