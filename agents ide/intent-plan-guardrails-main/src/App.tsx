import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WorkforceProvider } from "@/contexts/WorkforceContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { CommandPalette, KeyboardShortcutsDialog } from "@/components/command-palette/CommandPalette";
import { useKeyboardShortcuts, useCommandPaletteEvents } from "@/hooks/useKeyboardShortcuts";

// Pages
import Projects from "@/pages/Projects";
import NewProject from "@/pages/NewProject";
import ProjectWorkspace from "@/pages/ProjectWorkspace";
import AgentMarketplace from "@/pages/AgentMarketplace";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// This component must be inside BrowserRouter
function AppRoutes() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  // Global keyboard shortcuts (now inside Router context)
  useKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onShowShortcuts: () => setShortcutsDialogOpen(true),
  });

  // Listen for events from command palette
  useCommandPaletteEvents({
    onShowShortcuts: () => setShortcutsDialogOpen(true),
  });

  return (
    <>
      <Routes>
        {/* Project-centric routes */}
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/workspace/:projectId" element={<ProjectWorkspace />} />
        <Route path="/marketplace" element={<AgentMarketplace />} />
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onOpenChange={setShortcutsDialogOpen}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delayDuration={0}>
        <WorkforceProvider>
          <ProjectProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ProjectProvider>
        </WorkforceProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
