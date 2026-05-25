import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { LocationSearch } from "@/components/location-search";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle } from "@/services/weather";
import { predictTrend, computeRisks } from "@/lib/climate-ai";

export const Route = createFileRoute("/predictions")({
  head: () => ({ meta: [{ title: "Predictions · Aether" }, { name: "description", content: "AI-generated climate predictions and trend analysis for any region." }] }),
  component: Predictions,
});

function Predictions() {
  const { location, status, requestBrowserLocation, updateLocation } = useGeoLocation();
  const q = useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: () => fetchWeatherBundle(location) });

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Forecast engine"
        title="AI climate predictions"
        description="Confidence-scored trend predictions across atmospheric variables."
        actions={<LocationSearch current={location} onSelect={updateLocation} onUseDevice={requestBrowserLocation} isLocating={status === "loading"} />}
      />

      {!q.data && <div className="glass rounded-3xl h-64 animate-pulse" />}
      {q.data && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative glass-strong rounded-3xl p-8 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-aurora opacity-30 blur-3xl" />
            {(() => {
              const t = predictTrend(q.data);
              const Icon = t.delta > 0.5 ? TrendingUp : t.delta < -0.5 ? TrendingDown : Minus;
              return (
                <div className="relative grid lg:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> Aether prediction
                    </div>
                    <h2 className="mt-2 text-5xl font-display font-semibold tracking-tight">
                      {t.delta > 0 ? "+" : ""}{t.delta}°C
                    </h2>
                    <p className="mt-2 text-muted-foreground">{t.summary}</p>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <Icon className="h-5 w-5 text-primary" /> Model confidence
                    </div>
                    <div className="mt-3 font-display text-5xl font-semibold text-gradient">{t.confidence}%</div>
                    <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${t.confidence}%` }} transition={{ duration: 1 }} className="h-full bg-aurora" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="font-display font-semibold mb-4">Daily prediction breakdown</h3>
              <div className="space-y-2">
                {q.data.daily.map((d: any) => (
                  <div key={d.date} className="flex items-center justify-between glass rounded-xl px-4 py-3 text-sm">
                    <span>{new Date(d.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
                    <span className="text-muted-foreground">{Math.round(d.tempMin)}° – <span className="text-foreground font-medium">{Math.round(d.tempMax)}°</span></span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display font-semibold mb-4">Risk classification</h3>
              <div className="space-y-3">
                {computeRisks(q.data).map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{r.label}</span>
                      <span className="text-muted-foreground">{r.score}/100 · {r.level}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ duration: 0.8 }} className="h-full bg-aurora" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
