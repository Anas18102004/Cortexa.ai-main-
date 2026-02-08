import type { CortexaAnalysisResult } from "@/hooks/useAIJudgment";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Shield,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";

interface Props {
  result: CortexaAnalysisResult;
}

const trajectoryIcon = {
  rising: <TrendingUp className="h-3.5 w-3.5 text-pressure-critical" />,
  stable: <Minus className="h-3.5 w-3.5 text-amber" />,
  decaying: <TrendingDown className="h-3.5 w-3.5 text-pressure-low" />,
};

const stateLabel: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-pressure-critical/15 text-pressure-critical border-pressure-critical/30" },
  stabilizing: { label: "Stabilizing", className: "bg-amber/15 text-amber border-amber/30" },
  stable: { label: "Stable", className: "bg-pressure-low/15 text-pressure-low border-pressure-low/30" },
  resurfacing: { label: "Resurfacing", className: "bg-violet/15 text-violet border-violet/30" },
};

const severityColor: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-amber",
  high: "text-pressure-high",
  critical: "text-pressure-critical",
};

function PressureBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-pressure-critical" :
    score >= 60 ? "bg-pressure-high" :
    score >= 40 ? "bg-amber" :
    "bg-pressure-low";

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono font-medium w-6 text-right">{score}</span>
    </div>
  );
}

export function CortexaResultView({ result }: Props) {
  const highPressure = result.signals.filter(s => s.pressureScore >= 60);
  const stableSignals = result.signals.filter(s => s.state === "stable" || s.state === "stabilizing");
  const activeSignals = result.signals.filter(s => s.state === "active" || s.state === "resurfacing");

  return (
    <div className="space-y-6">
      {/* Context Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium mb-1 text-muted-foreground">Context Interpretation</p>
        <p className="text-sm">{result.contextSummary}</p>
        {result.assumptions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Assumptions</p>
            <ul className="space-y-0.5">
              {result.assumptions.map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-amber mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 🟥 Current Task Pressures */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-sm bg-pressure-critical" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Current Task Pressures</h2>
          <Badge variant="outline" className="text-xs">{result.signals.length} signals</Badge>
        </div>
        <div className="space-y-2">
          {result.signals.map((signal, i) => {
            const sState = stateLabel[signal.state] || stateLabel.active;
            return (
              <div key={i} className="rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{signal.title}</h3>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sState.className}`}>
                        {sState.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{signal.description}</p>
                  </div>
                  <PressureBar score={signal.pressureScore} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Source: </span>
                    <span>{signal.pressureSource}</span>
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <span className="text-muted-foreground">Trajectory: </span>
                    {trajectoryIcon[signal.pressureTrajectory]}
                    <span className="capitalize">{signal.pressureTrajectory}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Scope: </span>
                    <span className="capitalize">{signal.impactScope}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Confidence: </span>
                    <span>{Math.round(signal.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Risk if ignored: </span>
                  <span className="text-pressure-high">{signal.riskIfIgnored}</span>
                </div>

                {signal.dependencies && signal.dependencies.length > 0 && (
                  <div className="mt-1 text-xs">
                    <span className="text-muted-foreground">Dependencies: </span>
                    {signal.dependencies.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 🟨 Tasks Requiring Attention */}
      {highPressure.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-sm bg-amber" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Requiring Attention</h2>
            <Badge variant="outline" className="text-xs">{highPressure.length}</Badge>
          </div>
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-4">
            <ul className="space-y-2">
              {highPressure.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber" />
                    <span>{s.title}</span>
                  </div>
                  <PressureBar score={s.pressureScore} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 🟦 Suggested Assignees */}
      {result.signals.some(s => s.suggestedAssignee) && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-sm bg-cyan" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Suggested Assignees</h2>
          </div>
          <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-4">
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Advisory only — requires human approval</p>
            <ul className="space-y-1.5">
              {result.signals.filter(s => s.suggestedAssignee).map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.title}</span>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-cyan" />
                    <span className="font-medium">{s.suggestedAssignee}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 🟩 Tasks in Stable State */}
      {stableSignals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-sm bg-pressure-low" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Stable State</h2>
            <Badge variant="outline" className="text-xs">{stableSignals.length}</Badge>
          </div>
          <div className="rounded-lg border border-pressure-low/30 bg-pressure-low/5 p-4">
            <ul className="space-y-1.5">
              {stableSignals.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-pressure-low" />
                    <span>{s.title}</span>
                  </div>
                  <PressureBar score={s.pressureScore} />
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-muted-foreground mt-2">Still monitored — improvement potential always exists</p>
          </div>
        </section>
      )}

      {/* ⚠️ Risks & Assumptions */}
      {result.risks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-amber" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Risks & Assumptions</h2>
          </div>
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-4">
            <ul className="space-y-2">
              {result.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`text-xs font-mono uppercase mt-0.5 ${severityColor[r.severity]}`}>
                    [{r.severity}]
                  </span>
                  <span>{r.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Updated Existing Signals */}
      {result.updatedExistingSignals && result.updatedExistingSignals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-3.5 w-3.5 text-violet" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Context Updates to Existing Signals</h2>
          </div>
          <div className="rounded-lg border border-violet/30 bg-violet/5 p-4">
            <ul className="space-y-2">
              {result.updatedExistingSignals.map((u, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium">{u.title}</span>
                    <div className="flex items-center gap-2">
                      <PressureBar score={u.newPressureScore} />
                      {trajectoryIcon[u.newTrajectory]}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
