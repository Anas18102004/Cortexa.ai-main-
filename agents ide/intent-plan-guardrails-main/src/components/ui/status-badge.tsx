import { cn } from "@/lib/utils";
import type { AgentStatus, AuthorityLevel } from "@/types/agent";

interface StatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const statusConfig: Record<
  AgentStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  idle: {
    label: "Idle",
    dotClass: "bg-status-idle",
    textClass: "text-muted-foreground",
  },
  planning: {
    label: "Planning",
    dotClass: "bg-status-planning animate-pulse-subtle",
    textClass: "text-primary",
  },
  awaiting_approval: {
    label: "Awaiting Approval",
    dotClass: "bg-status-awaiting animate-pulse-subtle",
    textClass: "text-warning",
  },
  executing: {
    label: "Executing",
    dotClass: "bg-status-executing animate-pulse-subtle",
    textClass: "text-success",
  },
  paused: {
    label: "Paused",
    dotClass: "bg-status-awaiting",
    textClass: "text-warning",
  },
  error: {
    label: "Error",
    dotClass: "bg-status-error",
    textClass: "text-destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-xs font-medium",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      <span className={config.textClass}>{config.label}</span>
    </div>
  );
}

interface AuthorityBadgeProps {
  authority: AuthorityLevel;
  className?: string;
}

const authorityConfig: Record<
  AuthorityLevel,
  { label: string; bgClass: string; textClass: string; description: string }
> = {
  observer: {
    label: "Observer",
    bgClass: "bg-muted",
    textClass: "text-authority-observer",
    description: "Can analyze and report, no modifications",
  },
  advisor: {
    label: "Advisor",
    bgClass: "bg-info/10",
    textClass: "text-authority-advisor",
    description: "Can suggest changes, requires approval",
  },
  executor: {
    label: "Executor",
    bgClass: "bg-warning/10",
    textClass: "text-authority-executor",
    description: "Can execute approved plans",
  },
  autonomous: {
    label: "Autonomous",
    bgClass: "bg-success/10",
    textClass: "text-authority-autonomous",
    description: "Can execute without approval",
  },
};

export function AuthorityBadge({ authority, className }: AuthorityBadgeProps) {
  const config = authorityConfig[authority];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function getAuthorityDescription(authority: AuthorityLevel): string {
  return authorityConfig[authority].description;
}
