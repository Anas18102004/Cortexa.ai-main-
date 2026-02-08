import { useWorkforce } from "@/contexts/WorkforceContext";
import { ExecutionCard } from "@/components/executions/ExecutionCard";
import { Play, Pause, CheckCircle, XCircle } from "lucide-react";

export default function Executions() {
  const { executions, agents, getRole } = useWorkforce();

  const runningExecutions = executions.filter((e) => e.status === "running");
  const pausedExecutions = executions.filter((e) => e.status === "paused");
  const completedExecutions = executions.filter((e) => e.status === "completed" || e.status === "failed" || e.status === "cancelled");

  const stats = [
    { label: "Running", count: runningExecutions.length, icon: Play, color: "text-success" },
    { label: "Paused", count: pausedExecutions.length, icon: Pause, color: "text-warning" },
    { label: "Completed", count: completedExecutions.length, icon: CheckCircle, color: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1>Executions</h1>
        <p className="text-muted-foreground">
          Monitor and control active agent executions
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-2xl font-semibold">{stat.count}</span>
            <span className="text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Running Executions */}
      {runningExecutions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Running</h2>
          <div className="grid gap-4">
            {runningExecutions.map((execution) => {
              const agent = agents.find((a) => a.id === execution.agentId);
              const role = agent ? getRole(agent.roleId) : undefined;
              return (
                <ExecutionCard
                  key={execution.id}
                  execution={execution}
                  agent={agent}
                  role={role}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Paused Executions */}
      {pausedExecutions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Paused</h2>
          <div className="grid gap-4">
            {pausedExecutions.map((execution) => {
              const agent = agents.find((a) => a.id === execution.agentId);
              const role = agent ? getRole(agent.roleId) : undefined;
              return (
                <ExecutionCard
                  key={execution.id}
                  execution={execution}
                  agent={agent}
                  role={role}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Executions */}
      {completedExecutions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Completed</h2>
          <div className="grid gap-4 opacity-70">
            {completedExecutions.map((execution) => {
              const agent = agents.find((a) => a.id === execution.agentId);
              const role = agent ? getRole(agent.roleId) : undefined;
              return (
                <ExecutionCard
                  key={execution.id}
                  execution={execution}
                  agent={agent}
                  role={role}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {executions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No Executions</h3>
          <p className="text-sm text-muted-foreground">
            Executions will appear here when agents start working on approved plans.
          </p>
        </div>
      )}
    </div>
  );
}
