import { Link } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Zap, 
  TrendingUp, 
  Activity, 
  Bot, 
  Sparkles,
  ArrowRight,
  Command,
  Keyboard,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Projects() {
  const { projects } = useProject();
  const { agents, executions } = useWorkforce();
  
  const activeProjects = projects.filter((p) => p.status === "active");
  const executingAgents = agents.filter((a) => a.status === "executing");
  const runningExecutions = executions.filter((e) => e.status === "running");
  const totalAgents = agents.filter((a) => a.isActive).length;
  
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />
      
      {/* Hero Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg glow-primary">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-card flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold tracking-tight">AI Workforce</h1>
                <p className="text-sm text-muted-foreground">Intelligent agents at your command</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground">
                <Command className="w-3.5 h-3.5" />
                <span>K</span>
                <span className="text-muted-foreground/50">to search</span>
              </div>
              
              <Link to="/marketplace">
                <Button variant="outline" size="sm" className="gap-2 btn-ghost-premium">
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Marketplace</span>
                </Button>
              </Link>
              
              <Link to="/projects/new">
                <Button size="sm" className="gap-2 btn-premium">
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <section className="mb-10 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Active Projects"
              value={activeProjects.length}
              subtext={`${projects.length} total`}
              color="text-primary"
              glowColor="primary"
            />
            <StatCard
              icon={<Bot className="w-5 h-5" />}
              label="AI Agents"
              value={totalAgents}
              subtext={`${executingAgents.length} working`}
              color="text-success"
              glowColor="success"
              highlight={executingAgents.length > 0}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Executions"
              value={runningExecutions.length}
              subtext="in progress"
              color="text-info"
              glowColor="info"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="Tasks Complete"
              value={executions.filter((e) => e.status === "completed").length}
              subtext="this month"
              color="text-warning"
              glowColor="warning"
            />
          </div>
        </section>
        
        {/* Projects Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight">Your Projects</h2>
              <p className="text-muted-foreground mt-1">
                {activeProjects.length} active, {projects.length - activeProjects.length} paused or completed
              </p>
            </div>
          </div>
          
          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              {/* Add Project Card */}
              <Link
                to="/projects/new"
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-all duration-300 min-h-[280px] card-interactive"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Create New Project
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Start with AI agents
                  </p>
                </div>
              </Link>
            </div>
          )}
        </section>
        
        {/* Quick Tips */}
        <section className="mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Pro Tips</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">⌘K</kbd>
                    <span>Open command palette for quick navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">G</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">P</kbd>
                    <span>Go to projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">⌘/</kbd>
                    <span>View all keyboard shortcuts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext: string;
  color: string;
  glowColor: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, subtext, color, glowColor, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "relative p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:border-border card-hover overflow-hidden",
      highlight && "border-success/30"
    )}>
      {/* Subtle gradient background */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        glowColor === "primary" && "bg-gradient-to-br from-primary to-transparent",
        glowColor === "success" && "bg-gradient-to-br from-success to-transparent",
        glowColor === "info" && "bg-gradient-to-br from-info to-transparent",
        glowColor === "warning" && "bg-gradient-to-br from-warning to-transparent"
      )} />
      
      <div className="relative">
        <div className={cn("mb-3", color)}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/60">{subtext}</p>
        </div>
        
        {highlight && (
          <div className="absolute top-0 right-0">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
        <Zap className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-display font-semibold mb-2">Start Your First Project</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create a new project and assign AI agents to help you build amazing things.
      </p>
      <Link to="/projects/new">
        <Button size="lg" className="gap-2 btn-premium">
          <Plus className="w-5 h-5" />
          Create Project
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
