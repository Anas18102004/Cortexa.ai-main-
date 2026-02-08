import { useState, useCallback } from "react";
import type { Signal, ResponseType, ConsequenceProjection } from "@/lib/models/types";
import { projectPressure } from "@/lib/utils/pressure";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-judgment`;

interface AISignalDetectionResult {
  signals: Array<{
    title: string;
    description: string;
    pressureLevel: number;
    impactScope: "local" | "mission" | "organization";
    confidence: number;
    reasoning: string;
    suggestedTags: string[];
  }>;
  clusters: Array<{
    theme: string;
    signalIndices: number[];
  }>;
}

interface AIRecommendationResult {
  recommendation: ResponseType;
  reasoning: string;
  confidence: number;
  alternativeActions: Array<{
    action: ResponseType;
    reasoning: string;
  }>;
}

export interface CortexaAnalysisResult {
  contextSummary: string;
  assumptions: string[];
  signals: Array<{
    title: string;
    description: string;
    pressureSource: string;
    pressureScore: number;
    pressureTrajectory: "rising" | "stable" | "decaying";
    riskIfIgnored: string;
    dependencies?: string[];
    state: "active" | "stabilizing" | "stable" | "resurfacing";
    suggestedAssignee?: string;
    assigneeSkillMatch?: string;
    impactScope: "local" | "mission" | "organization";
    confidence: number;
    stabilizationReason?: string;
  }>;
  risks: Array<{
    description: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  updatedExistingSignals?: Array<{
    title: string;
    newPressureScore: number;
    newTrajectory: "rising" | "stable" | "decaying";
    newState?: "active" | "stabilizing" | "stable" | "resurfacing";
    reason: string;
    stabilizationReason?: string;
  }>;
}

export interface MultiSignalEvaluationResult {
  summary: string;
  sharedDependencies: Array<{
    dependency: string;
    affectedSignalTitles: string[];
    impact: string;
  }>;
  pressureInteractions: Array<{
    type: "reinforcement" | "conflict" | "cascade";
    signalTitles: string[];
    description: string;
    pressureAdjustment?: number;
  }>;
  updatedPressures: Array<{
    title: string;
    originalPressure: number;
    adjustedPressure: number;
    reason: string;
  }>;
  combinedStrategy: string;
  risks: Array<{
    description: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
}

export interface ResurfacingResult {
  shouldResurface: boolean;
  resurfaceReason: string;
  updatedSignal: {
    newPressureScore: number;
    newTrajectory: "rising" | "stable" | "decaying";
    newState: "active" | "stabilizing" | "stable" | "resurfacing";
    updatedRiskIfIgnored?: string;
    updatedDependencies?: string[];
    reasoning: string;
  };
  newSignals: CortexaAnalysisResult["signals"];
  risks: Array<{
    description: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
}

interface TeamSkillTag {
  name: string;
  skills: string[];
}

async function callEdgeFunction(body: Record<string, any>) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error("AI request failed");
  }

  return response.json();
}

export function useAIJudgment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withProcessing = useCallback(<T,>(fn: () => Promise<T>): Promise<T | null> => {
    return (async () => {
      setIsProcessing(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setIsProcessing(false);
      }
    })();
  }, []);

  // Full CORTEXA pipeline analysis
  const analyzeContext = useCallback(async (
    contextText: string,
    existingSignals?: Array<{ title: string; pressureLevel: number; state: string }>,
    options?: {
      teamSkillTags?: TeamSkillTag[];
      projectContext?: { name: string; description?: string };
    }
  ): Promise<CortexaAnalysisResult | null> => {
    return withProcessing(() =>
      callEdgeFunction({
        action: "analyze_context",
        contextText,
        existingSignals,
        teamSkillTags: options?.teamSkillTags,
        projectContext: options?.projectContext,
      })
    );
  }, [withProcessing]);

  // Evaluate multi-signal interaction effects
  const evaluateMultiSignal = useCallback(async (
    signals: Array<{
      title: string;
      description: string;
      pressureScore: number;
      pressureTrajectory: string;
      state: string;
      impactScope: string;
      dependencies?: string[];
    }>
  ): Promise<MultiSignalEvaluationResult | null> => {
    return withProcessing(() =>
      callEdgeFunction({ action: "evaluate_multi_signal", signals })
    );
  }, [withProcessing]);

  // Check resurfacing for a stabilized signal
  const checkResurfacing = useCallback(async (
    signal: {
      title: string;
      previousPressure: number;
      currentPressure: number;
      previousState: string;
      historicalReasoning?: string;
    },
    newContext?: string,
    safetyThreshold?: number
  ): Promise<ResurfacingResult | null> => {
    return withProcessing(() =>
      callEdgeFunction({
        action: "check_resurfacing",
        signal,
        newContext,
        safetyThreshold: safetyThreshold || 50,
      })
    );
  }, [withProcessing]);

  // Detect signals from pasted context
  const detectSignals = useCallback(async (contextText: string): Promise<AISignalDetectionResult | null> => {
    return withProcessing(() =>
      callEdgeFunction({ action: "detect_signals", contextText })
    );
  }, [withProcessing]);

  // Get AI recommendation for a signal
  const getRecommendation = useCallback(async (signal: Signal): Promise<AIRecommendationResult | null> => {
    return withProcessing(() =>
      callEdgeFunction({
        action: "get_recommendation",
        signal: {
          title: signal.title,
          description: signal.description,
          pressureLevel: signal.pressureLevel,
          impactScope: signal.impactScope,
          constraintType: signal.constraintType,
          constraintDeadline: signal.constraintDeadline,
          state: signal.state,
        },
      })
    );
  }, [withProcessing]);

  // Generate consequence projection
  const generateProjection = useCallback(async (signal: Signal, days: 7 | 14 | 30 = 14): Promise<ConsequenceProjection | null> => {
    return withProcessing(async () => {
      const data = await callEdgeFunction({
        action: "generate_projection",
        signal: {
          title: signal.title,
          description: signal.description,
          pressureLevel: signal.pressureLevel,
          pressureDecayRate: signal.pressureDecayRate,
          impactScope: signal.impactScope,
          constraintType: signal.constraintType,
          constraintDeadline: signal.constraintDeadline,
        },
        days,
      });

      const ignoreProjection = projectPressure(signal.pressureLevel, signal.pressureDecayRate, days, false);
      const addressProjection = projectPressure(signal.pressureLevel, signal.pressureDecayRate, days, true);
      
      const pressureDecayData = Array.from({ length: days + 1 }, (_, i) => ({
        day: i,
        ignoreValue: ignoreProjection[i],
        addressValue: addressProjection[i],
      }));

      return {
        signalId: signal.id,
        days,
        ignoreScenario: data.ignoreScenario,
        addressScenario: data.addressScenario,
        pressureDecayData,
        recommendation: data.recommendation,
        reasoning: data.reasoning,
        confidence: data.confidence,
        generatedAt: new Date(),
      } as ConsequenceProjection;
    });
  }, [withProcessing]);

  // Generate intelligence insights
  const generateInsights = useCallback(async (
    signals: Signal[],
    question: "slowdown" | "overload" | "upcoming_break" | "stop_doing"
  ) => {
    return withProcessing(() =>
      callEdgeFunction({
        action: "generate_insight",
        question,
        signals: signals.map(s => ({
          title: s.title,
          pressureLevel: s.pressureLevel,
          state: s.state,
          impactScope: s.impactScope,
        })),
      })
    );
  }, [withProcessing]);

  return {
    isProcessing,
    error,
    analyzeContext,
    evaluateMultiSignal,
    checkResurfacing,
    detectSignals,
    getRecommendation,
    generateProjection,
    generateInsights,
    clearError: () => setError(null),
  };
}
