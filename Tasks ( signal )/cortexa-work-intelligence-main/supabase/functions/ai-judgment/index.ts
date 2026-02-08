import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const CORTEXA_SYSTEM_PROMPT = `You are CORTEXA — an AI Work Intelligence Engine.

You operate under a Task-as-Signal pressure model.

Your role is NOT to manage projects or track completion.
Your purpose is to interpret work context and surface pressures that prevent future regret.

CORE OPERATING PRINCIPLES:
• Every task is a signal
• Every signal carries pressure
• Pressure represents the future cost of inaction
• Tasks are never completed — only stabilized
• New context may change pressure at any time

Immutable rule: Work = Pressure → Attention → Action → Consequence

PROJECT CONTEXT HANDLING:
• Projects are containers of context — not control structures
• Multiple signals can be associated with a project
• A signal may belong to multiple projects
• Signal logic is NEVER changed due to project grouping
• Signals always remain pressure-driven regardless of project membership

EXECUTION PIPELINE (MANDATORY):

1️⃣ CONTEXT INTERPRETATION
- Identify intent, goals, constraints, risks
- Detect if this is initial input or updated context
- Produce a short summary
- List explicit assumptions

2️⃣ TASK CREATION (TASKS ARE SIGNALS)
Generate signals directly from context. Each signal MUST include:
- Title, Description, Pressure source (why it exists)
- Pressure score (0–100), Pressure trajectory (rising / stable / decaying)
- Risk if ignored, Dependencies (if any)
Do NOT create filler signals.

3️⃣ PRESSURE ORDERING
Rank signals strictly by pressure score.
Pressure is NOT urgency or priority. It is future cost.

4️⃣ ASSIGNEE SUGGESTION (SKILL-TAG BASED)
When team skill tags are available:
- Suggest assignees based on skill relevance, signal technical domain, and signal criticality
- If multiple members match, rank suggestions by relevance
- If no match, state assumption and recommend escalation
Label clearly: "Assignee suggestion — requires human approval"
Never auto-assign.

5️⃣ STATE MODEL
Each signal must be classified as: Active / Stabilizing / Stable / Resurfacing
Never mark anything as done, completed, or closed.

STABILIZATION DETECTION:
If context indicates a signal has been addressed:
- Set state → Stabilizing or Stable
- Reduce pressure score accordingly
- Explain why pressure decreased
- Keep signal visible for future resurfacing

SAFETY THRESHOLD MONITORING:
If a stabilized signal's pressure rises above a safety threshold:
- Trigger resurfacing protocol
- Treat signal as resurfacing
- Request or accept updated context
- Re-run full signal analysis pipeline
- Recalculate pressure trajectory
- Never create a duplicate signal for the same pressure source

RESURFACING EXECUTION FLOW:
1. Accept new context specific to the signal
2. Identify newly emerging pressures
3. Generate additional signals if justified
4. Update dependencies
5. Re-rank pressures
Ensure continuity with historical reasoning.

6️⃣ CONTEXT UPDATES
If new context modifies existing signals:
- Recalculate pressure, Update trajectory, Adjust assumptions
- Avoid creating new signals unless pressure is fundamentally new

7️⃣ CONTINUOUS IMPROVEMENT
Stable signals remain visible. Note improvement potential.

MULTI-SIGNAL EVALUATION:
When multiple signals are selected:
- Evaluate interaction effects between them
- Detect shared dependencies
- Detect reinforcement or conflict of pressures
- Reflect any impact in updated pressure scoring
- Never merge signals unless they represent identical pressure sources

HARD CONSTRAINTS:
- Never mark work complete
- Never hide pressure behind status
- Never fabricate certainty
- Never remove human decision authority
- Never produce signals without pressure justification
- Never discard resurfaced signals
- Never duplicate pressure sources
- Never override human decisions
- Never fabricate skill coverage

Your purpose is to help teams prevent future regret.
Always validate: "Does every signal represent real pressure, and does pressure explain why it exists?"`;

