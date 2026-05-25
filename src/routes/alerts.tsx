import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ShieldAlert, Flame, CloudRain, Wind } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { LocationSearch } from "@/components/location-search";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle } from "@/services/weather";
import { computeRisks, generateInsights } from "@/lib/climate-ai";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts · Aether" }, { name: "description", content: "Disaster early-warning signals and active climate alerts." }] }),
  component: Alerts,
});

const ICONS: Record<string, any> = {
  "Flood risk": CloudRain,
  "Heatwave risk": Flame,
  "Storm risk": Wind,
  "Drought risk": ShieldAlert,
};

function Alerts() {
  const { location, status, requestBrowserLocation, updateLocation } = useGeoLocation();
  const q = useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: () => fetchWeatherBundle(location) });

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Early warning"
        title="Disaster alerts"
        description="Active risk signals and AI-derived environmental advisories."
        actions={<LocationSearch current={location} onSelect={updateLocation} onUseDevice={requestBrowserLocation} isLocating={status === "loading"} />}
      />

      {!q.data && <div className="glass rounded-3xl h-64 animate-pulse" />}
      {q.data && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {computeRisks(q.data).map((r) => {
              const Icon = ICONS[r.label] ?? AlertTriangle;
              const tone = r.level === "extreme" ? "border-destructive/40" : r.level === "high" ? "border-accent/40" : "border-border";
              return (
                <GlassCard key={r.label} className={`border ${tone}`}>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-aurora/20 flex items-center justify-center text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-semibold">{r.label}</h3>
                        <span className={`text-xs uppercase tracking-wider ${
                          r.level === "extreme" ? "text-destructive" :
                          r.level === "high" ? "text-accent" :
                          r.level === "moderate" ? "text-primary" : "text-muted-foreground"
                        }`}>{r.level}</span>
                      </div>
                      <div className="mt-1 text-3xl font-display font-semibold">{r.score}<span className="text-base text-muted-foreground">/100</span></div>
                      <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-aurora" style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <GlassCard>
            <h3 className="font-display font-semibold mb-4">Advisories</h3>
            <ul className="space-y-3">
              {generateInsights(q.data).map((i, idx) => (
                <li key={idx} className="flex gap-3 glass rounded-xl p-4">
                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    i.level === "alert" ? "bg-destructive" : i.level === "warn" ? "bg-accent" : "bg-primary"
                  }`} />
                  <div>
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{i.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </DashboardShell>
  );
}
