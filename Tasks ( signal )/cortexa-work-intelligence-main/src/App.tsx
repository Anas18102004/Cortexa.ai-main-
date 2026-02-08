import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WorkProvider } from "@/contexts/WorkContext";

// Pages
import WorkState from "./pages/WorkState";
import SignalPool from "./pages/SignalPool";
import MissionView from "./pages/MissionView";
import IntelligencePanel from "./pages/IntelligencePanel";
import DecisionLedger from "./pages/DecisionLedger";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WorkProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WorkState />} />
              <Route path="/signals" element={<SignalPool />} />
              <Route path="/missions" element={<MissionView />} />
              <Route path="/intelligence" element={<IntelligencePanel />} />
              <Route path="/ledger" element={<DecisionLedger />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;