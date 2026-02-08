import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FrictionItem, FrictionType } from "@/lib/models/types";
import { useWork } from "@/contexts/WorkContext";
import { 
  AlertOctagon, 
  Clock, 
  RefreshCw, 
  Shuffle, 
  Link2,
  Plus,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FrictionDialog } from "./FrictionDialog";

const frictionTypeConfig: Record<FrictionType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  blocker: {
    icon: AlertOctagon,
    label: "Blocker",
    bgColor: "bg-error/10",
    textColor: "text-error",
  },
  waiting: {
    icon: Clock,
    label: "Waiting",
    bgColor: "bg-amber/10",
    textColor: "text-amber",
  },
  rework: {
    icon: RefreshCw,
    label: "Rework",
    bgColor: "bg-violet/10",
    textColor: "text-violet",
  },
  context_switching: {
    icon: Shuffle,
    label: "Context Switch",
    bgColor: "bg-cyan/10",
    textColor: "text-cyan",
  },
  dependencies: {
    icon: Link2,
    label: "Dependency",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
};

const impactStyles = {
  low: "bg-pressure-low/15 text-pressure-low border-pressure-low/20",
  medium: "bg-pressure-medium/15 text-pressure-medium border-pressure-medium/20",
  high: "bg-pressure-high/15 text-pressure-high border-pressure-high/20",
  critical: "bg-pressure-critical/15 text-pressure-critical border-pressure-critical/20",
};

interface FrictionPanelProps {
  className?: string;
  compact?: boolean;
}

export function FrictionPanel({ className, compact = false }: FrictionPanelProps) {
  const { state, resolveFriction } = useWork();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const unresolvedFriction = state.frictionItems.filter(f => !f.resolvedAt);
  const recentlyResolved = state.frictionItems
    .filter(f => f.resolvedAt)
    .slice(-3)
    .reverse();

  // Calculate total drag cost
  const totalDragHours = unresolvedFriction.reduce((sum, f) => {
    const hoursActive = (Date.now() - new Date(f.startedAt).getTime()) / (1000 * 60 * 60);
    const multiplier = f.impactLevel === "critical" ? 4 : f.impactLevel === "high" ? 2 : f.impactLevel === "medium" ? 1 : 0.5;
    return sum + (hoursActive * multiplier);
  }, 0);

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="metric-label">Friction & Drag</h3>
          <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {unresolvedFriction.length > 0 ? (
          <>
            <p className="text-3xl font-semibold text-error mb-1">{unresolvedFriction.length}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Active blockers • ~{Math.round(totalDragHours)}h drag cost
            </p>
            <div className="space-y-2.5">
              {unresolvedFriction.slice(0, 3).map((item) => {
                const config = frictionTypeConfig[item.type];
                const Icon = config.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                      <Icon className={cn("h-3.5 w-3.5", config.textColor)} />
                    </div>
                    <span className="truncate flex-1 font-medium">{item.title}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-medium", impactStyles[item.impactLevel])}>
                      {item.impactLevel}
                    </Badge>
                  </div>
                );
              })}
              {unresolvedFriction.length > 3 && (
                <p className="text-xs text-muted-foreground pl-9">
                  +{unresolvedFriction.length - 3} more
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-teal" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No active friction</p>
          </div>
        )}

        <FrictionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden shadow-low", className)}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-error/10">
              <AlertOctagon className="h-5 w-5 text-error" />
            </div>
            <div>
              <h3 className="font-semibold">Friction & Drag</h3>
              <p className="text-sm text-muted-foreground">What's slowing work down</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-muted/30">
        <div className="text-center">
          <p className="text-2xl font-semibold text-error">{unresolvedFriction.length}</p>
          <p className="text-xs text-muted-foreground font-medium">Active Items</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-amber">
            {unresolvedFriction.filter(f => f.impactLevel === "critical" || f.impactLevel === "high").length}
          </p>
          <p className="text-xs text-muted-foreground font-medium">High Impact</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-muted-foreground">~{Math.round(totalDragHours)}h</p>
          <p className="text-xs text-muted-foreground font-medium">Est. Drag Cost</p>
        </div>
      </div>

      {/* Active Friction Items */}
      <div className="p-6">
        {unresolvedFriction.length > 0 ? (
          <div className="space-y-4">
            {unresolvedFriction.map((item) => {
              const config = frictionTypeConfig[item.type];
              const Icon = config.icon;
              const duration = formatDistanceToNow(new Date(item.startedAt), { addSuffix: false });

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card shadow-low"
                >
                  <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
                    <Icon className={cn("h-4 w-4", config.textColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-medium", config.bgColor, config.textColor, "border-current/20")}>
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] font-medium", impactStyles[item.impactLevel])}>
                        {item.impactLevel}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Active for {duration}
                      {item.affectedSignalIds.length > 0 && (
                        <> • Affects {item.affectedSignalIds.length} signal{item.affectedSignalIds.length !== 1 && "s"}</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => resolveFriction(item.id)}
                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-teal hover:bg-teal/10"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-teal" />
            </div>
            <p className="font-semibold mb-1">No Active Friction</p>
            <p className="text-sm text-muted-foreground">Work is flowing without major blockers</p>
          </div>
        )}
      </div>

      {/* Recently Resolved */}
      {recentlyResolved.length > 0 && (
        <div className="p-6 border-t border-border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recently Resolved</p>
          <div className="space-y-2">
            {recentlyResolved.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-teal" />
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <FrictionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
