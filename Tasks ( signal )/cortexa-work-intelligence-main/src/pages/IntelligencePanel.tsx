import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSignals } from "@/hooks/useSignals";
import { useAIJudgment, type CortexaAnalysisResult } from "@/hooks/useAIJudgment";
import { 
  Brain, 
  Loader2, 
  AlertTriangle,
  Clipboard,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CortexaResultView } from "@/components/intelligence/CortexaResultView";

export default function IntelligencePanel() {
  const { verifiedSignals } = useSignals();
  const { analyzeContext, isProcessing, error, clearError } = useAIJudgment();
  const [contextText, setContextText] = useState("");
  const [result, setResult] = useState<CortexaAnalysisResult | null>(null);
  const [inputExpanded, setInputExpanded] = useState(true);

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
    clearError();

    const existingSignals = verifiedSignals.map(s => ({
      title: s.title,
      pressureLevel: s.pressureLevel,
      state: s.state,
    }));

    const data = await analyzeContext(contextText, existingSignals.length > 0 ? existingSignals : undefined);
    if (data) {
      setResult(data);
      setInputExpanded(false);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-violet" />
            CORTEXA Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            Work = Pressure → Attention → Action → Consequence
          </p>
        </div>
      </div>

      {/* Context Input */}
      <div className="rounded-xl border border-border bg-card mb-6 overflow-hidden">
        <button
          onClick={() => setInputExpanded(!inputExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-violet" />
            {result ? "Analyze New Context" : "Paste Work Context"}
          </div>
          {inputExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {inputExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Paste Slack threads, emails, meeting notes, or any work context. CORTEXA will execute the full pipeline.
            </p>
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={handlePaste}>
                <Clipboard className="h-3.5 w-3.5 mr-1" />
                Paste
              </Button>
            </div>
            <Textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Paste your work context here..."
              rows={8}
              className="font-mono text-sm bg-muted/30"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{contextText.length} characters</span>
              <Button
                onClick={handleAnalyze}
                disabled={!contextText.trim() || isProcessing}
                className="bg-gradient-to-r from-violet to-cyan text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Pipeline...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Execute CORTEXA Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && !result && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Executing CORTEXA pipeline...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Context → Signals → Pressure Ordering → State Classification → Risk Analysis
          </p>
        </div>
      )}

      {/* Empty State */}
      {!result && !isProcessing && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Paste work context above — Slack threads, emails, meeting notes — and CORTEXA will surface pressures that prevent future regret.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <CortexaResultView result={result} />
      )}
    </MainLayout>
  );
}
