import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";
import { LocationSearch } from "@/components/location-search";
import { useGeoLocation } from "@/hooks/use-geo-location";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Aether" }, { name: "description", content: "Customize your Aether climate intelligence experience." }] }),
  component: Settings,
});

function Settings() {
  const { location, status, requestBrowserLocation, updateLocation } = useGeoLocation();

  return (
    <DashboardShell>
      <PageHeader eyebrow="Preferences" title="Settings" description="Configure your default location and Aether preferences." />
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display font-semibold mb-2">Default location</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Currently: <span className="text-foreground font-medium">{location.name ?? "—"}</span> ({location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
          </p>
          <LocationSearch current={location} onSelect={updateLocation} onUseDevice={requestBrowserLocation} isLocating={status === "loading"} />
        </GlassCard>

        <GlassCard>
          <h3 className="font-display font-semibold mb-2">About this build</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Aether v1.0 · TanStack Start · React 19</li>
            <li>Weather: Open-Meteo (free, no key)</li>
            <li>Air quality: Open-Meteo air-quality API</li>
            <li>AI inference: client-side rule-based engine</li>
          </ul>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
