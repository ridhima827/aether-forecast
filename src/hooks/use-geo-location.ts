import { useEffect, useState } from "react";
import type { GeoLocation } from "@/services/weather";
import { DEFAULT_LOCATION } from "@/services/weather";

const STORAGE_KEY = "climate.location";

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "denied">("idle");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLocation(JSON.parse(saved));
        setStatus("ready");
        return;
      }
    } catch {}
    setStatus("ready");
  }, []);

  const requestBrowserLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: GeoLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: "Your location",
        };
        setLocation(loc);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
        setStatus("ready");
      },
      () => setStatus("denied"),
      { timeout: 8000 },
    );
  };

  const updateLocation = (loc: GeoLocation) => {
    setLocation(loc);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
  };

  return { location, status, requestBrowserLocation, updateLocation };
}
