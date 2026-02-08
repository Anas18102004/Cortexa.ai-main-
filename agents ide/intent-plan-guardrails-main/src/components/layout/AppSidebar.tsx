import { useLocation, Link } from "react-router-dom";
import {
  Users,
  Bot,
  Play,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useWorkforce } from "@/contexts/WorkforceContext";

const navItems = [
  {
    title: "Workforce",
    href: "/",
    icon: Users,
    description: "Overview of all agents",
  },
  {
    title: "Active Agents",
    href: "/agents",
    icon: Bot,
    description: "Manage agent assignments",
  },
  {
    title: "Executions",
    href: "/executions",
    icon: Play,
    description: "Monitor running tasks",
  },
  {
    title: "Audit Log",
    href: "/audit",
    icon: FileText,
    description: "Review all actions",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Agent configuration",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { agents, executions } = useWorkforce();

  const executingCount = agents.filter((a) => a.status === "executing").length;
  const runningExecutions = executions.filter((e) => e.status === "running").length;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">AI Workforce</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Live Status Indicator */}
      {(executingCount > 0 || runningExecutions > 0) && (
        <div className={cn(
          "mx-2 mt-2 p-2 rounded-lg bg-success/10 border border-success/20",
          collapsed && "px-0 flex justify-center"
        )}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {!collapsed && (
              <span className="text-xs text-success">
                {executingCount} agent{executingCount !== 1 ? "s" : ""} executing
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-muted"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm">{item.title}</span>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Theme Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {!collapsed && (
                <span className="text-sm">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </TooltipContent>
          )}
        </Tooltip>

        {/* Collapse Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
              {!collapsed && <span className="text-sm">Collapse</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
