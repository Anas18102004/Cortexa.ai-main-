"""
Action Decomposition Node

This node decomposes Deliverables into executable Actions.

Performance Target: <200ms
"""

from typing import TYPE_CHECKING
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from ..schemas import Action, ActionStatus

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


class ActionsList(BaseModel):
    """List of actions"""
    actions: list[dict] = Field(..., description="List of actions with description, required_skills, estimated_hours")


def action_decomposition_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Deliverables → Actions.
    
    This node:
    1. Takes all Deliverables
    2. Decomposes each into 1-5 executable Actions
    3. Identifies required skills for each action
    4. Estimates effort in hours
    5. Links actions to deliverables and mission
    
    Performance: <200ms (p95)
    """
    orbix_state = state["state"]
    deliverables = orbix_state.deliverables
    mission = orbix_state.mission
    
    if not deliverables:
        print("[ActionDecomposition] No deliverables found, skipping")
        return state
    
    print(f"[ActionDecomposition] Decomposing {len(deliverables)} deliverables into actions")
    
    # Set up LLM
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.0,
        timeout=10.0
    )
    
    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert technical lead who breaks down deliverables into executable actions.

An Action is a specific piece of work that can be assigned to a team member.

Guidelines:
- Create 1-5 actions per deliverable
- Each action must be executable by a single person
- Identify required skills (e.g., "React", "Python", "UI/UX Design")
- Estimate effort in hours (realistic, not optimistic)
- Actions should be independent when possible

Output format:
{{
  "actions": [
    {{
      "description": "Clear description of the work",
      "required_skills": ["Skill1", "Skill2"],
      "estimated_hours": 8.0
    }}
  ]
}}"""),
        ("user", """Deliverable:
Outcome: {outcome}
Success Criteria: {success_criteria}

Mission Context:
Goal: {mission_goal}

Decompose this deliverable into executable actions.""")
    ])
    
    # Build chain
    parser = PydanticOutputParser(pydantic_object=ActionsList)
    chain = prompt | llm | parser
    
    all_actions = []
    
    for deliverable in deliverables:
        try:
            # Execute for each deliverable
            result = chain.invoke({
                "outcome": deliverable.outcome,
                "success_criteria": "\n- ".join(deliverable.success_criteria) if deliverable.success_criteria else "None",
                "mission_goal": mission.goal if mission else "N/A"
            })
            
            # Create Action objects
            for idx, a in enumerate(result.actions):
                action = Action(
                    deliverable_id=deliverable.deliverable_id,
                    mission_id=deliverable.mission_id,
                    description=a.get("description", f"Action {idx + 1}"),
                    required_skills=a.get("required_skills", []),
                    estimated_hours=a.get("estimated_hours"),
                    status=ActionStatus.PROPOSED
                )
                all_actions.append(action)
            
            print(f"[ActionDecomposition] {deliverable.deliverable_id}: {len(result.actions)} actions")
            
        except Exception as e:
            print(f"[ActionDecomposition] Error for {deliverable.deliverable_id}: {str(e)}")
            # Fallback: Create single action
            action = Action(
                deliverable_id=deliverable.deliverable_id,
                mission_id=deliverable.mission_id,
                description=deliverable.outcome,
                required_skills=[],
                status=ActionStatus.PROPOSED
            )
            all_actions.append(action)
    
    orbix_state.actions = all_actions
    
    print(f"[ActionDecomposition] Total actions created: {len(all_actions)}")
    
    return state
