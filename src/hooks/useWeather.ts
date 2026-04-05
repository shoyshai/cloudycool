import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────
export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  temp: number;
  tempMin: number;
  condition: string;
  icon: string;
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export type LocationSource = "gps" | "saved" | "ip" | "manual" | null;

// ── Constants ──────────────────────────────────────────────────────
const API_KEY = "b1b15e88fa797225412429c1c50c122a1";
const STORAGE_KEY = "cloudycool_last_location";
const SAVED_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const REVERSE_GEO_TIMEOUT_MS = 5000;

// ── Known urban area overrides ─────────────────────────────────────
// Bounding boxes for large cities whose suburbs often resolve to wrong names
const CITY_OVERRIDES: { name: string; latMin: number; latMax: number; lonMin: number; lonMax: number }[] = [
  { name: "Pune", latMin: 18.40, latMax: 18.65, lonMin: 73.75, lonMax: 73.98 },
  { name: "Mumbai", latMin: 18.89, latMax: 19.27, lonMin: 72.77, lonMax: 72.98 },
  { name: "Delhi", latMin: 28.40, latMax: 28.88, lonMin: 76.84, lonMax: 77.35 },
  { name: "Bangalore", latMin: 12.85, latMax: 13.14, lonMin: 77.46, lonMax: 77.78 },
  { name: "Hyderabad", latMin: 17.30, latMax: 17.55, lonMin: 78.35, lonMax: 78.60 },
  { name: "Chennai", latMin: 12.95, latMax: 13.20, lonMin: 80.15, lonMax: 80.30 },
];

const overrideCityName = (lat: number, lon: number, resolved: string | null): string | null => {
  for (const c of CITY_OVERRIDES) {
    if (lat >= c.latMin && lat <= c.latMax && lon >= c.lonMin && lon <= c.lonMax) {
      console.debug(`[location] Coordinates (${lat},${lon}) inside ${c.name} bounding box — overriding "${resolved}" → "${c.name}"`);
      return c.name;
    }
  }
  return resolved;
};

// ── LocalStorage helpers ───────────────────────────────────────────
interface SavedLocation {
  lat: number;
  lon: number;
  city: string;
  state?: string;
  ts: number; // saved timestamp
}

const saveLocation = (loc: Omit<SavedLocation, "ts">) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, ts: Date.now() }));
    console.debug("[location] Saved to localStorage:", loc.city);
  } catch {}
};

