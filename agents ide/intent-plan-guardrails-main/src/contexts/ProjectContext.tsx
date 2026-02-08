import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import type { Project, ProjectFile, AgentChange, TechStack, DiffLine } from "@/types/project";
import { mockProjectFiles, frontendTechStacks, backendTechStacks, toolsTechStacks } from "@/types/project";
import { useWorkforce } from "./WorkforceContext";
import { 
  AISimulationEngine, 
  generateAgentChange, 
  generateTerminalLog,
  generateDiffLines,
} from "@/lib/ai-simulation";

interface CreateProjectParams {
  name: string;
  description: string;
  goals: string[];
  githubUrl?: string;
  branch?: string;
  frontendStack: TechStack[];
  backendStack: TechStack[];
  toolsStack: TechStack[];
  assignedAgentIds: string[];
}

interface ProjectContextType {
  // Data
  projects: Project[];
  currentProject: Project | null;
  currentFile: ProjectFile | null;
  openFiles: ProjectFile[];
  terminalLogs: TerminalLog[];
  
  // Actions
  createProject: (params: CreateProjectParams) => Project;
  selectProject: (projectId: string | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  // File actions
  selectFile: (file: ProjectFile | null) => void;
  openFile: (file: ProjectFile) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string, modifiedBy: "user" | "agent") => void;
  
  // Agent change actions
  addAgentChange: (change: Omit<AgentChange, "id" | "timestamp" | "status">) => void;
  approveChange: (changeId: string) => void;
  rejectChange: (changeId: string) => void;
  approveAllChanges: () => void;
  rejectAllChanges: () => void;
  
  // Terminal
  addTerminalLog: (log: Omit<TerminalLog, "id" | "timestamp">) => void;
  clearTerminalLogs: () => void;
  
  // Utilities
  getFileByPath: (path: string) => ProjectFile | undefined;
  getFlatFileList: (files: ProjectFile[]) => ProjectFile[];
}

interface TerminalLog {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success" | "debug";
  message: string;
  agent?: string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Mock initial projects
const initialProjects: Project[] = [
  {
    id: "project-001",
    name: "E-Commerce Platform",
    description: "A modern e-commerce platform with real-time inventory and payment processing",
    goals: [
      "Implement user authentication",
      "Build product catalog with search",
      "Integrate Stripe payments",
      "Add real-time inventory tracking",
    ],
    githubUrl: "https://github.com/acme/ecommerce",
    branch: "main",
    lastSynced: new Date(Date.now() - 1000 * 60 * 30),
    frontendStack: [frontendTechStacks[0], frontendTechStacks[5], frontendTechStacks[7]],
    backendStack: [backendTechStacks[0], backendTechStacks[4], backendTechStacks[7]],
    toolsStack: [toolsTechStacks[0], toolsTechStacks[3]],
    assignedAgentIds: ["agent-fe-001", "agent-be-001", "agent-qa-001"],
    recommendedAgentIds: ["agent-security-001"],
    files: mockProjectFiles,
    pendingChanges: [],
    status: "active",
    progress: 35,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(),
  },
  {
    id: "project-002",
    name: "Analytics Dashboard",
    description: "Real-time analytics dashboard with data visualization",
    goals: [
      "Create interactive charts",
      "Build data pipeline integration",
      "Implement role-based access",
    ],
    githubUrl: "https://github.com/acme/analytics",
    branch: "develop",
    lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 2),
    frontendStack: [frontendTechStacks[0], frontendTechStacks[5], frontendTechStacks[7]],
    backendStack: [backendTechStacks[1], backendTechStacks[5], backendTechStacks[8]],
    toolsStack: [toolsTechStacks[4]],
    assignedAgentIds: ["agent-fe-001"],
    recommendedAgentIds: ["agent-be-001", "agent-qa-001"],
    files: mockProjectFiles,
    pendingChanges: [],
    status: "setup",
    progress: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(),
  },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  
  const currentProject = projects.find((p) => p.id === currentProjectId) || null;
  
