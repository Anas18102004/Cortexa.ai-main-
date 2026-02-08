import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Agent, AgentRole, Intent, Plan, Execution, AuditEntry, AuthorityLevel, AgentScope, StrictnessLevel } from "@/types/agent";
import {
  agents as initialAgents,
  agentRoles,
  intents as initialIntents,
  plans as initialPlans,
  executions as initialExecutions,
  auditEntries as initialAuditEntries,
  getAgentRole,
} from "@/data/mockData";

interface CreateAgentParams {
  roleId: string;
  customName?: string;
  authority: AuthorityLevel;
  strictness: StrictnessLevel;
  scope?: AgentScope[];
}

interface WorkforceContextType {
  // Data
  agents: Agent[];
  roles: AgentRole[];
  intents: Intent[];
  plans: Plan[];
  executions: Execution[];
  auditLog: AuditEntry[];
  
  // Selected state
  selectedAgentId: string | null;
  selectedAgent: Agent | null;
  selectedAgentRole: AgentRole | null;
  
  // Actions
  selectAgent: (agentId: string | null) => void;
  updateAgentStatus: (agentId: string, status: Agent["status"]) => void;
  updateAgentAuthority: (agentId: string, authority: Agent["authority"]) => void;
  createAgent: (params: CreateAgentParams) => Agent;
  toggleAgentActive: (agentId: string) => void;
  approvePlan: (planId: string) => void;
  rejectPlan: (planId: string, reason: string) => void;
  pauseExecution: (executionId: string) => void;
  resumeExecution: (executionId: string) => void;
  cancelExecution: (executionId: string) => void;
  
  // Utility
  getRole: (roleId: string) => AgentRole | undefined;
  getAgentIntents: (agentId: string) => Intent[];
  getAgentPlans: (agentId: string) => Plan[];
  getAgentExecutions: (agentId: string) => Execution[];
}

