// AI Workforce Management Platform - Mock Data
import type {
  AgentRole,
  Agent,
  Intent,
  Plan,
  PlanAction,
  PlanRisk,
  Execution,
  ExecutionLog,
  CodeChange,
  AuditEntry,
} from "@/types/agent";

// Built-in Agent Roles
export const agentRoles: AgentRole[] = [
  {
    id: "frontend-engineer",
    name: "Frontend Engineer",
    description: "Specializes in UI components, styling, accessibility, and user experience. Expert in React, TypeScript, and modern CSS.",
    icon: "Layout",
    baseCapabilities: [
      "Create React components",
      "Implement responsive layouts",
      "Apply styling with Tailwind CSS",
      "Ensure accessibility compliance",
      "Optimize client-side performance",
    ],
    defaultAuthority: "advisor",
    defaultScope: ["frontend"],
    isBuiltIn: true,
    color: "text-blue-500",
  },
  {
    id: "backend-engineer",
    name: "Backend Engineer",
    description: "Handles API design, database operations, server logic, and system performance. Expert in Node.js, databases, and cloud services.",
    icon: "Server",
    baseCapabilities: [
      "Design RESTful APIs",
      "Implement database schemas",
      "Write server-side logic",
      "Optimize query performance",
      "Configure cloud services",
    ],
    defaultAuthority: "advisor",
    defaultScope: ["backend", "database"],
    isBuiltIn: true,
    color: "text-emerald-500",
  },
  {
    id: "qa-engineer",
    name: "QA / Test Engineer",
    description: "Focuses on test coverage, regression detection, and edge case identification. Expert in testing frameworks and quality assurance.",
    icon: "TestTube",
    baseCapabilities: [
      "Write unit tests",
      "Create integration tests",
      "Identify edge cases",
      "Perform regression testing",
      "Generate test reports",
    ],
    defaultAuthority: "executor",
    defaultScope: ["testing"],
    isBuiltIn: true,
    color: "text-amber-500",
  },
  {
    id: "refactor-specialist",
    name: "Refactor Specialist",
    description: "Dedicated to code quality, design patterns, and codebase optimization. Expert in identifying and resolving technical debt.",
    icon: "Wrench",
    baseCapabilities: [
      "Identify code smells",
      "Apply design patterns",
      "Reduce technical debt",
      "Improve code readability",
      "Optimize algorithms",
    ],
    defaultAuthority: "advisor",
    defaultScope: ["fullstack"],
    isBuiltIn: true,
    color: "text-violet-500",
  },
  {
    id: "security-reviewer",
    name: "Security Reviewer",
    description: "Identifies vulnerabilities, reviews authentication flows, and ensures data protection. Expert in security best practices.",
    icon: "Shield",
    baseCapabilities: [
      "Identify security vulnerabilities",
      "Review authentication flows",
      "Audit data handling",
      "Check for injection attacks",
      "Ensure encryption standards",
    ],
    defaultAuthority: "observer",
    defaultScope: ["security"],
    isBuiltIn: true,
    color: "text-red-500",
  },
  {
    id: "product-analyst",
    name: "Product Analyst",
    description: "Provides UX insights, feature recommendations, and user behavior analysis. Expert in product thinking and analytics.",
    icon: "LineChart",
    baseCapabilities: [
      "Analyze user flows",
      "Recommend UX improvements",
      "Identify feature opportunities",
      "Review accessibility",
      "Suggest performance optimizations",
    ],
    defaultAuthority: "observer",
    defaultScope: ["frontend"],
    isBuiltIn: true,
    color: "text-cyan-500",
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    description: "Manages infrastructure, CI/CD pipelines, and deployment automation. Expert in cloud platforms and containerization.",
    icon: "Cloud",
    baseCapabilities: [
      "Configure CI/CD pipelines",
      "Manage cloud infrastructure",
      "Set up monitoring",
      "Optimize build processes",
      "Handle deployments",
    ],
    defaultAuthority: "executor",
    defaultScope: ["infrastructure"],
    isBuiltIn: true,
    color: "text-orange-500",
  },
  {
    id: "documentation-writer",
    name: "Documentation Writer",
    description: "Creates and maintains technical documentation, API references, and user guides. Expert in clear technical communication.",
    icon: "FileText",
    baseCapabilities: [
      "Write technical documentation",
      "Create API references",
      "Generate code comments",
      "Build user guides",
      "Maintain changelogs",
    ],
    defaultAuthority: "executor",
    defaultScope: ["repo-wide"],
    isBuiltIn: true,
    color: "text-slate-500",
  },
];

