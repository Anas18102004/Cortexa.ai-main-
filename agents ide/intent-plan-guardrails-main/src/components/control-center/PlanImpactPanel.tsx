import type { Agent, Plan, PlanRisk } from "@/types/agent";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  X,
  AlertTriangle,
  FileCode,
  TestTube,
  Clock,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCost } from "@/components/ui/cost-indicator";
import { useState } from "react";

interface PlanImpactPanelProps {
  plan?: Plan;
  agent: Agent;
}

export function PlanImpactPanel({ plan, agent }: PlanImpactPanelProps) {
  const { approvePlan, rejectPlan } = useWorkforce();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    actions: true,
    files: false,
    tests: false,
    risks: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!plan) {
    return (
      <aside className="h-full border-l border-border bg-card overflow-y-auto">
        <div className="p-5 flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No Active Plan</h3>
          <p className="text-sm text-muted-foreground">
            Submit an intent to generate a plan for this agent.
          </p>
        </div>
      </aside>
    );
  }

  const completedActions = plan.actions.filter((a) => a.status === "completed").length;
  const progressPercentage = (completedActions / plan.actions.length) * 100;

  const highRisks = plan.risks.filter((r) => r.severity === "high" || r.severity === "critical");
  const unacknowledgedRisks = plan.risks.filter((r) => !r.acknowledged);

  return (
    <aside className="h-full border-l border-border bg-card overflow-y-auto flex flex-col">
      {/* Header with Confidence */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Plan & Impact</h3>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className={cn(
              "text-sm font-medium",
              plan.confidenceScore >= 80 ? "text-success" :
              plan.confidenceScore >= 60 ? "text-warning" : "text-destructive"
            )}>
              {plan.confidenceScore}% confidence
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {plan.status === "executing" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span>{completedActions} / {plan.actions.length} actions</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Plan Summary */}
        <p className="text-sm text-muted-foreground mt-3">{plan.summary}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Planned Actions */}
        <CollapsibleSection
          title="Planned Actions"
          count={plan.actions.length}
          isExpanded={expandedSections.actions}
          onToggle={() => toggleSection("actions")}
        >
          <div className="space-y-2">
            {plan.actions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded text-sm",
                  action.status === "completed" ? "bg-success/10" :
                  action.status === "in_progress" ? "bg-primary/10" :
                  action.status === "failed" ? "bg-destructive/10" :
                  "bg-muted"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs",
                  action.type === "create" ? "bg-success/20 text-success" :
                  action.type === "modify" ? "bg-primary/20 text-primary" :
                  action.type === "delete" ? "bg-destructive/20 text-destructive" :
                  "bg-muted"
                )}>
                  {action.type === "create" ? "+" :
                   action.type === "modify" ? "~" :
                   action.type === "delete" ? "-" : "?"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs truncate">{action.targetFile}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  action.estimatedImpact === "high" ? "bg-warning/20 text-warning" :
                  action.estimatedImpact === "medium" ? "bg-info/20 text-info" :
                  "bg-muted text-muted-foreground"
                )}>
                  {action.estimatedImpact}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Files to Touch */}
        <CollapsibleSection
          title="Files to Touch"
          count={plan.filesToTouch.length}
          isExpanded={expandedSections.files}
          onToggle={() => toggleSection("files")}
        >
          <div className="space-y-1">
            {plan.filesToTouch.map((file) => (
              <div key={file} className="flex items-center gap-2 text-sm font-mono p-1.5 rounded bg-muted">
                <FileCode className="w-3 h-3 text-muted-foreground" />
                {file}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Tests to Add */}
        <CollapsibleSection
          title="Tests to Add"
          count={plan.testsToAdd.length}
          isExpanded={expandedSections.tests}
          onToggle={() => toggleSection("tests")}
        >
          <div className="space-y-1">
            {plan.testsToAdd.map((test, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted">
                <TestTube className="w-3 h-3 text-success" />
                {test}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Risks */}
        <CollapsibleSection
          title="Risks & Concerns"
          count={plan.risks.length}
          isExpanded={expandedSections.risks}
          onToggle={() => toggleSection("risks")}
          highlight={highRisks.length > 0}
        >
          <div className="space-y-2">
            {plan.risks.map((risk) => (
              <RiskItem key={risk.id} risk={risk} />
            ))}
          </div>
        </CollapsibleSection>

        <Separator />

        {/* Estimates */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Estimates
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Cost</span>
              </div>
              <span className="text-lg font-semibold">{formatCost(plan.estimatedCost)}</span>
            </div>
            <div className="p-3 rounded bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Duration</span>
              </div>
              <span className="text-lg font-semibold">{formatDuration(plan.estimatedDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Actions */}
      {plan.status === "pending_approval" && (
        <div className="p-5 border-t border-border bg-card space-y-3">
          {unacknowledgedRisks.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded bg-warning/10 text-warning text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                {unacknowledgedRisks.length} risk{unacknowledgedRisks.length > 1 ? "s" : ""} not acknowledged
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => rejectPlan(plan.id, "Plan rejected by user")}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              className="flex-1"
              onClick={() => approvePlan(plan.id)}
              disabled={highRisks.some((r) => !r.acknowledged)}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Plan
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

interface CollapsibleSectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  highlight?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  count,
  isExpanded,
  onToggle,
  highlight,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full text-left",
          highlight && "text-warning"
        )}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{count}</span>
      </button>
      {isExpanded && children}
    </div>
  );
}

function RiskItem({ risk }: { risk: PlanRisk }) {
  const severityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-info/10 text-info",
    high: "bg-warning/10 text-warning",
    critical: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={cn("p-2.5 rounded text-sm", severityColors[risk.severity])}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p>{risk.description}</p>
          {risk.mitigation && (
            <p className="text-xs mt-1 opacity-80">
              Mitigation: {risk.mitigation}
            </p>
          )}
        </div>
        {risk.acknowledged && (
          <Check className="w-4 h-4 text-success" />
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
