import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Activity, Globe2, Shield, Zap, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aether — AI Climate Intelligence Platform" },
      { name: "description", content: "A futuristic command center for global climate predictions, severe weather alerts and AI-driven environmental insights." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 -left-32 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[36rem] w-[36rem] rounded-full bg-accent/20 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-electric/20 blur-[140px]" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-aurora animate-pulse-glow" />
          <span className="font-display text-lg font-bold tracking-tight">Aether</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground transition">Dashboard</Link>
          <Link to="/predictions" className="hover:text-foreground transition">Predictions</Link>
          <Link to="/map" className="hover:text-foreground transition">Global Map</Link>
          <Link to="/about" className="hover:text-foreground transition">About</Link>
        </nav>
        <Link
          to="/dashboard"
          className="rounded-xl glass px-4 py-2 text-sm font-medium hover:border-primary/50 transition"
        >
          Launch
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live atmospheric data · 11 variables
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-[-0.04em] leading-[1.02]">
              The climate,{" "}
              <span className="text-gradient">decoded</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Aether fuses real-time weather telemetry, atmospheric models and AI prediction
              into a single intelligence layer for the planet.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-aurora px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/predictions"
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-medium hover:border-primary/50 transition"
              >
                <Sparkles className="h-4 w-4" />
                See AI prediction
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: "11", l: "atmospheric vars" },
                { v: "7d", l: "forecast horizon" },
                { v: "∞", l: "coordinates" },
              ].map((s) => (
                <div key={s.l} className="glass rounded-2xl p-4">
                  <dt className="text-2xl font-display font-semibold text-gradient">{s.v}</dt>
                  <dd className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Animated globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-square max-w-lg mx-auto w-full"
          >
            <div className="absolute inset-0 rounded-full bg-aurora blur-3xl opacity-40 animate-pulse-glow" />
            <div className="absolute inset-6 rounded-full glass-strong overflow-hidden">
              <div className="absolute inset-0 animate-spin-slow">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <radialGradient id="globe" cx="35%" cy="35%">
                      <stop offset="0%" stopColor="oklch(0.5 0.18 230)" />
                      <stop offset="60%" stopColor="oklch(0.25 0.1 260)" />
                      <stop offset="100%" stopColor="oklch(0.15 0.06 265)" />
                    </radialGradient>
                  </defs>
                  <circle cx="200" cy="200" r="180" fill="url(#globe)" />
                  {/* lat/long grid */}
                  {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y) => (
                    <ellipse key={y} cx="200" cy={y} rx="180" ry="6" fill="none" stroke="oklch(0.78 0.16 220 / 25%)" />
                  ))}
                  {[-150, -100, -50, 0, 50, 100, 150].map((x) => (
                    <ellipse key={x} cx="200" cy="200" rx={Math.abs(x) || 4} ry="180" fill="none" stroke="oklch(0.78 0.16 220 / 18%)" />
                  ))}
                  {/* "data points" */}
                  {[
                    [140, 130], [240, 170], [180, 220], [260, 260], [120, 250], [220, 110], [290, 200],
                  ].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="3" fill="oklch(0.85 0.18 200)" />
                      <circle cx={x} cy={y} r="8" fill="none" stroke="oklch(0.85 0.18 200 / 60%)">
                        <animate attributeName="r" from="3" to="16" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  ))}
                </svg>
              </div>
              {/* HUD */}
              <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] uppercase tracking-widest text-primary/80">
                <span>Lat 37.77° N</span>
                <span className="animate-pulse">●  Live</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] uppercase tracking-widest text-primary/80">
                <span>Lon 122.41° W</span>
                <span>Aether v1.0</span>
              </div>
            </div>
            {/* Orbiting cards */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-4 left-4 glass-strong rounded-2xl px-4 py-3 text-xs"
            >
              <div className="text-muted-foreground">Global avg</div>
              <div className="font-display text-lg font-semibold">+1.42°C</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 right-4 glass-strong rounded-2xl px-4 py-3 text-xs"
            >
              <div className="text-muted-foreground">AI confidence</div>
              <div className="font-display text-lg font-semibold text-gradient">94.3%</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { i: Activity, t: "Real-time telemetry", d: "Stream temperature, humidity, pressure and wind from global stations." },
            { i: Sparkles, t: "AI prediction engine", d: "Forecast climate trends with confidence-scored model outputs." },
            { i: Shield, t: "Disaster early-warning", d: "Floods, heatwaves, storms and drought signals detected ahead of time." },
            { i: Globe2, t: "Planetary view", d: "Interactive global climate map with regional zoom and overlays." },
            { i: LineChart, t: "Deep analytics", d: "Compare regions, trend historic data and export insights." },
            { i: Zap, t: "Edge-fast", d: "Built on a serverless edge runtime for sub-second responses." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="group glass rounded-3xl p-6 hover:border-primary/40 transition">
              <div className="h-10 w-10 rounded-xl bg-aurora/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        Aether Climate Intelligence · Powered by Open-Meteo
      </footer>
    </div>
  );
}
