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

export interface HourlyForecast {
  time: string;
  temp: number;
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

export interface AqiData {
  index: number; // 1-5
  label: string;
  hint: string;
}

export type LocationSource = "gps" | "saved" | "ip" | "manual" | null;

// ── Constants ──────────────────────────────────────────────────────
const API_KEY = "b1b15e88fa797225412429c1c50c122a1";
const STORAGE_KEY = "cloudycool_last_location";
const SAVED_MAX_AGE_MS = 30 * 60 * 1000;
const REVERSE_GEO_TIMEOUT_MS = 5000;

// ── AQI helpers ────────────────────────────────────────────────────
const AQI_MAP: Record<number, { label: string; hint: string }> = {
  1: { label: "Good", hint: "Air quality is satisfactory." },
  2: { label: "Fair", hint: "Acceptable for most people." },
  3: { label: "Moderate", hint: "Sensitive groups may be affected." },
  4: { label: "Poor", hint: "Health effects possible for everyone." },
  5: { label: "Very Poor", hint: "Serious health risk. Avoid outdoor activity." },
};

const fetchAQIByCoords = async (lat: number, lon: number): Promise<AqiData | null> => {
  console.debug(`[aqi] Fetching AQI for (${lat}, ${lon})`);
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (!res.ok) {
      console.warn("[aqi] API returned", res.status);
      return null;
    }
    const data = await res.json();
    const index = data.list?.[0]?.main?.aqi;
    if (!index || !AQI_MAP[index]) {
      console.warn("[aqi] Invalid AQI index:", index);
      return null;
    }
    const result = { index, ...AQI_MAP[index] };
    console.debug("[aqi] Success:", result);
    return result;
  } catch (e) {
    console.warn("[aqi] Fetch failed:", e);
    return null;
  }
};

// ── Dynamic city-label resolver ────────────────────────────────────
const CANDIDATE_FIELDS: { key: string; score: number }[] = [
  { key: "city", score: 100 },
  { key: "town", score: 95 },
  { key: "municipality", score: 90 },
  { key: "suburb", score: 70 },
  { key: "borough", score: 65 },
  { key: "village", score: 60 },
  { key: "county", score: 30 },
  { key: "district", score: 25 },
  { key: "state_district", score: 20 },
];

interface LabelCandidate { label: string; field: string; score: number; }

function resolveBestLocationLabel(
  addr: Record<string, string> | null,
  weatherName: string | null,
  state?: string,
  country?: string
): { label: string; source: "geocode" | "weather" | "fallback" } {
  const rejectSet = new Set<string>();
  if (state) rejectSet.add(state.toLowerCase());
  if (country) rejectSet.add(country.toLowerCase());

  const candidates: LabelCandidate[] = [];
  const seen = new Set<string>();

  if (addr) {
    for (const { key, score } of CANDIDATE_FIELDS) {
      const val = addr[key];
      if (!val) continue;
      const norm = val.trim();
      const lower = norm.toLowerCase();
      if (seen.has(lower) || rejectSet.has(lower)) continue;
      seen.add(lower);
      candidates.push({ label: norm, field: key, score });
    }
  }

  console.debug("[label-resolver] Candidates:", candidates.map(c => `${c.label} (${c.field}: ${c.score})`));

  const bestGeo = candidates.length > 0
    ? candidates.reduce((a, b) => a.score >= b.score ? a : b)
    : null;

  const weatherNorm = weatherName?.trim() || null;
  const weatherLower = weatherNorm?.toLowerCase();
  const weatherValid = weatherNorm && weatherLower && !rejectSet.has(weatherLower);

  let weatherScore = 50;
  if (weatherValid && weatherLower) {
    const matchingGeo = candidates.find(c => c.label.toLowerCase() === weatherLower);
    if (matchingGeo) weatherScore = matchingGeo.score;
  }

  if (bestGeo && (!weatherValid || bestGeo.score >= weatherScore)) {
    console.debug(`[label-resolver] Winner: "${bestGeo.label}" from geocode`);
    return { label: bestGeo.label, source: "geocode" };
  }
  if (weatherValid && weatherNorm) {
    console.debug(`[label-resolver] Winner: "${weatherNorm}" from weather API`);
    return { label: weatherNorm, source: "weather" };
  }
  return { label: "Current Location", source: "fallback" };
}

// ── LocalStorage helpers ───────────────────────────────────────────
interface SavedLocation { lat: number; lon: number; city: string; state?: string; ts: number; }

const saveLocation = (loc: Omit<SavedLocation, "ts">) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, ts: Date.now() }));
  } catch {}
};

const loadSavedLocation = (): SavedLocation | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: SavedLocation = JSON.parse(raw);
    if (Date.now() - (parsed.ts || 0) > SAVED_MAX_AGE_MS) return null;
    return parsed;
  } catch { return null; }
};

// ── Reverse geocoding ──────────────────────────────────────────────
interface ReverseGeoResult { addr: Record<string, string>; state?: string; country?: string; }

const reverseGeocode = async (lat: number, lon: number): Promise<ReverseGeoResult | null> => {
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
    const addr = data.address || {};
    console.debug("[location] Nominatim raw:", JSON.stringify(addr));
    return { addr, state: addr.state, country: addr.country };
  } catch (e) {
    clearTimeout(timer);
    console.warn("[location] Reverse geocoding failed:", e);
    return null;
  }
};

