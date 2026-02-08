import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  MessageSquare,
  FileCode,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function WorkspaceAgentBrain() {
  const { currentProject, approveChange, rejectChange, approveAllChanges, rejectAllChanges } = useProject();
  const { agents, getRole, executions, plans } = useWorkforce();
  const [feedback, setFeedback] = useState("");
  
  if (!currentProject) return null;
  
  const assignedAgents = currentProject.assignedAgentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  
  const activeAgent = assignedAgents.find((a) => a?.status === "executing" || a?.status === "planning");
  const activeRole = activeAgent ? getRole(activeAgent.roleId) : null;
  
  const activeExecution = executions.find(
    (e) => activeAgent && e.agentId === activeAgent.id && (e.status === "running" || e.status === "paused")
  );
  
  const activePlan = plans.find(
    (p) => activeAgent && p.agentId === activeAgent.id && p.status !== "rejected"
  );
  
  const changes = currentProject.pendingChanges;
  
  return (
    <div className="h-full flex flex-col bg-card/30 border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {activeAgent && activeRole ? (
            <>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                activeAgent.status === "executing" ? "bg-success/20" : "bg-primary/20",
                activeRole.color
              )}>
                <DynamicIcon name={activeRole.icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{activeAgent.customName || activeRole.name}</h3>
                <p className={cn(
                  "text-xs",
                  activeAgent.status === "executing" ? "text-success" : "text-primary"
                )}>
                  {activeAgent.status === "executing" && "Working..."}
                  {activeAgent.status === "planning" && "Planning..."}
                  {activeAgent.status === "awaiting_approval" && "Awaiting approval"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Agent Brain</h3>
                <p className="text-xs text-muted-foreground">No active agent</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Current Task */}
          {activeAgent?.currentIntent && (
            <section>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Current Task
              </h4>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">{activeAgent.currentIntent}</p>
              </div>
            </section>
          )}
          
          {/* Execution Progress */}
          {activeExecution && (
            <section>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Progress
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Step {activeExecution.currentStep} of {activeExecution.totalSteps}</span>
                  <span className="font-medium text-success">
                    {Math.round((activeExecution.currentStep / activeExecution.totalSteps) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(activeExecution.currentStep / activeExecution.totalSteps) * 100} 
                  className="h-2"
                />
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      Elapsed
                    </div>
                    <span className="font-medium font-mono">
                      {formatDuration(activeExecution.elapsedTime)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <TrendingUp className="w-3 h-3" />
                      Confidence
                    </div>
                    <span className="font-medium text-success">
                      {activePlan?.confidenceScore || 85}%
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Pending Changes */}
          {changes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pending Changes ({changes.length})
                </h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-success hover:bg-success/10"
                    onClick={approveAllChanges}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-destructive hover:bg-destructive/10"
                    onClick={rejectAllChanges}
                  >
                    <X className="w-3 h-3 mr-1" />
                    All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="p-3 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <FileCode className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{change.filePath}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {change.explanation}
                        </p>
                      </div>
                    </div>
                    
                    {/* Diff Preview */}
                    <div className="rounded bg-muted/50 p-2 mb-2 text-xs font-mono overflow-hidden">
                      {change.diffLines.slice(0, 4).map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex",
                            line.type === "added" && "text-success",
                            line.type === "removed" && "text-destructive"
                          )}
                        >
                          <span className="w-4 flex-shrink-0">
                            {line.type === "added" && <Plus className="w-3 h-3" />}
                            {line.type === "removed" && <Minus className="w-3 h-3" />}
                          </span>
                          <span className="truncate">{line.content}</span>
                        </div>
                      ))}
                      {change.diffLines.length > 4 && (
                        <p className="text-muted-foreground mt-1">
                          +{change.diffLines.length - 4} more lines
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs text-success border-success/30 hover:bg-success/10"
                        onClick={() => approveChange(change.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => rejectChange(change.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Files Being Touched */}
          {activePlan && (
            <section>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Files to Touch
              </h4>
              <div className="space-y-1">
                {activePlan.filesToTouch.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 text-xs font-mono"
                  >
                    <FileCode className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Risks */}
          {activePlan && activePlan.risks.length > 0 && (
            <section>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-warning" />
                Risks
              </h4>
              <div className="space-y-2">
                {activePlan.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={cn(
                      "p-2.5 rounded text-xs",
                      risk.severity === "high" || risk.severity === "critical"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-warning/10 text-warning border border-warning/20"
                    )}
                  >
                    <p>{risk.description}</p>
                    {risk.mitigation && (
                      <p className="mt-1 opacity-70">
                        Mitigation: {risk.mitigation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Feedback Input */}
          <section>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Feedback
            </h4>
            <Textarea
              placeholder="Provide feedback or request changes..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
            />
            <Button size="sm" className="w-full mt-2 gap-2" disabled={!feedback.trim()}>
              <MessageSquare className="w-3.5 h-3.5" />
              Send Feedback
            </Button>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}
