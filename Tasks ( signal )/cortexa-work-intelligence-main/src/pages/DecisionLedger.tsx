import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { useWork } from "@/contexts/WorkContext";
import { useSignals } from "@/hooks/useSignals";
import { 
  BookOpen, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { ResponseType } from "@/lib/models/types";

const responseTypeConfig: Record<ResponseType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  investigate: { icon: AlertTriangle, color: "bg-cyan text-cyan-foreground" },
  execute: { icon: CheckCircle, color: "bg-teal text-teal-foreground" },
  defer: { icon: Clock, color: "bg-amber text-amber-foreground" },
  ignore: { icon: AlertTriangle, color: "bg-muted text-muted-foreground" },
  escalate: { icon: ArrowRight, color: "bg-violet text-violet-foreground" },
  reframe: { icon: Sparkles, color: "bg-secondary text-secondary-foreground" },
};

export default function DecisionLedger() {
  const { state } = useWork();
  const { signals } = useSignals();

  // Create ledger entries
  const ledgerEntries = state.responses.map((response) => {
    const signal = signals.find(s => s.id === response.signalId);
    const outcome = state.outcomes.find(o => o.responseId === response.id);
    return {
      response,
      signal,
      outcome,
    };
  }).reverse(); // Most recent first

  // Calculate stats
  const totalDecisions = ledgerEntries.length;
  const overrideCount = ledgerEntries.filter(e => e.response.humanOverride).length;
  const aiAccuracy = totalDecisions > 0 
    ? Math.round(((totalDecisions - overrideCount) / totalDecisions) * 100) 
    : 0;

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal" />
            Decision Ledger
          </h1>
          <p className="text-muted-foreground">
            Complete audit trail of all decisions made
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{totalDecisions}</p>
          <p className="text-sm text-muted-foreground">Total Decisions</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-violet">{overrideCount}</p>
          <p className="text-sm text-muted-foreground">AI Overrides</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-teal">{aiAccuracy}%</p>
          <p className="text-sm text-muted-foreground">AI Alignment</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{state.outcomes.length}</p>
          <p className="text-sm text-muted-foreground">Recorded Outcomes</p>
        </div>
      </div>

      {/* Ledger Table */}
      {ledgerEntries.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Signal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Response</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">AI Said</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Override?</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pressure</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map(({ response, signal }) => {
                  const config = responseTypeConfig[response.type];
                  const aiConfig = responseTypeConfig[response.aiRecommendation];
                  const ResponseIcon = config.icon;
                  const AIIcon = aiConfig.icon;

                  return (
                    <tr key={response.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="text-sm">
                          {format(new Date(response.createdAt), "MMM d, HH:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm max-w-xs truncate">
                          {signal?.title || "Unknown Signal"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={config.color}>
                          <ResponseIcon className="h-3 w-3 mr-1" />
                          <span className="capitalize">{response.type}</span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          <AIIcon className="h-3 w-3 mr-1" />
                          <span className="capitalize">{response.aiRecommendation}</span>
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(response.aiConfidence * 100)}% confident
                        </div>
                      </td>
                      <td className="p-4">
                        {response.humanOverride ? (
                          <Badge variant="outline" className="bg-amber/10 text-amber border-amber/30">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm">{response.pressureAtDecision}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Decisions Yet</h3>
          <p className="text-muted-foreground">
            When you respond to Signals, your decisions will be logged here for review and learning.
          </p>
        </div>
      )}
    </MainLayout>
  );
}