// Active Agents
export const agents: Agent[] = [
  {
    id: "agent-fe-001",
    roleId: "frontend-engineer",
    customName: "UI Architect",
    description: "Primary frontend development agent focused on component architecture",
    authority: "executor",
    scope: ["frontend"],
    status: "executing",
    strictness: "balanced",
    hourlyRate: 150,
    totalCostThisMonth: 4250,
    executionCount: 28,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    currentIntent: "Implementing responsive dashboard layout",
    isActive: true,
    autoApprove: false,
    maxConcurrentTasks: 3,
    lockedCapabilities: ["Deploy to production", "Modify CI/CD"],
    allowedFilePatterns: ["src/components/**", "src/pages/**", "src/styles/**"],
    blockedFilePatterns: ["src/api/**", "supabase/**"],
  },
  {
    id: "agent-be-001",
    roleId: "backend-engineer",
    description: "Handles all API and database operations",
    authority: "advisor",
    scope: ["backend", "database"],
    status: "awaiting_approval",
    strictness: "conservative",
    hourlyRate: 175,
    totalCostThisMonth: 3100,
    executionCount: 18,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    currentIntent: "Optimizing user query performance",
    isActive: true,
    autoApprove: false,
    maxConcurrentTasks: 2,
    lockedCapabilities: ["Delete database tables", "Modify auth config"],
    allowedFilePatterns: ["src/api/**", "supabase/functions/**"],
    blockedFilePatterns: ["src/components/**"],
  },
  {
    id: "agent-qa-001",
    roleId: "qa-engineer",
    description: "Comprehensive test coverage and quality assurance",
    authority: "executor",
    scope: ["testing"],
    status: "idle",
    strictness: "aggressive",
    hourlyRate: 125,
    totalCostThisMonth: 1850,
    executionCount: 45,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isActive: true,
    autoApprove: true,
    maxConcurrentTasks: 5,
    lockedCapabilities: [],
    allowedFilePatterns: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    blockedFilePatterns: [],
  },
  {
    id: "agent-sec-001",
    roleId: "security-reviewer",
    description: "Continuous security monitoring and vulnerability detection",
    authority: "observer",
    scope: ["security"],
    status: "planning",
    strictness: "aggressive",
    hourlyRate: 200,
    totalCostThisMonth: 950,
    executionCount: 12,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    currentIntent: "Reviewing authentication implementation",
    isActive: true,
    autoApprove: false,
    maxConcurrentTasks: 1,
    lockedCapabilities: ["Modify code directly", "Execute commands"],
    allowedFilePatterns: ["**/*"],
    blockedFilePatterns: [],
  },
  {
    id: "agent-ref-001",
    roleId: "refactor-specialist",
    description: "Code quality improvements and technical debt reduction",
    authority: "advisor",
    scope: ["fullstack"],
    status: "idle",
    strictness: "balanced",
    hourlyRate: 160,
    totalCostThisMonth: 2200,
    executionCount: 15,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isActive: true,
    autoApprove: false,
    maxConcurrentTasks: 2,
    lockedCapabilities: ["Breaking changes"],
    allowedFilePatterns: ["src/**"],
    blockedFilePatterns: ["*.config.*", "package.json"],
  },
  {
    id: "agent-prod-001",
    roleId: "product-analyst",
    description: "UX analysis and feature recommendations",
    authority: "observer",
    scope: ["frontend"],
    status: "idle",
    strictness: "conservative",
    hourlyRate: 140,
    totalCostThisMonth: 780,
    executionCount: 8,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isActive: true,
    autoApprove: false,
    maxConcurrentTasks: 1,
    lockedCapabilities: ["Modify code", "Execute commands"],
    allowedFilePatterns: [],
    blockedFilePatterns: ["**/*"],
  },
];

