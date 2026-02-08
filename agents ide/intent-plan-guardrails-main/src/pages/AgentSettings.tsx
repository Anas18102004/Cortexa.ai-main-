import { useState } from "react";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { useNavigate } from "react-router-dom";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AuthorityBadge, getAuthorityDescription } from "@/components/ui/status-badge";
import { ScopeList, ScopeBadge } from "@/components/ui/scope-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, AlertTriangle, Check, Sparkles } from "lucide-react";
import type { AgentRole, AuthorityLevel, StrictnessLevel } from "@/types/agent";
import { cn } from "@/lib/utils";

export default function AgentSettings() {
  const { agents, roles, getRole, updateAgentAuthority, createAgent, toggleAgentActive } = useWorkforce();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<AgentRole | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for new role extension
  const [customName, setCustomName] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityLevel>("advisor");
  const [strictnessValue, setStrictnessValue] = useState([50]);

  const strictnessLabel: StrictnessLevel = 
    strictnessValue[0] < 33 ? "conservative" :
    strictnessValue[0] < 66 ? "balanced" : "aggressive";

  const handleCreateRole = () => {
    if (!selectedRole) return;

    const newAgent = createAgent({
      roleId: selectedRole.id,
      customName: customName || undefined,
      authority: selectedAuthority,
      strictness: strictnessLabel,
    });

    toast.success(`Agent "${customName || selectedRole.name}" created successfully!`, {
      description: "The agent is now active and ready to receive tasks.",
      action: {
        label: "View Agent",
        onClick: () => navigate(`/agents/${newAgent.id}`),
      },
    });

    setCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomName("");
    setSelectedAuthority("advisor");
    setStrictnessValue([50]);
    setSelectedRole(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1>Agent Settings</h1>
        <p className="text-muted-foreground">
          Configure agents and extend roles with custom guardrails
        </p>
      </div>

      {/* Active Agents Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Agent Configuration</h2>
          <span className="text-sm text-muted-foreground">
            {agents.filter(a => a.isActive).length} active
          </span>
        </div>
        
        <div className="grid gap-4">
          {agents.map((agent) => {
            const role = getRole(agent.roleId);
            if (!role) return null;
            
            return (
              <div
                key={agent.id}
                className={cn(
                  "p-4 rounded-lg border bg-card transition-all",
                  agent.isActive ? "border-border" : "border-border/50 opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-all",
                      role.color,
                      agent.status === "executing" && "glow-success"
                    )}>
                      <DynamicIcon name={role.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{agent.customName || role.name}</h4>
                      <p className="text-sm text-muted-foreground">{role.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Authority Selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Authority:</Label>
                      <Select
                        value={agent.authority}
                        onValueChange={(value: AuthorityLevel) =>
                          updateAgentAuthority(agent.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="observer">Observer</SelectItem>
                          <SelectItem value="advisor">Advisor</SelectItem>
                          <SelectItem value="executor">Executor</SelectItem>
                          <SelectItem value="autonomous">Autonomous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Active:</Label>
                      <Switch 
                        checked={agent.isActive} 
                        onCheckedChange={() => toggleAgentActive(agent.id)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <ScopeList scopes={agent.scope} />
                    <span className="text-xs text-muted-foreground">
                      {getAuthorityDescription(agent.authority)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Extend Role */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Extend Role
            </h2>
            <p className="text-sm text-muted-foreground">
              Create a new agent by extending a built-in role
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Dialog
              key={role.id}
              open={createDialogOpen && selectedRole?.id === role.id}
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (open) setSelectedRole(role);
                else resetForm();
              }}
            >
              <DialogTrigger asChild>
                <button
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-all text-left group card-hover"
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-all group-hover:scale-105",
                      role.color
                    )}>
                      <DynamicIcon name={role.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{role.name}</h4>
                      <p className="text-xs text-muted-foreground">Built-in</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" />
                    Extend this role
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", role.color)}>
                      <DynamicIcon name={role.icon} className="w-4 h-4" />
                    </div>
                    Extend {role.name}
                  </DialogTitle>
                  <DialogDescription>
                    Create a customized agent based on the {role.name} role
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Custom Name */}
                  <div className="space-y-2">
                    <Label>Custom Name (optional)</Label>
                    <Input
                      placeholder={`e.g., ${role.name} - Project X`}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>

                  {/* Authority Level */}
                  <div className="space-y-3">
                    <Label>Authority Level</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["observer", "advisor", "executor", "autonomous"] as AuthorityLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedAuthority(level)}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            selectedAuthority === level
                              ? "border-primary bg-accent"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{level}</span>
                            {selectedAuthority === level && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getAuthorityDescription(level)}
                          </p>
                        </button>
                      ))}
                    </div>
                    {selectedAuthority === "autonomous" && (
                      <div className="flex items-start gap-2 p-3 rounded bg-warning/10 text-warning text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Autonomous agents can execute without approval. Use with caution.</p>
                      </div>
                    )}
                  </div>

                  {/* Strictness */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Strictness</Label>
                      <span className="text-sm text-muted-foreground capitalize">{strictnessLabel}</span>
                    </div>
                    <Slider
                      value={strictnessValue}
                      onValueChange={setStrictnessValue}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      {strictnessLabel === "conservative"
                        ? "Prioritizes safety and minimal changes"
                        : strictnessLabel === "balanced"
                        ? "Balances efficiency with safety"
                        : "Prioritizes speed and comprehensive changes"}
                    </p>
                  </div>

                  {/* Scope Preview */}
                  <div className="space-y-2">
                    <Label>Default Scope</Label>
                    <div className="flex flex-wrap gap-1">
                      {role.defaultScope.map((scope) => (
                        <ScopeBadge key={scope} scope={scope} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scope can be adjusted after creation
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} className="glow-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}