  // Helper to find file recursively
  const findFile = useCallback((files: ProjectFile[], fileId: string): ProjectFile | undefined => {
    for (const file of files) {
      if (file.id === fileId) return file;
      if (file.children) {
        const found = findFile(file.children, fileId);
        if (found) return found;
      }
    }
    return undefined;
  }, []);
  
  const currentFile = currentProject && currentFileId 
    ? findFile(currentProject.files, currentFileId) || null
    : null;
    
  const openFiles = currentProject
    ? openFileIds.map((id) => findFile(currentProject.files, id)).filter(Boolean) as ProjectFile[]
    : [];

  // Sophisticated AI simulation
  const simulationRef = useRef<AISimulationEngine | null>(null);
  const [simulationPhase, setSimulationPhase] = useState<string>("idle");
  const [simulationProgress, setSimulationProgress] = useState({ step: 0, total: 0 });

  // Advanced simulation using the AI engine
  useEffect(() => {
    if (!currentProject || currentProject.status !== "active") {
      simulationRef.current?.stop();
      simulationRef.current = null;
      return;
    }
    
    // Create simulation engine
    const agentId = currentProject.assignedAgentIds[0] || "agent-fe-001";
    
    const engine = new AISimulationEngine(
      // On log
      (log) => {
        addTerminalLog(log);
      },
      // On change
      (change) => {
        if (currentProject.pendingChanges.length < 5) {
          addAgentChange(change);
        }
      },
      // On progress
      (step, total, phase) => {
        setSimulationProgress({ step, total });
        setSimulationPhase(phase);
      },
      agentId
    );
    
    simulationRef.current = engine;
    engine.start();
    
    return () => {
      engine.stop();
    };
  }, [currentProject?.id, currentProject?.status]);

