import { useState, useEffect, useCallback } from "react";

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

const API_KEY = "b1b15e88fa797225412429c1c50c122a1";
const STORAGE_KEY = "cloudycool_last_location";

interface SavedLocation {
  lat: number;
  lon: number;
  city: string;
}

const saveLocation = (loc: SavedLocation) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
};

const loadSavedLocation = (): SavedLocation | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Reverse geocode via Nominatim for accurate city name */
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=14`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address;
    // Priority: city > town > village > suburb > county/district
    return addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district || null;
  } catch {
    return null;
  }
};

/** IP-based fallback location */
const getIpLocation = async (): Promise<{ lat: number; lon: number; city: string } | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lon: data.longitude, city: data.city || "Unknown" };
    }
    return null;
  } catch { return null; }
};

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

  const toDisplay = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  const fetchWeatherByCoords = async (lat: number, lon: number, cityOverride?: string, source?: LocationSource) => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);
    setSuggestions([]);

    try {
      const params = `lat=${lat}&lon=${lon}`;
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
      ]);

      if (!currentRes.ok) throw new Error("Weather data not available");
      const data = await currentRes.json();

      // Use override city name (from reverse geocoding) if provided
      const displayCity = cityOverride || data.name;
      setCity(displayCity);
      if (source) setLocationSource(source);

      setWeather({
        city: displayCity,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      });

      if (forecastRes.ok) {
        const fData = await forecastRes.json();
        setForecast(parseForecast(fData.list));
      }

      // Save confirmed location
      saveLocation({ lat, lon, city: displayCity });
    } catch {
      setError("Could not fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchByQuery = async (query: string) => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);
    setSuggestions([]);

    try {
      const params = `q=${encodeURIComponent(query)}`;
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
      ]);

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
        setForecast(parseForecast(fData.list));
      }

      saveLocation({ lat: data.coord.lat, lon: data.coord.lon, city: data.name });
    } catch {
      setError("Could not find that city. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;
    await fetchByQuery(city.trim());
  };

  const fetchByCoords = async (lat: number, lon: number) => {
    const cityName = await reverseGeocode(lat, lon);
    await fetchWeatherByCoords(lat, lon, cityName || undefined, "manual");
  };

  /** Detect location using GPS → saved → IP fallback chain */
  const detectLocation = useCallback(() => {
    setDetectingLocation(true);
    setError("");

    const tryGPS = () => {
      if (!navigator.geolocation) {
        tryFallbacks("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const cityName = await reverseGeocode(latitude, longitude);
          setDetectingLocation(false);
          await fetchWeatherByCoords(latitude, longitude, cityName || undefined, "gps");
        },
        (err) => {
          let reason = "Location access denied.";
          if (err.code === 3) reason = "Location request timed out.";
          else if (err.code === 2) reason = "Location unavailable.";
          tryFallbacks(reason);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const tryFallbacks = async (gpsReason: string) => {
      // Try saved location first
      const saved = loadSavedLocation();
      if (saved) {
        setDetectingLocation(false);
        await fetchWeatherByCoords(saved.lat, saved.lon, saved.city, "saved");
        return;
      }

      // Try IP-based fallback
      const ipLoc = await getIpLocation();
      if (ipLoc) {
        setDetectingLocation(false);
        const cityName = await reverseGeocode(ipLoc.lat, ipLoc.lon);
        await fetchWeatherByCoords(ipLoc.lat, ipLoc.lon, cityName || ipLoc.city, "ip");
        return;
      }

      // All failed
      setDetectingLocation(false);
      setError(`${gpsReason} Please search for a city manually.`);
    };

    tryGPS();
  }, []);

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
