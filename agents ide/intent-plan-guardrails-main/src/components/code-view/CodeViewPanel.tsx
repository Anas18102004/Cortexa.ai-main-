import { codeChanges } from "@/data/mockData";
import type { CodeChange, DiffLine } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, X, MessageSquare, FileCode, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CodeViewPanelProps {
  executionId?: string;
}

export function CodeViewPanel({ executionId }: CodeViewPanelProps) {
  const changes = executionId 
    ? codeChanges.filter((c) => c.executionId === executionId)
    : codeChanges;
  
  if (changes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileCode className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No Code Changes</h3>
        <p className="text-sm text-muted-foreground">
          Code changes will appear here after execution begins
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {changes.map((change) => (
        <CodeChangeView key={change.id} change={change} />
      ))}
    </div>
  );
}

interface CodeChangeViewProps {
  change: CodeChange;
}

function CodeChangeView({ change }: CodeChangeViewProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-border">
      {/* File Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center text-xs font-medium",
              change.changeType === "created"
                ? "bg-success/20 text-success"
                : change.changeType === "modified"
                ? "bg-primary/20 text-primary"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {change.changeType === "created"
              ? "+"
              : change.changeType === "modified"
              ? "~"
              : "-"}
          </span>
          <span className="font-mono text-sm">{change.filePath}</span>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded",
            change.changeType === "created"
              ? "bg-success/10 text-success"
              : change.changeType === "modified"
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {change.changeType}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* AI Explanation */}
          <div className="mb-4 p-3 rounded-lg bg-accent border border-accent-foreground/10">
            <p className="text-sm">{change.explanation}</p>
            {change.reasoning && (
              <p className="text-xs text-muted-foreground mt-2">
                {change.reasoning}
              </p>
            )}
          </div>

          {/* Diff View */}
          <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
            <div className="font-mono text-xs leading-relaxed">
              {change.diffLines.map((line, index) => (
                <DiffLineView key={index} line={line} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button variant="outline" size="sm">
              <X className="w-3 h-3 mr-1" />
              Reject
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-3 h-3 mr-1" />
              Request Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface DiffLineViewProps {
  line: DiffLine;
}

function DiffLineView({ line }: DiffLineViewProps) {
  return (
    <div
      className={cn(
        "flex",
        line.type === "added" && "bg-success/10",
        line.type === "removed" && "bg-destructive/10"
      )}
    >
      <span className="w-12 flex-shrink-0 px-2 py-0.5 text-muted-foreground text-right border-r border-border select-none">
        {line.lineNumber}
      </span>
      <span
        className={cn(
          "w-4 flex-shrink-0 text-center py-0.5 select-none",
          line.type === "added" && "text-success",
          line.type === "removed" && "text-destructive"
        )}
      >
        {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
      </span>
      <pre className="flex-1 py-0.5 px-2 overflow-x-auto">
        <code>{line.content}</code>
      </pre>
    </div>
  );
}
