import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, FileText, Clipboard } from "lucide-react";
import { useAIJudgment } from "@/hooks/useAIJudgment";
import { useWork } from "@/contexts/WorkContext";
import { VerificationQueueCard } from "../signals/VerificationQueueCard";
import type { Signal } from "@/lib/models/types";

interface ContextInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextInputDialog({ open, onOpenChange }: ContextInputDialogProps) {
  const [contextText, setContextText] = useState("");
  const [detectedSignals, setDetectedSignals] = useState<
    (Signal & { currentPressure: number })[]
  >([]);
  const [step, setStep] = useState<"input" | "review">("input");

  const { detectSignals, isProcessing, error } = useAIJudgment();
  const { addSignal, verifySignal, setFirstRun } = useWork();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContextText(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!contextText.trim()) return;

    const result = await detectSignals(contextText);
    if (result && result.signals.length > 0) {
      const signals = result.signals.map((s) => {
        const now = new Date();
        return {
          id: crypto.randomUUID(),
          title: s.title,
          description: s.description,
          source: "ai" as const,
          sourceContext: contextText.slice(0, 500),
          pressureLevel: s.pressureLevel,
          pressureDecayRate: 5,
          originalPressure: s.pressureLevel,
          impactScope: s.impactScope,
          constraintType: "none" as const,
          aiConfidence: s.confidence,
          aiReasoning: s.reasoning,
          state: "unaddressed" as const,
          verificationStatus: "pending_review" as const,
          relatedSignalIds: [],
          createdAt: now,
          updatedAt: now,
          createdBy: "ai-system",
          tags: s.suggestedTags || [],
          currentPressure: s.pressureLevel,
        };
      });

      setDetectedSignals(signals);
      setStep("review");
    }
  };

  const handleVerifySignal = (
    signal: Signal & { currentPressure: number },
    status: Signal["verificationStatus"],
    notes?: string
  ) => {
    // Add to work context
    addSignal({
      ...signal,
      verificationStatus: status,
      modificationNotes: notes,
    });

    // Remove from local list
    setDetectedSignals((prev) => prev.filter((s) => s.id !== signal.id));

    // If all signals processed, close dialog
    if (detectedSignals.length === 1) {
      setFirstRun(false);
      onOpenChange(false);
      setStep("input");
      setContextText("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("input");
    setContextText("");
    setDetectedSignals([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "input" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet" />
                Extract Signals from Context
              </DialogTitle>
              <DialogDescription>
                Paste text from Slack, emails, meeting notes, or any work context.
                AI will detect Signals that need attention.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Work Context</label>
                  <Button variant="ghost" size="sm" onClick={handlePaste}>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Paste
                  </Button>
                </div>
                <Textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Paste your Slack thread, email, meeting notes, or any text that contains work-related information..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {contextText.length} characters
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!contextText.trim() || isProcessing}
                  className="flex-1 bg-gradient-to-r from-violet to-cyan"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Detect Signals
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal" />
                Verify Detected Signals
              </DialogTitle>
              <DialogDescription>
                Review and verify the AI-detected Signals before they enter the system.
                {detectedSignals.length} signal{detectedSignals.length !== 1 && "s"} remaining.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {detectedSignals.map((signal) => (
                <VerificationQueueCard
                  key={signal.id}
                  signal={signal}
                  onVerify={(status, notes) => handleVerifySignal(signal, status, notes)}
                />
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  // Add all remaining as verified
                  detectedSignals.forEach((signal) => {
                    addSignal({
                      ...signal,
                      verificationStatus: "verified",
                    });
                  });
                  setFirstRun(false);
                  handleClose();
                }}
                className="flex-1"
              >
                Verify All Remaining
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // Skip remaining
                  setFirstRun(false);
                  handleClose();
                }}
              >
                Skip Rest
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}