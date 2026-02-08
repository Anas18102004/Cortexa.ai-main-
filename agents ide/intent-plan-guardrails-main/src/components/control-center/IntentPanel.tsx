import { useState } from "react";
import type { Agent, Intent } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Send, Lock, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentPanelProps {
  agent: Agent;
  currentIntent?: Intent;
}

export function IntentPanel({ agent, currentIntent }: IntentPanelProps) {
  const [intentTitle, setIntentTitle] = useState("");
  const [intentDescription, setIntentDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [constraints, setConstraints] = useState<string[]>([""]);

  const hasActiveIntent = currentIntent && 
    ["submitted", "planning", "approved", "executing"].includes(currentIntent.status);

  const addRequirement = () => setRequirements([...requirements, ""]);
  const addConstraint = () => setConstraints([...constraints, ""]);

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const updateConstraint = (index: number, value: string) => {
    const updated = [...constraints];
    updated[index] = value;
    setConstraints(updated);
  };

  const handleSubmit = () => {
    // In a real implementation, this would create the intent
    console.log("Submitting intent:", {
      title: intentTitle,
      description: intentDescription,
      requirements: requirements.filter(Boolean),
      constraints: constraints.filter(Boolean),
    });
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Intent Lock Banner (when active) */}
      {hasActiveIntent && currentIntent && (
        <div className="px-6 py-4 bg-accent border-b border-border">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">Active Intent</h4>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  currentIntent.status === "executing" ? "bg-success/10 text-success" :
                  currentIntent.status === "planning" ? "bg-primary/10 text-primary" :
                  "bg-warning/10 text-warning"
                )}>
                  {currentIntent.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm font-medium mt-1">{currentIntent.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentIntent.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Intent Input Form */}
      <div className="flex-1 overflow-y-auto p-6">
        {hasActiveIntent ? (
          <div className="space-y-6">
            {/* Active Intent Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Requirements
                </h4>
                <ul className="space-y-1">
                  {currentIntent?.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Constraints
                </h4>
                <ul className="space-y-1">
                  {currentIntent?.constraints.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-3 h-3 text-warning mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Context Files
                </h4>
                <div className="space-y-1">
                  {currentIntent?.contextFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-mono bg-muted px-2 py-1 rounded">
                      <FileText className="w-3 h-3" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-medium">Assign New Task</h3>
              <p className="text-sm text-muted-foreground">
                Describe what you need done. Be specific about outcomes, not implementation.
              </p>
            </div>

            <Separator />

            {/* Intent Title */}
            <div className="space-y-2">
              <Label htmlFor="intent-title">Task Title</Label>
              <Input
                id="intent-title"
                placeholder="e.g., Implement user authentication flow"
                value={intentTitle}
                onChange={(e) => setIntentTitle(e.target.value)}
              />
            </div>

            {/* Intent Description */}
            <div className="space-y-2">
              <Label htmlFor="intent-description">Description</Label>
              <Textarea
                id="intent-description"
                placeholder="Describe the desired outcome in detail. What should be accomplished? What does success look like?"
                className="min-h-[120px] resize-none"
                value={intentDescription}
                onChange={(e) => setIntentDescription(e.target.value)}
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <Input
                    key={index}
                    placeholder="e.g., Must support OAuth2"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                >
                  + Add Requirement
                </Button>
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <Label>Constraints</Label>
              <div className="space-y-2">
                {constraints.map((con, index) => (
                  <Input
                    key={index}
                    placeholder="e.g., No breaking changes to existing API"
                    value={con}
                    onChange={(e) => updateConstraint(index, e.target.value)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConstraint}
                >
                  + Add Constraint
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!hasActiveIntent && (
        <div className="px-6 py-4 border-t border-border bg-card">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!intentTitle.trim() || !intentDescription.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Intent for Planning
          </Button>
        </div>
      )}
    </div>
  );
}
