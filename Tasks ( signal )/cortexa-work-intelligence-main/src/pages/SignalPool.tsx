import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalCard } from "@/components/signals/SignalCard";
import { VerificationQueueCard } from "@/components/signals/VerificationQueueCard";
import { ResponseDialog } from "@/components/responses/ResponseDialog";
import { ContextInputDialog } from "@/components/intelligence/ContextInputDialog";
import { useSignals } from "@/hooks/useSignals";
import { 
  Plus, 
  Layers, 
  CheckCircle, 
  Clock, 
  EyeOff,
  AlertCircle,
  Sparkles
} from "lucide-react";
import type { Signal } from "@/lib/models/types";

export default function SignalPool() {
  const { 
    pendingVerification, 
    signalsByState, 
    signalsByPressure,
    stats,
    verifySignal
  } = useSignals();
  
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [responseDialogSignal, setResponseDialogSignal] = useState<
    (Signal & { currentPressure: number; urgencyScore: number }) | null
  >(null);
  const [activeTab, setActiveTab] = useState(
    pendingVerification.length > 0 ? "verification" : "unaddressed"
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-teal" />
            Signal Pool
          </h1>
          <p className="text-muted-foreground">
            All work Signals, organized by state and pressure
          </p>
        </div>
        <Button onClick={() => setContextDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Context
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-amber">{pendingVerification.length}</p>
          <p className="text-xs text-muted-foreground">Pending Review</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold">{signalsByState.unaddressed.length}</p>
          <p className="text-xs text-muted-foreground">Unaddressed</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-teal">{signalsByState.responding.length}</p>
          <p className="text-xs text-muted-foreground">Responding</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{signalsByState.deferred.length}</p>
          <p className="text-xs text-muted-foreground">Deferred</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-pressure-critical">{stats.criticalCount}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="verification" className="relative">
            <Sparkles className="h-4 w-4 mr-1" />
            Verification Queue
            {pendingVerification.length > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-amber-foreground">
                {pendingVerification.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unaddressed">
            <AlertCircle className="h-4 w-4 mr-1" />
            Unaddressed
          </TabsTrigger>
          <TabsTrigger value="responding">
            <CheckCircle className="h-4 w-4 mr-1" />
            Responding
          </TabsTrigger>
          <TabsTrigger value="deferred">
            <Clock className="h-4 w-4 mr-1" />
            Deferred
          </TabsTrigger>
          <TabsTrigger value="ignored">
            <EyeOff className="h-4 w-4 mr-1" />
            Ignored
          </TabsTrigger>
        </TabsList>

        {/* Verification Queue */}
        <TabsContent value="verification">
          {pendingVerification.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Review AI-detected Signals before they enter the system. 
                You can verify, reject, or modify each Signal.
              </p>
              {pendingVerification.map((signal) => (
                <VerificationQueueCard
                  key={signal.id}
                  signal={signal}
                  onVerify={(status, notes) => verifySignal(signal.id, status, notes)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
              <h3 className="font-semibold mb-2">All Clear</h3>
              <p className="text-muted-foreground mb-4">
                No Signals pending verification. All AI-detected Signals have been reviewed.
              </p>
              <Button variant="outline" onClick={() => setContextDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add More Context
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Unaddressed */}
        <TabsContent value="unaddressed">
          {signalsByState.unaddressed.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {signalsByState.unaddressed.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onClick={() => setResponseDialogSignal(signal)}
                  onRespond={() => setResponseDialogSignal(signal)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="No Unaddressed Signals"
              description="All Signals have been responded to. Great work!"
            />
          )}
        </TabsContent>

        {/* Responding */}
        <TabsContent value="responding">
          {signalsByState.responding.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {signalsByState.responding.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="No Active Responses"
              description="No Signals are currently being worked on."
            />
          )}
        </TabsContent>

        {/* Deferred */}
        <TabsContent value="deferred">
          {signalsByState.deferred.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {signalsByState.deferred.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No Deferred Signals"
              description="No Signals have been consciously postponed."
            />
          )}
        </TabsContent>

        {/* Ignored */}
        <TabsContent value="ignored">
          {signalsByState.ignored.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {signalsByState.ignored.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={EyeOff}
              title="No Ignored Signals"
              description="No Signals have been explicitly ignored."
            />
          )}
        </TabsContent>
      </Tabs>

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

function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}