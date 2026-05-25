import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle, describeWeather } from "@/services/weather";
import { computeRisks, predictTrend } from "@/lib/climate-ai";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · Aether" }, { name: "description", content: "Generate downloadable climate reports for any location." }] }),
  component: Reports,
});

function Reports() {
  const { location } = useGeoLocation();
  const q = useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: () => fetchWeatherBundle(location) });

  const downloadJson = () => {
    if (!q.data) return;
    const report = {
      generatedAt: new Date().toISOString(),
      location: q.data.location,
      current: q.data.current,
      forecast7d: q.data.daily,
      ai: {
        trend: predictTrend(q.data),
        risks: computeRisks(q.data),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aether-report-${q.data.location.name ?? "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!q.data) return;
    const rows = [["date", "tempMax", "tempMin", "precipitation", "precipProb", "wmoCode"]];
    q.data.daily.forEach((d: any) => rows.push([d.date, d.tempMax, d.tempMin, d.precipitation, d.precipitationProbability, d.weatherCode]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aether-forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell>
      <PageHeader eyebrow="Export" title="Climate reports" description="Generate and download structured climate reports for your records." />

      <div className="grid lg:grid-cols-[1fr_auto] gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Report preview</h3>
          </div>
          {q.data ? (
            <div className="space-y-3 text-sm">
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="font-display font-semibold">{q.data.location.name}, {q.data.location.country}</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Current conditions</div>
                <div className="font-display font-semibold">
                  {Math.round(q.data.current.temperature)}°C · {describeWeather(q.data.current.weatherCode).label}
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">AI summary</div>
                <div className="font-display font-semibold">{predictTrend(q.data).summary}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {computeRisks(q.data).map((r) => (
                  <div key={r.label} className="glass rounded-xl p-3 flex justify-between">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-semibold">{r.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 animate-pulse" />
          )}
        </GlassCard>

        <div className="space-y-3 lg:w-64">
          <button onClick={downloadJson} disabled={!q.data} className="w-full bg-aurora rounded-2xl px-5 py-4 text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            <Download className="h-4 w-4" /> Download JSON
          </button>
          <button onClick={downloadCsv} disabled={!q.data} className="w-full glass rounded-2xl px-5 py-4 font-medium flex items-center justify-center gap-2 hover:border-primary/50 disabled:opacity-50">
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