// Sample Intents
export const intents: Intent[] = [
  {
    id: "intent-001",
    agentId: "agent-fe-001",
    title: "Implement responsive dashboard layout",
    description: "Create a responsive three-column dashboard layout that collapses gracefully on mobile devices. Include a sidebar navigation, main content area, and a collapsible right panel for details.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    createdBy: "user-001",
    status: "executing",
    contextFiles: ["src/pages/Dashboard.tsx", "src/components/Layout.tsx"],
    requirements: [
      "Responsive breakpoints at 768px and 1024px",
      "Sidebar should collapse to icons on tablet",
      "Right panel should be dismissible on mobile",
    ],
    constraints: [
      "Must use existing design system colors",
      "No additional dependencies",
    ],
  },
  {
    id: "intent-002",
    agentId: "agent-be-001",
    title: "Optimize user query performance",
    description: "Review and optimize the user search query that is currently experiencing slow performance with large datasets. Consider adding indexes and query caching.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    createdBy: "user-001",
    status: "planning",
    contextFiles: ["supabase/functions/search-users/index.ts"],
    requirements: [
      "Query should complete under 200ms for 100k records",
      "Implement result pagination",
    ],
    constraints: [
      "Cannot modify table schema without approval",
      "Must maintain backward compatibility",
    ],
  },
];

// Sample Plans
export const plans: Plan[] = [
  {
    id: "plan-001",
    intentId: "intent-001",
    agentId: "agent-fe-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
    summary: "Implement a responsive dashboard with ResizablePanelGroup, using CSS Grid for the main layout and Tailwind responsive utilities for breakpoint handling.",
    actions: [
      {
        id: "action-001",
        type: "modify",
        targetFile: "src/pages/Dashboard.tsx",
        description: "Restructure dashboard to use three-column responsive layout",
        estimatedImpact: "medium",
        dependencies: [],
        status: "completed",
      },
      {
        id: "action-002",
        type: "create",
        targetFile: "src/components/dashboard/DashboardSidebar.tsx",
        description: "Create collapsible sidebar navigation component",
        estimatedImpact: "low",
        dependencies: ["action-001"],
        status: "in_progress",
      },
      {
        id: "action-003",
        type: "create",
        targetFile: "src/components/dashboard/DashboardPanel.tsx",
        description: "Create dismissible right panel component",
        estimatedImpact: "low",
        dependencies: ["action-001"],
        status: "pending",
      },
      {
        id: "action-004",
        type: "modify",
        targetFile: "src/index.css",
        description: "Add responsive utility classes for dashboard",
        estimatedImpact: "low",
        dependencies: [],
        status: "pending",
      },
    ],
    filesToTouch: [
      "src/pages/Dashboard.tsx",
      "src/components/dashboard/DashboardSidebar.tsx",
      "src/components/dashboard/DashboardPanel.tsx",
      "src/index.css",
    ],
    testsToAdd: [
      "Dashboard responsive behavior test",
      "Sidebar collapse/expand test",
      "Panel dismiss functionality test",
    ],
    risks: [
      {
        id: "risk-001",
        severity: "low",
        description: "Layout shift may occur during hydration on slow connections",
        mitigation: "Use CSS-only responsive behavior where possible",
        acknowledged: true,
      },
      {
        id: "risk-002",
        severity: "medium",
        description: "Existing dashboard widgets may need adjustment for new layout",
        mitigation: "Review all widget components after implementation",
        acknowledged: false,
      },
    ],
    confidenceScore: 87,
    estimatedCost: 45,
    estimatedDuration: 900,
    status: "executing",
    approvedAt: new Date(Date.now() - 1000 * 60 * 20),
    approvedBy: "user-001",
  },
  {
    id: "plan-002",
    intentId: "intent-002",
    agentId: "agent-be-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 40),
    summary: "Add composite index on user table for search fields, implement query result caching with 5-minute TTL, and add cursor-based pagination.",
    actions: [
      {
        id: "action-005",
        type: "create",
        targetFile: "supabase/migrations/add_search_indexes.sql",
        description: "Create composite index for user search optimization",
        estimatedImpact: "high",
        dependencies: [],
        status: "pending",
      },
      {
        id: "action-006",
        type: "modify",
        targetFile: "supabase/functions/search-users/index.ts",
        description: "Implement cursor-based pagination and caching",
        estimatedImpact: "medium",
        dependencies: ["action-005"],
        status: "pending",
      },
    ],
    filesToTouch: [
      "supabase/migrations/add_search_indexes.sql",
      "supabase/functions/search-users/index.ts",
    ],
    testsToAdd: [
      "Search performance benchmark test",
      "Pagination edge case tests",
    ],
    risks: [
      {
        id: "risk-003",
        severity: "high",
        description: "Index creation may temporarily lock the users table",
        mitigation: "Schedule during low-traffic period or use CONCURRENTLY",
        acknowledged: false,
      },
    ],
    confidenceScore: 72,
    estimatedCost: 85,
    estimatedDuration: 1800,
    status: "pending_approval",
  },
];

