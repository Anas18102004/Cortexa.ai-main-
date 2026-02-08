// Pressure calculation utilities for CORTEXA

import type { Signal, SignalState } from "@/lib/models/types";

/**
 * Calculate current pressure based on decay over time
 */
export function calculateCurrentPressure(
  originalPressure: number,
  decayRate: number,
  createdAt: Date,
  state: SignalState
): number {
  // Ignored signals have zero active pressure
  if (state === "ignored") return 0;
  
  // Actively responding signals decay faster (work is being done)
  const effectiveDecayRate = state === "responding" ? decayRate * 1.5 : decayRate;
  
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-effectiveDecayRate * daysSinceCreation / 100);
  
  return Math.max(0, Math.round(originalPressure * decayFactor));
}

/**
 * Get pressure level category for styling
 */
export function getPressureLevel(pressure: number): "critical" | "high" | "medium" | "low" | "minimal" {
  if (pressure >= 80) return "critical";
  if (pressure >= 60) return "high";
  if (pressure >= 40) return "medium";
  if (pressure >= 20) return "low";
  return "minimal";
}

/**
 * Get pressure color class for Tailwind
 */
export function getPressureColorClass(pressure: number, prefix: "text" | "bg" | "border" = "bg"): string {
  const level = getPressureLevel(pressure);
  return `${prefix}-pressure-${level}`;
}

/**
 * Calculate total pressure for a set of signals
 */
export function calculateTotalPressure(signals: Signal[]): number {
  return signals.reduce((total, signal) => {
    const currentPressure = calculateCurrentPressure(
      signal.originalPressure,
      signal.pressureDecayRate,
      new Date(signal.createdAt),
      signal.state
    );
    return total + currentPressure;
  }, 0);
}

/**
 * Project pressure over time for consequence simulation
 */
export function projectPressure(
  originalPressure: number,
  decayRate: number,
  days: number,
  isAddressed: boolean
): number[] {
  const effectiveDecayRate = isAddressed ? decayRate * 2 : decayRate * 0.5;
  const baseGrowth = isAddressed ? 0 : 0.1; // Unaddressed signals can compound
  
  const projection: number[] = [];
  
  for (let day = 0; day <= days; day++) {
    const decayFactor = Math.exp(-effectiveDecayRate * day / 100);
    const growthFactor = 1 + (baseGrowth * day);
    
    if (isAddressed) {
      // Pressure decreases when addressed
      projection.push(Math.max(0, Math.round(originalPressure * decayFactor)));
    } else {
      // Pressure may increase when ignored (compounding risk)
      projection.push(Math.min(100, Math.round(originalPressure * growthFactor * decayFactor)));
    }
  }
  
  return projection;
}

/**
 * Format pressure for display
 */
export function formatPressure(pressure: number): string {
  return `${pressure}`;
}

/**
 * Get descriptive text for pressure level
 */
export function getPressureDescription(pressure: number): string {
  const level = getPressureLevel(pressure);
  switch (level) {
    case "critical": return "Critical pressure - immediate attention required";
    case "high": return "High pressure - needs attention soon";
    case "medium": return "Moderate pressure - monitor actively";
    case "low": return "Low pressure - manageable";
    case "minimal": return "Minimal pressure - stable";
  }
}

/**
 * Calculate urgency score combining pressure and decay
 */
export function calculateUrgencyScore(signal: Signal): number {
  const currentPressure = calculateCurrentPressure(
    signal.originalPressure,
    signal.pressureDecayRate,
    new Date(signal.createdAt),
    signal.state
  );
  
  // Factor in constraint deadlines
  let deadlineMultiplier = 1;
  if (signal.constraintType === "hard" && signal.constraintDeadline) {
    const daysUntilDeadline = (new Date(signal.constraintDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline <= 1) deadlineMultiplier = 2;
    else if (daysUntilDeadline <= 3) deadlineMultiplier = 1.5;
    else if (daysUntilDeadline <= 7) deadlineMultiplier = 1.2;
  }
  
  // Factor in impact scope
  const scopeMultiplier = signal.impactScope === "organization" ? 1.5 
    : signal.impactScope === "mission" ? 1.2 
    : 1;
  
  return Math.min(100, currentPressure * deadlineMultiplier * scopeMultiplier);
}