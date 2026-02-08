import type { Execution, Agent, AgentRole } from "@/types/agent";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  FileCode,
  TestTube,
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCost } from "@/components/ui/cost-indicator";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface ExecutionCardProps {
  execution: Execution;
  agent?: Agent;
  role?: AgentRole;
}

export function ExecutionCard({ execution, agent, role }: ExecutionCardProps) {
  const { pauseExecution, resumeExecution, cancelExecution } = useWorkforce();
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [displayedElapsed, setDisplayedElapsed] = useState(execution.elapsedTime);

  // Live elapsed time counter
  useEffect(() => {
    if (execution.status !== "running") return;
    
    const interval = setInterval(() => {
      setDisplayedElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [execution.status]);

  // Sync with actual elapsed time
  useEffect(() => {
    setDisplayedElapsed(execution.elapsedTime);
  }, [execution.elapsedTime]);

  const progressPercentage = (execution.currentStep / execution.totalSteps) * 100;
  const isRunning = execution.status === "running";
  const isPaused = execution.status === "paused";

  return (
    <div className={cn(
      "p-5 rounded-lg border bg-card transition-all",
      isRunning && "border-success/30 shadow-lg shadow-success/5",
      isPaused && "border-warning/30"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {role && (
            <div className={cn(
              "w-10 h-10 rounded-lg bg-muted flex items-center justify-center",
              role.color,
              isRunning && "animate-pulse"
            )}>
              <DynamicIcon name={role.icon} className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-medium">
              {agent?.customName || role?.name || "Unknown Agent"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Started {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <Activity className="w-4 h-4 text-success animate-pulse" />
          )}
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              execution.status === "running" ? "bg-success/10 text-success" :
              execution.status === "paused" ? "bg-warning/10 text-warning" :
              execution.status === "completed" ? "bg-muted text-muted-foreground" :
              "bg-destructive/10 text-destructive"
            )}
          >
            {execution.status}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Step {execution.currentStep} of {execution.totalSteps}
          </span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-2",
            isRunning && "[&>div]:bg-gradient-to-r [&>div]:from-success [&>div]:to-success/70"
          )} 
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs">Elapsed</span>
          </div>
          <p className={cn("text-sm font-medium font-mono", isRunning && "text-success")}>
            {formatDuration(displayedElapsed)}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs">Cost</span>
          </div>
          <p className="text-sm font-medium">{formatCost(execution.costAccrued)}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileCode className="w-3 h-3" />
            <span className="text-xs">Files</span>
          </div>
          <p className="text-sm font-medium">{execution.changedFiles.length}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TestTube className="w-3 h-3" />
            <span className="text-xs">Tests</span>
          </div>
          <p className="text-sm font-medium">
            {execution.testsPassed}/{execution.testsRun}
          </p>
        </div>
      </div>

      {/* Logs (Collapsible) */}
      <Collapsible open={logsExpanded} onOpenChange={setLogsExpanded}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {logsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          View Logs ({execution.logs.length})
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="rounded-lg bg-muted/50 border border-border p-3 max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
            {execution.logs.slice().reverse().map((log) => (
              <div
                key={log.id}
                className={cn(
                  "flex gap-2",
                  log.level === "error" ? "text-destructive" :
                  log.level === "warning" ? "text-warning" :
                  log.level === "debug" ? "text-muted-foreground" :
                  "text-foreground"
                )}
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={cn(
                  "uppercase w-12 flex-shrink-0",
                  log.level === "error" ? "text-destructive" :
                  log.level === "warning" ? "text-warning" :
                  "text-muted-foreground"
                )}>
                  [{log.level}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      {(isRunning || isPaused) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => pauseExecution(execution.id)}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resumeExecution(execution.id)}
              className="text-success border-success/30 hover:bg-success/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => cancelExecution(execution.id)}
          >
            <Square className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}
