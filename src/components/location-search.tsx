import { useState, type FormEvent } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { geocodeCity, type GeoLocation } from "@/services/weather";

export function LocationSearch({
  current,
  onSelect,
  onUseDevice,
  isLocating,
}: {
  current: GeoLocation;
  onSelect: (loc: GeoLocation) => void;
  onUseDevice: () => void;
  isLocating?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await geocodeCity(query.trim());
      setResults(r);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full sm:w-auto">
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder={`Search city · ${current.name ?? ""}`}
            className="w-full glass rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/50 transition"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={onUseDevice}
          className="glass rounded-xl px-3 py-2.5 text-sm flex items-center gap-2 hover:border-primary/50 transition"
          title="Use my location"
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="hidden sm:inline">GPS</span>
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full glass-strong rounded-xl overflow-hidden shadow-elevated">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(r);
                setOpen(false);
                setQuery("");
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-sidebar-accent text-sm flex items-center justify-between"
            >
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
