import type { Agent, AgentRole } from "@/types/agent";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { StatusBadge, AuthorityBadge, getAuthorityDescription } from "@/components/ui/status-badge";
import { ScopeList } from "@/components/ui/scope-badge";
import { CostMeter } from "@/components/ui/cost-indicator";
import { cn } from "@/lib/utils";
import { Shield, FileCode, Lock, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AgentContextPanelProps {
  agent: Agent;
  role: AgentRole;
}

export function AgentContextPanel({ agent, role }: AgentContextPanelProps) {
  return (
    <aside className="h-full border-r border-border bg-card overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Agent Identity */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-lg bg-muted flex items-center justify-center",
              role.color
            )}
          >
            <DynamicIcon name={role.icon} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium">{agent.customName || role.name}</h3>
            <p className="text-sm text-muted-foreground">{role.name}</p>
          </div>
        </div>

        <StatusBadge status={agent.status} />

        <Separator />

        {/* Role Description */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Role Description
          </h4>
          <p className="text-sm">{role.description}</p>
        </div>

        {/* Authority Level */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Authority Level
          </h4>
          <div className="space-y-2">
            <AuthorityBadge authority={agent.authority} />
            <p className="text-xs text-muted-foreground">
              {getAuthorityDescription(agent.authority)}
            </p>
          </div>
        </div>

        {/* Scope Boundaries */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Allowed Scope
          </h4>
          <ScopeList scopes={agent.scope} maxVisible={5} />
        </div>

        <Separator />

        {/* Cost Meter */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Budget Usage
          </h4>
          <CostMeter current={agent.totalCostThisMonth} limit={10000} />
        </div>

        {/* Execution Limits */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Execution Limits
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concurrent tasks</span>
              <span className="font-medium">{agent.maxConcurrentTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Strictness</span>
              <span className="font-medium capitalize">{agent.strictness}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-approve</span>
              <span className="font-medium">{agent.autoApprove ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Safety Constraints */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Safety Constraints
          </h4>
          
          {/* Locked Capabilities */}
          {agent.lockedCapabilities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Locked capabilities</p>
              <div className="space-y-1">
                {agent.lockedCapabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allowed Files */}
          {agent.allowedFilePatterns.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Allowed file patterns</p>
              <div className="space-y-1">
                {agent.allowedFilePatterns.map((pattern) => (
                  <div
                    key={pattern}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs font-mono"
                  >
                    <FileCode className="w-3 h-3 text-success" />
                    <span>{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked Files */}
          {agent.blockedFilePatterns.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Blocked file patterns</p>
              <div className="space-y-1">
                {agent.blockedFilePatterns.map((pattern) => (
                  <div
                    key={pattern}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-destructive/10 text-xs font-mono"
                  >
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    <span>{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
