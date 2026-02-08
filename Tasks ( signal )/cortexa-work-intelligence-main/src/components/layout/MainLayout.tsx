import { cn } from "@/lib/utils";
import { Navigation } from "./Navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <main className={cn(
        "min-h-screen",
        "lg:pl-72", // Account for wider sidebar on desktop
        "pt-16 lg:pt-0", // Account for mobile nav
        className
      )}>
        <div className="max-w-7xl mx-auto px-5 py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
