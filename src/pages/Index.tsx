import { Droplets, Wind, Thermometer, CloudOff, LocateFixed, Info } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import CitySearch from "@/components/CitySearch";

const Index = () => {
  const {
    city, setCity, weather, forecast, loading, error,
    unit, setUnit, toDisplay,
    fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation,
  } = useWeather();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-sky)" }}>
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">Weather App</h1>
          <p className="text-primary-foreground/70 text-sm">Search any city to get current weather</p>
        </div>

        {/* Search */}
        <CitySearch
          city={city}
          setCity={setCity}
          loading={loading}
          suggestions={suggestions}
          onSearch={fetchWeather}
          onLocate={detectLocation}
          onSelectSuggestion={(s) => {
            setSuggestions([]);
            fetchByCoords(s.lat, s.lon);
          }}
          onQueryChange={fetchSuggestions}
        />

        {/* Detecting location */}
        {detectingLocation && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <LocateFixed className="w-10 h-10 mx-auto text-primary animate-pulse" />
            <p className="mt-4 text-muted-foreground text-sm">Detecting your location...</p>
          </div>
        )}

        {/* Loading weather */}
        {loading && !detectingLocation && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
            <p className="mt-4 text-muted-foreground text-sm">Fetching weather data...</p>
          </div>
        )}

        {/* Error */}
        {error && !detectingLocation && (
          <div className="rounded-xl bg-card/80 backdrop-blur-md p-8 text-center animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)" }}>
            <CloudOff className="w-12 h-12 mx-auto text-destructive" />
            <p className="mt-3 text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* IP fallback note */}
        {locationSource === "ip" && weather && (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-4 py-2 text-xs text-muted-foreground animate-fade-in-up">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Showing approximate location from network. Use the location button for better accuracy.</span>
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
              <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} className="w-20 h-20" />
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
              <Stat icon={<Thermometer className="w-4 h-4" />} label="Feels like" value={`${toDisplay(weather.temp)}°`} />
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
                  <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="w-10 h-10" />
                  <span className="text-xs text-muted-foreground capitalize flex-1 text-center truncate px-2">{day.condition}</span>
                  <div className="text-sm text-right">
                    <span className="font-semibold text-card-foreground">{toDisplay(day.temp)}°</span>
                    <span className="text-muted-foreground ml-1">{toDisplay(day.tempMin)}°</span>
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
