import { forwardRef } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@/types/project";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Github, 
  Clock, 
  ChevronRight, 
  Play, 
  Pause,
  Settings,
  MoreHorizontal,
  Zap,
  Bot,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project }, ref) => {
    const { agents, getRole } = useWorkforce();
    
    const assignedAgents = project.assignedAgentIds
      .map((id) => agents.find((a) => a.id === id))
      .filter(Boolean);
    
    const executingAgents = assignedAgents.filter((a) => a?.status === "executing");
    const isActive = project.status === "active";
    
    const statusConfig = {
      setup: { label: "Setup", color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" },
      active: { label: "Active", color: "text-success", bg: "bg-success/10", dot: "bg-success" },
      paused: { label: "Paused", color: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
      completed: { label: "Completed", color: "text-primary", bg: "bg-primary/10", dot: "bg-primary" },
    };
    
    const status = statusConfig[project.status];
    
    return (
      <div
        ref={ref}
        className={cn(
          "group relative p-6 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300 card-interactive overflow-hidden",
          isActive && "border-success/20 hover:border-success/40",
          !isActive && "border-border/50 hover:border-primary/30"
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/workspace/${project.id}`}
              className="block"
            >
              <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="w-4 h-4 mr-2" />
                Pause Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* GitHub Repository */}
        {project.githubUrl && (
          <div className="relative flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2.5 rounded-xl bg-muted/30 border border-border/30">
            <Github className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-mono">
              {project.githubUrl.replace("https://github.com/", "")}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex-shrink-0">{project.branch}</span>
          </div>
        )}
        
        {/* Tech Stack Pills */}
        <div className="relative flex flex-wrap gap-1.5 mb-4">
          {[...project.frontendStack, ...project.backendStack].slice(0, 4).map((tech) => (
            <span
              key={tech.id}
              className={cn(
                "px-2 py-0.5 rounded-lg text-xs font-medium bg-muted/50 border border-border/30",
                tech.color
              )}
            >
              {tech.icon} {tech.name}
            </span>
          ))}
          {project.frontendStack.length + project.backendStack.length > 4 && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-muted/50 border border-border/30 text-muted-foreground">
              +{project.frontendStack.length + project.backendStack.length - 4}
            </span>
          )}
        </div>
        
        {/* Progress */}
        {isActive && (
          <div className="relative mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-success">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-muted/50" />
          </div>
        )}
        
        {/* Agents */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {assignedAgents.slice(0, 4).map((agent) => {
                if (!agent) return null;
                const role = getRole(agent.roleId);
                const isExecuting = agent.status === "executing";
                
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium bg-muted transition-all",
                      isExecuting && "ring-2 ring-success ring-offset-1 ring-offset-card"
                    )}
                    title={agent.customName || role?.name}
                  >
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                );
              })}
              {assignedAgents.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium bg-muted">
                  +{assignedAgents.length - 4}
                </div>
              )}
            </div>
            
            {executingAgents.length > 0 && (
              <span className="text-xs text-success flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                {executingAgents.length} active
              </span>
            )}
          </div>
          
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            status.bg, status.color
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
          </div>
          
          <Link to={`/workspace/${project.id}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {isActive ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Open
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
