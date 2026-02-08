import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkforce } from "@/contexts/WorkforceContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  FolderOpen,
  FileCode,
  Bot,
  Play,
  Pause,
  Settings,
  Plus,
  Search,
  Sun,
  Moon,
  Home,
  LayoutDashboard,
  Terminal,
  GitBranch,
  Keyboard,
  ArrowRight,
  Store,
  Zap,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/types/project";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandCategory = "navigation" | "files" | "agents" | "actions" | "theme";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: CommandCategory;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { currentProject, projects, selectProject, openFile, getFlatFileList, approveAllChanges, rejectAllChanges } = useProject();
  const { agents, roles } = useWorkforce();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Get flat file list for current project
  const allFiles = useMemo(() => {
    if (!currentProject) return [];
    return getFlatFileList(currentProject.files);
  }, [currentProject, getFlatFileList]);

  // Build command items
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // Navigation commands
    items.push(
      {
        id: "nav-projects",
        label: "Go to Projects",
        description: "View all your projects",
        icon: <Home className="w-4 h-4" />,
        category: "navigation",
        shortcut: "G P",
        action: () => {
          navigate("/projects");
          onOpenChange(false);
        },
        keywords: ["home", "dashboard", "projects"],
      },
      {
        id: "nav-new-project",
        label: "Create New Project",
        description: "Start a new AI-powered project",
        icon: <Plus className="w-4 h-4" />,
        category: "navigation",
        shortcut: "G N",
        action: () => {
          navigate("/projects/new");
          onOpenChange(false);
        },
        keywords: ["new", "create", "add"],
      },
      {
        id: "nav-marketplace",
        label: "Agent Marketplace",
        description: "Browse and add agents",
        icon: <Store className="w-4 h-4" />,
        category: "navigation",
        shortcut: "G M",
        action: () => {
          navigate("/marketplace");
          onOpenChange(false);
        },
        keywords: ["store", "agents", "buy", "marketplace"],
      }
    );

    // Project commands
    for (const project of projects) {
      items.push({
        id: `project-${project.id}`,
        label: `Open ${project.name}`,
        description: project.description.slice(0, 50) + "...",
        icon: <FolderOpen className="w-4 h-4" />,
        category: "navigation",
        action: () => {
          selectProject(project.id);
          navigate(`/workspace/${project.id}`);
          onOpenChange(false);
        },
        keywords: ["project", project.name.toLowerCase()],
      });
    }

    // File commands (if in project workspace)
    if (currentProject) {
      for (const file of allFiles.slice(0, 20)) {
        items.push({
          id: `file-${file.id}`,
          label: file.name,
          description: file.path,
          icon: <FileCode className="w-4 h-4" />,
          category: "files",
          action: () => {
            openFile(file);
            onOpenChange(false);
          },
          keywords: ["file", file.name.toLowerCase(), file.path.toLowerCase()],
        });
      }

      // Pending changes actions
      if (currentProject.pendingChanges.length > 0) {
        items.push(
          {
            id: "action-approve-all",
            label: "Approve All Changes",
            description: `Accept ${currentProject.pendingChanges.length} pending changes`,
            icon: <CheckCircle className="w-4 h-4 text-success" />,
            category: "actions",
            shortcut: "⌘ ⏎",
            action: () => {
              approveAllChanges();
              onOpenChange(false);
            },
            keywords: ["approve", "accept", "changes"],
          },
          {
            id: "action-reject-all",
            label: "Reject All Changes",
            description: `Reject ${currentProject.pendingChanges.length} pending changes`,
            icon: <XCircle className="w-4 h-4 text-destructive" />,
            category: "actions",
            shortcut: "⌘ ⌫",
            action: () => {
              rejectAllChanges();
              onOpenChange(false);
            },
            keywords: ["reject", "deny", "changes"],
          }
        );
      }
    }

    // Agent commands
    for (const agent of agents.slice(0, 10)) {
      const role = roles.find((r) => r.id === agent.roleId);
      items.push({
        id: `agent-${agent.id}`,
        label: agent.customName || role?.name || "Agent",
        description: `${agent.status} • ${role?.name}`,
        icon: <Bot className="w-4 h-4" />,
        category: "agents",
        action: () => {
          navigate(`/agents/${agent.id}`);
          onOpenChange(false);
        },
        keywords: ["agent", agent.customName?.toLowerCase() || "", role?.name.toLowerCase() || ""],
      });
    }

    // Theme commands
    items.push(
      {
        id: "theme-dark",
        label: "Switch to Dark Theme",
        icon: <Moon className="w-4 h-4" />,
        category: "theme",
        action: () => {
          setTheme("dark");
          onOpenChange(false);
        },
        keywords: ["dark", "theme", "mode"],
      },
      {
        id: "theme-light",
        label: "Switch to Light Theme",
        icon: <Sun className="w-4 h-4" />,
        category: "theme",
        action: () => {
          setTheme("light");
          onOpenChange(false);
        },
        keywords: ["light", "theme", "mode"],
      }
    );

    // Action commands
    items.push(
      {
        id: "action-toggle-terminal",
        label: "Toggle Terminal",
        description: "Show or hide the terminal panel",
        icon: <Terminal className="w-4 h-4" />,
        category: "actions",
        shortcut: "⌘ `",
        action: () => {
          // Will dispatch event to toggle terminal
          window.dispatchEvent(new CustomEvent("toggle-terminal"));
          onOpenChange(false);
        },
        keywords: ["terminal", "console", "logs"],
      },
      {
        id: "action-keyboard-shortcuts",
        label: "Keyboard Shortcuts",
        description: "View all available shortcuts",
        icon: <Keyboard className="w-4 h-4" />,
        category: "actions",
        shortcut: "⌘ /",
        action: () => {
          window.dispatchEvent(new CustomEvent("show-shortcuts"));
          onOpenChange(false);
        },
        keywords: ["keyboard", "shortcuts", "help"],
      }
    );

    return items;
  }, [
    navigate,
    onOpenChange,
    projects,
    currentProject,
    allFiles,
    agents,
    roles,
    selectProject,
    openFile,
    approveAllChanges,
    rejectAllChanges,
    setTheme,
  ]);

  // Filter commands by search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter((cmd) => {
      const matchesLabel = cmd.label.toLowerCase().includes(searchLower);
      const matchesDescription = cmd.description?.toLowerCase().includes(searchLower);
      const matchesKeywords = cmd.keywords?.some((k) => k.includes(searchLower));
      return matchesLabel || matchesDescription || matchesKeywords;
    });
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      navigation: [],
      files: [],
      agents: [],
      actions: [],
      theme: [],
    };

    for (const cmd of filteredCommands) {
      groups[cmd.category].push(cmd);
    }

    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<CommandCategory, string> = {
    navigation: "Navigation",
    files: "Files",
    agents: "Agents",
    actions: "Actions",
    theme: "Theme",
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3 gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <CommandInput
            ref={inputRef}
            placeholder="Search commands, files, agents..."
            value={search}
            onValueChange={setSearch}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            esc
          </kbd>
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto py-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>

          {Object.entries(groupedCommands).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <CommandGroup key={category} heading={categoryLabels[category as CommandCategory]}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={item.action}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.shortcut && (
                      <CommandShortcut className="text-xs">
                        {item.shortcut}
                      </CommandShortcut>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-aria-selected:opacity-100" />
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>AI Workforce</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}

// Keyboard shortcuts help dialog
export function KeyboardShortcutsDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const shortcuts = [
    { category: "General", items: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
      { keys: ["⌘", "`"], description: "Toggle terminal" },
      { keys: ["⌘", "S"], description: "Save current file" },
    ]},
    { category: "Navigation", items: [
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "N"], description: "New Project" },
      { keys: ["G", "M"], description: "Agent Marketplace" },
      { keys: ["⌘", "P"], description: "Quick file open" },
    ]},
    { category: "Editor", items: [
      { keys: ["⌘", "F"], description: "Find in file" },
      { keys: ["⌘", "⇧", "F"], description: "Find in project" },
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⌘", "⇧", "Z"], description: "Redo" },
    ]},
    { category: "Agent Actions", items: [
      { keys: ["⌘", "⏎"], description: "Approve all changes" },
      { keys: ["⌘", "⌫"], description: "Reject all changes" },
      { keys: ["⌘", "⇧", "A"], description: "Start agent execution" },
      { keys: ["⌘", "⇧", "P"], description: "Pause agent" },
    ]},
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Master your workflow with these keyboard shortcuts
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {shortcuts.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.items.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 rounded bg-background border text-xs font-mono"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">⌘ K</kbd> to open the command palette
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
