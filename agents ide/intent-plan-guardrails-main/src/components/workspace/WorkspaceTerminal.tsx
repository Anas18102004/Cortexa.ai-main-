import { useProject } from "@/contexts/ProjectContext";
import { format } from "date-fns";
import { 
  Terminal as TerminalIcon, 
  Trash2,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

export function WorkspaceTerminal() {
  const { terminalLogs, clearTerminalLogs } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [terminalLogs, autoScroll]);
  
  // Handle manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };
  
  const filteredLogs = filter
    ? terminalLogs.filter((log) => log.level === filter)
    : terminalLogs;
  
  const levelColors = {
    info: "text-foreground/80",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
    debug: "text-muted-foreground",
  };
  
  const levelBadges = {
    info: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-destructive/10 text-destructive",
    debug: "bg-muted/50 text-muted-foreground",
  };
  
  return (
    <div className="h-full flex flex-col bg-[hsl(228,14%,4%)] border-t border-border/50">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border/30 bg-card/30">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Terminal</span>
          <span className="text-xs text-muted-foreground">
            ({filteredLogs.length} logs)
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Level Filters */}
          <div className="flex items-center gap-0.5 mr-2">
            {["info", "success", "warning", "error"].map((level) => (
              <Button
                key={level}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-5 w-5 rounded",
                  filter === level && "bg-muted"
                )}
                onClick={() => setFilter(filter === level ? null : level)}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  level === "info" && "bg-foreground/60",
                  level === "success" && "bg-success",
                  level === "warning" && "bg-warning",
                  level === "error" && "bg-destructive"
                )} />
              </Button>
            ))}
          </div>
          
          {!autoScroll && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setAutoScroll(true);
                if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
              }}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearTerminalLogs}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Log Output */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <TerminalIcon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No logs yet</p>
            <p className="text-xs text-muted-foreground/60">
              Agent activity will appear here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-2 py-1 px-2 rounded hover:bg-muted/20 transition-colors group",
                  levelColors[log.level]
                )}
              >
                {/* Timestamp */}
                <span className="text-muted-foreground/50 flex-shrink-0 w-16">
                  {format(log.timestamp, "HH:mm:ss")}
                </span>
                
                {/* Level Badge */}
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase flex-shrink-0 w-14 text-center",
                  levelBadges[log.level]
                )}>
                  {log.level}
                </span>
                
                {/* Agent (if any) */}
                {log.agent && (
                  <span className="text-primary/70 flex-shrink-0">
                    [{log.agent}]
                  </span>
                )}
                
                {/* Message */}
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Typing indicator when auto-scrolling */}
      {autoScroll && terminalLogs.length > 0 && (
        <div className="px-4 py-1 border-t border-border/30 text-xs text-muted-foreground flex items-center gap-2">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          <span>Agents are working...</span>
        </div>
      )}
    </div>
  );
}
