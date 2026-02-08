import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Activity, 
  Layers, 
  Target, 
  Brain, 
  BookOpen,
  Menu,
  X,
  Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useSignals } from "@/hooks/useSignals";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Work State", icon: Activity },
  { path: "/signals", label: "Signal Pool", icon: Layers },
  { path: "/missions", label: "Missions", icon: Target },
  { path: "/intelligence", label: "Intelligence", icon: Brain },
  { path: "/ledger", label: "Decision Ledger", icon: BookOpen },
];

export function Navigation() {
  const location = useLocation();
  const { pendingVerification, stats } = useSignals();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex h-20 items-center gap-4 border-b border-sidebar-border px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-cyan shadow-medium">
            <Hexagon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">CORTEXA</h1>
            <p className="text-xs text-muted-foreground font-medium">Work Intelligence</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showBadge = item.path === "/signals" && pendingVerification.length > 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-gradient-to-r from-teal/10 to-cyan/10 text-teal shadow-low"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive && "text-teal")} />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-amber-foreground">
                      {pendingVerification.length}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="border-t border-sidebar-border p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-teal/5 to-cyan/5 border border-teal/10 p-3 text-center">
              <p className="text-xl font-bold text-teal">{stats.verified}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-error/5 to-amber/5 border border-error/10 p-3 text-center">
              <p className="text-xl font-bold text-error">{stats.criticalCount + stats.highCount}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Priority</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="border-t border-sidebar-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-cyan shadow-low">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight">CORTEXA</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 border-b border-border bg-background p-4 shadow-high">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const showBadge = item.path === "/signals" && pendingVerification.length > 0;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-gradient-to-r from-teal/10 to-cyan/10 text-teal"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-amber-foreground">
                        {pendingVerification.length}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
