import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Signal, ResponseType } from "@/lib/models/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search,
  Play,
  Clock,
  EyeOff,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { PressureBar } from "../signals/PressureIndicator";
import { useAIJudgment } from "@/hooks/useAIJudgment";
import { useWork } from "@/contexts/WorkContext";

interface ResponseDialogProps {
  signal: Signal & { currentPressure: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const responseOptions: {
  type: ResponseType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}[] = [
  {
    type: "investigate",
    label: "Investigate",
    icon: Search,
    description: "Gather more information before deciding",
    color: "bg-cyan text-cyan-foreground",
  },
  {
    type: "execute",
    label: "Execute",
    icon: Play,
    description: "Take action to address this Signal",
    color: "bg-teal text-teal-foreground",
  },
  {
    type: "defer",
    label: "Defer",
    icon: Clock,
    description: "Consciously postpone with timeline",
    color: "bg-amber text-amber-foreground",
  },
  {
    type: "ignore",
    label: "Ignore",
    icon: EyeOff,
    description: "Explicitly choose not to address",
    color: "bg-muted text-muted-foreground",
  },
  {
    type: "escalate",
    label: "Escalate",
    icon: ArrowUpRight,
    description: "Needs someone with more authority",
    color: "bg-violet text-violet-foreground",
  },
  {
    type: "reframe",
    label: "Reframe",
    icon: RefreshCw,
    description: "The Signal itself needs redefinition",
    color: "bg-secondary text-secondary-foreground",
  },
];

export function ResponseDialog({ signal, open, onOpenChange }: ResponseDialogProps) {
  const [selectedResponse, setSelectedResponse] = useState<ResponseType | null>(null);
  const [justification, setJustification] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendation: ResponseType;
    reasoning: string;
    confidence: number;
  } | null>(null);

  const { getRecommendation, isProcessing } = useAIJudgment();
  const { respondToSignal } = useWork();

  const handleGetRecommendation = async () => {
    const result = await getRecommendation(signal);
    if (result) {
      setAiRecommendation(result);
    }
  };

  const handleSubmit = () => {
    if (!selectedResponse || !justification.trim()) return;

    respondToSignal(
      signal.id,
      selectedResponse,
      justification,
      aiRecommendation?.recommendation || "investigate",
      aiRecommendation?.reasoning || "No AI recommendation available",
      aiRecommendation?.confidence || 0
    );

    onOpenChange(false);
    setSelectedResponse(null);
    setJustification("");
    setAiRecommendation(null);
  };

  const isOverride = aiRecommendation && selectedResponse !== aiRecommendation.recommendation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Respond to Signal
          </DialogTitle>
          <DialogDescription>
            Make an explicit choice about how to address this Signal
          </DialogDescription>
        </DialogHeader>

        {/* Signal Summary */}
        <div className="rounded-lg bg-muted/50 p-4 mb-4">
          <h4 className="font-semibold mb-1">{signal.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{signal.description}</p>
          <PressureBar pressure={signal.currentPressure} />
        </div>

        {/* AI Recommendation */}
        <div className="mb-4">
          {!aiRecommendation ? (
            <Button
              variant="outline"
              onClick={handleGetRecommendation}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting AI Recommendation...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Recommendation
                </>
              )}
            </Button>
          ) : (
            <div className="rounded-lg border border-violet/30 bg-violet/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet" />
                <span className="text-sm font-medium">AI Recommends: </span>
                <Badge className="bg-violet/20 text-violet capitalize">
                  {aiRecommendation.recommendation}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(aiRecommendation.confidence * 100)}% confident)
                </span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "{aiRecommendation.reasoning}"
              </p>
            </div>
          )}
        </div>

        {/* Response Options */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {responseOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedResponse === option.type;
            const isRecommended = aiRecommendation?.recommendation === option.type;

            return (
              <button
                key={option.type}
                onClick={() => setSelectedResponse(option.type)}
                className={cn(
                  "relative p-3 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  isRecommended && !isSelected && "border-violet/50 bg-violet/5"
                )}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2 -right-2 bg-violet text-[10px]">
                    AI Pick
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("p-1.5 rounded", option.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Justification */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1.5 block">
            Justification <span className="text-muted-foreground">(required)</span>
          </label>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why are you making this choice?"
            rows={3}
          />
        </div>

        {/* Override Warning */}
        {isOverride && (
          <div className="flex items-start gap-2 rounded-lg bg-amber/10 border border-amber/30 p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber">
                You're overriding the AI recommendation
              </p>
              <p className="text-xs text-muted-foreground">
                This will be logged in the Decision Ledger for learning purposes.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedResponse || !justification.trim()}
            className="flex-1 bg-gradient-to-r from-teal to-cyan"
          >
            Submit Response
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}