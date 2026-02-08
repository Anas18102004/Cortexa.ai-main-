import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/signals/SignalCard";
import { ResponseDialog } from "@/components/responses/ResponseDialog";
import { ContextInputDialog } from "@/components/intelligence/ContextInputDialog";
import { ConsequenceSimulator } from "@/components/intelligence/ConsequenceSimulator";
import { FrictionPanel } from "@/components/friction/FrictionPanel";
import { CommitmentPanel } from "@/components/commitments/CommitmentPanel";
import { useSignals } from "@/hooks/useSignals";
import { useWork } from "@/contexts/WorkContext";
import { 
  Plus, 
  Sparkles, 
  Activity,
  AlertTriangle,
  TrendingDown,
  Layers,
  ArrowRight,
  Zap,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Signal } from "@/lib/models/types";

export default function WorkState() {
  const { state } = useWork();
  const { getDominantSignals, pendingVerification, stats, signalsByState } = useSignals();
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [responseDialogSignal, setResponseDialogSignal] = useState<
    (Signal & { currentPressure: number; urgencyScore: number }) | null
  >(null);

  const dominantSignals = getDominantSignals(5);
  const topSignal = dominantSignals[0];

  // Show first-run experience if no signals
  if (state.isFirstRun && stats.total === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal to-cyan flex items-center justify-center shadow-high">
              <Activity className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-violet flex items-center justify-center shadow-medium">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Welcome to <span className="text-gradient">CORTEXA</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mb-10 text-lg leading-relaxed">
            Your Work Intelligence Operating System. Start by pasting some work context — 
            a Slack thread, email, or meeting notes — and let AI detect your Signals.
          </p>
          
          <Button
            size="lg"
            onClick={() => setContextDialogOpen(true)}
            className="h-14 px-8 text-base font-medium bg-gradient-to-r from-teal to-cyan text-white border-0 btn-glow shadow-medium hover:shadow-high transition-smooth"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Paste Your First Context
          </Button>

          <div className="flex items-center gap-8 mt-16 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal" />
              <span>Mission tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber" />
              <span>Energy allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-violet" />
              <span>Pressure decay</span>
            </div>
          </div>
        </div>

        <ContextInputDialog
          open={contextDialogOpen}
          onOpenChange={setContextDialogOpen}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Work State</h1>
          <p className="text-muted-foreground">Real-time truth about your work</p>
        </div>
        <Button 
          onClick={() => setContextDialogOpen(true)}
          className="h-11 px-5 bg-gradient-to-r from-teal to-cyan text-white border-0 shadow-low hover:shadow-medium transition-smooth"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Context
        </Button>
      </header>

      {/* Pending Verification Alert */}
      {pendingVerification.length > 0 && (
        <Link
          to="/signals"
          className="flex items-center justify-between p-5 mb-8 rounded-2xl border border-amber/30 bg-amber/5 hover:bg-amber/10 transition-smooth group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber/15">
              <Sparkles className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="font-semibold">
                {pendingVerification.length} Signal{pendingVerification.length !== 1 && "s"} awaiting verification
              </p>
              <p className="text-sm text-muted-foreground">
                AI-detected Signals need review before entering the system
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="metric-label mb-2">Total Pressure</p>
          <p className="metric-value text-foreground">{stats.totalPressure}</p>
        </div>
        <div className="stat-card">
          <p className="metric-label mb-2">Active Signals</p>
          <p className="metric-value text-teal">{stats.verified}</p>
        </div>
        <div className="stat-card">
          <p className="metric-label mb-2">High Priority</p>
          <p className="metric-value text-error">{stats.criticalCount + stats.highCount}</p>
        </div>
        <div className="stat-card">
          <p className="metric-label mb-2">Avg Pressure</p>
          <p className="metric-value text-muted-foreground">{stats.avgPressure}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Dominant Signals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dominant Signals */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber/10">
                  <AlertTriangle className="h-5 w-5 text-amber" />
                </div>
                Dominant Signals
              </h2>
              <Link to="/signals" className="text-sm text-teal font-medium hover:underline underline-offset-4">
                View all →
              </Link>
            </div>

            {dominantSignals.length > 0 ? (
              <div className="grid gap-4">
                {dominantSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onClick={() => setResponseDialogSignal(signal)}
                    onRespond={() => setResponseDialogSignal(signal)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                <Layers className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  No active Signals
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Add context to detect new Signals
                </p>
              </div>
            )}
          </section>

          {/* Consequence Simulator for Top Signal */}
          {topSignal && (
            <section>
              <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet/10">
                  <TrendingDown className="h-5 w-5 text-violet" />
                </div>
                Consequence Projection
              </h2>
              <ConsequenceSimulator signal={topSignal} />
            </section>
          )}
        </div>

        {/* Right Column - Overview Panels */}
        <div className="space-y-6">
          {/* Signal States */}
          <div className="stat-card">
            <h3 className="metric-label mb-4">Signal Distribution</h3>
            <div className="space-y-4">
              {[
                { label: "Unaddressed", count: signalsByState.unaddressed.length, color: "bg-amber" },
                { label: "Responding", count: signalsByState.responding.length, color: "bg-teal" },
                { label: "Deferred", count: signalsByState.deferred.length, color: "bg-muted-foreground" },
                { label: "Ignored", count: signalsByState.ignored.length, color: "bg-muted" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Commitments - Compact */}
          <CommitmentPanel compact />

          {/* Friction & Drag - Compact */}
          <FrictionPanel compact />

          {/* Recent Decisions */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="metric-label">Recent Decisions</h3>
              <Link to="/ledger" className="text-xs text-teal font-medium hover:underline underline-offset-4">
                View ledger →
              </Link>
            </div>
            {state.responses.length > 0 ? (
              <div className="space-y-3">
                {state.responses.slice(-3).reverse().map((response) => {
                  const signal = state.signals.find(s => s.id === response.signalId);
                  return (
                    <div key={response.id} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                      <span className="truncate flex-1 font-medium">{signal?.title || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-muted">
                        {response.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No decisions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Panels Below */}
      <div className="section-divider my-10" />
      
      <div className="grid lg:grid-cols-2 gap-8">
        <CommitmentPanel />
        <FrictionPanel />
      </div>

      {/* Dialogs */}
      <ContextInputDialog
        open={contextDialogOpen}
        onOpenChange={setContextDialogOpen}
      />

      {responseDialogSignal && (
        <ResponseDialog
          signal={responseDialogSignal}
          open={!!responseDialogSignal}
          onOpenChange={(open) => !open && setResponseDialogSignal(null)}
        />
      )}
    </MainLayout>
  );
}
