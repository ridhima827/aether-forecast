import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard, StatCard } from "@/components/glass-card";
import { LocationSearch } from "@/components/location-search";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchAirQuality } from "@/services/weather";
import { Wind } from "lucide-react";

export const Route = createFileRoute("/air-quality")({
  head: () => ({ meta: [{ title: "Air Quality · Aether" }, { name: "description", content: "Real-time air quality monitoring with PM2.5, ozone and AQI metrics." }] }),
  component: AirQuality,
});

function badge(aqi: number) {
  if (aqi <= 50) return { l: "Good", c: "text-primary" };
  if (aqi <= 100) return { l: "Moderate", c: "text-primary" };
  if (aqi <= 150) return { l: "Unhealthy (sensitive)", c: "text-accent" };
  if (aqi <= 200) return { l: "Unhealthy", c: "text-accent" };
  return { l: "Hazardous", c: "text-destructive" };
}

function AirQuality() {
  const { location, status, requestBrowserLocation, updateLocation } = useGeoLocation();
  const q = useQuery({ queryKey: ["air", location.latitude, location.longitude], queryFn: () => fetchAirQuality(location) });

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Atmosphere"
        title="Air quality"
        description="Particulate matter, ozone and pollutant levels for your region."
        actions={<LocationSearch current={location} onSelect={updateLocation} onUseDevice={requestBrowserLocation} isLocating={status === "loading"} />}
      />

      {!q.data && <div className="glass rounded-3xl h-64 animate-pulse" />}
      {q.data && (
        <div className="space-y-6">
          <div className="relative glass-strong rounded-3xl p-8 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-aurora opacity-30 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                  <Wind className="h-3.5 w-3.5" /> US AQI
                </div>
                <h2 className="mt-2 text-7xl font-display font-semibold tracking-tighter">{Math.round(q.data.usAqi)}</h2>
                <p className={`mt-2 font-medium ${badge(q.data.usAqi).c}`}>{badge(q.data.usAqi).l}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="European AQI" value={Math.round(q.data.europeanAqi)} />
                <StatCard label="PM2.5" value={q.data.pm2_5?.toFixed(1)} unit="µg/m³" />
                <StatCard label="PM10" value={q.data.pm10?.toFixed(1)} unit="µg/m³" />
                <StatCard label="Ozone" value={q.data.ozone?.toFixed(1)} unit="µg/m³" />
              </div>
            </div>
          </div>

          <GlassCard>
            <h3 className="font-display font-semibold mb-3">Pollutant breakdown</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Nitrogen dioxide" value={q.data.no2?.toFixed(1)} unit="µg/m³" />
              <StatCard label="Carbon monoxide" value={q.data.co?.toFixed(0)} unit="µg/m³" />
              <StatCard label="Air quality class" value={badge(q.data.usAqi).l} />
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardShell>
  );
}
