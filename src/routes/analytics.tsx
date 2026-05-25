import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, Legend } from "recharts";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle } from "@/services/weather";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Aether" }, { name: "description", content: "Deep climate analytics and atmospheric correlations." }] }),
  component: Analytics,
});

function Analytics() {
  const { location } = useGeoLocation();
  const q = useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: () => fetchWeatherBundle(location) });

  return (
    <DashboardShell>
      <PageHeader eyebrow="Insights" title="Climate analytics" description="Trend, distribution and correlation views across the weekly window." />
      {!q.data && <div className="glass rounded-3xl h-64 animate-pulse" />}
      {q.data && (
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Daily highs vs lows</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={q.data.daily.map((d: any) => ({
                  day: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
                  High: d.tempMax, Low: d.tempMin,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                  <XAxis dataKey="day" stroke="oklch(0.72 0.04 240)" fontSize={11} />
                  <YAxis stroke="oklch(0.72 0.04 240)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.05 260 / 95%)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="High" fill="oklch(0.78 0.16 220)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Low" fill="oklch(0.68 0.22 295)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display font-semibold mb-4">UV exposure</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="30%" outerRadius="100%" data={q.data.daily.map((d: any, i: number) => ({
                  name: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
                  uv: d.uvIndexMax ?? 0,
                  fill: `oklch(${0.55 + i * 0.04} 0.16 ${210 + i * 8})`,
                }))}>
                  <RadialBar background dataKey="uv" />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-3">
            <h3 className="font-display font-semibold mb-4">Hourly humidity</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={q.data.hourly.map((h: any) => ({ t: new Date(h.time).getHours() + "h", humidity: h.humidity }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                  <XAxis dataKey="t" stroke="oklch(0.72 0.04 240)" fontSize={11} />
                  <YAxis stroke="oklch(0.72 0.04 240)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.05 260 / 95%)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="humidity" fill="oklch(0.65 0.22 255)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardShell>
  );
}
