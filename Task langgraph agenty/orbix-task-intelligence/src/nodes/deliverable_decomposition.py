"""
Deliverable Decomposition Node

This node decomposes a Mission into concrete Deliverables.

Performance Target: <200ms
"""

from typing import TYPE_CHECKING
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from ..schemas import Deliverable

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


class DeliverablesList(BaseModel):
    """List of deliverables"""
    deliverables: list[dict] = Field(..., description="List of deliverables with outcome and success_criteria")


def deliverable_decomposition_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Mission → Deliverables.
    
    This node:
    1. Takes the Mission
    2. Decomposes it into 2-7 concrete Deliverables
    3. Each deliverable has clear outcome and success criteria
    4. Links deliverables to mission
    
    Performance: <200ms (p95)
    """
    orbix_state = state["state"]
    mission = orbix_state.mission
    
    if not mission:
        print("[DeliverableDecomposition] No mission found, skipping")
        return state
    
    print(f"[DeliverableDecomposition] Decomposing mission: {mission.mission_id}")
    
    # Set up LLM
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.0,
        timeout=10.0
    )
    
    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert project manager who breaks down missions into concrete deliverables.

A Deliverable is a concrete outcome that contributes to the mission goal.

Guidelines:
- Create 2-7 deliverables (optimal: 3-5)
- Each deliverable must have a clear, measurable outcome
- Each deliverable should have 1-3 success criteria
- Deliverables should be independent when possible
- Order deliverables logically (dependencies first)

Output format:
{{
  "deliverables": [
    {{
      "outcome": "Clear description of what will be delivered",
      "success_criteria": ["Criterion 1", "Criterion 2"],
      "estimated_effort_hours": 20.0
    }}
  ]
}}"""),
        ("user", """Mission:
Goal: {goal}
Success Criteria: {success_criteria}
Constraints: {constraints}

Decompose this mission into concrete deliverables.""")
    ])
    
    # Build chain
    parser = PydanticOutputParser(pydantic_object=DeliverablesList)
    chain = prompt | llm | parser
    
    try:
        # Execute
        result = chain.invoke({
            "goal": mission.goal,
            "success_criteria": "\n- ".join(mission.success_criteria),
            "constraints": "\n- ".join(mission.constraints) if mission.constraints else "None"
        })
        
        # Create Deliverable objects
        deliverables = []
        for idx, d in enumerate(result.deliverables):
            deliverable = Deliverable(
                mission_id=mission.mission_id,
                outcome=d.get("outcome", f"Deliverable {idx + 1}"),
                success_criteria=d.get("success_criteria", []),
                estimated_effort_hours=d.get("estimated_effort_hours")
            )
            deliverables.append(deliverable)
        
        orbix_state.deliverables = deliverables
        
        print(f"[DeliverableDecomposition] Created {len(deliverables)} deliverables")
        for d in deliverables:
            print(f"  - {d.deliverable_id}: {d.outcome[:60]}...")
        
    except Exception as e:
        print(f"[DeliverableDecomposition] Error: {str(e)}")
        # Fallback: Create single deliverable
        deliverable = Deliverable(
            mission_id=mission.mission_id,
            outcome=mission.goal,
            success_criteria=mission.success_criteria
        )
        orbix_state.deliverables = [deliverable]
    
    return state
