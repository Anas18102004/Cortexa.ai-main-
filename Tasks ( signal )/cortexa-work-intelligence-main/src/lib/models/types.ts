// CORTEXA Core Data Models
// Philosophy: Work = Pressure → Choice → Consequence

// ============================================
// SIGNAL - Atomic Unit of Real Work
// ============================================

export type SignalSource = "human" | "ai" | "system" | "integration";
export type SignalState = "unaddressed" | "responding" | "deferred" | "ignored";
export type SignalVerificationStatus = "pending_review" | "verified" | "rejected" | "modified";
export type ImpactScope = "local" | "mission" | "organization";
export type ConstraintType = "none" | "soft" | "hard";

export interface Signal {
  id: string;
  title: string;
  description: string;
  source: SignalSource;
  sourceContext?: string; // Original text that generated this Signal
  
  // Pressure metrics
  pressureLevel: number; // 0-100
  pressureDecayRate: number; // How fast pressure decreases without action (per day)
  originalPressure: number; // Starting pressure when created
  
  // Impact and constraints
  impactScope: ImpactScope;
  constraintType: ConstraintType;
  constraintDeadline?: Date;
  
  // AI assessment
  aiConfidence: number; // 0-1
  aiReasoning?: string;
  
  // State management
  state: SignalState;
  verificationStatus: SignalVerificationStatus;
  verifiedBy?: string;
  modificationNotes?: string;
  
  // Relationships
  missionId?: string;
  relatedSignalIds: string[];
  clusterId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

// ============================================
// MISSION - Intent Container
// ============================================

export type MissionHealth = "healthy" | "at_risk" | "critical";

export interface Mission {
  id: string;
  title: string;
  goalStatement: string;
  successCriteria: string[];
  constraints: string[];
  knownRisks: string[];
  
  // Health metrics
  health: MissionHealth;
  aiHealthScore: number; // 0-100
  aiConfidence: number; // 0-1
  aiAssessment?: string;
  
  // Ownership
  ownerId: string;
  ownerName: string;
  
  // Relationships
  linkedSignalIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "paused" | "completed" | "abandoned";
}

// ============================================
// RESPONSE - Explicit Choice
// ============================================

export type ResponseType = 
  | "investigate" 
  | "execute" 
  | "defer" 
  | "ignore" 
  | "escalate" 
  | "reframe";

export interface Response {
  id: string;
  signalId: string;
  type: ResponseType;
  
  // Decision context
  ownerId: string;
  ownerName: string;
  justification: string;
  
  // AI context
  aiRecommendation: ResponseType;
  aiReasoning: string;
  aiConfidence: number; // 0-1
  humanOverride: boolean;
  
  // Pressure snapshot at decision time
  pressureAtDecision: number;
  
  // For deferred responses
  deferUntil?: Date;
  deferReason?: string;
  
  // For escalated responses
  escalatedTo?: string;
  
  // Outcome tracking
  outcomeId?: string;
  
  // Metadata
  createdAt: Date;
}

// ============================================
// COMMITMENT - Energy Allocation
// ============================================

export interface Commitment {
  id: string;
  title: string;
  description: string;
  
  // Energy allocation
  energyPercentage: number; // 0-100
  
  // Linked work
  linkedSignalIds: string[];
  missionId?: string;
  
  // Expected outcomes
  expectedPressureReduction: number;
  
  // Review conditions
  reviewConditions: string[];
  nextReviewDate?: Date;
  
  // Status
  status: "active" | "paused" | "completed" | "abandoned";
  progress: number; // 0-100
  
  // Ownership
  ownerId: string;
  ownerName: string;
  
  // Metadata
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// OUTCOME - Truth Loop
// ============================================

export type OutcomeType = "positive" | "neutral" | "negative" | "inconclusive";

export interface Outcome {
  id: string;
  responseId: string;
  signalId: string;
  
  type: OutcomeType;
  description: string;
  
  // Metrics
  pressureReduction: number; // Actual change in pressure
  riskMovement: string; // Description of how risk moved
  
  // Learning
  wasDecisionCorrect: boolean | null; // null = inconclusive
  lessonsLearned?: string;
  
  // AI analysis
  aiAnalysis?: string;
  
  // Metadata
  recordedAt: Date;
  recordedBy: string;
}

// ============================================
// CONSEQUENCE PROJECTION
// ============================================

export interface ConsequenceProjection {
  signalId: string;
  days: number; // 7, 14, or 30
  
  // If ignored
  ignoreScenario: {
    projectedPressure: number;
    riskAssessment: string;
    potentialImpacts: string[];
    confidence: number;
  };
  
  // If addressed
  addressScenario: {
    projectedPressure: number;
    expectedOutcome: string;
    requiredEffort: string;
    confidence: number;
  };
  
  // Pressure decay visualization data
  pressureDecayData: {
    day: number;
    ignoreValue: number;
    addressValue: number;
  }[];
  
  // AI recommendation
  recommendation: ResponseType;
  reasoning: string;
  confidence: number;
  
  generatedAt: Date;
}

// ============================================
// FRICTION & DRAG
// ============================================

export type FrictionType = 
  | "blocker" 
  | "waiting" 
  | "rework" 
  | "context_switching" 
  | "dependencies";

export interface FrictionItem {
  id: string;
  type: FrictionType;
  title: string;
  description: string;
  
  // Impact
  impactLevel: "low" | "medium" | "high" | "critical";
  affectedSignalIds: string[];
  
  // Duration
  startedAt: Date;
  resolvedAt?: Date;
  
  // Metadata
  createdAt: Date;
}

// ============================================
// INTELLIGENCE INSIGHTS
// ============================================

export interface IntelligenceInsight {
  id: string;
  question: "slowdown" | "overload" | "upcoming_break" | "stop_doing";
  
  title: string;
  summary: string;
  details: string;
  
  // Supporting data
  relatedSignalIds: string[];
  relatedMissionIds: string[];
  
  // Confidence
  confidence: number;
  
  // Actionable recommendations
  recommendations: string[];
  
  generatedAt: Date;
}

// ============================================
// DECISION LEDGER ENTRY
// ============================================

export interface DecisionLedgerEntry {
  id: string;
  response: Response;
  signal: Signal;
  outcome?: Outcome;
  
  // Analytics
  aiAccuracyScore?: number; // Did AI predict correctly?
  decisionLatency: number; // Time from Signal creation to Response
  
  // Pattern detection
  patternTags: string[];
}

// ============================================
// USER ROLES
// ============================================

export type UserRole = 
  | "observer" 
  | "contributor" 
  | "decision_maker" 
  | "mission_owner" 
  | "senior_lead" 
  | "org_authority";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// ============================================
// AI CONTEXT FOR SIGNAL DETECTION
// ============================================

export interface AISignalDetectionRequest {
  contextText: string;
  existingSignals: Signal[];
  existingMissions: Mission[];
}

export interface AISignalDetectionResponse {
  detectedSignals: Omit<Signal, "id" | "createdAt" | "updatedAt" | "state" | "verificationStatus">[];
  duplicateWarnings: {
    newSignalIndex: number;
    existingSignalId: string;
    similarity: number;
  }[];
  suggestedClusters: {
    signalIndices: number[];
    theme: string;
  }[];
}