const WorkforceContext = createContext<WorkforceContextType | undefined>(undefined);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [intents, setIntents] = useState<Intent[]>(initialIntents);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [executions, setExecutions] = useState<Execution[]>(initialExecutions);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(initialAuditEntries);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;
  const selectedAgentRole = selectedAgent ? getAgentRole(selectedAgent.roleId) || null : null;

  // Real-time simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Update executing agents
      setExecutions((prev) =>
        prev.map((exec) => {
          if (exec.status !== "running") return exec;
          
          const newElapsedTime = exec.elapsedTime + 1;
          const progressIncrement = Math.random() > 0.7 ? 1 : 0;
          const newCurrentStep = Math.min(exec.currentStep + progressIncrement, exec.totalSteps);
          const newCostAccrued = exec.costAccrued + Math.floor(Math.random() * 2);
          
          // Check if execution completed
          if (newCurrentStep >= exec.totalSteps) {
            // Add completion log
            const completionLog = {
              id: `log-${Date.now()}`,
              timestamp: new Date(),
              level: "info" as const,
              message: "Execution completed successfully",
            };
            
            return {
              ...exec,
              currentStep: exec.totalSteps,
              elapsedTime: newElapsedTime,
              costAccrued: newCostAccrued,
              status: "completed" as const,
              completedAt: new Date(),
              logs: [...exec.logs, completionLog],
            };
          }
          
          // Add random logs
          const shouldAddLog = Math.random() > 0.9;
          const newLogs = shouldAddLog
            ? [
                ...exec.logs,
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date(),
                  level: (Math.random() > 0.8 ? "warning" : "info") as "info" | "warning",
                  message: getRandomLogMessage(newCurrentStep),
                },
              ]
            : exec.logs;
          
          return {
            ...exec,
            currentStep: newCurrentStep,
            elapsedTime: newElapsedTime,
            costAccrued: newCostAccrued,
            logs: newLogs,
          };
        })
      );

      // Update agent statuses based on executions
      setAgents((prev) =>
        prev.map((agent) => {
          const agentExecution = executions.find(
            (e) => e.agentId === agent.id && e.status === "running"
          );
          
          if (agentExecution) {
            return { ...agent, status: "executing" as const, lastActivity: new Date() };
          }
          
          // Random status changes for idle agents to simulate activity
          if (agent.status === "idle" && Math.random() > 0.98) {
            const newStatus = Math.random() > 0.5 ? "planning" : "idle";
            return { ...agent, status: newStatus as Agent["status"] };
          }
          
          if (agent.status === "planning" && Math.random() > 0.95) {
            return { ...agent, status: "awaiting_approval" as const };
          }
          
          return agent;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [executions]);
  
  const selectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId);
  }, []);
  
  const updateAgentStatus = useCallback((agentId: string, status: Agent["status"]) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status, lastActivity: new Date() } : agent
      )
    );
  }, []);
  
  const updateAgentAuthority = useCallback((agentId: string, authority: Agent["authority"]) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, authority } : agent
      )
    );
    
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      const role = getAgentRole(agent.roleId);
      const newEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date(),
        initiatedBy: "user-001",
        agentId,
        agentRole: role?.name || "Unknown",
        action: "authority_changed",
        description: `Authority level changed to ${authority}`,
        canRollback: true,
        rolledBack: false,
      };
      setAuditLog((prev) => [newEntry, ...prev]);
    }
  }, [agents]);

  const createAgent = useCallback((params: CreateAgentParams): Agent => {
    const role = getAgentRole(params.roleId);
    if (!role) throw new Error("Invalid role ID");

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      roleId: params.roleId,
      customName: params.customName,
      description: role.description,
      authority: params.authority,
      scope: params.scope || role.defaultScope,
      status: "idle",
      strictness: params.strictness,
      hourlyRate: Math.floor(100 + Math.random() * 100),
      totalCostThisMonth: 0,
      executionCount: 0,
      lastActivity: new Date(),
      isActive: true,
      autoApprove: params.authority === "autonomous",
      maxConcurrentTasks: params.authority === "autonomous" ? 5 : 3,
      lockedCapabilities: role.id === "security-reviewer" 
        ? ["Modify code directly", "Execute commands"]
        : [],
      allowedFilePatterns: role.defaultScope.includes("frontend")
        ? ["src/components/**", "src/pages/**"]
        : role.defaultScope.includes("backend")
        ? ["src/api/**", "supabase/**"]
        : ["**/*"],
      blockedFilePatterns: [],
    };

    setAgents((prev) => [...prev, newAgent]);

    // Add audit entry
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      initiatedBy: "user-001",
      agentId: newAgent.id,
      agentRole: role.name,
      action: "intent_created",
      description: `Created new agent: ${params.customName || role.name}`,
      canRollback: false,
      rolledBack: false,
    };
    setAuditLog((prev) => [newEntry, ...prev]);

    return newAgent;
  }, []);

  const toggleAgentActive = useCallback((agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? { ...agent, isActive: !agent.isActive, status: agent.isActive ? "idle" : agent.status }
          : agent
      )
    );
  }, []);
  
  const approvePlan = useCallback((planId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, status: "approved", approvedAt: new Date(), approvedBy: "user-001" }
          : plan
      )
    );
    
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const agent = agents.find((a) => a.id === plan.agentId);
      const role = agent ? getAgentRole(agent.roleId) : undefined;
      
      const newEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date(),
        initiatedBy: "user-001",
        agentId: plan.agentId,
        agentRole: role?.name || "Unknown",
        action: "plan_approved",
        description: `Approved plan: ${plan.summary.slice(0, 50)}...`,
        planId,
        intentId: plan.intentId,
        canRollback: true,
        rolledBack: false,
      };
      setAuditLog((prev) => [newEntry, ...prev]);
      
      updateAgentStatus(plan.agentId, "executing");

      // Start a new execution
      const newExecution: Execution = {
        id: `exec-${Date.now()}`,
        planId,
        agentId: plan.agentId,
        intentId: plan.intentId,
        startedAt: new Date(),
        currentStep: 0,
        totalSteps: plan.actions.length,
        status: "running",
        elapsedTime: 0,
        costAccrued: 0,
        changedFiles: [],
        testsRun: 0,
        testsPassed: 0,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            level: "info",
            message: "Execution started",
            details: plan.summary,
          },
        ],
      };
      setExecutions((prev) => [...prev, newExecution]);
    }
  }, [plans, agents, updateAgentStatus]);
  
  const rejectPlan = useCallback((planId: string, reason: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, status: "rejected", rejectionReason: reason }
          : plan
      )
    );
    
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const agent = agents.find((a) => a.id === plan.agentId);
      const role = agent ? getAgentRole(agent.roleId) : undefined;
      
      const newEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date(),
        initiatedBy: "user-001",
        agentId: plan.agentId,
        agentRole: role?.name || "Unknown",
        action: "plan_rejected",
        description: `Rejected plan: ${reason}`,
        planId,
        intentId: plan.intentId,
        canRollback: false,
        rolledBack: false,
      };
      setAuditLog((prev) => [newEntry, ...prev]);
      
      updateAgentStatus(plan.agentId, "idle");
    }
  }, [plans, agents, updateAgentStatus]);
  
  const pauseExecution = useCallback((executionId: string) => {
    setExecutions((prev) =>
      prev.map((exec) =>
        exec.id === executionId ? { ...exec, status: "paused" } : exec
      )
    );
    
    const execution = executions.find((e) => e.id === executionId);
    if (execution) {
      updateAgentStatus(execution.agentId, "paused");
    }
  }, [executions, updateAgentStatus]);
  
  const resumeExecution = useCallback((executionId: string) => {
    setExecutions((prev) =>
      prev.map((exec) =>
        exec.id === executionId ? { ...exec, status: "running" } : exec
      )
    );
    
    const execution = executions.find((e) => e.id === executionId);
    if (execution) {
      updateAgentStatus(execution.agentId, "executing");
    }
  }, [executions, updateAgentStatus]);
  
  const cancelExecution = useCallback((executionId: string) => {
    setExecutions((prev) =>
      prev.map((exec) =>
        exec.id === executionId
          ? { ...exec, status: "cancelled", completedAt: new Date() }
          : exec
      )
    );
    
    const execution = executions.find((e) => e.id === executionId);
    if (execution) {
      updateAgentStatus(execution.agentId, "idle");
    }
  }, [executions, updateAgentStatus]);
  
  const getRole = useCallback((roleId: string) => getAgentRole(roleId), []);
  
  const getAgentIntents = useCallback(
    (agentId: string) => intents.filter((i) => i.agentId === agentId),
    [intents]
  );
  
  const getAgentPlans = useCallback(
    (agentId: string) => plans.filter((p) => p.agentId === agentId),
    [plans]
  );
  
  const getAgentExecutions = useCallback(
    (agentId: string) => executions.filter((e) => e.agentId === agentId),
    [executions]
  );
  
  return (
    <WorkforceContext.Provider
      value={{
        agents,
        roles: agentRoles,
        intents,
        plans,
        executions,
        auditLog,
        selectedAgentId,
        selectedAgent,
        selectedAgentRole,
        selectAgent,
        updateAgentStatus,
        updateAgentAuthority,
        createAgent,
        toggleAgentActive,
        approvePlan,
        rejectPlan,
        pauseExecution,
        resumeExecution,
        cancelExecution,
        getRole,
        getAgentIntents,
        getAgentPlans,
        getAgentExecutions,
      }}
    >
      {children}
    </WorkforceContext.Provider>
  );
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (context === undefined) {
    throw new Error("useWorkforce must be used within a WorkforceProvider");
  }
  return context;
}

// Helper function for random log messages
function getRandomLogMessage(step: number): string {
  const messages = [
    `Processing step ${step}...`,
    "Analyzing code structure",
    "Generating implementation",
    "Running type checks",
    "Validating changes",
    "Checking for conflicts",
    "Optimizing output",
    "Preparing file updates",
    "Running static analysis",
    "Verifying dependencies",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
