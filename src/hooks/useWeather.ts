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

const API_KEY = "b1b15e88fa797225412429c1c50c122a1";

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

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export const useWeather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);

  const toDisplay = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  const fetchByParams = async (params: string) => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);
    setSuggestions([]);

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&units=metric&appid=${API_KEY}`),
      ]);

      if (!currentRes.ok) throw new Error("City not found");
      const data = await currentRes.json();
      setCity(data.name);
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
    } catch {
      setError("Could not find that city. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;
    await fetchByParams(`q=${encodeURIComponent(city.trim())}`);
  };

  const fetchByCoords = async (lat: number, lon: number) => {
    await fetchByParams(`lat=${lat}&lon=${lon}`);
  };

  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByParams(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
      () => {
        setLoading(false);
        setError("Location access denied. Please search manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
    } catch {
      // silently ignore autocomplete errors
    }
  }, []);

  useEffect(() => {
    fetchByLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    city, setCity,
    weather, forecast, loading, error, unit, setUnit,
    toDisplay, fetchWeather, fetchByLocation, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
  };
};
