import { cn } from "@/lib/utils";
import type { AgentScope } from "@/types/agent";
import {
  Layout,
  Server,
  Layers,
  Database,
  Shield,
  TestTube,
  Cloud,
  FolderOpen,
} from "lucide-react";

interface ScopeBadgeProps {
  scope: AgentScope;
  className?: string;
  showIcon?: boolean;
}

const scopeConfig: Record<
  AgentScope,
  { label: string; icon: typeof Layout; colorClass: string }
> = {
  frontend: {
    label: "Frontend",
    icon: Layout,
    colorClass: "text-blue-500",
  },
  backend: {
    label: "Backend",
    icon: Server,
    colorClass: "text-emerald-500",
  },
  fullstack: {
    label: "Full Stack",
    icon: Layers,
    colorClass: "text-violet-500",
  },
  database: {
    label: "Database",
    icon: Database,
    colorClass: "text-amber-500",
  },
  security: {
    label: "Security",
    icon: Shield,
    colorClass: "text-red-500",
  },
  testing: {
    label: "Testing",
    icon: TestTube,
    colorClass: "text-cyan-500",
  },
  infrastructure: {
    label: "Infrastructure",
    icon: Cloud,
    colorClass: "text-orange-500",
  },
  "repo-wide": {
    label: "Repo-wide",
    icon: FolderOpen,
    colorClass: "text-slate-500",
  },
};

export function ScopeBadge({ scope, className, showIcon = true }: ScopeBadgeProps) {
  const config = scopeConfig[scope];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-muted",
        config.colorClass,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </span>
  );
}

interface ScopeListProps {
  scopes: AgentScope[];
  className?: string;
  maxVisible?: number;
}

export function ScopeList({ scopes, className, maxVisible = 3 }: ScopeListProps) {
  const visible = scopes.slice(0, maxVisible);
  const remaining = scopes.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((scope) => (
        <ScopeBadge key={scope} scope={scope} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
