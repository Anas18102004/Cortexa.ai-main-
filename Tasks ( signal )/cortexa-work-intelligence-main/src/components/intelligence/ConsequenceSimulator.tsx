import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Signal, ConsequenceProjection } from "@/lib/models/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Sparkles,
  Calendar
} from "lucide-react";
import { useAIJudgment } from "@/hooks/useAIJudgment";

interface ConsequenceSimulatorProps {
  signal: Signal & { currentPressure: number };
  className?: string;
}

export function ConsequenceSimulator({ signal, className }: ConsequenceSimulatorProps) {
  const [projection, setProjection] = useState<ConsequenceProjection | null>(null);
  const [selectedDays, setSelectedDays] = useState<7 | 14 | 30>(14);
  const { generateProjection, isProcessing, error } = useAIJudgment();

  const loadProjection = async () => {
    const result = await generateProjection(signal, selectedDays);
    if (result) {
      setProjection(result);
    }
  };

  useEffect(() => {
    loadProjection();
  }, [signal.id, selectedDays]);

  if (isProcessing && !projection) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating consequence projection...</span>
        </div>
      </div>
    );
  }

  if (error && !projection) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-amber mx-auto mb-2" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={loadProjection} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="text-center py-8">
          <Button onClick={loadProjection} disabled={isProcessing}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Consequence Projection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet" />
            Consequence Simulator
          </h3>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map((days) => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedDays(days)}
                className="h-7 px-2 text-xs"
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          What happens if this Signal is ignored vs addressed over {selectedDays} days
        </p>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection.pressureDecayData}>
              <defs>
                <linearGradient id="ignoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--error))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--error))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="addressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ignoreValue"
                stroke="hsl(var(--error))"
                fill="url(#ignoreGradient)"
                name="If Ignored"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="addressValue"
                stroke="hsl(var(--teal))"
                fill="url(#addressGradient)"
                name="If Addressed"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid md:grid-cols-2 gap-4 p-4 border-t border-border">
        {/* Ignore Scenario */}
        <div className="rounded-lg border border-error/30 bg-error/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-error" />
            <span className="font-medium text-sm">If Ignored</span>
            <Badge variant="outline" className="ml-auto text-[10px]">
              {Math.round(projection.ignoreScenario.confidence * 100)}% confident
            </Badge>
          </div>
          <p className="text-2xl font-bold text-error mb-2">
            {projection.ignoreScenario.projectedPressure}
            <span className="text-sm font-normal text-muted-foreground"> pressure</span>
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            {projection.ignoreScenario.riskAssessment}
          </p>
          <div className="space-y-1">
            {projection.ignoreScenario.potentialImpacts.slice(0, 3).map((impact, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 text-error shrink-0 mt-0.5" />
                <span>{impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address Scenario */}
        <div className="rounded-lg border border-teal/30 bg-teal/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-teal" />
            <span className="font-medium text-sm">If Addressed</span>
            <Badge variant="outline" className="ml-auto text-[10px]">
              {Math.round(projection.addressScenario.confidence * 100)}% confident
            </Badge>
          </div>
          <p className="text-2xl font-bold text-teal mb-2">
            {projection.addressScenario.projectedPressure}
            <span className="text-sm font-normal text-muted-foreground"> pressure</span>
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            {projection.addressScenario.expectedOutcome}
          </p>
          <div className="flex items-start gap-2 text-xs">
            <Calendar className="h-3 w-3 text-teal shrink-0 mt-0.5" />
            <span>Effort: {projection.addressScenario.requiredEffort}</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <span className="text-sm font-medium">AI Recommendation</span>
          <Badge className="bg-violet/20 text-violet capitalize">
            {projection.recommendation}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({Math.round(projection.confidence * 100)}% confident)
          </span>
        </div>
        <p className="text-sm text-muted-foreground italic">
          "{projection.reasoning}"
        </p>
      </div>
    </div>
  );
}