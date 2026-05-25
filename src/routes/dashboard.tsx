import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Thermometer, Droplets, Wind, Gauge, Sun, Cloud, Eye, ArrowUp,
} from "lucide-react";
import {
  LineChart as RLineChart, Line, ResponsiveContainer, XAxis, YAxis,
  Tooltip, Area, AreaChart, CartesianGrid,
} from "recharts";

import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard, StatCard } from "@/components/glass-card";
import { LocationSearch } from "@/components/location-search";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle, fetchAirQuality, describeWeather } from "@/services/weather";
import { computeRisks, generateInsights, predictTrend } from "@/lib/climate-ai";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Aether Climate Intelligence" },
      { name: "description", content: "Real-time weather telemetry, AI predictions and atmospheric insights for your location." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { location, status, requestBrowserLocation, updateLocation } = useGeoLocation();

  const weatherQuery = useQuery({
    queryKey: ["weather", location.latitude, location.longitude],
    queryFn: () => fetchWeatherBundle(location),
    staleTime: 5 * 60 * 1000,
  });

  const airQuery = useQuery({
    queryKey: ["air", location.latitude, location.longitude],
    queryFn: () => fetchAirQuality(location),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Live telemetry"
        title="Climate dashboard"
        description={`Atmospheric variables for ${location.name ?? "your location"}${location.country ? `, ${location.country}` : ""}.`}
        actions={
          <LocationSearch
            current={location}
            onSelect={updateLocation}
            onUseDevice={requestBrowserLocation}
            isLocating={status === "loading"}
          />
        }
      />

      {weatherQuery.isLoading && <LoadingGrid />}

      {weatherQuery.isError && (
        <GlassCard className="text-center py-16">
          <p className="text-muted-foreground">Unable to reach weather network. Retrying…</p>
        </GlassCard>
      )}

      {weatherQuery.data && (
        <DashboardContent
          data={weatherQuery.data}
          air={airQuery.data}
        />
      )}
    </DashboardShell>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass rounded-3xl h-32 animate-pulse" />
      ))}
    </div>
  );
}

function DashboardContent({
  data,
  air,
}: {
  data: NonNullable<ReturnType<typeof useQuery>["data"]> extends infer T ? any : never;
  air?: any;
}) {
  const c = data.current;
  const desc = describeWeather(c.weatherCode);
  const risks = computeRisks(data);
  const insights = generateInsights(data, air);
  const trend = predictTrend(data);

  const hourly = data.hourly.map((h: any) => ({
    t: new Date(h.time).getHours() + "h",
    temp: h.temperature,
    rain: h.precipitation,
  }));

  const weekly = data.daily.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    max: d.tempMax,
    min: d.tempMin,
    rain: d.precipitation,
  }));

  return (
    <div className="space-y-6">
      {/* Hero current weather */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-strong rounded-3xl p-8 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-aurora opacity-30 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now
            </div>
            <div className="mt-2 flex items-end gap-6">
              <div className="text-7xl sm:text-8xl font-display font-semibold tracking-tighter">
                {Math.round(c.temperature)}°
              </div>
              <div className="pb-3">
                <div className="text-2xl">{desc.emoji} {desc.label}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Feels like {Math.round(c.apparentTemperature)}° · Wind {Math.round(c.windSpeed)} km/h
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg">
              {trend.summary} · Aether confidence{" "}
              <span className="text-primary font-medium">{trend.confidence}%</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[260px]">
            {[
              { i: Droplets, l: "Humidity", v: `${c.humidity}%` },
              { i: Wind, l: "Wind", v: `${Math.round(c.windSpeed)} km/h` },
              { i: Gauge, l: "Pressure", v: `${Math.round(c.pressure)} hPa` },
              { i: Sun, l: "UV index", v: `${c.uvIndex?.toFixed?.(1) ?? c.uvIndex}` },
            ].map(({ i: Icon, l, v }) => (
              <div key={l} className="glass rounded-2xl p-3">
                <Icon className="h-4 w-4 text-primary mb-2" />
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                <div className="font-display text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cloud cover" value={`${c.cloudCover}`} unit="%" icon={<Cloud className="h-4 w-4" />} />
        <StatCard label="Precipitation" value={c.precipitation} unit="mm" icon={<Droplets className="h-4 w-4" />} />
        <StatCard label="Apparent" value={Math.round(c.apparentTemperature)} unit="°C" icon={<Thermometer className="h-4 w-4" />} />
        <StatCard
          label="Air quality (US)"
          value={air ? Math.round(air.usAqi) : "—"}
          unit="AQI"
          icon={<Eye className="h-4 w-4" />}
          trend={air ? aqiLabel(air.usAqi) : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">24-hour temperature</h3>
            <span className="text-xs text-muted-foreground">°C</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                <XAxis dataKey="t" stroke="oklch(0.72 0.04 240)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.04 240)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.05 260 / 95%)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="oklch(0.78 0.16 220)" strokeWidth={2} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display font-semibold mb-4">AI insights</h3>
          <ul className="space-y-3">
            {insights.map((ins, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                  ins.level === "alert" ? "bg-destructive" :
                  ins.level === "warn" ? "bg-accent" : "bg-primary"
                }`} />
                <div>
                  <div className="font-medium">{ins.title}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{ins.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* 7-day */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">7-day forecast</h3>
          <span className="text-xs text-muted-foreground">High / low · precipitation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.daily.map((d: any) => {
            const dd = describeWeather(d.weatherCode);
            return (
              <div key={d.date} className="glass rounded-2xl p-4 text-center">
                <div className="text-xs text-muted-foreground">
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="text-3xl my-2">{dd.emoji}</div>
                <div className="font-display font-semibold">{Math.round(d.tempMax)}°</div>
                <div className="text-xs text-muted-foreground">{Math.round(d.tempMin)}°</div>
                <div className="text-[10px] text-primary mt-1">{Math.round(d.precipitationProbability)}%</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Risk panel */}
      <GlassCard>
        <h3 className="font-display font-semibold mb-4">Disaster risk model</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {risks.map((r) => (
            <div key={r.label} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`uppercase tracking-wider ${
                  r.level === "extreme" ? "text-destructive" :
                  r.level === "high" ? "text-accent" :
                  r.level === "moderate" ? "text-primary" : "text-muted-foreground"
                }`}>{r.level}</span>
              </div>
              <div className="mt-3 font-display text-3xl font-semibold">{r.score}<span className="text-base text-muted-foreground">/100</span></div>
              <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-aurora"
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Weekly precipitation */}
      <GlassCard>
        <h3 className="font-display font-semibold mb-4">Weekly precipitation</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RLineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.72 0.04 240)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.04 240)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.2 0.05 260 / 95%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="rain" stroke="oklch(0.68 0.22 295)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="max" stroke="oklch(0.78 0.16 220)" strokeWidth={2} dot={{ r: 4 }} />
            </RLineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

// Suppress unused warning
void ArrowUp;
