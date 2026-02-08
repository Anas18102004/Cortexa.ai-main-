import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TechStackSelector } from "@/components/projects/TechStackSelector";
import { AgentRecommendation } from "@/components/projects/AgentRecommendation";
import {
  frontendTechStacks,
  backendTechStacks,
  toolsTechStacks,
  type TechStack,
} from "@/types/project";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Github,
  Sparkles,
  FolderOpen,
  Code,
  Users,
  Rocket,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, name: "Project Details", icon: FolderOpen },
  { id: 2, name: "Connect Repository", icon: Github },
  { id: 3, name: "Tech Stack", icon: Code },
  { id: 4, name: "Assign Agents", icon: Users },
  { id: 5, name: "Launch", icon: Rocket },
];

export default function NewProject() {
  const navigate = useNavigate();
  const { createProject } = useProject();
  const { agents, roles } = useWorkforce();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState<string[]>([""]);
  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [frontendStack, setFrontendStack] = useState<TechStack[]>([]);
  const [backendStack, setBackendStack] = useState<TechStack[]>([]);
  const [toolsStack, setToolsStack] = useState<TechStack[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  
  const progress = (currentStep / STEPS.length) * 100;
  
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.trim().length > 0 && description.trim().length > 0;
      case 2:
        return true; // GitHub is optional
      case 3:
        return frontendStack.length > 0 || backendStack.length > 0;
      case 4:
        return selectedAgentIds.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/projects");
    }
  };
  
  const handleLaunch = () => {
    const project = createProject({
      name,
      description,
      goals: goals.filter(Boolean),
      githubUrl: githubUrl || undefined,
      branch,
      frontendStack,
      backendStack,
      toolsStack,
      assignedAgentIds: selectedAgentIds,
    });
    
    toast({
      title: "Project Created!",
      description: `${name} is now ready. Opening workspace...`,
    });
    
    navigate(`/workspace/${project.id}`);
  };
  
  const addGoal = () => setGoals([...goals, ""]);
  const updateGoal = (index: number, value: string) => {
    const updated = [...goals];
    updated[index] = value;
    setGoals(updated);
  };
  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Create New Project</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                </p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={() => navigate("/projects")}>
              Cancel
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>
      
      {/* Step Indicators */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                      isCompleted && "cursor-pointer hover:bg-muted",
                      isCurrent && "bg-primary/10 text-primary",
                      !isCurrent && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      isCompleted && "bg-success text-success-foreground",
                      isCurrent && "bg-primary text-primary-foreground",
                      !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{step.name}</span>
                  </button>
                  
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-2",
                      currentStep > step.id ? "bg-success" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Project Details</h2>
                <p className="text-muted-foreground">
                  Tell us about your project so we can recommend the right agents.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., E-Commerce Platform"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What are you building? Describe your project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="space-y-2">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Goal ${index + 1}...`}
                          value={goal}
                          onChange={(e) => updateGoal(index, e.target.value)}
                        />
                        {goals.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGoal(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addGoal} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Goal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Connect Repository */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect Repository</h2>
                <p className="text-muted-foreground">
                  Connect your GitHub repository to let agents work on your codebase.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-dashed border-border bg-card/50 text-center">
                <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Connect to GitHub</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Authorize GitHub to import your repository
                </p>
                <Button variant="outline" className="gap-2">
                  <Github className="w-4 h-4" />
                  Connect GitHub Account
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github-url">Repository URL</Label>
                  <Input
                    id="github-url"
                    placeholder="https://github.com/username/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                You can skip this step and add a repository later.
              </p>
            </div>
          )}
          
          {/* Step 3: Tech Stack */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tech Stack</h2>
                <p className="text-muted-foreground">
                  Select the technologies your project uses.
                </p>
              </div>
              
              <TechStackSelector
                label="Frontend"
                options={frontendTechStacks}
                selected={frontendStack}
                onSelect={setFrontendStack}
              />
              
              <TechStackSelector
                label="Backend"
                options={backendTechStacks}
                selected={backendStack}
                onSelect={setBackendStack}
              />
              
              <TechStackSelector
                label="Tools & Testing"
                options={toolsTechStacks}
                selected={toolsStack}
                onSelect={setToolsStack}
              />
            </div>
          )}
          
          {/* Step 4: Assign Agents */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Assign Agents</h2>
                <p className="text-muted-foreground">
                  Based on your tech stack, we recommend these agents for your project.
                </p>
              </div>
              
              <AgentRecommendation
                frontendStack={frontendStack}
                backendStack={backendStack}
                toolsStack={toolsStack}
                selectedAgentIds={selectedAgentIds}
                onSelectAgent={(id) => {
                  setSelectedAgentIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((i) => i !== id)
                      : [...prev, id]
                  );
                }}
              />
            </div>
          )}
          
          {/* Step 5: Launch */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to Launch!</h2>
                <p className="text-muted-foreground">
                  Review your project setup and launch when ready.
                </p>
              </div>
              
              {/* Summary */}
              <div className="space-y-4 p-6 rounded-xl border bg-card">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Project Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                
                {githubUrl && (
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Repository</span>
                    <span className="font-mono text-sm">{githubUrl.replace("https://github.com/", "")}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Tech Stack</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {[...frontendStack, ...backendStack, ...toolsStack].slice(0, 4).map((tech) => (
                      <span key={tech.id} className="px-2 py-0.5 rounded-full text-xs bg-muted">
                        {tech.icon} {tech.name}
                      </span>
                    ))}
                    {frontendStack.length + backendStack.length + toolsStack.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted">
                        +{frontendStack.length + backendStack.length + toolsStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Agents</span>
                  <span className="font-medium">{selectedAgentIds.length} assigned</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Goals</span>
                  <span className="font-medium">{goals.filter(Boolean).length} defined</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <p className="text-sm text-success text-center">
                  🎉 Your project is ready! Click "Launch Project" to open your workspace and start working with AI agents.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Actions */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleLaunch}
                className="gap-2 bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/20"
              >
                <Rocket className="w-4 h-4" />
                Launch Project
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
