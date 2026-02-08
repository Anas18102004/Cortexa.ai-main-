import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Play,
  Pause,
  Plus,
  Activity,
  Zap,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function WorkspaceAgentPanel() {
  const { currentProject } = useProject();
  const { agents, getRole, pauseExecution, resumeExecution, executions } = useWorkforce();
  
  if (!currentProject) return null;
  
  const assignedAgents = currentProject.assignedAgentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  
  return (
    <aside className="h-full border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            AI Team
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {assignedAgents.length} agents assigned
        </p>
      </div>
      
      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {assignedAgents.map((agent) => {
          if (!agent) return null;
          
          const role = getRole(agent.roleId);
          const isExecuting = agent.status === "executing";
          const isPaused = agent.status === "paused";
          const isPlanning = agent.status === "planning";
          const isAwaiting = agent.status === "awaiting_approval";
          
          // Get current execution for this agent
          const currentExecution = executions.find(
            (e) => e.agentId === agent.id && (e.status === "running" || e.status === "paused")
          );
          
          const progress = currentExecution
            ? (currentExecution.currentStep / currentExecution.totalSteps) * 100
            : 0;
          
          return (
            <div
              key={agent.id}
              className={cn(
                "p-3 rounded-xl border transition-all duration-300 card-interactive",
                isExecuting && "border-success/30 bg-success/5",
                isPaused && "border-warning/30 bg-warning/5",
                isPlanning && "border-primary/30 bg-primary/5",
                isAwaiting && "border-warning/30 bg-warning/5",
                !isExecuting && !isPaused && !isPlanning && !isAwaiting && "border-border/50 bg-card/50"
              )}
            >
              {/* Agent Header */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isExecuting && "bg-success/20 animate-pulse",
                  !isExecuting && "bg-muted"
                )}>
                  {role?.icon ? (
                    <DynamicIcon name={role.icon} className={cn(
                      "w-5 h-5",
                      isExecuting && "text-success",
                      !isExecuting && "text-muted-foreground"
                    )} />
                  ) : (
                    <Bot className={cn(
                      "w-5 h-5",
                      isExecuting && "text-success",
                      !isExecuting && "text-muted-foreground"
                    )} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {agent.customName || role?.name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role?.name}
                  </p>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center">
                  {isExecuting && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                  )}
                  {isPaused && (
                    <span className="w-2 h-2 rounded-full bg-warning" />
                  )}
                  {isPlanning && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  {isAwaiting && (
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Current Task (if any) */}
              {agent.currentIntent && (
                <div className="mt-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Activity className="w-3 h-3" />
                    <span>Current task</span>
                  </div>
                  <p className="text-xs font-medium truncate">{agent.currentIntent}</p>
                </div>
              )}
              
              {/* Progress (if executing) */}
              {isExecuting && currentExecution && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Step {currentExecution.currentStep}/{currentExecution.totalSteps}</span>
                    <span className="text-success font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-muted/50" />
                </div>
              )}
              
              {/* Quick Actions */}
              {(isExecuting || isPaused) && currentExecution && (
                <div className="mt-3 flex gap-2">
                  {isExecuting ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => pauseExecution(currentExecution.id)}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs text-success border-success/30 hover:bg-success/10"
                      onClick={() => resumeExecution(currentExecution.id)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Add Agent
        </Button>
      </div>
    </aside>
  );
}
