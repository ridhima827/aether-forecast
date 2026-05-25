import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  glow,
}: {
  className?: string;
  children: ReactNode;
  glow?: "cyan" | "purple" | "none";
}) {
  return (
    <div
      className={cn(
        "relative glass rounded-3xl p-6 transition-all duration-300",
        "hover:border-primary/30 hover:-translate-y-0.5",
        glow === "cyan" && "hover:glow-cyan",
        glow === "purple" && "hover:glow-purple",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-display font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
    </GlassCard>
  );
}
