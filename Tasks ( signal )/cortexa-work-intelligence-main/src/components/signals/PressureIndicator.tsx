import { cn } from "@/lib/utils";
import { getPressureLevel } from "@/lib/utils/pressure";

interface PressureIndicatorProps {
  pressure: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export function PressureIndicator({ 
  pressure, 
  size = "md", 
  showLabel = false,
  animate = false,
  className 
}: PressureIndicatorProps) {
  const level = getPressureLevel(pressure);
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const colorClasses = {
    critical: "bg-pressure-critical",
    high: "bg-pressure-high",
    medium: "bg-pressure-medium",
    low: "bg-pressure-low",
    minimal: "bg-pressure-minimal",
  };

  const textColorClasses = {
    critical: "text-pressure-critical",
    high: "text-pressure-high",
    medium: "text-pressure-medium",
    low: "text-pressure-low",
    minimal: "text-pressure-minimal",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          colorClasses[level],
          animate && level === "critical" && "pressure-pulse"
        )}
      />
      {showLabel && (
        <span className={cn("text-sm font-medium capitalize", textColorClasses[level])}>
          {level} ({pressure})
        </span>
      )}
    </div>
  );
}

interface PressureBarProps {
  pressure: number;
  maxPressure?: number;
  showValue?: boolean;
  className?: string;
}

export function PressureBar({ 
  pressure, 
  maxPressure = 100, 
  showValue = true,
  className 
}: PressureBarProps) {
  const level = getPressureLevel(pressure);
  const percentage = Math.min((pressure / maxPressure) * 100, 100);

  const colorClasses = {
    critical: "bg-pressure-critical",
    high: "bg-pressure-high",
    medium: "bg-pressure-medium",
    low: "bg-pressure-low",
    minimal: "bg-pressure-minimal",
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorClasses[level]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-sm font-mono font-medium text-muted-foreground w-10 text-right">
          {pressure}
        </span>
      )}
    </div>
  );
}