  // Additional realistic terminal logging
  useEffect(() => {
    if (!currentProject || currentProject.status !== "active") return;
    
    const interval = setInterval(() => {
      // Random background activity logs
      if (Math.random() > 0.8) {
        const backgroundLogs = [
          { level: "debug" as const, message: "File watcher: Detected change in src/components/", agent: "System" },
          { level: "info" as const, message: "TypeScript: Incremental compilation complete (0 errors)", agent: "Build" },
          { level: "debug" as const, message: "Hot reload: Updating module...", agent: "Vite" },
          { level: "info" as const, message: "ESLint: Analyzing changed files...", agent: "Linter" },
          { level: "success" as const, message: "All type checks passed", agent: "TypeScript" },
          { level: "debug" as const, message: "Memory usage: 124MB / 512MB", agent: "System" },
        ];
        const log = backgroundLogs[Math.floor(Math.random() * backgroundLogs.length)];
        addTerminalLog(log);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [currentProject?.id, currentProject?.status]);
  
  const createProject = useCallback((params: CreateProjectParams): Project => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: params.name,
      description: params.description,
      goals: params.goals,
      githubUrl: params.githubUrl,
      branch: params.branch || "main",
      frontendStack: params.frontendStack,
      backendStack: params.backendStack,
      toolsStack: params.toolsStack,
      assignedAgentIds: params.assignedAgentIds,
      recommendedAgentIds: [],
      files: mockProjectFiles,
      pendingChanges: [],
      status: "setup",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);
  
  const selectProject = useCallback((projectId: string | null) => {
    setCurrentProjectId(projectId);
    setCurrentFileId(null);
    setOpenFileIds([]);
    setTerminalLogs([]);
  }, []);
  
  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    );
  }, []);
  
  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  }, [currentProjectId]);
  
  const selectFile = useCallback((file: ProjectFile | null) => {
    setCurrentFileId(file?.id || null);
  }, []);
  
  const openFile = useCallback((file: ProjectFile) => {
    if (file.type === "folder") return;
    setOpenFileIds((prev) => 
      prev.includes(file.id) ? prev : [...prev, file.id]
    );
    setCurrentFileId(file.id);
  }, []);
  
  const closeFile = useCallback((fileId: string) => {
    setOpenFileIds((prev) => prev.filter((id) => id !== fileId));
    if (currentFileId === fileId) {
      setCurrentFileId(null);
    }
  }, [currentFileId]);
  
  const updateFileContent = useCallback((
    fileId: string, 
    content: string, 
    modifiedBy: "user" | "agent"
  ) => {
    if (!currentProjectId) return;
    
    const updateFileInTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.map((file) => {
        if (file.id === fileId) {
          return { ...file, content, isModified: true, modifiedBy, lastModified: new Date() };
        }
        if (file.children) {
          return { ...file, children: updateFileInTree(file.children) };
        }
        return file;
      });
    };
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, files: updateFileInTree(p.files), updatedAt: new Date() }
          : p
      )
    );
  }, [currentProjectId]);
  
  const addAgentChange = useCallback((change: Omit<AgentChange, "id" | "timestamp" | "status">) => {
    if (!currentProjectId) return;
    
    const newChange: AgentChange = {
      ...change,
      id: `change-${Date.now()}`,
      timestamp: new Date(),
      status: "pending",
    };
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, pendingChanges: [...p.pendingChanges, newChange] }
          : p
      )
    );
    
    // Add terminal log
    addTerminalLog({
      level: "info",
      message: `Agent proposed change: ${change.explanation}`,
      agent: "Frontend Engineer",
    });
  }, [currentProjectId]);
  
  const approveChange = useCallback((changeId: string) => {
    if (!currentProjectId) return;
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              pendingChanges: p.pendingChanges.filter((c) => c.id !== changeId),
            }
          : p
      )
    );
    
    addTerminalLog({
      level: "success",
      message: "Change approved and applied",
    });
  }, [currentProjectId]);
  
  const rejectChange = useCallback((changeId: string) => {
    if (!currentProjectId) return;
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              pendingChanges: p.pendingChanges.filter((c) => c.id !== changeId),
            }
          : p
      )
    );
    
    addTerminalLog({
      level: "warning",
      message: "Change rejected",
    });
  }, [currentProjectId]);
  
  const approveAllChanges = useCallback(() => {
    if (!currentProjectId) return;
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, pendingChanges: [] }
          : p
      )
    );
    
    addTerminalLog({
      level: "success",
      message: "All changes approved and applied",
    });
  }, [currentProjectId]);
  
  const rejectAllChanges = useCallback(() => {
    if (!currentProjectId) return;
    
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, pendingChanges: [] }
          : p
      )
    );
    
    addTerminalLog({
      level: "warning",
      message: "All changes rejected",
    });
  }, [currentProjectId]);
  
  const addTerminalLog = useCallback((log: Omit<TerminalLog, "id" | "timestamp">) => {
    const newLog: TerminalLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setTerminalLogs((prev) => [...prev.slice(-99), newLog]);
  }, []);
  
  const clearTerminalLogs = useCallback(() => {
    setTerminalLogs([]);
  }, []);
  
  const getFileByPath = useCallback((path: string): ProjectFile | undefined => {
    if (!currentProject) return undefined;
    
    const findByPath = (files: ProjectFile[]): ProjectFile | undefined => {
      for (const file of files) {
        if (file.path === path) return file;
        if (file.children) {
          const found = findByPath(file.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    return findByPath(currentProject.files);
  }, [currentProject]);
  
  const getFlatFileList = useCallback((files: ProjectFile[]): ProjectFile[] => {
    const result: ProjectFile[] = [];
    
    const flatten = (fileList: ProjectFile[]) => {
      for (const file of fileList) {
        if (file.type === "file") {
          result.push(file);
        }
        if (file.children) {
          flatten(file.children);
        }
      }
    };
    
    flatten(files);
    return result;
  }, []);
  
  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        currentFile,
        openFiles,
        terminalLogs,
        createProject,
        selectProject,
        updateProject,
        deleteProject,
        selectFile,
        openFile,
        closeFile,
        updateFileContent,
        addAgentChange,
        approveChange,
        rejectChange,
        approveAllChanges,
        rejectAllChanges,
        addTerminalLog,
        clearTerminalLogs,
        getFileByPath,
        getFlatFileList,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
