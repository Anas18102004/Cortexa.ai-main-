import type { TechStack } from "@/types/project";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { AuthorityBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { Check, Plus, Sparkles, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface AgentRecommendationProps {
  frontendStack: TechStack[];
  backendStack: TechStack[];
  toolsStack: TechStack[];
  selectedAgentIds: string[];
  onSelectAgent: (agentId: string) => void;
}

export function AgentRecommendation({
  frontendStack,
  backendStack,
  toolsStack,
  selectedAgentIds,
  onSelectAgent,
}: AgentRecommendationProps) {
  const { agents, roles } = useWorkforce();
  
  // Recommend agents based on tech stack
  const recommendedRoleIds: string[] = [];
  
  if (frontendStack.length > 0) {
    recommendedRoleIds.push("frontend-engineer");
  }
  if (backendStack.length > 0) {
    recommendedRoleIds.push("backend-engineer");
  }
  if (toolsStack.some((t) => t.category === "tool" && t.name.toLowerCase().includes("test"))) {
    recommendedRoleIds.push("qa-engineer");
  }
  
  // Always recommend at least frontend
  if (recommendedRoleIds.length === 0) {
    recommendedRoleIds.push("frontend-engineer");
  }
  
  // Get agents for recommended roles
  const availableAgents = agents.filter((a) => a.isActive);
  const recommendedAgents = availableAgents.filter((a) =>
    recommendedRoleIds.includes(a.roleId)
  );
  const otherAgents = availableAgents.filter(
    (a) => !recommendedRoleIds.includes(a.roleId)
  );
  
  // Missing roles (roles we recommend but don't have agents for)
  const agentRoleIds = new Set(availableAgents.map((a) => a.roleId));
  const missingRoleIds = recommendedRoleIds.filter((id) => !agentRoleIds.has(id));
  const missingRoles = missingRoleIds.map((id) => roles.find((r) => r.id === id)).filter(Boolean);
  
  return (
    <div className="space-y-6">
      {/* Recommended Agents */}
      {recommendedAgents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-medium">Recommended for your project</h4>
          </div>
          
          <div className="grid gap-3">
            {recommendedAgents.map((agent) => {
              const role = roles.find((r) => r.id === agent.roleId);
              const isSelected = selectedAgentIds.includes(agent.id);
              
              if (!role) return null;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                    isSelected
                      ? "bg-primary/10 border-primary/50 shadow-sm"
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected ? "bg-primary/20" : "bg-muted",
                    role.color
                  )}>
                    <DynamicIcon name={role.icon} className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{agent.customName || role.name}</h5>
                      <AuthorityBadge authority={agent.authority} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {role.description}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Missing Agents */}
      {missingRoles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-warning flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            You might need
          </h4>
          
          <div className="grid gap-3">
            {missingRoles.map((role) => {
              if (!role) return null;
              
              return (
                <div
                  key={role.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-warning/30 bg-warning/5"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center",
                    role.color
                  )}>
                    <DynamicIcon name={role.icon} className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium">{role.name}</h5>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {role.description}
                    </p>
                  </div>
                  
                  <Link to="/marketplace">
                    <Button size="sm" variant="outline" className="gap-2 border-warning/50 text-warning hover:bg-warning/10">
                      <Plus className="w-4 h-4" />
                      Add Agent
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Other Available Agents */}
      {otherAgents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground">Other available agents</h4>
          
          <div className="grid gap-3">
            {otherAgents.map((agent) => {
              const role = roles.find((r) => r.id === agent.roleId);
              const isSelected = selectedAgentIds.includes(agent.id);
              
              if (!role) return null;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                    isSelected
                      ? "bg-primary/10 border-primary/50 shadow-sm"
                      : "bg-card/50 border-border hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center bg-muted",
                    role.color
                  )}>
                    <DynamicIcon name={role.icon} className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{agent.customName || role.name}</h5>
                      <AuthorityBadge authority={agent.authority} />
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected agents</span>
          <span className="font-medium">{selectedAgentIds.length}</span>
        </div>
      </div>
    </div>
  );
}
