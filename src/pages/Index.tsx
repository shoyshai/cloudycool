import { useState } from "react";
import { Search, Droplets, Wind, Thermometer, MapPin, CloudOff } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const API_KEY = "b1b15e88fa797225412429c1c50c122a1"; // OpenWeatherMap demo key

const Index = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather({
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      });
    } catch {
      setError("Could not find that city. Please try again.");
    } finally {
      setLoading(false);
    }
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
            {/* City & Icon */}
            <div className="p-6 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">
                  {weather.city}
                </h2>
                <p className="text-muted-foreground text-sm">{weather.country}</p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.condition}
                className="w-20 h-20"
              />
            </div>

            {/* Temperature */}
            <div className="px-6 pb-4">
              <div className="flex items-end gap-1">
                <span className="text-6xl font-extrabold text-card-foreground leading-none">
                  {weather.temp}
                </span>
                <span className="text-2xl font-semibold text-muted-foreground mb-1">°C</span>
              </div>
              <p className="text-muted-foreground capitalize mt-1">{weather.condition}</p>
            </div>

            {/* Stats */}
            <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
              <Stat icon={<Thermometer className="w-4 h-4" />} label="Feels like" value={`${weather.temp}°`} />
              <Stat icon={<Droplets className="w-4 h-4" />} label="Humidity" value={`${weather.humidity}%`} />
              <Stat icon={<Wind className="w-4 h-4" />} label="Wind" value={`${weather.windSpeed} m/s`} />
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
