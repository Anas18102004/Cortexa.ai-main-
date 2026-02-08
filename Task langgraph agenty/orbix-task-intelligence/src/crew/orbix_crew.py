"""
Orbix Crew - CrewAI Integration

This module implements the bounded reasoning sandbox using CrewAI.

Authority Contract:
- Receives filtered structured data only
- Debates internally between agents
- Returns strict JSON
- NO memory persistence
- NO external API calls
- NO database access
- NO execution authority
"""

from typing import Dict, List, Optional
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from ..schemas import (
    Action,
    Assignment,
    OrgMember,
    CapacityVector,
    ReasoningOutput,
    RiskLevel,
)


class ReasoningInput(BaseModel):
    """Input to the reasoning crew"""
    action: Action
    candidates: List[Dict]  # List of {user_id, skills, capacity}
    org_context: Dict  # Simplified org context
    constraints: List[str] = Field(default_factory=list)


class CortexaCrew:
    """
    CORTEXA AI CrewAI Integrationing sandbox for complex decision-making.
    
    This crew has 3 specialized agents:
    1. Workload Analyst - Assesses workload realism
    2. Risk Analyst - Identifies failure points
    3. Org Dynamics Analyst - Understands team hierarchy
    
    The crew debates internally and returns structured recommendations.
    """
    
    def __init__(self, temperature: float = 0.0, timeout: int = 10):
        """
        Initialize the Orbix Crew.
        
        Args:
            temperature: LLM temperature (0.0 for deterministic)
            timeout: Timeout in seconds for crew execution
        """
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=temperature,
            timeout=timeout
        )
        
        # Initialize agents
        self.workload_analyst = self._create_workload_analyst()
        self.risk_analyst = self._create_risk_analyst()
        self.org_dynamics_analyst = self._create_org_dynamics_analyst()
    
    def _create_workload_analyst(self) -> Agent:
        """Create the Workload Analyst agent"""
        return Agent(
            role="Workload Analyst",
            goal="Assess workload realism and sustainability for team members",
            backstory="""You are an expert in capacity planning and burnout prevention.
            You analyze workload distribution, identify overload risks, and ensure
            sustainable work allocation. You consider historical patterns, volatility,
            and realistic effort estimates.""",
            llm=self.llm,
            verbose=False,
            allow_delegation=False,  # No delegation
            tools=[],  # No external tools
        )
    
    def _create_risk_analyst(self) -> Agent:
        """Create the Risk Analyst agent"""
        return Agent(
            role="Risk Analyst",
            goal="Identify future failure points and project risks",
            backstory="""You are an experienced project risk manager who identifies
            potential failure points before they occur. You analyze dependencies,
            skill gaps, timeline constraints, and external factors that could
            derail project success.""",
            llm=self.llm,
            verbose=False,
            allow_delegation=False,
            tools=[],
        )
    
    def _create_org_dynamics_analyst(self) -> Agent:
        """Create the Org Dynamics Analyst agent"""
        return Agent(
            role="Org Dynamics Analyst",
            goal="Understand team hierarchy, collaboration patterns, and organizational context",
            backstory="""You are an expert in organizational behavior and team dynamics.
            You understand reporting structures, team collaboration patterns, cross-team
            dependencies, and how organizational context affects work allocation.
            You ensure assignments respect team boundaries and manager relationships.""",
            llm=self.llm,
            verbose=False,
            allow_delegation=False,
            tools=[],
        )
    
    def analyze_assignment(
        self,
        action: Action,
        candidates: List[Dict],
        org_context: Dict,
        constraints: Optional[List[str]] = None
    ) -> ReasoningOutput:
        """
        Analyze an action assignment using the crew.
        
        Args:
            action: The action to assign
            candidates: List of candidate users with skills and capacity
            org_context: Organization context (simplified)
            constraints: Optional constraints
        
        Returns:
            ReasoningOutput: Structured recommendation
        """
        # Prepare context
        context = self._prepare_context(action, candidates, org_context, constraints or [])
        
        # Create tasks for each agent
        workload_task = Task(
            description=f"""Analyze the workload implications of assigning this action:

Action: {action.description}
Estimated Hours: {action.estimated_hours or 'Unknown'}
Required Skills: {', '.join(action.required_skills)}

Candidates:
{self._format_candidates(candidates)}

Assess:
1. Which candidate has the most sustainable capacity?
2. Are there overload risks for any candidate?
3. Is the effort estimate realistic?

Provide your analysis focusing on workload sustainability.""",
            expected_output="Analysis of workload sustainability for each candidate",
            agent=self.workload_analyst
        )
        
        risk_task = Task(
            description=f"""Analyze the risks of assigning this action:

Action: {action.description}
Estimated Hours: {action.estimated_hours or 'Unknown'}
Required Skills: {', '.join(action.required_skills)}

Candidates:
{self._format_candidates(candidates)}

Constraints: {', '.join(constraints or ['None'])}

Assess:
1. What are the skill gap risks for each candidate?
2. Are there dependency or timeline risks?
3. What could go wrong with each assignment?

Provide your risk analysis.""",
            expected_output="Risk assessment for each candidate assignment",
            agent=self.risk_analyst
        )
        
        org_dynamics_task = Task(
            description=f"""Analyze the organizational dynamics of assigning this action:

Action: {action.description}

Candidates:
{self._format_candidates(candidates)}

Organization Context:
{self._format_org_context(org_context)}

Assess:
1. Are there cross-team implications?
2. Do any candidates have manager/reporting conflicts?
3. What are the collaboration implications?

Provide your organizational analysis.""",
            expected_output="Organizational dynamics analysis",
            agent=self.org_dynamics_analyst
        )
        
        # Create final synthesis task
        synthesis_task = Task(
            description=f"""Based on the analyses from the Workload Analyst, Risk Analyst, 
and Org Dynamics Analyst, provide a final recommendation for assigning this action:

Action: {action.description}

Candidates:
{self._format_candidates(candidates)}

Synthesize the analyses and provide:
1. Recommended candidate (user_id)
2. Confidence score (0.0 to 1.0)
3. Risk level (LOW, MEDIUM, HIGH)
4. Key tradeoffs
5. Why other candidates were not chosen

Output ONLY valid JSON in this exact format:
{{
    "recommendation": "user_id of recommended candidate",
    "confidence": 0.85,
    "risk_level": "LOW",
    "tradeoffs": ["tradeoff 1", "tradeoff 2"],
    "why_not_others": {{
        "user_id_1": "reason",
        "user_id_2": "reason"
    }}
}}""",
            expected_output="JSON recommendation",
            agent=self.workload_analyst,  # Lead agent for synthesis
            context=[workload_task, risk_task, org_dynamics_task]
        )
        
        # Create and run the crew
        crew = Crew(
            agents=[self.workload_analyst, self.risk_analyst, self.org_dynamics_analyst],
            tasks=[workload_task, risk_task, org_dynamics_task, synthesis_task],
            process=Process.sequential,  # Sequential execution
            verbose=False
        )
        
        try:
            # Execute the crew
            result = crew.kickoff()
            
            # Parse the result
            import json
            
            # Extract JSON from result
            result_str = str(result)
            
            # Try to find JSON in the output
            start_idx = result_str.find('{')
            end_idx = result_str.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = result_str[start_idx:end_idx]
                parsed = json.loads(json_str)
                
                # Map to ReasoningOutput
                risk_level_map = {
                    "LOW": RiskLevel.LOW,
                    "MEDIUM": RiskLevel.MEDIUM,
                    "HIGH": RiskLevel.HIGH
                }
                
                return ReasoningOutput(
                    recommendation=parsed.get("recommendation", candidates[0]["user_id"]),
                    confidence=float(parsed.get("confidence", 0.5)),
                    risk_level=risk_level_map.get(parsed.get("risk_level", "MEDIUM"), RiskLevel.MEDIUM),
                    tradeoffs=parsed.get("tradeoffs", []),
                    why_not_others=parsed.get("why_not_others", {})
                )
            else:
                # Fallback: Use first candidate with medium confidence
                return self._fallback_reasoning(candidates)
        
        except Exception as e:
            print(f"[OrbixCrew] Error during reasoning: {str(e)}")
            return self._fallback_reasoning(candidates)
    
    def _prepare_context(
        self,
        action: Action,
        candidates: List[Dict],
        org_context: Dict,
        constraints: List[str]
    ) -> str:
        """Prepare context string for the crew"""
        context_parts = [
            f"Action: {action.description}",
            f"Estimated Hours: {action.estimated_hours or 'Unknown'}",
            f"Required Skills: {', '.join(action.required_skills)}",
            f"\nCandidates: {len(candidates)}",
        ]
        
        for candidate in candidates:
            context_parts.append(
                f"  - {candidate['user_id']}: Skills={candidate.get('skills', [])}, "
                f"Capacity={candidate.get('capacity', {}).get('effective_free_hours', 'Unknown')}h"
            )
        
        if constraints:
            context_parts.append(f"\nConstraints: {', '.join(constraints)}")
        
        return "\n".join(context_parts)
    
    def _format_candidates(self, candidates: List[Dict]) -> str:
        """Format candidates for display"""
        lines = []
        for candidate in candidates:
            capacity = candidate.get('capacity', {})
            lines.append(
                f"  - {candidate['user_id']}: "
                f"Skills={', '.join(candidate.get('skills', []))}, "
                f"Capacity={capacity.get('effective_free_hours', 'Unknown')}h, "
                f"Volatility={capacity.get('volatility_index', 'Unknown')}, "
                f"Risk={capacity.get('overload_risk', 'Unknown')}"
            )
        return "\n".join(lines)
    
    def _format_org_context(self, org_context: Dict) -> str:
        """Format org context for display"""
        lines = []
        for member in org_context.get('members', []):
            lines.append(
                f"  - {member.get('user_id')}: "
                f"Role={member.get('role')}, "
                f"Team={member.get('team')}, "
                f"Manager={member.get('manager_id', 'None')}"
            )
        return "\n".join(lines)
    
    def _fallback_reasoning(self, candidates: List[Dict]) -> ReasoningOutput:
        """Fallback reasoning when crew fails"""
        if not candidates:
            return ReasoningOutput(
                recommendation="NONE",
                confidence=0.0,
                risk_level=RiskLevel.HIGH,
                tradeoffs=["No candidates available"],
                why_not_others={}
            )
        
        # Use first candidate with low confidence
        return ReasoningOutput(
            recommendation=candidates[0]["user_id"],
            confidence=0.5,
            risk_level=RiskLevel.MEDIUM,
            tradeoffs=["Fallback reasoning used due to crew error"],
            why_not_others={}
        )