// ── IP fallback ────────────────────────────────────────────────────
const getIpLocation = async (): Promise<{ lat: number; lon: number; city: string } | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) return { lat: data.latitude, lon: data.longitude, city: data.city || "Unknown" };
    return null;
  } catch { return null; }
};

// ── Hourly forecast parser ─────────────────────────────────────────
const parseHourlyForToday = (list: any[]): HourlyForecast[] => {
  const today = new Date().toISOString().split("T")[0];
  const entries = list
    .filter((item) => item.dt_txt.startsWith(today))
    .map((item) => ({
      time: new Date(item.dt_txt).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].description,
      icon: item.weather[0].icon,
    }));
  console.debug(`[hourly] Parsed ${entries.length} entries for today (${today})`);
  return entries;
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
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [locationSource, setLocationSource] = useState<LocationSource>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const requestIdRef = useRef(0);

  const toDisplay = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  /** Core weather + AQI fetch — always by coordinates */
  const fetchWeatherByCoords = useCallback(async (
    lat: number, lon: number, geoResult: ReverseGeoResult | null, source: LocationSource, reqId: number
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = `lat=${lat}&lon=${lon}`;
      // Fetch weather + forecast + AQI in parallel; AQI uses allSettled so it can't break weather
      const [currentRes, forecastRes, aqiResult] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
        fetchAQIByCoords(lat, lon).catch(() => null),
      ]);

      if (reqId !== requestIdRef.current) return;

      if (!currentRes.ok) throw new Error("Weather data not available");
      const data = await currentRes.json();

      const { label: displayCity } = resolveBestLocationLabel(
        geoResult?.addr || null, data.name, geoResult?.state, geoResult?.country
      );

      console.debug(`[location] Final: "${displayCity}" (source: ${source}, reqId: ${reqId})`);

      setCity(displayCity);
      setLocationSource(source);
      setWeather({
        city: displayCity, country: data.sys.country,
        temp: Math.round(data.main.temp), condition: data.weather[0].description,
        humidity: data.main.humidity, windSpeed: data.wind.speed, icon: data.weather[0].icon,
      });
      setForecast([]);
      setAqi(aqiResult);
      if (!aqiResult) console.debug("[aqi] AQI unavailable for this location");

      if (forecastRes.ok) {
        const fData = await forecastRes.json();
        if (reqId === requestIdRef.current) setForecast(parseForecast(fData.list));
      }

      saveLocation({ lat, lon, city: displayCity, state: geoResult?.state });
    } catch {
      if (reqId === requestIdRef.current) setError("Could not fetch weather data. Please try again.");
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const startRequest = () => {
    const id = ++requestIdRef.current;
    setWeather(null);
    setForecast([]);
    setSuggestions([]);
    setAqi(null);
    return id;
  };

  const resolveAndFetch = useCallback(async (lat: number, lon: number, source: LocationSource) => {
    const reqId = startRequest();
    const geoResult = await reverseGeocode(lat, lon);
    if (reqId !== requestIdRef.current) return;
    await fetchWeatherByCoords(lat, lon, geoResult, source, reqId);
  }, [fetchWeatherByCoords]);

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

      // Also fetch AQI for the searched city's coords
      const aqiResult = await fetchAQIByCoords(data.coord.lat, data.coord.lon).catch(() => null);
      if (reqId !== requestIdRef.current) return;

      setCity(data.name);
      setLocationSource("manual");
      setWeather({
        city: data.name, country: data.sys.country,
        temp: Math.round(data.main.temp), condition: data.weather[0].description,
        humidity: data.main.humidity, windSpeed: data.wind.speed, icon: data.weather[0].icon,
      });
      setAqi(aqiResult);
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

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    await resolveAndFetch(lat, lon, "manual");
  }, [resolveAndFetch]);

  const detectLocation = useCallback(() => {
    setDetectingLocation(true);
    setError("");

    const finish = () => setDetectingLocation(false);

    if (!navigator.geolocation) {
      tryFallbacks("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.debug("[location] GPS success:", pos.coords.latitude, pos.coords.longitude);
        finish();
        await resolveAndFetch(pos.coords.latitude, pos.coords.longitude, "gps");
      },
      (err) => {
        let reason = "Location access denied.";
        if (err.code === 3) reason = "Location request timed out.";
        else if (err.code === 2) reason = "Location unavailable.";
        tryFallbacks(reason);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    async function tryFallbacks(gpsReason: string) {
      const saved = loadSavedLocation();
      if (saved) {
        finish();
        const reqId = startRequest();
        await fetchWeatherByCoords(saved.lat, saved.lon, null, "saved", reqId);
        return;
      }
      const ipLoc = await getIpLocation();
      if (ipLoc) {
        finish();
        await resolveAndFetch(ipLoc.lat, ipLoc.lon, "ip");
        return;
      }
      finish();
      setError(`${gpsReason} Please search for a city manually.`);
    }
  }, [resolveAndFetch, fetchWeatherByCoords]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.map((item: any) => ({
          name: item.name, country: item.country, state: item.state, lat: item.lat, lon: item.lon,
        })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    city, setCity,
    weather, forecast, aqi, loading, error, unit, setUnit,
    toDisplay, fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation,
  };
};
