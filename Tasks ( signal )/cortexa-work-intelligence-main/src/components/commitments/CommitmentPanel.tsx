import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCommitments } from "@/hooks/useCommitments";
import { useWork } from "@/contexts/WorkContext";
import { 
  Zap, 
  Plus, 
  Pause, 
  Play, 
  CheckCircle,
  Target,
  TrendingDown
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommitmentDialog } from "./CommitmentDialog";

interface CommitmentPanelProps {
  className?: string;
  compact?: boolean;
}

export function CommitmentPanel({ className, compact = false }: CommitmentPanelProps) {
  const { activeCommitments, stats, pauseCommitment, resumeCommitment, completeCommitment } = useCommitments();
  const { state } = useWork();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Energy ring visualization
  const EnergyRing = ({ allocated, size = "default" }: { allocated: number; size?: "default" | "small" }) => {
    const dimensions = size === "small" ? { outer: 80, inner: 32, stroke: 6 } : { outer: 96, inner: 40, stroke: 8 };
    const radius = dimensions.inner;
    const circumference = 2 * Math.PI * radius;
    const allocatedOffset = circumference - (allocated / 100) * circumference;
    
    return (
      <div className={cn("relative", size === "small" ? "w-20 h-20" : "w-24 h-24")}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={dimensions.outer / 2}
            cy={dimensions.outer / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={dimensions.stroke}
          />
          {/* Allocated ring */}
          <circle
            cx={dimensions.outer / 2}
            cy={dimensions.outer / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--teal))"
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={allocatedOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", size === "small" ? "text-lg" : "text-2xl")}>{allocated}%</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">allocated</span>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="metric-label">Energy Commitments</h3>
          <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-5 mb-4">
          <EnergyRing allocated={stats.totalEnergyAllocated} size="small" />
          <div>
            <p className="text-sm font-semibold">{activeCommitments.length} Active</p>
            <p className="text-xs text-muted-foreground">{stats.availableEnergy}% energy available</p>
          </div>
        </div>

        {activeCommitments.length > 0 ? (
          <div className="space-y-3">
            {activeCommitments.slice(0, 3).map((commitment) => (
              <div key={commitment.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1 font-medium">{commitment.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{commitment.energyPercentage}%</span>
                </div>
                <Progress value={commitment.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No active commitments
          </p>
        )}

        <CommitmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden shadow-low", className)}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal/10">
              <Zap className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h3 className="font-semibold">Energy Commitments</h3>
              <p className="text-sm text-muted-foreground">How team energy is allocated</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Commit
          </Button>
        </div>
      </div>

      {/* Energy Overview */}
      <div className="p-6 bg-muted/30 flex items-center justify-center gap-10">
        <EnergyRing allocated={stats.totalEnergyAllocated} />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-teal" />
            <span className="text-sm font-medium">Allocated: {stats.totalEnergyAllocated}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-sm font-medium">Available: {stats.availableEnergy}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeCommitments.length} active commitment{activeCommitments.length !== 1 && "s"}
          </p>
        </div>
      </div>

      {/* Active Commitments */}
      <div className="p-6">
        {activeCommitments.length > 0 ? (
          <div className="space-y-4">
            {activeCommitments.map((commitment) => {
              const mission = state.missions.find(m => m.id === commitment.missionId);
              
              return (
                <div
                  key={commitment.id}
                  className="p-5 rounded-xl border border-border bg-card shadow-low"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-teal/10 text-teal border-teal/20 text-[10px] font-medium">
                          {commitment.energyPercentage}% energy
                        </Badge>
                        {mission && (
                          <Badge variant="outline" className="text-[10px] font-medium">
                            <Target className="h-3 w-3 mr-1" />
                            {mission.title}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold">{commitment.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {commitment.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {commitment.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => pauseCommitment(commitment.id)}
                          className="h-9 w-9"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resumeCommitment(commitment.id)}
                          className="h-9 w-9"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => completeCommitment(commitment.id)}
                        className="h-9 w-9 text-muted-foreground hover:text-teal hover:bg-teal/10"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-mono font-medium">{commitment.progress}%</span>
                    </div>
                    <Progress value={commitment.progress} className="h-2" />
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span>Started {formatDistanceToNow(new Date(commitment.startDate), { addSuffix: true })}</span>
                    {commitment.expectedPressureReduction > 0 && (
                      <span className="flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5" />
                        -{commitment.expectedPressureReduction} pressure expected
                      </span>
                    )}
                    {commitment.linkedSignalIds.length > 0 && (
                      <span>{commitment.linkedSignalIds.length} linked signal{commitment.linkedSignalIds.length !== 1 && "s"}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-teal" />
            </div>
            <p className="font-semibold mb-1">No Active Commitments</p>
            <p className="text-sm text-muted-foreground mb-5">
              Allocate energy to signals and missions
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Commitment
            </Button>
          </div>
        )}
      </div>

      <CommitmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
