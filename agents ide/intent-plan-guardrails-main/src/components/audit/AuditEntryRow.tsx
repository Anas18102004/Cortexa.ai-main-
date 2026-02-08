import type { AuditEntry } from "@/types/agent";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  XCircle,
  Play,
  AlertCircle,
  RotateCcw,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AuditEntryRowProps {
  entry: AuditEntry;
}

const actionIcons: Record<AuditEntry["action"], typeof FileText> = {
  intent_created: FileText,
  plan_generated: FileText,
  plan_approved: CheckCircle,
  plan_rejected: XCircle,
  execution_started: Play,
  execution_completed: CheckCircle,
  execution_failed: AlertCircle,
  rollback_performed: RotateCcw,
  authority_changed: Settings,
  scope_modified: Settings,
};

const actionColors: Record<AuditEntry["action"], string> = {
  intent_created: "text-primary",
  plan_generated: "text-info",
  plan_approved: "text-success",
  plan_rejected: "text-destructive",
  execution_started: "text-primary",
  execution_completed: "text-success",
  execution_failed: "text-destructive",
  rollback_performed: "text-warning",
  authority_changed: "text-warning",
  scope_modified: "text-warning",
};

export function AuditEntryRow({ entry }: AuditEntryRowProps) {
  const Icon = actionIcons[entry.action];
  const colorClass = actionColors[entry.action];

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
      {/* Icon */}
      <div className={cn("w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{entry.description}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium">{entry.agentRole}</span>
              <span>•</span>
              <span>by {entry.initiatedBy.startsWith("agent") ? "Agent" : "User"}</span>
              {entry.changedFiles && entry.changedFiles.length > 0 && (
                <>
                  <span>•</span>
                  <span>{entry.changedFiles.length} file{entry.changedFiles.length > 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>

          {/* Timestamp & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {format(entry.timestamp, "MMM d, HH:mm")}
            </span>
            {entry.canRollback && !entry.rolledBack && (
              <Button variant="ghost" size="sm" className="text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Rollback
              </Button>
            )}
            {entry.rolledBack && (
              <span className="text-xs text-warning">Rolled back</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Related IDs */}
        {(entry.intentId || entry.planId || entry.executionId) && (
          <div className="flex gap-3 mt-2">
            {entry.intentId && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                intent:{entry.intentId.slice(-6)}
              </span>
            )}
            {entry.planId && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                plan:{entry.planId.slice(-6)}
              </span>
            )}
            {entry.executionId && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                exec:{entry.executionId.slice(-6)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
