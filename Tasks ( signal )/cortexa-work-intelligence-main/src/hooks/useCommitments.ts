import { useMemo } from "react";
import { useWork } from "@/contexts/WorkContext";
import type { Commitment } from "@/lib/models/types";

export function useCommitments() {
  const { state, addCommitment, updateCommitment } = useWork();

  // Active commitments
  const activeCommitments = useMemo(() => {
    return state.commitments.filter(c => c.status === "active");
  }, [state.commitments]);

  // Total energy allocated
  const totalEnergyAllocated = useMemo(() => {
    return activeCommitments.reduce((sum, c) => sum + c.energyPercentage, 0);
  }, [activeCommitments]);

  // Available energy
  const availableEnergy = useMemo(() => {
    return Math.max(0, 100 - totalEnergyAllocated);
  }, [totalEnergyAllocated]);

  // Commitments by mission
  const commitmentsByMission = useMemo(() => {
    const grouped: Record<string, Commitment[]> = {};
    
    activeCommitments.forEach(commitment => {
      const key = commitment.missionId || "unassigned";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(commitment);
    });

    return grouped;
  }, [activeCommitments]);

  // Stats
  const stats = useMemo(() => {
    const active = activeCommitments.length;
    const paused = state.commitments.filter(c => c.status === "paused").length;
    const completed = state.commitments.filter(c => c.status === "completed").length;
    const averageProgress = active > 0
      ? Math.round(activeCommitments.reduce((sum, c) => sum + c.progress, 0) / active)
      : 0;

    return {
      active,
      paused,
      completed,
      totalEnergyAllocated,
      availableEnergy,
      averageProgress,
    };
  }, [state.commitments, activeCommitments, totalEnergyAllocated, availableEnergy]);

  // Create a new commitment
  const createCommitment = (
    title: string,
    description: string,
    energyPercentage: number,
    linkedSignalIds: string[],
    missionId?: string,
    expectedPressureReduction: number = 0,
    reviewConditions: string[] = []
  ): Commitment => {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      title,
      description,
      energyPercentage: Math.min(energyPercentage, availableEnergy),
      linkedSignalIds,
      missionId,
      expectedPressureReduction,
      reviewConditions,
      status: "active",
      progress: 0,
      ownerId: "current-user",
      ownerName: "Current User",
      startDate: now,
      createdAt: now,
      updatedAt: now,
    };
  };

  // Update progress
  const updateProgress = (id: string, progress: number) => {
    updateCommitment(id, { progress: Math.min(100, Math.max(0, progress)) });
  };

  // Pause commitment
  const pauseCommitment = (id: string) => {
    updateCommitment(id, { status: "paused" });
  };

  // Resume commitment
  const resumeCommitment = (id: string) => {
    updateCommitment(id, { status: "active" });
  };

  // Complete commitment
  const completeCommitment = (id: string) => {
    updateCommitment(id, { status: "completed", endDate: new Date(), progress: 100 });
  };

  // Abandon commitment
  const abandonCommitment = (id: string) => {
    updateCommitment(id, { status: "abandoned", endDate: new Date() });
  };

  return {
    commitments: state.commitments,
    activeCommitments,
    commitmentsByMission,
    stats,
    
    // Actions
    addCommitment,
    updateCommitment,
    createCommitment,
    updateProgress,
    pauseCommitment,
    resumeCommitment,
    completeCommitment,
    abandonCommitment,
  };
}
