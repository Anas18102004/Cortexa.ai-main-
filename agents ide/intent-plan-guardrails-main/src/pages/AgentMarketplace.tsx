import { useWorkforce } from "@/contexts/WorkforceContext";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { AuthorityBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { ShoppingCart, Plus, Check, Sparkles, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AgentMarketplace() {
  const { roles, createAgent } = useWorkforce();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAddAgent = (roleId: string) => {
    createAgent({
      roleId,
      authority: "advisor",
      strictness: "balanced",
    });
    
    toast({
      title: "Agent Added!",
      description: "New agent has been added to your workforce.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Agent Marketplace</h1>
                <p className="text-sm text-muted-foreground">Add new agents to your workforce</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Featured */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Available Agents</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center bg-muted",
                    role.color
                  )}>
                    <DynamicIcon name={role.icon} className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{role.name}</h3>
                    <AuthorityBadge authority={role.defaultAuthority} />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {role.description}
                </p>
                
                {/* Capabilities */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Capabilities
                  </h4>
                  <div className="space-y-1">
                    {role.baseCapabilities.slice(0, 3).map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 text-success" />
                        <span>{cap}</span>
                      </div>
                    ))}
                    {role.baseCapabilities.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{role.baseCapabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Default Scope */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {role.defaultScope.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-bold">$0.50</span>
                    <span className="text-xs text-muted-foreground">/hour</span>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => handleAddAgent(role.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Add to Workforce
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
