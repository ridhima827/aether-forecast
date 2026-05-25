import { createFileRoute } from "@tanstack/react-router";
import { Newspaper, ExternalLink } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/dashboard-shell";
import { GlassCard } from "@/components/glass-card";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News · Aether" }, { name: "description", content: "Curated climate and weather news sources." }] }),
  component: News,
});

const SOURCES = [
  { name: "NASA Climate", desc: "Authoritative climate science and satellite imagery.", url: "https://climate.nasa.gov/" },
  { name: "NOAA Climate.gov", desc: "Climate news, data and outreach from NOAA.", url: "https://www.climate.gov/news-features" },
  { name: "BBC Climate", desc: "Global climate coverage from the BBC.", url: "https://www.bbc.com/news/science_and_environment" },
  { name: "Carbon Brief", desc: "Clear, evidence-based climate journalism.", url: "https://www.carbonbrief.org/" },
  { name: "The Guardian – Environment", desc: "In-depth environmental and climate reporting.", url: "https://www.theguardian.com/environment/climate-crisis" },
  { name: "Open-Meteo Blog", desc: "Updates from the weather API powering Aether.", url: "https://open-meteo.com/en/blog" },
];

function News() {
  return (
    <DashboardShell>
      <PageHeader eyebrow="Stay informed" title="Climate news" description="Curated, trustworthy sources covering atmospheric and climate science." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOURCES.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="group">
            <GlassCard className="h-full hover:border-primary/40">
              <div className="h-10 w-10 rounded-xl bg-aurora/20 flex items-center justify-center text-primary mb-3">
                <Newspaper className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold flex items-center gap-2">
                {s.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </GlassCard>
          </a>
        ))}
      </div>
    </DashboardShell>
  );
}
