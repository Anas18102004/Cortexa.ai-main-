import { useMemo } from "react";
import { useWork } from "@/contexts/WorkContext";
import { calculateCurrentPressure, calculateUrgencyScore, getPressureLevel } from "@/lib/utils/pressure";
import type { Signal, SignalState, SignalVerificationStatus } from "@/lib/models/types";

export function useSignals() {
  const { state, addSignal, updateSignal, removeSignal, verifySignal, selectSignal } = useWork();

  // All signals with calculated current pressure
  const signalsWithPressure = useMemo(() => {
    return state.signals.map(signal => ({
      ...signal,
      currentPressure: calculateCurrentPressure(
        signal.originalPressure,
        signal.pressureDecayRate,
        new Date(signal.createdAt),
        signal.state
      ),
      urgencyScore: calculateUrgencyScore(signal),
    }));
  }, [state.signals]);

  // Signals pending verification (for senior review)
  const pendingVerification = useMemo(() => {
    return signalsWithPressure.filter(s => s.verificationStatus === "pending_review");
  }, [signalsWithPressure]);

  // Verified signals only
  const verifiedSignals = useMemo(() => {
    return signalsWithPressure.filter(s => s.verificationStatus === "verified");
  }, [signalsWithPressure]);

  // Unaddressed signals (need attention)
  const unaddressedSignals = useMemo(() => {
    return verifiedSignals.filter(s => s.state === "unaddressed");
  }, [verifiedSignals]);

  // Signals grouped by pressure level
  const signalsByPressure = useMemo(() => {
    const grouped: Record<ReturnType<typeof getPressureLevel>, typeof signalsWithPressure> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      minimal: [],
    };

    verifiedSignals.forEach(signal => {
      const level = getPressureLevel(signal.currentPressure);
      grouped[level].push(signal);
    });

    return grouped;
  }, [verifiedSignals]);

  // Signals grouped by state
  const signalsByState = useMemo(() => {
    const grouped: Record<SignalState, typeof signalsWithPressure> = {
      unaddressed: [],
      responding: [],
      deferred: [],
      ignored: [],
    };

    verifiedSignals.forEach(signal => {
      grouped[signal.state].push(signal);
    });

    return grouped;
  }, [verifiedSignals]);

  // Top N dominant signals by urgency
  const getDominantSignals = (count: number = 5) => {
    return [...verifiedSignals]
      .filter(s => s.state !== "ignored")
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, count);
  };

  // Cluster related signals
  const signalClusters = useMemo(() => {
    const clusters: Map<string, typeof signalsWithPressure> = new Map();
    
    verifiedSignals.forEach(signal => {
      if (signal.clusterId) {
        const existing = clusters.get(signal.clusterId) || [];
        existing.push(signal);
        clusters.set(signal.clusterId, existing);
      }
    });

    return clusters;
  }, [verifiedSignals]);

  // Statistics
  const stats = useMemo(() => {
    const verified = verifiedSignals.length;
    const pending = pendingVerification.length;
    const totalPressure = verifiedSignals.reduce((sum, s) => sum + s.currentPressure, 0);
    const avgPressure = verified > 0 ? Math.round(totalPressure / verified) : 0;
    const criticalCount = signalsByPressure.critical.length;
    const highCount = signalsByPressure.high.length;

    return {
      total: state.signals.length,
      verified,
      pending,
      totalPressure,
      avgPressure,
      criticalCount,
      highCount,
      unaddressedCount: unaddressedSignals.length,
    };
  }, [state.signals, verifiedSignals, pendingVerification, signalsByPressure, unaddressedSignals]);

  // Create a new signal from AI detection
  const createSignalFromAI = (
    title: string,
    description: string,
    sourceContext: string,
    pressureLevel: number,
    impactScope: Signal["impactScope"],
    aiConfidence: number,
    aiReasoning?: string
  ): Signal => {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      title,
      description,
      source: "ai",
      sourceContext,
      pressureLevel,
      pressureDecayRate: 5, // Default 5% per day
      originalPressure: pressureLevel,
      impactScope,
      constraintType: "none",
      aiConfidence,
      aiReasoning,
      state: "unaddressed",
      verificationStatus: "pending_review",
      relatedSignalIds: [],
      createdAt: now,
      updatedAt: now,
      createdBy: "ai-system",
      tags: [],
    };
  };

  return {
    signals: signalsWithPressure,
    pendingVerification,
    verifiedSignals,
    unaddressedSignals,
    signalsByPressure,
    signalsByState,
    signalClusters,
    stats,
    selectedSignalId: state.selectedSignalId,
    
    // Actions
    addSignal,
    updateSignal,
    removeSignal,
    verifySignal,
    selectSignal,
    getDominantSignals,
    createSignalFromAI,
  };
}