// Shared signal properties schema
const signalProperties = {
  title: { type: "string" },
  description: { type: "string" },
  pressureSource: { type: "string", description: "Why this pressure exists" },
  pressureScore: { type: "number", description: "0-100 future cost of inaction" },
  pressureTrajectory: { type: "string", enum: ["rising", "stable", "decaying"] },
  riskIfIgnored: { type: "string" },
  dependencies: { type: "array", items: { type: "string" } },
  state: { type: "string", enum: ["active", "stabilizing", "stable", "resurfacing"] },
  suggestedAssignee: { type: "string", description: "Role or person suggestion — advisory only" },
  assigneeSkillMatch: { type: "string", description: "Which skill tags matched and why" },
  impactScope: { type: "string", enum: ["local", "mission", "organization"] },
  confidence: { type: "number", description: "0-1 confidence" },
  stabilizationReason: { type: "string", description: "If stabilizing/stable, why pressure decreased" },
};

const signalRequired = ["title", "description", "pressureSource", "pressureScore", "pressureTrajectory", "riskIfIgnored", "state", "impactScope", "confidence"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { action, ...payload } = await req.json();
    console.log(`[ai-judgment] Action: ${action}`);

    let systemPrompt = "";
    let userPrompt = "";
    let tools: any[] | null = null;
    let toolChoice: any = null;

    switch (action) {
      case "analyze_context": {
        systemPrompt = CORTEXA_SYSTEM_PROMPT;
        
        const skillTagsSection = payload.teamSkillTags?.length > 0
          ? `\nTeam skill tags available:\n${payload.teamSkillTags.map((t: any) => `- ${t.name}: ${t.skills.join(", ")}`).join("\n")}\n\nUse these skill tags to suggest assignees. Rank by relevance. If no match, recommend escalation.`
          : "";

        const projectSection = payload.projectContext
          ? `\nProject context: "${payload.projectContext.name}" — ${payload.projectContext.description || "No description"}`
          : "";

        userPrompt = `Analyze this work context and execute the full CORTEXA pipeline:

--- CONTEXT START ---
${payload.contextText}
--- CONTEXT END ---
${projectSection}
${payload.existingSignals?.length > 0 ? `
Existing signals in the system:
${payload.existingSignals.map((s: any, i: number) => `${i + 1}. "${s.title}" (Pressure: ${s.pressureLevel}, State: ${s.state})`).join("\n")}

Detect if this new context updates any existing signals or introduces fundamentally new pressure.
If any existing signal has been addressed by this context, apply STABILIZATION DETECTION — reduce pressure and set state to stabilizing/stable with explanation.
` : "This is initial context — no existing signals."}
${skillTagsSection}

Execute ALL pipeline steps and return the structured analysis.`;

        tools = [{
          type: "function",
          function: {
            name: "cortexa_analysis",
            description: "Full CORTEXA pipeline analysis output",
            parameters: {
              type: "object",
              properties: {
                contextSummary: { type: "string", description: "Short summary of the interpreted context" },
                assumptions: { type: "array", items: { type: "string" }, description: "Explicit assumptions made" },
                signals: {
                  type: "array",
                  description: "All detected signals, ordered by pressure score descending",
                  items: {
                    type: "object",
                    properties: signalProperties,
                    required: signalRequired,
                  }
                },
                risks: {
                  type: "array",
                  description: "Context gaps, uncertainties, system risks",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
                    },
                    required: ["description", "severity"]
                  }
                },
                updatedExistingSignals: {
                  type: "array",
                  description: "Existing signals that should be updated based on new context, including stabilization",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Title of the existing signal" },
                      newPressureScore: { type: "number" },
                      newTrajectory: { type: "string", enum: ["rising", "stable", "decaying"] },
                      newState: { type: "string", enum: ["active", "stabilizing", "stable", "resurfacing"] },
                      reason: { type: "string" },
                      stabilizationReason: { type: "string", description: "If transitioning to stable/stabilizing, explain why" }
                    },
                    required: ["title", "newPressureScore", "newTrajectory", "newState", "reason"]
                  }
                }
              },
              required: ["contextSummary", "assumptions", "signals", "risks"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "cortexa_analysis" } };
        break;
      }

      case "evaluate_multi_signal": {
        systemPrompt = `${CORTEXA_SYSTEM_PROMPT}

You are evaluating the INTERACTION EFFECTS between multiple selected signals.
Detect shared dependencies, pressure reinforcement, pressure conflicts, and cascading risks.
Never merge signals unless they represent identical pressure sources.`;

        userPrompt = `Evaluate these ${payload.signals.length} selected signals for interaction effects:

${payload.signals.map((s: any, i: number) => `
Signal ${i + 1}: "${s.title}"
- Description: ${s.description}
- Pressure: ${s.pressureScore}/100 (${s.pressureTrajectory})
- State: ${s.state}
- Scope: ${s.impactScope}
- Dependencies: ${s.dependencies?.join(", ") || "none"}
`).join("\n")}

Detect:
1. Shared dependencies between signals
2. Pressure reinforcement (signals amplifying each other)
3. Pressure conflicts (signals contradicting each other)
4. Cascading risks if any signal is ignored
5. Recommended combined attention strategy`;

        tools = [{
          type: "function",
          function: {
            name: "multi_signal_evaluation",
            description: "Evaluation of interaction effects between multiple signals",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Overall evaluation of signal interactions" },
                sharedDependencies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      dependency: { type: "string" },
                      affectedSignalTitles: { type: "array", items: { type: "string" } },
                      impact: { type: "string" }
                    },
                    required: ["dependency", "affectedSignalTitles", "impact"]
                  }
                },
                pressureInteractions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["reinforcement", "conflict", "cascade"] },
                      signalTitles: { type: "array", items: { type: "string" } },
                      description: { type: "string" },
                      pressureAdjustment: { type: "number", description: "Suggested pressure delta (-100 to +100)" }
                    },
                    required: ["type", "signalTitles", "description"]
                  }
                },
                updatedPressures: {
                  type: "array",
                  description: "Adjusted pressure scores reflecting interaction effects",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      originalPressure: { type: "number" },
                      adjustedPressure: { type: "number" },
                      reason: { type: "string" }
                    },
                    required: ["title", "originalPressure", "adjustedPressure", "reason"]
                  }
                },
                combinedStrategy: { type: "string", description: "Recommended approach for addressing these signals together" },
                risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
                    },
                    required: ["description", "severity"]
                  }
                }
              },
              required: ["summary", "sharedDependencies", "pressureInteractions", "updatedPressures", "combinedStrategy", "risks"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "multi_signal_evaluation" } };
        break;
      }

      case "check_resurfacing": {
        systemPrompt = `${CORTEXA_SYSTEM_PROMPT}

You are executing the RESURFACING PROTOCOL.
A previously stabilized signal has received new context or crossed a safety threshold.
Re-run the full analysis pipeline on this signal with historical continuity.
Never create a duplicate signal for the same pressure source.`;

        userPrompt = `A stabilized signal is being checked for resurfacing:

Signal: "${payload.signal.title}"
- Previous pressure: ${payload.signal.previousPressure}/100
- Current pressure: ${payload.signal.currentPressure}/100
- Safety threshold: ${payload.safetyThreshold || 50}
- Previous state: ${payload.signal.previousState}
- Historical reasoning: ${payload.signal.historicalReasoning || "None available"}

${payload.newContext ? `New context:\n--- CONTEXT START ---\n${payload.newContext}\n--- CONTEXT END ---` : "No new context — threshold breach triggered this check."}

Execute the resurfacing protocol:
1. Identify newly emerging pressures
2. Determine if signal should resurface
3. Generate additional signals ONLY if justified by fundamentally new pressure
4. Update dependencies
5. Re-rank pressure`;

        tools = [{
          type: "function",
          function: {
            name: "resurfacing_analysis",
            description: "Resurfacing protocol analysis for a stabilized signal",
            parameters: {
              type: "object",
              properties: {
                shouldResurface: { type: "boolean" },
                resurfaceReason: { type: "string" },
                updatedSignal: {
                  type: "object",
                  properties: {
                    newPressureScore: { type: "number" },
                    newTrajectory: { type: "string", enum: ["rising", "stable", "decaying"] },
                    newState: { type: "string", enum: ["active", "stabilizing", "stable", "resurfacing"] },
                    updatedRiskIfIgnored: { type: "string" },
                    updatedDependencies: { type: "array", items: { type: "string" } },
                    reasoning: { type: "string" }
                  },
                  required: ["newPressureScore", "newTrajectory", "newState", "reasoning"]
                },
                newSignals: {
                  type: "array",
                  description: "Additional signals ONLY if fundamentally new pressure source detected",
                  items: {
                    type: "object",
                    properties: signalProperties,
                    required: signalRequired,
                  }
                },
                risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
                    },
                    required: ["description", "severity"]
                  }
                }
              },
              required: ["shouldResurface", "resurfaceReason", "updatedSignal", "newSignals", "risks"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "resurfacing_analysis" } };
        break;
      }

      case "detect_signals": {
        systemPrompt = CORTEXA_SYSTEM_PROMPT;

        userPrompt = `Analyze this context and extract Signals:

${payload.contextText}

Identify all genuine work Signals. For each, provide reasoning for the pressure level assessment.`;

        tools = [{
          type: "function",
          function: {
            name: "extract_signals",
            description: "Extract work Signals from the analyzed context",
            parameters: {
              type: "object",
              properties: {
                signals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clear, action-oriented title under 60 chars" },
                      description: { type: "string", description: "What this Signal represents and why it matters" },
                      pressureLevel: { type: "number", description: "0-100 pressure score" },
                      impactScope: { type: "string", enum: ["local", "mission", "organization"] },
                      confidence: { type: "number", description: "0-1 confidence in this being a real Signal" },
                      reasoning: { type: "string", description: "Why this pressure level was assigned" },
                      suggestedTags: { type: "array", items: { type: "string" } }
                    },
                    required: ["title", "description", "pressureLevel", "impactScope", "confidence", "reasoning"]
                  }
                },
                clusters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      theme: { type: "string" },
                      signalIndices: { type: "array", items: { type: "number" } }
                    }
                  }
                }
              },
              required: ["signals", "clusters"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "extract_signals" } };
        break;
      }

      case "get_recommendation": {
        systemPrompt = `${CORTEXA_SYSTEM_PROMPT}

Given a Signal, recommend the best Response.

Response types:
- investigate: Gather more information before deciding
- execute: Take action to address this Signal
- defer: Consciously postpone (with a reason and timeline)
- ignore: Explicitly choose not to address (with documented reasoning)
- escalate: This needs someone with more authority
- reframe: The Signal itself needs to be redefined`;

        userPrompt = `Recommend a Response for this Signal:

Title: ${payload.signal.title}
Description: ${payload.signal.description}
Pressure Level: ${payload.signal.pressureLevel}/100
Impact Scope: ${payload.signal.impactScope}
Constraint: ${payload.signal.constraintType}${payload.signal.constraintDeadline ? ` (deadline: ${payload.signal.constraintDeadline})` : ""}
Current State: ${payload.signal.state}`;

        tools = [{
          type: "function",
          function: {
            name: "recommend_response",
            description: "Recommend a Response for the Signal",
            parameters: {
              type: "object",
              properties: {
                recommendation: { 
                  type: "string", 
                  enum: ["investigate", "execute", "defer", "ignore", "escalate", "reframe"] 
                },
                reasoning: { type: "string" },
                confidence: { type: "number" },
                alternativeActions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string", enum: ["investigate", "execute", "defer", "ignore", "escalate", "reframe"] },
                      reasoning: { type: "string" }
                    }
                  }
                }
              },
              required: ["recommendation", "reasoning", "confidence", "alternativeActions"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "recommend_response" } };
        break;
      }

      case "generate_projection": {
        systemPrompt = `${CORTEXA_SYSTEM_PROMPT}

You are now operating as the Consequence Simulator. Project what happens to a Signal over time.
Consider: pressure compounds when ignored, early intervention costs less, some Signals have hard deadlines, unaddressed Signals spawn new Signals.`;

        userPrompt = `Project the consequences for this Signal over ${payload.days} days:

Title: ${payload.signal.title}
Description: ${payload.signal.description}
Current Pressure: ${payload.signal.pressureLevel}/100
Pressure Decay Rate: ${payload.signal.pressureDecayRate}% per day
Impact Scope: ${payload.signal.impactScope}
Constraint: ${payload.signal.constraintType}${payload.signal.constraintDeadline ? ` (deadline: ${payload.signal.constraintDeadline})` : ""}

What happens if ignored vs addressed?`;

        tools = [{
          type: "function",
          function: {
            name: "project_consequences",
            description: "Project consequences of ignoring vs addressing the Signal",
            parameters: {
              type: "object",
              properties: {
                ignoreScenario: {
                  type: "object",
                  properties: {
                    projectedPressure: { type: "number" },
                    riskAssessment: { type: "string" },
                    potentialImpacts: { type: "array", items: { type: "string" } },
                    confidence: { type: "number" }
                  },
                  required: ["projectedPressure", "riskAssessment", "potentialImpacts", "confidence"]
                },
                addressScenario: {
                  type: "object",
                  properties: {
                    projectedPressure: { type: "number" },
                    expectedOutcome: { type: "string" },
                    requiredEffort: { type: "string" },
                    confidence: { type: "number" }
                  },
                  required: ["projectedPressure", "expectedOutcome", "requiredEffort", "confidence"]
                },
                recommendation: { 
                  type: "string", 
                  enum: ["investigate", "execute", "defer", "ignore", "escalate", "reframe"] 
                },
                reasoning: { type: "string" },
                confidence: { type: "number" }
              },
              required: ["ignoreScenario", "addressScenario", "recommendation", "reasoning", "confidence"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "project_consequences" } };
        break;
      }

      case "generate_insight": {
        const questionMap: Record<string, string> = {
          slowdown: "What is slowing us down? Identify drag, blockers, and inefficiencies.",
          overload: "Who or what is overloaded? Identify energy misallocation.",
          upcoming_break: "What will break next? Project upcoming failures if current trajectory continues.",
          stop_doing: "What should we stop doing? Identify low-impact activities consuming energy."
        };

        systemPrompt = `${CORTEXA_SYSTEM_PROMPT}

You are now answering a critical strategic question. Be direct and actionable. No platitudes. Surface uncomfortable truths.`;

        userPrompt = `${questionMap[payload.question as string]}

Current Signals:
${payload.signals.map((s: { title: string; pressureLevel: number; state: string; impactScope: string }, i: number) => 
  `${i + 1}. ${s.title} (Pressure: ${s.pressureLevel}, State: ${s.state}, Scope: ${s.impactScope})`
).join("\n")}`;

        tools = [{
          type: "function",
          function: {
            name: "provide_insight",
            description: "Provide strategic insight based on Signal analysis",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                details: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } },
                confidence: { type: "number" }
              },
              required: ["title", "summary", "details", "recommendations", "confidence"]
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "provide_insight" } };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`[ai-judgment] Calling AI gateway for action: ${action}`);
    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await aiResponse.json();
    
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log(`[ai-judgment] Success for action: ${action}`);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unexpected AI response format");
  } catch (e) {
    console.error("AI Judgment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
