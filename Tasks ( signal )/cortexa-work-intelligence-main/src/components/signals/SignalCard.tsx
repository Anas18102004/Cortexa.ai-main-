import { cn } from "@/lib/utils";
import type { Signal } from "@/lib/models/types";
import { PressureIndicator, PressureBar } from "./PressureIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Clock, 
  Target, 
  Building2, 
  User,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SignalCardProps {
  signal: Signal & { currentPressure: number; urgencyScore: number };
  onClick?: () => void;
  onRespond?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function SignalCard({ 
  signal, 
  onClick, 
  onRespond,
  showActions = true,
  compact = false,
  className 
}: SignalCardProps) {
  const scopeIcons = {
    local: User,
    mission: Target,
    organization: Building2,
  };

  const ScopeIcon = scopeIcons[signal.impactScope];

  const stateColors = {
    unaddressed: "border-l-amber",
    responding: "border-l-teal",
    deferred: "border-l-muted-foreground",
    ignored: "border-l-muted",
  };

  const sourceStyles = {
    ai: "bg-violet/10 text-violet border-violet/20",
    human: "bg-teal/10 text-teal border-teal/20",
    system: "bg-cyan/10 text-cyan border-cyan/20",
    integration: "bg-amber/10 text-amber border-amber/20",
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-smooth",
          "border-l-4",
          stateColors[signal.state],
          "shadow-low hover:shadow-medium",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <PressureIndicator 
            pressure={signal.currentPressure} 
            animate={signal.currentPressure >= 80} 
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{signal.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group rounded-2xl border border-border bg-card p-5 transition-smooth signal-card",
        "border-l-4",
        stateColors[signal.state],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <PressureIndicator 
            pressure={signal.currentPressure} 
            size="lg"
            animate={signal.currentPressure >= 80}
          />
          <Badge variant="outline" className={cn("text-xs font-medium", sourceStyles[signal.source])}>
            {signal.source === "ai" && <Sparkles className="h-3 w-3 mr-1" />}
            {signal.source}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ScopeIcon className="h-4 w-4" />
          <span className="text-xs font-medium capitalize">{signal.impactScope}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-teal transition-colors">
        {signal.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {signal.description}
      </p>

      {/* Pressure Bar */}
      <PressureBar pressure={signal.currentPressure} className="mb-4" />

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}</span>
        </div>
        {signal.constraintType !== "none" && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber" />
            <span className="capitalize">{signal.constraintType} constraint</span>
          </div>
        )}
        {signal.aiConfidence && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet" />
            <span>{Math.round(signal.aiConfidence * 100)}% confidence</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {signal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {signal.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {signal.tags.length > 3 && (
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
              +{signal.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && signal.state === "unaddressed" && (
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onRespond?.();
          }}
          className="w-full h-11 bg-gradient-to-r from-teal to-cyan text-white border-0 font-medium shadow-low hover:shadow-medium transition-smooth"
          size="sm"
        >
          Respond to Signal
        </Button>
      )}
    </div>
  );
}
