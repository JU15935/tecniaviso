import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({ icon, title, description, className }: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "app-card flex flex-col items-start gap-3 p-5 transition-all duration-200 hover:scale-[1.01]",
        className
      )}
    >
      {/* Icon container */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};