// Sample Executions
export const executions: Execution[] = [
  {
    id: "exec-001",
    planId: "plan-001",
    agentId: "agent-fe-001",
    intentId: "intent-001",
    startedAt: new Date(Date.now() - 1000 * 60 * 15),
    currentStep: 2,
    totalSteps: 4,
    status: "running",
    elapsedTime: 900,
    costAccrued: 22,
    changedFiles: ["src/pages/Dashboard.tsx"],
    testsRun: 0,
    testsPassed: 0,
    logs: [
      {
        id: "log-001",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        level: "info",
        message: "Execution started",
        details: "Beginning dashboard restructure",
      },
      {
        id: "log-002",
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        level: "info",
        message: "Action completed: Restructure dashboard layout",
        details: "Modified src/pages/Dashboard.tsx with new grid structure",
      },
      {
        id: "log-003",
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        level: "info",
        message: "Action in progress: Creating sidebar component",
      },
      {
        id: "log-004",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        level: "warning",
        message: "TypeScript warning detected",
        details: "Unused import in DashboardSidebar.tsx - will be resolved on completion",
      },
    ],
  },
];

// Sample Code Changes
export const codeChanges: CodeChange[] = [
  {
    id: "change-001",
    executionId: "exec-001",
    filePath: "src/pages/Dashboard.tsx",
    changeType: "modified",
    beforeContent: `import React from 'react';

export const Dashboard = () => {
  return (
    <div className="p-4">
      <h1>Dashboard</h1>
    </div>
  );
};`,
    afterContent: `import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_320px] min-h-screen">
      <DashboardSidebar />
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        {/* Main content area */}
      </main>
      <DashboardPanel className="hidden lg:block" />
    </div>
  );
};`,
    diffLines: [
      { type: "unchanged", lineNumber: 1, content: "import React from 'react';" },
      { type: "added", lineNumber: 2, content: "import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';" },
      { type: "added", lineNumber: 3, content: "import { DashboardPanel } from '@/components/dashboard/DashboardPanel';" },
      { type: "unchanged", lineNumber: 4, content: "" },
      { type: "unchanged", lineNumber: 5, content: "export const Dashboard = () => {" },
      { type: "unchanged", lineNumber: 6, content: "  return (" },
      { type: "removed", lineNumber: 7, content: '    <div className="p-4">' },
      { type: "added", lineNumber: 7, content: '    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_320px] min-h-screen">' },
      { type: "added", lineNumber: 8, content: "      <DashboardSidebar />" },
      { type: "added", lineNumber: 9, content: '      <main className="p-6">' },
      { type: "removed", lineNumber: 8, content: "      <h1>Dashboard</h1>" },
      { type: "added", lineNumber: 10, content: '        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>' },
      { type: "added", lineNumber: 11, content: "        {/* Main content area */}" },
      { type: "added", lineNumber: 12, content: "      </main>" },
      { type: "added", lineNumber: 13, content: '      <DashboardPanel className="hidden lg:block" />' },
      { type: "unchanged", lineNumber: 14, content: "    </div>" },
      { type: "unchanged", lineNumber: 15, content: "  );" },
      { type: "unchanged", lineNumber: 16, content: "};" },
    ],
    explanation: "Restructured the Dashboard component to use CSS Grid with responsive columns. The sidebar and right panel components are imported and positioned using the grid layout.",
    reasoning: "CSS Grid provides native responsive behavior with minimal JavaScript, improving performance and reducing layout complexity.",
  },
];

