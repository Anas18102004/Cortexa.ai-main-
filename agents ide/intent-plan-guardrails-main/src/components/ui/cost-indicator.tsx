import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface CostIndicatorProps {
  amount: number; // in cents
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CostIndicator({
  amount,
  label,
  className,
  size = "md",
}: CostIndicatorProps) {
  const formatted = formatCost(amount);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", sizeClasses[size], className)}>
      <DollarSign className={cn("text-muted-foreground", size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4")} />
      <span className="font-medium">{formatted}</span>
      {label && <span className="text-muted-foreground">/ {label}</span>}
    </div>
  );
}

export function formatCost(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `${(dollars / 1000).toFixed(1)}k`;
  }
  if (dollars >= 1) {
    return dollars.toFixed(2);
  }
  return `${cents}¢`;
}

interface CostMeterProps {
  current: number;
  limit?: number;
  className?: string;
}

export function CostMeter({ current, limit, className }: CostMeterProps) {
  const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Cost this month</span>
        <span className={cn("font-medium", isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "")}>
          {formatCost(current)}
          {limit && <span className="text-muted-foreground"> / {formatCost(limit)}</span>}
        </span>
      </div>
      {limit && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverLimit ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
