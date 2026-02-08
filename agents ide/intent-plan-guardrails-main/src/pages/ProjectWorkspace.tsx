import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { WorkspaceAgentPanel } from "@/components/workspace/WorkspaceAgentPanel";
import { WorkspaceCodeEditor } from "@/components/workspace/WorkspaceCodeEditor";
import { WorkspaceAgentBrain } from "@/components/workspace/WorkspaceAgentBrain";
import { WorkspaceTerminal } from "@/components/workspace/WorkspaceTerminal";
import { WorkspaceFileTree } from "@/components/workspace/WorkspaceFileTree";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Settings,
  Github,
  Clock,
  DollarSign,
  Play,
  Pause,
  MoreHorizontal,
  Zap,
  ChevronDown,
  PanelLeftClose,
  PanelRightClose,
  Terminal,
  Command,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyboardShortcuts, useCommandPaletteEvents } from "@/hooks/useKeyboardShortcuts";

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, selectProject, currentProject, updateProject } = useProject();
  const { agents, getRole } = useWorkforce();
  
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  
  // Handle terminal toggle from keyboard shortcut
  useCommandPaletteEvents({
    onToggleTerminal: () => setTerminalExpanded((prev) => !prev),
  });
  
  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
    
    return () => selectProject(null);
  }, [projectId, selectProject]);
  
  if (!currentProject) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist.
          </p>
          <Link to="/projects">
            <Button className="btn-premium">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const assignedAgents = currentProject.assignedAgentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  
  const executingAgents = assignedAgents.filter((a) => a?.status === "executing");
  const isActive = currentProject.status === "active";
  
  const toggleProjectStatus = () => {
    updateProject(currentProject.id, {
      status: isActive ? "paused" : "active",
    });
  };
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header - Premium glass design */}
      <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/projects")}
                className="hover:bg-muted/80"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Back to Projects</TooltipContent>
          </Tooltip>
          
          <div className="h-6 w-px bg-border/50" />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm">{currentProject.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {currentProject.githubUrl && (
                  <>
                    <Github className="w-3 h-3" />
                    <span className="font-mono">
                      {currentProject.githubUrl.replace("https://github.com/", "")}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                  </>
                )}
                <span>{currentProject.branch}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Active Agents Indicator */}
          {executingAgents.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 glow-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-xs text-success font-medium">
                {executingAgents.length} agent{executingAgents.length > 1 ? "s" : ""} working
              </span>
            </div>
          )}
          
          {/* Command Palette Hint */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(currentProject.updatedAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-success font-medium">$12.50</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-border/50" />
          
          {/* Project Controls */}
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={toggleProjectStatus}
            className={cn(
              "gap-2 transition-all",
              isActive && "bg-success hover:bg-success/90 text-success-foreground glow-success"
            )}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Resume
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/80">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Github className="w-4 h-4 mr-2" />
                Sync Repository
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Agents */}
          {!leftPanelCollapsed && (
            <>
              <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
                <WorkspaceAgentPanel />
              </ResizablePanel>
              <ResizableHandle className="panel-resizer w-1 hover:w-1.5 transition-all" />
            </>
          )}
          
          {/* Center: File Tree + Editor */}
          <ResizablePanel defaultSize={leftPanelCollapsed ? 60 : 50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={terminalExpanded ? 50 : 75} minSize={30}>
                <ResizablePanelGroup direction="horizontal">
                  {/* File Tree */}
                  <ResizablePanel defaultSize={22} minSize={15} maxSize={40}>
                    <WorkspaceFileTree />
                  </ResizablePanel>
                  
                  <ResizableHandle className="panel-resizer w-1 hover:w-1.5 transition-all" />
                  
                  {/* Code Editor */}
                  <ResizablePanel defaultSize={78}>
                    <WorkspaceCodeEditor />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              
              <ResizableHandle className="panel-resizer h-1 hover:h-1.5 transition-all" />
              
              {/* Terminal */}
              <ResizablePanel defaultSize={terminalExpanded ? 50 : 25} minSize={10} maxSize={60}>
                <WorkspaceTerminal />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          {/* Right Panel: Agent Brain */}
          {!rightPanelCollapsed && (
            <>
              <ResizableHandle className="panel-resizer w-1 hover:w-1.5 transition-all" />
              <ResizablePanel defaultSize={32} minSize={20} maxSize={40}>
                <WorkspaceAgentBrain />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      
      {/* Bottom Bar - Panel toggles */}
      <div className="h-6 border-t border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              >
                <PanelLeftClose className={cn("w-3 h-3", leftPanelCollapsed && "rotate-180")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle Agent Panel</TooltipContent>
          </Tooltip>
          
          <span className="text-muted-foreground/40">|</span>
          
          <span>{currentProject.files.length} files</span>
          <span className="text-muted-foreground/40">•</span>
          <span>{currentProject.pendingChanges.length} pending changes</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setTerminalExpanded(!terminalExpanded)}
              >
                <Terminal className={cn("w-3 h-3", terminalExpanded && "text-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle Terminal (⌘`)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              >
                <PanelRightClose className={cn("w-3 h-3", rightPanelCollapsed && "rotate-180")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle Agent Brain</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
