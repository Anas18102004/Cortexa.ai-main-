// AI Workforce Management Platform - Type Definitions

export type AuthorityLevel = "observer" | "advisor" | "executor" | "autonomous";

export type AgentStatus =
  | "idle"
  | "planning"
  | "awaiting_approval"
  | "executing"
  | "paused"
  | "error";

export type AgentScope =
  | "frontend"
  | "backend"
  | "fullstack"
  | "database"
  | "security"
  | "testing"
  | "infrastructure"
  | "repo-wide";

export type StrictnessLevel = "conservative" | "balanced" | "aggressive";

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from lucide-react
  baseCapabilities: string[];
  defaultAuthority: AuthorityLevel;
  defaultScope: AgentScope[];
  isBuiltIn: boolean;
  color: string; // Tailwind color class
}

export interface Agent {
  id: string;
  roleId: string;
  customName?: string;
  description: string;
  authority: AuthorityLevel;
  scope: AgentScope[];
  status: AgentStatus;
  strictness: StrictnessLevel;
  
  // Cost tracking
  hourlyRate: number; // in cents
  totalCostThisMonth: number;
  executionCount: number;
  
  // Activity
  lastActivity: Date;
  currentIntent?: string;
  
  // Configuration
  isActive: boolean;
  autoApprove: boolean;
  maxConcurrentTasks: number;
  
  // Safety
  lockedCapabilities: string[];
  allowedFilePatterns: string[];
  blockedFilePatterns: string[];
}

export interface Intent {
  id: string;
  agentId: string;
  title: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  status: "draft" | "submitted" | "planning" | "approved" | "rejected" | "executing" | "completed" | "failed";
  
  // Context
  contextFiles: string[];
  requirements: string[];
  constraints: string[];
}

export interface PlanAction {
  id: string;
  type: "create" | "modify" | "delete" | "test" | "review";
  targetFile: string;
  description: string;
  estimatedImpact: "low" | "medium" | "high";
  dependencies: string[];
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
}

export interface Plan {
  id: string;
  intentId: string;
  agentId: string;
  createdAt: Date;
  
  // Plan details
  summary: string;
  actions: PlanAction[];
  filesToTouch: string[];
  testsToAdd: string[];
  
  // Risk assessment
  risks: PlanRisk[];
  confidenceScore: number; // 0-100
  
  // Estimates
  estimatedCost: number;
  estimatedDuration: number; // in seconds
  
  // Status
  status: "draft" | "pending_approval" | "approved" | "rejected" | "executing" | "completed" | "failed";
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface PlanRisk {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  mitigation?: string;
  acknowledged: boolean;
}

export interface Execution {
  id: string;
  planId: string;
  agentId: string;
  intentId: string;
  
  // Progress
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  status: "running" | "paused" | "completed" | "failed" | "cancelled";
  
  // Metrics
  elapsedTime: number;
  costAccrued: number;
  
  // Results
  changedFiles: string[];
  testsRun: number;
  testsPassed: number;
  
  // Logs
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  details?: string;
}

export interface CodeChange {
  id: string;
  executionId: string;
  filePath: string;
  changeType: "created" | "modified" | "deleted";
  
  // Diff content
  beforeContent?: string;
  afterContent?: string;
  diffLines: DiffLine[];
  
  // AI explanations
  explanation: string;
  reasoning?: string;
}

export interface DiffLine {
  type: "unchanged" | "added" | "removed";
  lineNumber: number;
  content: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  
  // Who
  initiatedBy: string;
  agentId: string;
  agentRole: string;
  
  // What
  action: "intent_created" | "plan_generated" | "plan_approved" | "plan_rejected" | "execution_started" | "execution_completed" | "execution_failed" | "rollback_performed" | "authority_changed" | "scope_modified";
  description: string;
  
  // Details
  intentId?: string;
  planId?: string;
  executionId?: string;
  
  // Changes
  changedFiles?: string[];
  diffSummary?: string;
  
  // Rollback
  canRollback: boolean;
  rolledBack: boolean;
  rollbackAt?: Date;
}

// UI State types
export interface AgentContextPanel {
  agent: Agent;
  role: AgentRole;
  currentIntent?: Intent;
  costThisSession: number;
  executionsThisSession: number;
}

export interface PlanImpactPanel {
  plan: Plan;
  risks: PlanRisk[];
  estimatedCost: number;
  estimatedDuration: number;
  confidence: number;
}
