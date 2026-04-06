import { Droplets, Wind, Thermometer, CloudOff, LocateFixed, Info, Sun, Moon, Leaf, Clock, CalendarDays } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useTheme } from "@/hooks/useTheme";
import { getWeatherBackground } from "@/lib/weatherBackgrounds";
import CitySearch from "@/components/CitySearch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { AqiData, HourlyForecast } from "@/hooks/useWeather";

const AQI_COLORS: Record<number, string> = {
  1: "var(--aqi-good)",
  2: "var(--aqi-fair)",
  3: "var(--aqi-moderate)",
  4: "var(--aqi-poor)",
  5: "var(--aqi-very-poor)",
};

const glassCardClass = "rounded-3xl border border-white/25 bg-white/20 backdrop-blur-2xl shadow-[0_24px_70px_-35px_rgba(15,23,42,0.95)]";

const Index = () => {
  const {
    city, setCity, weather, forecast, hourly, aqi, loading, error,
    unit, setUnit, toDisplay,
    fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation,
  } = useWeather();

  const { theme, toggleTheme } = useTheme();

  const bg = getWeatherBackground(weather?.condition, weather?.icon, theme);
  const aqiTone = aqi ? `hsl(${AQI_COLORS[aqi.index]})` : "rgba(255,255,255,0.85)";
  const aqiProgress = aqi ? (aqi.index / 5) * 100 : 0;
  const todayForecast = forecast[0];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden py-8 text-white transition-all duration-700 md:py-12"
      style={{ background: bg.gradient }}
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/35 blur-3xl animate-float-soft" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl animate-float-soft-delayed" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.28),transparent_42%),radial-gradient(circle_at_80%_75%,rgba(59,130,246,0.25),transparent_45%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5 px-4">
        <section className={`${glassCardClass} p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">CloudyCool</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Weather Intelligence</h1>
              <p className="mt-1 text-sm text-white/75">Live weather with hourly and air quality insights</p>
            </div>
            <button
              onClick={toggleTheme}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-xl transition hover:bg-white/30"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-5">
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
          </div>
        </section>

        {detectingLocation && (
          <section className={`${glassCardClass} p-8 text-center`}>
            <LocateFixed className="mx-auto h-10 w-10 animate-pulse" />
            <p className="mt-3 text-sm text-white/85">Detecting your location...</p>
          </section>
        )}

        {loading && !detectingLocation && (
          <section className={`${glassCardClass} p-8 text-center`}>
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <p className="mt-3 text-sm text-white/85">Fetching weather data...</p>
          </section>
        )}

        {error && !detectingLocation && (
          <section className={`${glassCardClass} p-8 text-center`}>
            <CloudOff className="mx-auto h-12 w-12 text-red-200" />
            <p className="mt-3 text-sm font-medium text-red-100">{error}</p>
          </section>
        )}

        {weather && (
          <section className={`${glassCardClass} relative overflow-hidden p-6 sm:p-8`}>
            <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-48 w-48 rounded-full bg-white/25 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80">{weather.country}</p>
                <h2 className="truncate text-3xl font-semibold text-white sm:text-4xl">{weather.city}</h2>
                <p className="mt-1 text-sm capitalize text-white/80">{weather.condition}</p>
                {todayForecast && (
                  <p className="mt-2 text-xs text-white/70">
                    H: {toDisplay(todayForecast.temp)}\u00B0 · L: {toDisplay(todayForecast.tempMin)}\u00B0
                  </p>
                )}
                <p className="mt-2 text-xs text-white/70">
                  AQI: {aqi ? `${aqi.label} (${aqi.index}/5)` : "Unavailable"}
                </p>
              </div>
              <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
            </div>

            <div className="relative mt-4 flex items-end gap-3">
              <span className="text-[4.25rem] font-semibold leading-none tracking-tight text-white sm:text-[5rem]">{toDisplay(weather.temp)}</span>
              <div className="mb-3 flex items-center gap-1 text-lg">
                <button
                  onClick={() => setUnit("C")}
                  className={`rounded-full px-2 py-0.5 font-semibold transition ${unit === "C" ? "bg-white/20 text-white" : "text-white/75 hover:text-white"}`}
                >
                  \u00B0C
                </button>
                <span className="text-white/65">/</span>
                <button
                  onClick={() => setUnit("F")}
                  className={`rounded-full px-2 py-0.5 font-semibold transition ${unit === "F" ? "bg-white/20 text-white" : "text-white/75 hover:text-white"}`}
                >
                  \u00B0F
                </button>
              </div>
            </div>
          </section>
        )}

        {locationSource === "ip" && weather && (
          <section className="rounded-2xl border border-white/20 bg-slate-900/35 px-4 py-3 text-xs text-white/85 backdrop-blur-xl">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Showing approximate location from network. Use location for better accuracy.</span>
            </div>
          </section>
        )}

        {weather && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className={`${glassCardClass} p-5 sm:p-6`}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.17em] text-white/80">Current Details</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat icon={<Thermometer className="h-4 w-4" />} label="Feels like" value={`${toDisplay(weather.temp)}\u00B0`} />
                <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${weather.humidity}%`} />
                <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${weather.windSpeed} m/s`} />
              </div>
            </section>

            <AqiCard aqi={aqi} aqiTone={aqiTone} aqiProgress={aqiProgress} />
          </div>
        )}

        {hourly.length > 0 && (
          <section className={`${glassCardClass} overflow-hidden p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/75" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.17em] text-white/80">Hourly Outlook</h3>
            </div>

            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {hourly.map((item, i) => (
                  <HourlyCard key={i} item={item} toDisplay={toDisplay} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {forecast.length > 0 && (
          <section className={`${glassCardClass} overflow-hidden p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/75" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.17em] text-white/80">5-Day Forecast</h3>
            </div>

            <div className="space-y-2">
              {forecast.map((day) => (
                <div key={day.date} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-lg">
                  <div className="min-w-[86px]">
                    <p className="text-sm font-semibold text-white">{day.dayName}</p>
                    <p className="text-xs text-white/70">{new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                  </div>
                  <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="h-10 w-10" />
                  <p className="flex-1 truncate text-sm text-white/80 capitalize">{day.condition}</p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{toDisplay(day.temp)}\u00B0</p>
                    <p className="text-xs text-white/70">{toDisplay(day.tempMin)}\u00B0</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const HourlyCard = ({ item, toDisplay }: { item: HourlyForecast; toDisplay: (c: number) => number }) => (
  <div className="min-w-[92px] rounded-2xl border border-white/20 bg-white/15 px-3 py-3 text-center backdrop-blur-xl">
    <p className="text-xs font-medium text-white/80">{item.time}</p>
    <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt={item.condition} className="mx-auto mt-1 h-9 w-9" />
    <p className="mt-1 text-sm font-semibold text-white">{toDisplay(item.temp)}\u00B0</p>
    <p className="truncate text-[11px] capitalize text-white/70">{item.condition}</p>
  </div>
);

const AqiCard = ({
  aqi,
  aqiTone,
  aqiProgress,
}: {
  aqi: AqiData | null;
  aqiTone: string;
  aqiProgress: number;
}) => (
  <section className={`${glassCardClass} p-5 sm:p-6`}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.17em] text-white/80">Air Quality</h3>
        <p className="mt-1 text-sm text-white/85">{aqi ? aqi.hint : "AQI data unavailable"}</p>
      </div>
      <Leaf className="h-5 w-5 text-white/80" />
    </div>

    <div className="mt-4 flex items-center gap-4">
      <div
        className="grid h-20 w-20 place-items-center rounded-full border border-white/35 bg-slate-900/40"
        style={{ backgroundImage: `conic-gradient(${aqiTone} ${aqiProgress}%, rgba(255,255,255,0.18) ${aqiProgress}% 100%)` }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-900/70 text-lg font-semibold text-white">
          {aqi?.index ?? "-"}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.15em] text-white/70">Status</p>
        <p className="truncate text-lg font-semibold text-white">{aqi?.label ?? "Unavailable"}</p>
      </div>
    </div>
  </section>
);

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center backdrop-blur-md">
    <div className="mx-auto w-fit rounded-xl bg-white/15 p-2 text-white">{icon}</div>
    <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-white/70">{label}</p>
    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
  </div>
);

export default Index;
