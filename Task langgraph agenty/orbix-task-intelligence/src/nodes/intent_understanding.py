"""
Intent Understanding Node

This node converts raw, chaotic intent into structured, actionable information.

Performance Target: <100ms
"""

from typing import TYPE_CHECKING
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from ..orbix_core import OrbixGraphState


class StructuredIntent(BaseModel):
    """Structured intent extracted from raw description"""
    goal: str = Field(..., description="Clear, concise business goal")
    success_criteria: list[str] = Field(..., description="Measurable success criteria (minimum 1)")
    constraints: list[str] = Field(default_factory=list, description="Constraints and limitations")
    scope: str = Field(..., description="Scope of work")
    priority: str = Field(default="MEDIUM", description="Priority: LOW, MEDIUM, HIGH, CRITICAL")


def intent_understanding_node(state: "OrbixGraphState") -> "OrbixGraphState":
    """
    Convert raw intent → structured intent.
    
    This node:
    1. Parses raw text description
    2. Extracts goal, success criteria, constraints
    3. Determines scope and priority
    4. Uses LangChain structured output (Pydantic mode)
    
    Performance: <100ms (p95)
    """
    orbix_state = state["state"]
    raw_intent = orbix_state.raw_intent
    
    print(f"[IntentUnderstanding] Processing: {raw_intent.description[:100]}...")
    
    # Set up LLM with structured output
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.0,  # Deterministic
        timeout=5.0  # 5 second timeout
    )
    
    # Create parser
    parser = PydanticOutputParser(pydantic_object=StructuredIntent)
    
    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert business analyst who extracts structured information from project descriptions.

Your task is to analyze the raw intent and extract:
1. A clear, concise business goal
2. Measurable success criteria (at least 1, ideally 2-5)
3. Any constraints or limitations mentioned
4. The scope of work
5. Priority level (LOW, MEDIUM, HIGH, CRITICAL)

Be precise and actionable. Success criteria must be measurable.

{format_instructions}"""),
        ("user", """Raw Intent:
{description}

Additional Context:
- Documents: {documents}
- Meeting Notes: {meeting_notes}

Extract the structured intent.""")
    ])
    
    # Build chain
    chain = prompt | llm | parser
    
    try:
        # Execute
        structured_intent = chain.invoke({
            "description": raw_intent.description,
            "documents": ", ".join(raw_intent.documents) if raw_intent.documents else "None",
            "meeting_notes": ", ".join(raw_intent.meeting_notes) if raw_intent.meeting_notes else "None",
            "format_instructions": parser.get_format_instructions()
        })
        
        print(f"[IntentUnderstanding] Extracted goal: {structured_intent.goal}")
        print(f"[IntentUnderstanding] Success criteria: {len(structured_intent.success_criteria)}")
        
        # Store in state for next nodes
        # We'll use this in mission_builder_node
        if not hasattr(orbix_state, '_structured_intent'):
            orbix_state._structured_intent = structured_intent
        
    except Exception as e:
        print(f"[IntentUnderstanding] Error: {str(e)}")
        # Fallback: Use raw description as goal
        structured_intent = StructuredIntent(
            goal=raw_intent.description,
            success_criteria=["Project completed successfully"],
            constraints=[],
            scope="To be determined",
            priority="MEDIUM"
        )
        orbix_state._structured_intent = structured_intent
    
    return state
