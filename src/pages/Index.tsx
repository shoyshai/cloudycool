import { useState, useEffect } from "react";
import { Search, Droplets, Wind, Thermometer, MapPin, CloudOff, LocateFixed } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  date: string;
  dayName: string;
  temp: number;
  tempMin: number;
  condition: string;
  icon: string;
}

const API_KEY = "b1b15e88fa797225412429c1c50c122a1";

const Index = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");

  const toDisplay = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  const fetchByParams = async (params: string) => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

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
        const daily = parseForecast(fData.list);
        setForecast(daily);
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
      }
    );
  };

  useEffect(() => {
    fetchByLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-sky)" }}>
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">
            Weather App
          </h1>
          <p className="text-primary-foreground/70 text-sm">
            Search any city to get current weather
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
            />
          </div>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={fetchByLocation}
            disabled={loading}
            className="px-3 py-3 rounded-lg bg-card text-card-foreground border border-border hover:bg-accent transition-colors disabled:opacity-50"
            title="Use my location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
            <p className="mt-4 text-muted-foreground text-sm">Fetching weather data...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md p-8 text-center animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)" }}>
            <CloudOff className="w-12 h-12 mx-auto text-destructive" />
            <p className="mt-3 text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {weather && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md overflow-hidden animate-fade-in-up" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="p-6 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{weather.city}</h2>
                <p className="text-muted-foreground text-sm">{weather.country}</p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.condition}
                className="w-20 h-20"
              />
            </div>
            <div className="px-6 pb-4">
              <div className="flex items-end gap-2">
                <span className="text-6xl font-extrabold text-card-foreground leading-none">{toDisplay(weather.temp)}</span>
                <div className="flex items-center gap-1 mb-1">
                  <button onClick={() => setUnit("C")} className={`text-lg font-semibold transition-colors ${unit === "C" ? "text-primary" : "text-muted-foreground hover:text-card-foreground"}`}>°C</button>
                  <span className="text-muted-foreground">/</span>
                  <button onClick={() => setUnit("F")} className={`text-lg font-semibold transition-colors ${unit === "F" ? "text-primary" : "text-muted-foreground hover:text-card-foreground"}`}>°F</button>
                </div>
              </div>
              <p className="text-muted-foreground capitalize mt-1">{weather.condition}</p>
            </div>
            <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
              <Stat icon={<Thermometer className="w-4 h-4" />} label="Feels like" value={`${weather.temp}°`} />
              <Stat icon={<Droplets className="w-4 h-4" />} label="Humidity" value={`${weather.humidity}%`} />
              <Stat icon={<Wind className="w-4 h-4" />} label="Wind" value={`${weather.windSpeed} m/s`} />
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md overflow-hidden animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">5-Day Forecast</h3>
            </div>
            <div className="divide-y divide-border">
              {forecast.map((day) => (
                <div key={day.date} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm font-medium text-card-foreground w-10">{day.dayName}</span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.condition}
                    className="w-10 h-10"
                  />
                  <span className="text-xs text-muted-foreground capitalize flex-1 text-center truncate px-2">{day.condition}</span>
                  <div className="text-sm text-right">
                    <span className="font-semibold text-card-foreground">{day.temp}°</span>
                    <span className="text-muted-foreground ml-1">{day.tempMin}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-4 text-center space-y-1">
    <div className="flex justify-center text-primary">{icon}</div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-card-foreground">{value}</p>
  </div>
);

export default Index;
