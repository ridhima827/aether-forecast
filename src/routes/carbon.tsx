import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Car, Plane, Zap } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard, StatCard } from "@/components/glass-card";

export const Route = createFileRoute("/carbon")({
  head: () => ({ meta: [{ title: "Carbon Tracking · Aether" }, { name: "description", content: "Estimate and reduce your personal carbon footprint." }] }),
  component: Carbon,
});

function Carbon() {
  const [car, setCar] = useState(100);
  const [flights, setFlights] = useState(2);
  const [kwh, setKwh] = useState(300);

  // Rough factors (kg CO2)
  const carCo2 = car * 4 * 0.21;        // km/week → year
  const flightCo2 = flights * 250;       // per short-haul
  const electricityCo2 = kwh * 12 * 0.4; // monthly kWh → year × intensity
  const total = carCo2 + flightCo2 + electricityCo2;

  return (
    <DashboardShell>
      <PageHeader eyebrow="Footprint" title="Carbon tracking" description="Estimate your annual CO₂ emissions and explore reduction levers." />

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-6">Lifestyle inputs</h3>
          <div className="space-y-6">
            <Slider icon={<Car className="h-4 w-4" />} label="Car · km per week" value={car} onChange={setCar} max={500} unit="km" />
            <Slider icon={<Plane className="h-4 w-4" />} label="Short-haul flights / year" value={flights} onChange={setFlights} max={20} />
            <Slider icon={<Zap className="h-4 w-4" />} label="Electricity · kWh per month" value={kwh} onChange={setKwh} max={1500} unit="kWh" />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="text-center bg-aurora/10">
            <div className="text-xs uppercase tracking-widest text-primary flex items-center gap-2 justify-center">
              <Leaf className="h-3.5 w-3.5" /> Estimated annual CO₂
            </div>
            <div className="mt-3 font-display text-5xl font-semibold text-gradient">
              {(total / 1000).toFixed(2)}<span className="text-xl text-muted-foreground"> t</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {total < 4000 ? "Below world average" : total < 8000 ? "Around world average" : "Above world average — consider reduction"}
            </p>
          </GlassCard>
          <StatCard label="Transport" value={(carCo2 / 1000).toFixed(2)} unit="t CO₂" />
          <StatCard label="Flights" value={(flightCo2 / 1000).toFixed(2)} unit="t CO₂" />
          <StatCard label="Electricity" value={(electricityCo2 / 1000).toFixed(2)} unit="t CO₂" />
        </div>
      </div>
    </DashboardShell>
  );
}

function Slider({ icon, label, value, onChange, max, unit }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void; max: number; unit?: string; }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
        <span className="font-display font-semibold">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
