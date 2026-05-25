import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { fetchWeatherBundle, describeWeather } from "@/services/weather";
import { computeRisks, predictTrend, generateInsights } from "@/lib/climate-ai";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · Aether" }, { name: "description", content: "Conversational climate intelligence assistant." }] }),
  component: Assistant,
});

interface Msg { role: "user" | "ai"; text: string; }

function answer(q: string, bundle: any): string {
  const lc = q.toLowerCase();
  if (!bundle) return "I'm still loading atmospheric data — try again in a moment.";
  const c = bundle.current;
  const desc = describeWeather(c.weatherCode);
  if (/temperature|hot|cold|warm/.test(lc)) return `Current temperature is ${Math.round(c.temperature)}°C, feeling like ${Math.round(c.apparentTemperature)}°C with ${desc.label.toLowerCase()}.`;
  if (/rain|precip|storm/.test(lc)) {
    const rain = bundle.daily.slice(0, 3).reduce((a: number, d: any) => a + d.precipitation, 0);
    return `Expected rainfall over the next 3 days: ${rain.toFixed(1)} mm. Maximum probability: ${Math.max(...bundle.daily.slice(0, 3).map((d: any) => d.precipitationProbability))}%.`;
  }
  if (/wind/.test(lc)) return `Wind speed is ${Math.round(c.windSpeed)} km/h from ${c.windDirection}°.`;
  if (/humid/.test(lc)) return `Relative humidity is ${c.humidity}%.`;
  if (/uv/.test(lc)) return `UV index is ${c.uvIndex?.toFixed(1)}. ${c.uvIndex >= 8 ? "Sun protection strongly recommended." : "Normal precautions are sufficient."}`;
  if (/risk|disaster|flood|heatwave|drought/.test(lc)) {
    const top = computeRisks(bundle).sort((a, b) => b.score - a.score)[0];
    return `Highest active risk signal: ${top.label} at ${top.score}/100 (${top.level}).`;
  }
  if (/forecast|prediction|trend|future/.test(lc)) {
    const t = predictTrend(bundle);
    return `${t.summary}. Aether confidence: ${t.confidence}%.`;
  }
  if (/insight|advice|recommend|farm/.test(lc)) {
    return generateInsights(bundle).map((i) => `• ${i.title} — ${i.description}`).join("\n");
  }
  return `I monitor 11 atmospheric variables for ${bundle.location.name ?? "your location"}. Ask me about temperature, rainfall, wind, UV, risks or 7-day predictions.`;
}

function Assistant() {
  const { location } = useGeoLocation();
  const { data } = useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: () => fetchWeatherBundle(location) });
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi — I'm Aether. Ask me about climate conditions, risks or predictions for your location." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: answer(q, data) }]);
    }, 400);
  };

  const suggestions = ["What's the temperature?", "Any disaster risks?", "7-day prediction", "Give me insights"];

  return (
    <DashboardShell>
      <PageHeader eyebrow="Conversational AI" title="Aether assistant" description="Ask anything about the atmosphere — answers powered by live data." />

      <GlassCard className="flex flex-col h-[calc(100vh-16rem)] p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  m.role === "ai" ? "bg-aurora text-primary-foreground" : "glass"
                }`}>
                  {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                  m.role === "ai" ? "glass" : "bg-aurora text-primary-foreground"
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-border/40 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="glass rounded-full px-3 py-1 text-xs hover:border-primary/50 transition">
                <Sparkles className="inline h-3 w-3 mr-1" />{s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aether…"
              className="flex-1 glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
            />
            <button type="submit" className="rounded-xl bg-aurora px-4 py-3 text-primary-foreground hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
