// Lightweight rule-based climate AI utilities.
// Provides confidence-scored insights from atmospheric variables.

import type { WeatherBundle, AirQuality } from "@/services/weather";

export interface Insight {
  level: "info" | "warn" | "alert";
  title: string;
  description: string;
}

export interface RiskScore {
  label: string;
  score: number; // 0-100
  level: "low" | "moderate" | "high" | "extreme";
}

const levelFromScore = (s: number): RiskScore["level"] =>
  s >= 75 ? "extreme" : s >= 50 ? "high" : s >= 25 ? "moderate" : "low";

export function computeRisks(bundle: WeatherBundle): RiskScore[] {
  const { current, daily } = bundle;
  const next3 = daily.slice(0, 3);

  // Flood: rainfall + probability + saturated humidity
  const rainSum = next3.reduce((a, d) => a + d.precipitation, 0);
  const probMax = Math.max(...next3.map((d) => d.precipitationProbability));
  const floodScore = Math.min(100, rainSum * 4 + probMax * 0.4 + (current.humidity > 85 ? 10 : 0));

  // Heatwave
  const tMax = Math.max(...next3.map((d) => d.tempMax));
  const heatScore = Math.min(100, Math.max(0, (tMax - 28) * 6) + (current.humidity > 60 ? 8 : 0));

  // Storm
  const windMax = Math.max(...next3.map((d) => d.windSpeedMax));
  const stormScore = Math.min(100, Math.max(0, (windMax - 25) * 2.5) + (probMax > 70 ? 15 : 0));

  // Drought (low rain across week + high temps)
  const weekRain = daily.reduce((a, d) => a + d.precipitation, 0);
  const droughtScore = Math.min(100, Math.max(0, (10 - weekRain) * 8) + (tMax > 32 ? 12 : 0));

  return [
    { label: "Flood risk", score: Math.round(floodScore), level: levelFromScore(floodScore) },
    { label: "Heatwave risk", score: Math.round(heatScore), level: levelFromScore(heatScore) },
    { label: "Storm risk", score: Math.round(stormScore), level: levelFromScore(stormScore) },
    { label: "Drought risk", score: Math.round(droughtScore), level: levelFromScore(droughtScore) },
  ];
}

export function generateInsights(bundle: WeatherBundle, air?: AirQuality): Insight[] {
  const out: Insight[] = [];
  const c = bundle.current;
  if (c.uvIndex >= 8) out.push({ level: "warn", title: "Extreme UV index", description: "Avoid prolonged sun exposure between 11:00 and 16:00." });
  if (c.temperature >= 35) out.push({ level: "alert", title: "Heat stress conditions", description: "Hydrate frequently and limit outdoor activity." });
  if (c.windSpeed >= 40) out.push({ level: "warn", title: "High winds", description: "Secure loose objects; possible disruption to travel." });
  if (c.humidity >= 90) out.push({ level: "info", title: "Saturated atmosphere", description: "Visibility may drop; precipitation likely." });
  if (air && air.usAqi >= 100) out.push({ level: "warn", title: "Sensitive air quality", description: `US AQI ${Math.round(air.usAqi)}. Sensitive groups should reduce exertion.` });
  if (out.length === 0) out.push({ level: "info", title: "Atmospheric conditions stable", description: "No abnormal signals across monitored variables." });
  return out;
}

export function predictTrend(bundle: WeatherBundle): { delta: number; confidence: number; summary: string } {
  const temps = bundle.daily.map((d) => (d.tempMax + d.tempMin) / 2);
  if (temps.length < 2) return { delta: 0, confidence: 0, summary: "Insufficient data" };
  // Simple linear slope (last vs first)
  const delta = temps[temps.length - 1] - temps[0];
  // Confidence from variance
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const variance = temps.reduce((a, b) => a + (b - mean) ** 2, 0) / temps.length;
  const confidence = Math.max(60, Math.min(98, 100 - variance * 6));
  const direction = delta > 0.5 ? "warming" : delta < -0.5 ? "cooling" : "stable";
  return {
    delta: Number(delta.toFixed(1)),
    confidence: Math.round(confidence),
    summary: `7-day trend: ${direction} (${delta > 0 ? "+" : ""}${delta.toFixed(1)}°C)`,
  };
}
