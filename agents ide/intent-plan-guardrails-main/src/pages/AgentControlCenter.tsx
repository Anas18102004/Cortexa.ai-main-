import { useParams, useNavigate } from "react-router-dom";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { AgentContextPanel } from "@/components/control-center/AgentContextPanel";
import { IntentPanel } from "@/components/control-center/IntentPanel";
import { PlanImpactPanel } from "@/components/control-center/PlanImpactPanel";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentControlCenter() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agents, getRole, getAgentPlans, getAgentIntents } = useWorkforce();

  const agent = agents.find((a) => a.id === agentId);
  const role = agent ? getRole(agent.roleId) : undefined;
  const intents = agent ? getAgentIntents(agent.id) : [];
  const plans = agent ? getAgentPlans(agent.id) : [];

  // Get the latest intent and plan for this agent
  const currentIntent = intents.find((i) => 
    i.status === "executing" || i.status === "planning" || i.status === "approved"
  );
  const currentPlan = plans.find((p) => 
    p.status === "executing" || p.status === "pending_approval" || p.status === "approved"
  );

  if (!agent || !role) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Agent not found</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workforce
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {agent.customName || role.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Agent Control Center
          </p>
        </div>
      </header>

      {/* Three-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_400px] overflow-hidden">
        {/* Left: Agent Context (Always visible) */}
        <AgentContextPanel agent={agent} role={role} />

        {/* Center: Intent Panel */}
        <IntentPanel 
          agent={agent} 
          currentIntent={currentIntent}
        />

        {/* Right: Plan & Impact */}
        <PlanImpactPanel 
          plan={currentPlan}
          agent={agent}
        />
      </div>
    </div>
  );
}
