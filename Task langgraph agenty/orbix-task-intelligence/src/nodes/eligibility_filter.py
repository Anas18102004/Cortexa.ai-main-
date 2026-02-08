"""
Eligibility Filter Node

This node filters out impossible assignees for each action.

Performance Target: <50ms (pure logic, no LLM)
"""

from typing import TYPE_CHECKING
from ..schemas import Assignment, MarketResponse, RiskLevel, JustificationCode

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


def eligibility_filter_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Remove impossible assignees.
    
    This node:
    1. For each action, identify eligible candidates
    2. Filter by required skills vs. org member skills
    3. Filter by role constraints (IC vs. Manager)
    4. Filter by availability (future: PTO, leave)
    5. Create preliminary assignments
    
    Performance: <50ms (pure logic)
    """
    orbix_state = state["state"]
    actions = orbix_state.actions
    org_context = orbix_state.org_context
    
    if not actions:
        print("[EligibilityFilter] No actions found, skipping")
        return state
    
    print(f"[EligibilityFilter] Filtering eligibility for {len(actions)} actions")
    
    assignments = []
    
    for action in actions:
        # Get required skills
        required_skills = set(action.required_skills)
        
        # Find eligible members
        eligible_members = []
        
        for member in org_context.org_graph:
            # Filter 1: Role constraint (for now, only ICs and Tech Leads can be assigned)
            if member.role.value not in ["IC", "TECH_LEAD"]:
                continue
            
            # Filter 2: Skill match
            member_skills = set(member.skills)
            
            if required_skills:
                # Calculate skill match percentage
                matching_skills = required_skills.intersection(member_skills)
                match_percentage = len(matching_skills) / len(required_skills) if required_skills else 0.0
                
                # Require at least 50% skill match
                if match_percentage < 0.5:
                    continue
                
                eligible_members.append({
                    "user_id": member.user_id,
                    "match_percentage": match_percentage,
                    "matching_skills": list(matching_skills)
                })
            else:
                # No required skills, all ICs/Tech Leads are eligible
                eligible_members.append({
                    "user_id": member.user_id,
                    "match_percentage": 1.0,
                    "matching_skills": []
                })
        
        # Sort by match percentage (descending)
        eligible_members.sort(key=lambda x: x["match_percentage"], reverse=True)
        
        # Create preliminary assignments for top candidates
        # We'll take top 3 candidates (or all if fewer)
        top_candidates = eligible_members[:3]
        
        for candidate in top_candidates:
            assignment = Assignment(
                action_id=action.action_id,
                recommended_user_id=candidate["user_id"],
                confidence_score=candidate["match_percentage"],  # Initial confidence based on skill match
                risk_level=RiskLevel.LOW,  # Will be refined in capacity_vector node
                market_response=MarketResponse.PENDING,
                justification_codes=[JustificationCode.SKILL_MATCH] if candidate["matching_skills"] else []
            )
            assignments.append(assignment)
        
        print(f"[EligibilityFilter] {action.action_id}: {len(top_candidates)} eligible candidates")
    
    orbix_state.assignments = assignments
    
    print(f"[EligibilityFilter] Total preliminary assignments: {len(assignments)}")
    
    return state
