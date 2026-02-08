import type { Agent } from "@/types/agent";
import { Bot, Play, Clock, DollarSign, Activity } from "lucide-react";
import { formatCost } from "@/components/ui/cost-indicator";
import { cn } from "@/lib/utils";

interface WorkforceStatsProps {
  agents: Agent[];
}

export function WorkforceStats({ agents }: WorkforceStatsProps) {
  const activeAgents = agents.filter((a) => a.isActive).length;
  const executingAgents = agents.filter((a) => a.status === "executing").length;
  const awaitingApproval = agents.filter((a) => a.status === "awaiting_approval").length;
  const totalCost = agents.reduce((sum, a) => sum + a.totalCostThisMonth, 0);
  const totalExecutions = agents.reduce((sum, a) => sum + a.executionCount, 0);

  const stats = [
    {
      label: "Active Agents",
      value: activeAgents,
      subtext: `${executingAgents} executing`,
      icon: Bot,
      color: "text-primary",
      highlight: executingAgents > 0,
    },
    {
      label: "Awaiting Approval",
      value: awaitingApproval,
      subtext: "plans pending",
      icon: Clock,
      color: "text-warning",
      highlight: awaitingApproval > 0,
    },
    {
      label: "Total Executions",
      value: totalExecutions,
      subtext: "this month",
      icon: Play,
      color: "text-success",
      highlight: false,
    },
    {
      label: "Total Cost",
      value: formatCost(totalCost),
      subtext: "this month",
      icon: DollarSign,
      color: "text-muted-foreground",
      highlight: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "p-4 rounded-lg border bg-card transition-all",
            stat.highlight && "border-primary/30 shadow-lg shadow-primary/5"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-8 h-8 rounded-md bg-muted flex items-center justify-center",
              stat.highlight && "bg-primary/10"
            )}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            {stat.highlight && (
              <Activity className="w-3 h-3 text-primary animate-pulse ml-auto" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
