import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useWork } from "@/contexts/WorkContext";
import { useSignals } from "@/hooks/useSignals";
import type { FrictionType, FrictionItem } from "@/lib/models/types";
import { 
  AlertOctagon, 
  Clock, 
  RefreshCw, 
  Shuffle, 
  Link2 
} from "lucide-react";

interface FrictionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const frictionTypes: { value: FrictionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "blocker", label: "Blocker", icon: AlertOctagon },
  { value: "waiting", label: "Waiting on someone/something", icon: Clock },
  { value: "rework", label: "Rework required", icon: RefreshCw },
  { value: "context_switching", label: "Context switching", icon: Shuffle },
  { value: "dependencies", label: "Dependency issue", icon: Link2 },
];

const impactLevels = ["low", "medium", "high", "critical"] as const;

export function FrictionDialog({ open, onOpenChange }: FrictionDialogProps) {
  const { addFriction } = useWork();
  const { verifiedSignals } = useSignals();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<FrictionType>("blocker");
  const [impactLevel, setImpactLevel] = useState<FrictionItem["impactLevel"]>("medium");
  const [affectedSignalIds, setAffectedSignalIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const friction: FrictionItem = {
      id: crypto.randomUUID(),
      type,
      title: title.trim(),
      description: description.trim(),
      impactLevel,
      affectedSignalIds,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    addFriction(friction);
    
    // Reset form
    setTitle("");
    setDescription("");
    setType("blocker");
    setImpactLevel("medium");
    setAffectedSignalIds([]);
    onOpenChange(false);
  };

  const toggleSignal = (signalId: string) => {
    setAffectedSignalIds(prev => 
      prev.includes(signalId) 
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-error" />
            Log Friction
          </DialogTitle>
          <DialogDescription>
            Track blockers, waiting states, and other work impediments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {frictionTypes.map((ft) => {
                const Icon = ft.icon;
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setType(ft.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm",
                      type === ft.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{ft.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="friction-title">Title</Label>
            <Input
              id="friction-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's blocking or slowing things down?"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="friction-description">Description</Label>
            <Textarea
              id="friction-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="More details about the friction..."
              rows={3}
            />
          </div>

          {/* Impact Level */}
          <div className="space-y-2">
            <Label>Impact Level</Label>
            <Select value={impactLevel} onValueChange={(v) => setImpactLevel(v as typeof impactLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {impactLevels.map((level) => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Affected Signals */}
          {verifiedSignals.length > 0 && (
            <div className="space-y-2">
              <Label>Affected Signals (optional)</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {verifiedSignals.slice(0, 10).map((signal) => (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => toggleSignal(signal.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors",
                      affectedSignalIds.includes(signal.id)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded border",
                      affectedSignalIds.includes(signal.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )} />
                    <span className="truncate">{signal.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!title.trim()}
              className="flex-1 bg-gradient-to-r from-error to-amber text-background"
            >
              Log Friction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
