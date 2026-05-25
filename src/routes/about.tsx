import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { Github, Sparkles, Globe2, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Aether" }, { name: "description", content: "About Aether — an AI-powered climate intelligence platform." }] }),
  component: About,
});

function About() {
  return (
    <DashboardShell>
      <PageHeader eyebrow="The platform" title="About Aether" description="A futuristic climate intelligence platform powered by open atmospheric data." />

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            Aether brings real-time atmospheric data, AI-derived predictions and disaster
            early-warning signals together in a single command surface. It is designed for
            people who want to understand the climate around them — from daily weather
            decisions to long-horizon environmental insight.
          </p>
          <h3 className="font-display font-semibold mt-6 mb-3">Built with</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="glass rounded-xl p-3"><Sparkles className="h-4 w-4 text-primary mb-1" />TanStack Start + React 19</div>
            <div className="glass rounded-xl p-3"><Globe2 className="h-4 w-4 text-primary mb-1" />Open-Meteo APIs</div>
            <div className="glass rounded-xl p-3"><Zap className="h-4 w-4 text-primary mb-1" />Framer Motion + Recharts</div>
          </div>
        </GlassCard>

        <GlassCard className="bg-aurora/10">
          <h3 className="font-display font-semibold mb-3">Try it</h3>
          <p className="text-sm text-muted-foreground mb-4">Open the live dashboard or talk to Aether.</p>
          <div className="space-y-2">
            <Link to="/dashboard" className="block bg-aurora rounded-xl px-4 py-3 text-center text-primary-foreground font-medium">Open dashboard</Link>
            <Link to="/assistant" className="block glass rounded-xl px-4 py-3 text-center font-medium">Chat with assistant</Link>
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
              <Github className="h-3.5 w-3.5" /> Powered by open data
            </a>
          </div>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
