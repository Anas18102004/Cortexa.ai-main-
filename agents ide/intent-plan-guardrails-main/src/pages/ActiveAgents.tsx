import { useWorkforce } from "@/contexts/WorkforceContext";
import { AgentCard } from "@/components/workforce/AgentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function ActiveAgents() {
  const { agents, getRole } = useWorkforce();

  const activeAgents = agents.filter((a) => a.isActive);
  const inactiveAgents = agents.filter((a) => !a.isActive);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1>Active Agents</h1>
          <p className="text-muted-foreground">
            Manage and assign tasks to your AI workforce
          </p>
        </div>
        <Button asChild>
          <Link to="/settings">
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Link>
        </Button>
      </div>

      {/* Active Agents */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          Active ({activeAgents.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeAgents.map((agent) => {
            const role = getRole(agent.roleId);
            if (!role) return null;
            return <AgentCard key={agent.id} agent={agent} role={role} />;
          })}
        </div>
      </div>

      {/* Inactive Agents */}
      {inactiveAgents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            Inactive ({inactiveAgents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 opacity-60">
            {inactiveAgents.map((agent) => {
              const role = getRole(agent.roleId);
              if (!role) return null;
              return <AgentCard key={agent.id} agent={agent} role={role} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
