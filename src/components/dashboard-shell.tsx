import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full relative">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-electric/15 blur-[120px]" />
      </div>

      <AppSidebar />

      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-[1600px] mx-auto pt-20 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.25em] text-primary mb-2">{eyebrow}</div>
        )}
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