// Sample Audit Entries
export const auditEntries: AuditEntry[] = [
  {
    id: "audit-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    initiatedBy: "user-001",
    agentId: "agent-fe-001",
    agentRole: "Frontend Engineer",
    action: "intent_created",
    description: "Created intent: Implement responsive dashboard layout",
    intentId: "intent-001",
    canRollback: false,
    rolledBack: false,
  },
  {
    id: "audit-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    initiatedBy: "agent-fe-001",
    agentId: "agent-fe-001",
    agentRole: "Frontend Engineer",
    action: "plan_generated",
    description: "Generated execution plan with 4 actions",
    intentId: "intent-001",
    planId: "plan-001",
    canRollback: false,
    rolledBack: false,
  },
  {
    id: "audit-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
    initiatedBy: "user-001",
    agentId: "agent-fe-001",
    agentRole: "Frontend Engineer",
    action: "plan_approved",
    description: "Approved plan for responsive dashboard implementation",
    intentId: "intent-001",
    planId: "plan-001",
    canRollback: true,
    rolledBack: false,
  },
  {
    id: "audit-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    initiatedBy: "agent-fe-001",
    agentId: "agent-fe-001",
    agentRole: "Frontend Engineer",
    action: "execution_started",
    description: "Started execution of dashboard restructure plan",
    intentId: "intent-001",
    planId: "plan-001",
    executionId: "exec-001",
    canRollback: true,
    rolledBack: false,
  },
  {
    id: "audit-005",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    initiatedBy: "user-001",
    agentId: "agent-be-001",
    agentRole: "Backend Engineer",
    action: "intent_created",
    description: "Created intent: Optimize user query performance",
    intentId: "intent-002",
    canRollback: false,
    rolledBack: false,
  },
  {
    id: "audit-006",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    initiatedBy: "agent-be-001",
    agentId: "agent-be-001",
    agentRole: "Backend Engineer",
    action: "plan_generated",
    description: "Generated optimization plan with 2 actions and 1 high-severity risk",
    intentId: "intent-002",
    planId: "plan-002",
    canRollback: false,
    rolledBack: false,
  },
  {
    id: "audit-007",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    initiatedBy: "agent-qa-001",
    agentId: "agent-qa-001",
    agentRole: "QA / Test Engineer",
    action: "execution_completed",
    description: "Completed test suite execution: 45 tests passed, 2 skipped",
    executionId: "exec-000",
    canRollback: false,
    rolledBack: false,
  },
  {
    id: "audit-008",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    initiatedBy: "user-001",
    agentId: "agent-sec-001",
    agentRole: "Security Reviewer",
    action: "authority_changed",
    description: "Authority level changed from Advisor to Observer",
    canRollback: true,
    rolledBack: false,
  },
];

// Helper functions
export function getAgentRole(roleId: string): AgentRole | undefined {
  return agentRoles.find((role) => role.id === roleId);
}

export function getAgentById(agentId: string): Agent | undefined {
  return agents.find((agent) => agent.id === agentId);
}

export function getIntentsByAgent(agentId: string): Intent[] {
  return intents.filter((intent) => intent.agentId === agentId);
}

export function getPlansByAgent(agentId: string): Plan[] {
  return plans.filter((plan) => plan.agentId === agentId);
}

export function getExecutionsByAgent(agentId: string): Execution[] {
  return executions.filter((exec) => exec.agentId === agentId);
}

export function getAuditEntriesByAgent(agentId: string): AuditEntry[] {
  return auditEntries.filter((entry) => entry.agentId === agentId);
}
