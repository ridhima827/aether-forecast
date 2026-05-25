import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { fetchWeatherBundle, describeWeather, type GeoLocation } from "@/services/weather";

const CITIES: GeoLocation[] = [
  { latitude: 40.7128, longitude: -74.006, name: "New York", country: "US" },
  { latitude: 51.5072, longitude: -0.1276, name: "London", country: "UK" },
  { latitude: 35.6762, longitude: 139.6503, name: "Tokyo", country: "JP" },
  { latitude: -33.8688, longitude: 151.2093, name: "Sydney", country: "AU" },
  { latitude: 19.076, longitude: 72.8777, name: "Mumbai", country: "IN" },
  { latitude: -23.5505, longitude: -46.6333, name: "São Paulo", country: "BR" },
  { latitude: 30.0444, longitude: 31.2357, name: "Cairo", country: "EG" },
  { latitude: 55.7558, longitude: 37.6173, name: "Moscow", country: "RU" },
  { latitude: 48.8566, longitude: 2.3522, name: "Paris", country: "FR" },
  { latitude: 1.3521, longitude: 103.8198, name: "Singapore", country: "SG" },
];

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Global Map · Aether" }, { name: "description", content: "Live global weather grid across major cities." }] }),
  component: GlobalMap,
});

function GlobalMap() {
  const queries = useQueries({
    queries: CITIES.map((c) => ({
      queryKey: ["weather", c.latitude, c.longitude],
      queryFn: () => fetchWeatherBundle(c),
      staleTime: 10 * 60 * 1000,
    })),
  });

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Planetary view"
        title="Global climate grid"
        description="Live atmospheric readings from major cities across the planet."
      />

      <div className="relative glass-strong rounded-3xl p-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-aurora opacity-10" />
        <svg viewBox="0 0 800 400" className="relative w-full h-auto opacity-70">
          {/* Simplified world dots grid */}
          {Array.from({ length: 20 }).map((_, y) =>
            Array.from({ length: 40 }).map((_, x) => (
              <circle key={`${x}-${y}`} cx={x * 20 + 10} cy={y * 20 + 10} r="1" fill="oklch(0.78 0.16 220 / 30%)" />
            ))
          )}
          {/* City markers */}
          {CITIES.map((c, i) => {
            const cx = ((c.longitude + 180) / 360) * 800;
            const cy = ((90 - c.latitude) / 180) * 400;
            const data = queries[i].data;
            return (
              <g key={c.name}>
                <circle cx={cx} cy={cy} r="6" fill="oklch(0.78 0.16 220)" />
                <circle cx={cx} cy={cy} r="12" fill="none" stroke="oklch(0.78 0.16 220 / 60%)">
                  <animate attributeName="r" from="6" to="20" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                {data && (
                  <text x={cx + 10} y={cy + 4} fill="oklch(0.98 0.01 240)" fontSize="11" fontFamily="Space Grotesk">
                    {Math.round(data.current.temperature)}°
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {CITIES.map((c, i) => {
          const data = queries[i].data;
          const desc = data ? describeWeather(data.current.weatherCode) : null;
          return (
            <motion.div key={c.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.country}</div>
                  </div>
                  <div className="text-2xl">{desc?.emoji ?? "…"}</div>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-display font-semibold">
                    {data ? Math.round(data.current.temperature) : "—"}°
                  </span>
                  <span className="text-xs text-muted-foreground pb-1">{desc?.label}</span>
                </div>
                {data && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    💧 {data.current.humidity}% · 💨 {Math.round(data.current.windSpeed)} km/h
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
