import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignalCard } from "@/components/signals/SignalCard";
import { useWork } from "@/contexts/WorkContext";
import { useSignals } from "@/hooks/useSignals";
import { 
  Target, 
  Plus, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import type { Mission, MissionHealth } from "@/lib/models/types";

export default function MissionView() {
  const { state, addMission, updateMission, getSignalsForMission } = useWork();
  const { signals } = useSignals();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Form state
  const [newMission, setNewMission] = useState({
    title: "",
    goalStatement: "",
    successCriteria: "",
  });

  const handleCreateMission = () => {
    const mission: Mission = {
      id: crypto.randomUUID(),
      title: newMission.title,
      goalStatement: newMission.goalStatement,
      successCriteria: newMission.successCriteria.split("\n").filter(Boolean),
      constraints: [],
      knownRisks: [],
      health: "healthy",
      aiHealthScore: 80,
      aiConfidence: 0.7,
      ownerId: "current-user",
      ownerName: "Current User",
      linkedSignalIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    };

    addMission(mission);
    setCreateDialogOpen(false);
    setNewMission({ title: "", goalStatement: "", successCriteria: "" });
  };

  const getHealthIcon = (health: MissionHealth) => {
    switch (health) {
      case "healthy": return <TrendingUp className="h-4 w-4 text-success" />;
      case "at_risk": return <Minus className="h-4 w-4 text-amber" />;
      case "critical": return <TrendingDown className="h-4 w-4 text-error" />;
    }
  };

  const getHealthColor = (health: MissionHealth) => {
    switch (health) {
      case "healthy": return "bg-success/10 text-success border-success/30";
      case "at_risk": return "bg-amber/10 text-amber border-amber/30";
      case "critical": return "bg-error/10 text-error border-error/30";
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-teal" />
            Missions
          </h1>
          <p className="text-muted-foreground">
            Strategic intent containers — why work exists
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Mission
        </Button>
      </div>

      {/* Missions Grid */}
      {state.missions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.missions.map((mission) => {
            const missionSignals = signals.filter(s => s.missionId === mission.id);
            const linkedCount = missionSignals.length;
            const activeCount = missionSignals.filter(s => s.state !== "ignored").length;

            return (
              <button
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className="text-left rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all"
              >
                {/* Health Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getHealthColor(mission.health)}>
                    {getHealthIcon(mission.health)}
                    <span className="ml-1 capitalize">{mission.health.replace("_", " ")}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {mission.status}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-2">{mission.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {mission.goalStatement}
                </p>

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">AI Health Score</span>
                    <span className="font-mono">{mission.aiHealthScore}%</span>
                  </div>
                  <Progress value={mission.aiHealthScore} className="h-1.5" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{linkedCount} signals</span>
                  </div>
                  <div>
                    <span>{activeCount} active</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Missions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Missions are why work exists. Create your first Mission to start organizing Signals.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Mission
          </Button>
        </div>
      )}

      {/* Create Mission Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mission</DialogTitle>
            <DialogDescription>
              Define why this work exists. A Mission is not a project — it's an outcome.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mission Title</label>
              <Input
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                placeholder="e.g., Launch MVP by Q2"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Goal Statement</label>
              <Textarea
                value={newMission.goalStatement}
                onChange={(e) => setNewMission({ ...newMission, goalStatement: e.target.value })}
                placeholder="What outcome are you trying to achieve?"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Success Criteria <span className="text-muted-foreground">(one per line)</span>
              </label>
              <Textarea
                value={newMission.successCriteria}
                onChange={(e) => setNewMission({ ...newMission, successCriteria: e.target.value })}
                placeholder="How will you know this Mission is successful?"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCreateMission}
                disabled={!newMission.title || !newMission.goalStatement}
                className="flex-1"
              >
                Create Mission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Detail Dialog */}
      <Dialog open={!!selectedMission} onOpenChange={(open) => !open && setSelectedMission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMission && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getHealthColor(selectedMission.health)}>
                    {getHealthIcon(selectedMission.health)}
                    <span className="ml-1 capitalize">{selectedMission.health.replace("_", " ")}</span>
                  </Badge>
                </div>
                <DialogTitle>{selectedMission.title}</DialogTitle>
                <DialogDescription>{selectedMission.goalStatement}</DialogDescription>
              </DialogHeader>

              {/* Success Criteria */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Success Criteria</h4>
                <ul className="space-y-1">
                  {selectedMission.successCriteria.map((criteria, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-teal">•</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Assessment */}
              <div className="rounded-lg bg-violet/5 border border-violet/30 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-violet" />
                  <span className="text-sm font-medium">AI Assessment</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(selectedMission.aiConfidence * 100)}% confident)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold">{selectedMission.aiHealthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                  <Progress value={selectedMission.aiHealthScore} className="flex-1 h-2" />
                </div>
              </div>

              {/* Linked Signals */}
              <div>
                <h4 className="text-sm font-medium mb-2">Linked Signals</h4>
                {signals.filter(s => s.missionId === selectedMission.id).length > 0 ? (
                  <div className="space-y-2">
                    {signals
                      .filter(s => s.missionId === selectedMission.id)
                      .map((signal) => (
                        <SignalCard key={signal.id} signal={signal} compact showActions={false} />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No Signals linked to this Mission yet.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}