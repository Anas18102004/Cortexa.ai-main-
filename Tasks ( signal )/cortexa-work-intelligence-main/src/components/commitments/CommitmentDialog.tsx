import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommitments } from "@/hooks/useCommitments";
import { useSignals } from "@/hooks/useSignals";
import { useWork } from "@/contexts/WorkContext";
import { Zap, Target, AlertTriangle } from "lucide-react";

interface CommitmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommitmentDialog({ open, onOpenChange }: CommitmentDialogProps) {
  const { createCommitment, addCommitment, stats } = useCommitments();
  const { verifiedSignals } = useSignals();
  const { state } = useWork();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [energyPercentage, setEnergyPercentage] = useState(20);
  const [missionId, setMissionId] = useState<string>("");
  const [linkedSignalIds, setLinkedSignalIds] = useState<string[]>([]);
  const [expectedPressureReduction, setExpectedPressureReduction] = useState(0);

  const activeMissions = state.missions.filter(m => m.status === "active");
  const isOverAllocated = energyPercentage > stats.availableEnergy;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const commitment = createCommitment(
      title.trim(),
      description.trim(),
      energyPercentage,
      linkedSignalIds,
      missionId || undefined,
      expectedPressureReduction
    );

    addCommitment(commitment);
    
    // Reset form
    setTitle("");
    setDescription("");
    setEnergyPercentage(20);
    setMissionId("");
    setLinkedSignalIds([]);
    setExpectedPressureReduction(0);
    onOpenChange(false);
  };

  const toggleSignal = (signalId: string) => {
    setLinkedSignalIds(prev => 
      prev.includes(signalId) 
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-teal" />
            Create Commitment
          </DialogTitle>
          <DialogDescription>
            Allocate team energy to signals and missions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="commitment-title">Title</Label>
            <Input
              id="commitment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you committing to?"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="commitment-description">Description</Label>
            <Textarea
              id="commitment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expected work and outcomes..."
              rows={3}
            />
          </div>

          {/* Energy Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Energy Allocation</Label>
              <span className="text-sm font-mono">
                {energyPercentage}% 
                <span className="text-muted-foreground"> / {stats.availableEnergy}% available</span>
              </span>
            </div>
            <Slider
              value={[energyPercentage]}
              onValueChange={([value]) => setEnergyPercentage(value)}
              max={100}
              min={5}
              step={5}
              className={cn(isOverAllocated && "[&_[role=slider]]:bg-error")}
            />
            {isOverAllocated && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertTriangle className="h-4 w-4" />
                <span>Exceeds available energy. Will be capped at {stats.availableEnergy}%</span>
              </div>
            )}
          </div>

          {/* Link to Mission */}
          {activeMissions.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Mission (optional)</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a mission..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No mission</SelectItem>
                  {activeMissions.map((mission) => (
                    <SelectItem key={mission.id} value={mission.id}>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {mission.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Link to Signals */}
          {verifiedSignals.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Signals (optional)</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {verifiedSignals.filter(s => s.state !== "ignored").slice(0, 10).map((signal) => (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => toggleSignal(signal.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors",
                      linkedSignalIds.includes(signal.id)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded border",
                      linkedSignalIds.includes(signal.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )} />
                    <span className="truncate">{signal.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      P{signal.currentPressure}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expected Pressure Reduction */}
          <div className="space-y-2">
            <Label>Expected Pressure Reduction</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[expectedPressureReduction]}
                onValueChange={([value]) => setExpectedPressureReduction(value)}
                max={100}
                min={0}
                step={5}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right">-{expectedPressureReduction}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              How much total pressure do you expect this commitment to reduce?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!title.trim()}
              className="flex-1 bg-gradient-to-r from-teal to-cyan text-background"
            >
              Create Commitment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
