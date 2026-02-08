import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface DynamicIconProps {
  name: string;
  className?: string;
}

type IconComponent = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const iconMap: Record<string, IconComponent> = {
    Layout: LucideIcons.Layout,
    Server: LucideIcons.Server,
    TestTube: LucideIcons.TestTube,
    Wrench: LucideIcons.Wrench,
    Shield: LucideIcons.Shield,
    LineChart: LucideIcons.LineChart,
    Cloud: LucideIcons.Cloud,
    FileText: LucideIcons.FileText,
    Circle: LucideIcons.Circle,
    Bot: LucideIcons.Bot,
    Code: LucideIcons.Code,
    Database: LucideIcons.Database,
    Lock: LucideIcons.Lock,
    Zap: LucideIcons.Zap,
  };
  
  const Icon = iconMap[name] || LucideIcons.Circle;
  
  return <Icon className={className} />;
}
