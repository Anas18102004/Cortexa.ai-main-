import { Link } from "react-router-dom";
import { useWorkforce } from "@/contexts/WorkforceContext";
import type { Agent, AgentRole } from "@/types/agent";
import { StatusBadge, AuthorityBadge } from "@/components/ui/status-badge";
import { ScopeList } from "@/components/ui/scope-badge";
import { CostIndicator } from "@/components/ui/cost-indicator";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  role: AgentRole;
}

export function AgentCard({ agent, role }: AgentCardProps) {
  const lastActivityText = formatDistanceToNow(agent.lastActivity, {
    addSuffix: true,
  });

  const isExecuting = agent.status === "executing";
  const isAwaiting = agent.status === "awaiting_approval";
  const isPlanning = agent.status === "planning";

  return (
    <Link
      to={`/agents/${agent.id}`}
      className={cn(
        "block p-5 rounded-lg border bg-card transition-all duration-300 card-hover",
        isExecuting && "border-success/50 shadow-lg shadow-success/5",
        isAwaiting && "border-warning/50 shadow-lg shadow-warning/5",
        isPlanning && "border-primary/50 shadow-lg shadow-primary/5",
        !isExecuting && !isAwaiting && !isPlanning && "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-all",
              role.color,
              isExecuting && "animate-pulse"
            )}
          >
            <DynamicIcon name={role.icon} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-sm">
              {agent.customName || role.name}
            </h3>
            <p className="text-xs text-muted-foreground">{role.name}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Current Intent */}
      {agent.currentIntent && (
        <div className="mb-4 p-3 rounded-md bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3 h-3 text-primary" />
            <p className="text-xs text-muted-foreground">Current task</p>
          </div>
          <p className="text-sm font-medium truncate">{agent.currentIntent}</p>
        </div>
      )}

      {/* Meta Info */}
      <div className="space-y-3">
        {/* Authority & Scope */}
        <div className="flex items-center justify-between">
          <AuthorityBadge authority={agent.authority} />
          <ScopeList scopes={agent.scope} maxVisible={2} />
        </div>

        {/* Cost & Activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <CostIndicator amount={agent.hourlyRate} label="hr" size="sm" />
          <span>Active {lastActivityText}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">This month</p>
            <p className="text-sm font-medium">{agent.executionCount} tasks</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground">Total cost</p>
            <CostIndicator amount={agent.totalCostThisMonth} size="sm" />
          </div>
        </div>
      </div>
    </Link>
  );
}