const loadSavedLocation = (): SavedLocation | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: SavedLocation = JSON.parse(raw);
    const age = Date.now() - (parsed.ts || 0);
    if (age > SAVED_MAX_AGE_MS) {
      console.debug("[location] Saved location expired (age:", Math.round(age / 1000), "s)");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// ── Reverse geocoding (Nominatim) with timeout ────────────────────
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REVERSE_GEO_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=14`,
      { headers: { "Accept-Language": "en" }, signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address;
    const resolved = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district || null;
    console.debug("[location] Nominatim resolved:", resolved, "| raw addr:", JSON.stringify(addr));
    // Apply bounding-box override
    return overrideCityName(lat, lon, resolved);
  } catch (e) {
    clearTimeout(timer);
    console.warn("[location] Reverse geocoding failed:", e);
    return null;
  }
};

// ── IP-based fallback ──────────────────────────────────────────────
const getIpLocation = async (): Promise<{ lat: number; lon: number; city: string } | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      console.debug("[location] IP location:", data.city, data.latitude, data.longitude);
      return { lat: data.latitude, lon: data.longitude, city: data.city || "Unknown" };
    }
    return null;
  } catch {
    return null;
  }
};

// ── Forecast parser ────────────────────────────────────────────────
const parseForecast = (list: any[]): ForecastDay[] => {
  const days: Record<string, any[]> = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  const today = new Date().toISOString().split("T")[0];
  return Object.entries(days)
    .filter(([date]) => date !== today)
    .slice(0, 5)
    .map(([date, items]) => {
      const midday = items.find((i) => i.dt_txt.includes("12:00")) || items[0];
      const temps = items.map((i) => i.main.temp);
      const d = new Date(date);
      return {
        date,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        temp: Math.round(midday.main.temp),
        tempMin: Math.round(Math.min(...temps)),
        condition: midday.weather[0].description,
        icon: midday.weather[0].icon,
      };
    });
};

// ── Hook ───────────────────────────────────────────────────────────
export const useWeather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [locationSource, setLocationSource] = useState<LocationSource>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Race-condition guard: only the latest request ID is honored
  const requestIdRef = useRef(0);

  const toDisplay = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  /** Core weather fetch — always by coordinates */
  const fetchWeatherByCoords = useCallback(async (
    lat: number, lon: number, cityLabel: string, source: LocationSource, reqId: number
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = `lat=${lat}&lon=${lon}`;
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
      ]);

      // Race-condition check: discard if a newer request was started
      if (reqId !== requestIdRef.current) {
        console.debug("[location] Discarding stale response for reqId", reqId);
        return;
      }

      if (!currentRes.ok) throw new Error("Weather data not available");
      const data = await currentRes.json();

      const displayCity = cityLabel || data.name;
      console.debug(`[location] Displaying weather for "${displayCity}" (source: ${source}, reqId: ${reqId})`);

      setCity(displayCity);
      setLocationSource(source);
      setWeather({
        city: displayCity,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      });
      setForecast([]);

      if (forecastRes.ok) {
        const fData = await forecastRes.json();
        if (reqId === requestIdRef.current) {
          setForecast(parseForecast(fData.list));
        }
      }

      saveLocation({ lat, lon, city: displayCity });
    } catch {
      if (reqId === requestIdRef.current) {
        setError("Could not fetch weather data. Please try again.");
      }
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /** Start a new request (bumps requestId) */
  const startRequest = () => {
    const id = ++requestIdRef.current;
    setWeather(null);
    setForecast([]);
    setSuggestions([]);
    return id;
  };

  /** Resolve coordinates → city label → fetch weather */
  const resolveAndFetch = useCallback(async (
    lat: number, lon: number, source: LocationSource
  ) => {
    const reqId = startRequest();
    const cityLabel = await reverseGeocode(lat, lon) || "Current Location";
    if (reqId !== requestIdRef.current) return;
    await fetchWeatherByCoords(lat, lon, cityLabel, source, reqId);
  }, [fetchWeatherByCoords]);

  /** Manual search by city name query */
  const fetchByQuery = useCallback(async (query: string) => {
    const reqId = startRequest();
    setLoading(true);
    setError("");
    try {
      const params = `q=${encodeURIComponent(query)}`;
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
      ]);
      if (reqId !== requestIdRef.current) return;
      if (!currentRes.ok) throw new Error("City not found");
      const data = await currentRes.json();

      setCity(data.name);
      setLocationSource("manual");
      setWeather({
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      });
      if (forecastRes.ok) {
        const fData = await forecastRes.json();
        if (reqId === requestIdRef.current) setForecast(parseForecast(fData.list));
      }
      saveLocation({ lat: data.coord.lat, lon: data.coord.lon, city: data.name });
    } catch {
      if (reqId === requestIdRef.current) setError("Could not find that city. Please try again.");
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!city.trim()) return;
    await fetchByQuery(city.trim());
  }, [city, fetchByQuery]);

  /** Called when user selects an autocomplete suggestion */
  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    await resolveAndFetch(lat, lon, "manual");
  }, [resolveAndFetch]);

  /** Detect location: GPS → saved (if fresh) → IP fallback */
  const detectLocation = useCallback(() => {
    setDetectingLocation(true);
    setError("");
    console.debug("[location] Starting detection chain...");

    const finish = () => setDetectingLocation(false);

    // Step 1: Try GPS
    if (!navigator.geolocation) {
      console.debug("[location] Geolocation API not available");
      tryFallbacks("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.debug("[location] GPS success:", pos.coords.latitude, pos.coords.longitude, "accuracy:", pos.coords.accuracy, "m");
        finish();
        await resolveAndFetch(pos.coords.latitude, pos.coords.longitude, "gps");
      },
      (err) => {
        console.warn("[location] GPS failed:", err.code, err.message);
        let reason = "Location access denied.";
        if (err.code === 3) reason = "Location request timed out.";
        else if (err.code === 2) reason = "Location unavailable.";
        tryFallbacks(reason);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    async function tryFallbacks(gpsReason: string) {
      // Step 2: Try fresh saved location
      const saved = loadSavedLocation();
      if (saved) {
        console.debug("[location] Using saved location:", saved.city);
        finish();
        const reqId = startRequest();
        await fetchWeatherByCoords(saved.lat, saved.lon, saved.city, "saved", reqId);
        return;
      }

      // Step 3: IP fallback
      console.debug("[location] Trying IP fallback...");
      const ipLoc = await getIpLocation();
      if (ipLoc) {
        finish();
        await resolveAndFetch(ipLoc.lat, ipLoc.lon, "ip");
        return;
      }

      // All failed
      finish();
      setError(`${gpsReason} Please search for a city manually.`);
    }
  }, [resolveAndFetch, fetchWeatherByCoords]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(
          data.map((item: any) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon,
          }))
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    city, setCity,
    weather, forecast, loading, error, unit, setUnit,
    toDisplay, fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation,
  };
};
