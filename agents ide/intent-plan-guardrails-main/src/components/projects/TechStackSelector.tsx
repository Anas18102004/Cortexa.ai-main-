import type { TechStack } from "@/types/project";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TechStackSelectorProps {
  label: string;
  options: TechStack[];
  selected: TechStack[];
  onSelect: (stacks: TechStack[]) => void;
}

export function TechStackSelector({
  label,
  options,
  selected,
  onSelect,
}: TechStackSelectorProps) {
  const toggleStack = (stack: TechStack) => {
    const isSelected = selected.some((s) => s.id === stack.id);
    if (isSelected) {
      onSelect(selected.filter((s) => s.id !== stack.id));
    } else {
      onSelect([...selected, stack]);
    }
  };
  
  // Group by category
  const grouped = options.reduce((acc, stack) => {
    const category = stack.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(stack);
    return acc;
  }, {} as Record<string, TechStack[]>);
  
  const categoryLabels: Record<string, string> = {
    language: "Languages",
    framework: "Frameworks",
    database: "Databases",
    tool: "Tools",
    styling: "Styling",
  };
  
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{label}</h3>
      
      {Object.entries(grouped).map(([category, stacks]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {categoryLabels[category] || category}
          </p>
          <div className="flex flex-wrap gap-2">
            {stacks.map((stack) => {
              const isSelected = selected.some((s) => s.id === stack.id);
              
              return (
                <button
                  key={stack.id}
                  onClick={() => toggleStack(stack)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    isSelected
                      ? "bg-primary/10 border-primary/50 text-primary shadow-sm"
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{stack.icon}</span>
                    <span>{stack.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
