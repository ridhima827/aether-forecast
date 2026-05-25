// Open-Meteo (no API key required) weather service
// Docs: https://open-meteo.com/

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
}

export interface AirQuality {
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2: number;
  co: number;
  europeanAqi: number;
  usAqi: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
  country?: string;
}

export interface WeatherBundle {
  location: GeoLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyPoint[];
}

const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const AIR_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocodeCity(query: string): Promise<GeoLocation[]> {
  const url = `${GEO_BASE}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    name: r.name,
    country: r.country,
  }));
}

export async function fetchWeatherBundle(loc: GeoLocation): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index,weather_code,is_day",
    hourly: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,uv_index_max,sunrise,sunset",
    forecast_days: "7",
    timezone: "auto",
  });
  const res = await fetch(`${WEATHER_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const c = data.current;
  const d = data.daily;
  const h = data.hourly;

  const daily: DailyForecast[] = d.time.map((t: string, i: number) => ({
    date: t,
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    precipitation: d.precipitation_sum[i],
    precipitationProbability: d.precipitation_probability_max[i] ?? 0,
    weatherCode: d.weather_code[i],
    windSpeedMax: d.wind_speed_10m_max[i],
    uvIndexMax: d.uv_index_max[i] ?? 0,
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
  }));

  const hourly: HourlyPoint[] = h.time.slice(0, 24).map((t: string, i: number) => ({
    time: t,
    temperature: h.temperature_2m[i],
    humidity: h.relative_humidity_2m[i],
    precipitation: h.precipitation[i],
    windSpeed: h.wind_speed_10m[i],
  }));

  return {
    location: loc,
    current: {
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      pressure: c.pressure_msl,
      cloudCover: c.cloud_cover,
      uvIndex: c.uv_index,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
      time: c.time,
    },
    daily,
    hourly,
  };
}

export async function fetchAirQuality(loc: GeoLocation): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    current: "pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide,european_aqi,us_aqi",
  });
  const res = await fetch(`${AIR_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Air quality fetch failed");
  const data = await res.json();
  const c = data.current;
  return {
    pm2_5: c.pm2_5,
    pm10: c.pm10,
    ozone: c.ozone,
    no2: c.nitrogen_dioxide,
    co: c.carbon_monoxide,
    europeanAqi: c.european_aqi,
    usAqi: c.us_aqi,
  };
}

// Weather code → label/icon per WMO
export function describeWeather(code: number): { label: string; emoji: string } {
  const map: Record<number, [string, string]> = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌧️"],
    61: ["Light rain", "🌧️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "⛈️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "🌨️"],
    75: ["Heavy snow", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Heavy showers", "🌧️"],
    82: ["Violent showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm + hail", "⛈️"],
    99: ["Severe thunderstorm", "⛈️"],
  };
  const [label, emoji] = map[code] ?? ["Unknown", "🌡️"];
  return { label, emoji };
}

export const DEFAULT_LOCATION: GeoLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  name: "San Francisco",
  country: "United States",
};
