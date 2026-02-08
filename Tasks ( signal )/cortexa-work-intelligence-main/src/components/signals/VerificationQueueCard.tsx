import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Signal } from "@/lib/models/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Edit3, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";
import { PressureBar } from "./PressureIndicator";

interface VerificationQueueCardProps {
  signal: Signal & { currentPressure: number };
  onVerify: (status: Signal["verificationStatus"], notes?: string) => void;
  className?: string;
}

export function VerificationQueueCard({ signal, onVerify, className }: VerificationQueueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const handleVerify = () => {
    onVerify("verified");
  };

  const handleReject = () => {
    onVerify("rejected", editNotes || undefined);
  };

  const handleModify = () => {
    if (editNotes.trim()) {
      onVerify("modified", editNotes);
    }
    setIsEditing(false);
    setEditNotes("");
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-amber/30 bg-card overflow-hidden",
        "border-l-4 border-l-amber",
        className
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber/10 text-amber border-amber/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Detected
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {Math.round(signal.aiConfidence * 100)}% confident
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <h3 className="font-semibold text-foreground mb-1">{signal.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{signal.description}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>AI Pressure Assessment</span>
            <span className="font-mono">{signal.currentPressure}/100</span>
          </div>
          <PressureBar pressure={signal.currentPressure} showValue={false} />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          {/* AI Reasoning */}
          {signal.aiReasoning && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning</p>
              <p className="text-sm bg-muted/50 rounded-lg p-3 italic">
                "{signal.aiReasoning}"
              </p>
            </div>
          )}

          {/* Source Context */}
          {signal.sourceContext && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Original Context</p>
              <p className="text-sm bg-muted/50 rounded-lg p-3 font-mono text-xs">
                {signal.sourceContext.slice(0, 300)}
                {signal.sourceContext.length > 300 && "..."}
              </p>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Modification Notes
              </p>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Describe what you're changing and why..."
                className="text-sm"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 border-t border-border">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditNotes("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleModify}
              disabled={!editNotes.trim()}
              className="flex-1 bg-violet text-violet-foreground hover:bg-violet/90"
            >
              Save Modifications
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Modify
            </Button>
            <Button
              size="sm"
              onClick={handleVerify}
              className="flex-1 bg-teal text-teal-foreground hover:bg-teal/90"
            >
              <Check className="h-4 w-4 mr-1" />
              Verify
            </Button>
          </>
        )}
      </div>
    </div>
  );
}