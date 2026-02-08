import { useWorkforce } from "@/contexts/WorkforceContext";
import { AgentCard } from "@/components/workforce/AgentCard";
import { WorkforceStats } from "@/components/workforce/WorkforceStats";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkforceOverview() {
  const { agents, roles, getRole } = useWorkforce();

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2">
            AI Workforce
            <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI engineering workforce
          </p>
        </div>
        <Button asChild>
          <Link to="/settings">
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <WorkforceStats agents={agents} />

      {/* Agent Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Agents</h2>
          <span className="text-sm text-muted-foreground">
            {agents.filter((a) => a.isActive).length} of {agents.length} active
          </span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents
            .filter((a) => a.isActive)
            .map((agent) => {
              const role = getRole(agent.roleId);
              if (!role) return null;
              return (
                <AgentCard key={agent.id} agent={agent} role={role} />
              );
            })}
        </div>
      </div>

      {/* Available Roles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Available Roles</h2>
          <span className="text-sm text-muted-foreground">
            {roles.length} built-in roles
          </span>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Link
              key={role.id}
              to="/settings"
              className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer group card-hover"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-transform group-hover:scale-105",
                  role.color
                )}>
                  <DynamicIcon name={role.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{role.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {role.description.slice(0, 40)}...
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
