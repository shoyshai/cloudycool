import { Droplets, Wind, Thermometer, CloudOff, LocateFixed, Info, Sun, Moon, Leaf, Clock, CalendarDays, Download, Star } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useTheme } from "@/hooks/useTheme";
import { getWeatherBackground } from "@/lib/weatherBackgrounds";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useFavorites } from "@/hooks/useFavorites";
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

const frameClass = "mx-auto w-full max-w-[440px] px-4 sm:max-w-[470px]";
const glassCardClass = "rounded-3xl border border-white/25 bg-white/20 backdrop-blur-2xl shadow-[0_24px_70px_-35px_rgba(15,23,42,0.95)]";

const formatTemp = (value: number) => `${Math.round(value)}°`;
const toFahrenheit = (celsius: number) => Math.round((celsius * 9) / 5 + 32);

const Index = () => {
  const {
    city, setCity, weather, forecast, hourly, aqi, loading, error,
    unit, setUnit, toDisplay,
    fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation,
  } = useWeather();

  const { theme, toggleTheme } = useTheme();
  const { canInstall, showIosHint, promptInstall } = usePwaInstall();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const bg = getWeatherBackground(weather?.condition, weather?.icon, theme);
  const aqiTone = aqi ? `hsl(${AQI_COLORS[aqi.index]})` : "rgba(255,255,255,0.8)";
  const aqiProgress = aqi ? (aqi.index / 5) * 100 : 0;
  const todayForecast = forecast[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden py-7 text-white transition-all duration-1000" style={{ background: bg.gradient }}>
      <div className="pointer-events-none absolute inset-0 transition-all duration-1000" style={{ background: bg.overlay }} />
      <div className="pointer-events-none absolute inset-0 transition-all duration-1000" style={{ backgroundImage: bg.haze }} />
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-3xl animate-float-soft transition-all duration-1000" style={{ backgroundColor: bg.glowA }} />
      <div className="pointer-events-none absolute right-[-4rem] top-36 h-64 w-64 rounded-full blur-3xl animate-float-soft-delayed transition-all duration-1000" style={{ backgroundColor: bg.glowB }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.38)_100%)]" />

      <main className={`${frameClass} relative z-10 flex flex-col gap-4`}>
        <div className="rounded-[2rem] border border-white/25 bg-slate-900/20 p-2 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <section className={`${glassCardClass} relative z-[90] overflow-visible p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">CloudyCool</p>
                <h1 className="mt-2 text-xl font-semibold text-white">Weather Intelligence</h1>
                <p className="mt-1 text-xs text-white/75">Live weather with hourly and air quality insights</p>
              </div>
              <div className="flex items-center gap-2">
                {canInstall && (
                  <button
                    onClick={promptInstall}
                    className="flex h-10 items-center gap-1.5 rounded-2xl border border-white/30 bg-white/20 px-3 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/30"
                    title="Install CloudyCool"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install</span>
                  </button>
                )}
                <button
                  onClick={toggleTheme}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-xl transition hover:bg-white/30"
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mt-4">
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

            {favorites.length > 0 && (
              <div className="mt-3">
                <ScrollArea className="w-full">
                  <div className="flex items-center gap-2 pb-1 pt-1 px-1">
                    {favorites.map((fav, i) => (
                      <button
                        key={`${fav.lat}-${fav.lon}-${i}`}
                        onClick={() => {
                          setCity(`${fav.city}, ${fav.country}`);
                          fetchByCoords(fav.lat, fav.lon);
                        }}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md transition hover:bg-white/20"
                      >
                        <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                        {fav.city}
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="h-1.5" />
                </ScrollArea>
              </div>
            )}

            {showIosHint && (
              <p className="mt-3 text-[11px] text-white/72">
                On iPhone, tap Share and choose Add to Home Screen.
              </p>
            )}
          </section>

          {detectingLocation && (
            <section className={`${glassCardClass} mt-4 p-6 text-center`}>
              <LocateFixed className="mx-auto h-9 w-9 animate-pulse" />
              <p className="mt-2 text-sm text-white/85">Detecting your location...</p>
            </section>
          )}

          {loading && !detectingLocation && (
            <section className={`${glassCardClass} mt-4 p-6 text-center`}>
              <div className="mx-auto h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
              <p className="mt-2 text-sm text-white/85">Fetching weather data...</p>
            </section>
          )}

          {error && !detectingLocation && (
            <section className={`${glassCardClass} mt-4 p-6 text-center`}>
              <CloudOff className="mx-auto h-10 w-10 text-red-200" />
              <p className="mt-2 text-sm font-medium text-red-100">{error}</p>
            </section>
          )}

          {weather && (
            <section className={`${glassCardClass} relative mt-4 overflow-hidden p-5`}>
              <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-44 w-44 rounded-full bg-white/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/75">{weather.country}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="truncate text-[1.75rem] font-semibold leading-tight text-white">{weather.city}</h2>
                    <button 
                      onClick={() => toggleFavorite(weather)}
                      className="transition-transform active:scale-95"
                      title={isFavorite(weather.lat, weather.lon) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className="h-6 w-6 filter drop-shadow-md" fill={isFavorite(weather.lat, weather.lon) ? "#FCD34D" : "rgba(255,255,255,0.15)"} strokeWidth={1} stroke={isFavorite(weather.lat, weather.lon) ? "#FCD34D" : "white"} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm capitalize text-white/80">{weather.condition}</p>
                  <p className="mt-2 text-xs text-white/80">{formatTemp(weather.temp)}C / {formatTemp(toFahrenheit(weather.temp))}F</p>
                  {todayForecast && (
                    <p className="mt-1 text-xs text-white/75">H: {formatTemp(toDisplay(todayForecast.temp))} · L: {formatTemp(toDisplay(todayForecast.tempMin))}</p>
                  )}
                  <p className="mt-1 text-xs text-white/75">AQI: {aqi ? `${aqi.label} (${aqi.index}/5)` : "Unavailable"}</p>
                </div>
                <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} className="h-[4.5rem] w-[4.5rem] shrink-0" />
              </div>

              <div className="relative mt-3 flex items-end gap-2">
                <span className="text-[3.9rem] font-semibold leading-none tracking-tight text-white">{toDisplay(weather.temp)}</span>
                <div className="mb-3 flex items-center gap-1 text-base">
                  <button
                    onClick={() => setUnit("C")}
                    className={`rounded-full px-2 py-0.5 font-semibold transition ${unit === "C" ? "bg-white/20 text-white" : "text-white/75 hover:text-white"}`}
                  >
                    °C
                  </button>
                  <span className="text-white/65">/</span>
                  <button
                    onClick={() => setUnit("F")}
                    className={`rounded-full px-2 py-0.5 font-semibold transition ${unit === "F" ? "bg-white/20 text-white" : "text-white/75 hover:text-white"}`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </section>
          )}

          {locationSource === "ip" && weather && (
            <section className="mt-4 rounded-2xl border border-white/20 bg-slate-900/30 px-4 py-2.5 text-xs text-white/85 backdrop-blur-xl">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Showing approximate location from network. Use location for better accuracy.</span>
              </div>
            </section>
          )}

          {weather && (
            <section className={`${glassCardClass} mt-4 p-4`}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Current Details</h3>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                <Stat icon={<Thermometer className="h-4 w-4" />} label="Feels like" value={formatTemp(toDisplay(weather.temp))} />
                <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${weather.humidity}%`} />
                <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${weather.windSpeed} m/s`} />
              </div>
            </section>
          )}

          {weather && <AqiCard aqi={aqi} aqiTone={aqiTone} aqiProgress={aqiProgress} />}

          {hourly.length > 0 && (
            <section className={`${glassCardClass} mt-4 overflow-hidden p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/75" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Hourly Outlook</h3>
              </div>

              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-1">
                  {hourly.map((item, i) => (
                    <HourlyCard key={i} item={item} toDisplay={toDisplay} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          {forecast.length > 0 && (
            <section className={`${glassCardClass} mt-4 overflow-hidden p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/75" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">5-Day Forecast</h3>
              </div>

              <div className="space-y-2">
                {forecast.map((day) => (
                  <div key={day.date} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-lg">
                    <div className="min-w-[80px]">
                      <p className="text-sm font-semibold text-white">{day.dayName}</p>
                      <p className="text-[11px] text-white/70">{new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                    </div>
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="h-9 w-9" />
                    <p className="flex-1 truncate text-sm text-white/80 capitalize">{day.condition}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatTemp(toDisplay(day.temp))}</p>
                      <p className="text-xs text-white/70">{formatTemp(toDisplay(day.tempMin))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const HourlyCard = ({ item, toDisplay }: { item: HourlyForecast; toDisplay: (c: number) => number }) => (
  <div className="min-w-[82px] rounded-2xl border border-white/20 bg-white/15 px-2.5 py-2 text-center backdrop-blur-xl">
    <p className="text-[11px] font-medium text-white/80">{item.time}</p>
    <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt={item.condition} className="mx-auto mt-1 h-8 w-8" />
    <p className="mt-1 text-sm font-semibold text-white">{formatTemp(toDisplay(item.temp))}</p>
    <p className="truncate text-[10px] capitalize text-white/70">{item.condition}</p>
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
  <section className={`${glassCardClass} mt-4 p-4`}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Air Quality</h3>
        <p className="mt-1 text-sm text-white/85">{aqi ? aqi.hint : "AQI data unavailable"}</p>
      </div>
      <Leaf className="h-5 w-5 text-white/80" />
    </div>

    <div className="mt-3 flex items-center gap-3">
      <div
        className="grid h-16 w-16 place-items-center rounded-full border border-white/35 bg-slate-900/40"
        style={{ backgroundImage: `conic-gradient(${aqiTone} ${aqiProgress}%, rgba(255,255,255,0.18) ${aqiProgress}% 100%)` }}
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-900/70 text-base font-semibold text-white">
          {aqi?.index ?? "-"}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">Status</p>
        <p className="truncate text-base font-semibold text-white">{aqi?.label ?? "Unavailable"}</p>
      </div>
    </div>
  </section>
);

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 p-2.5 text-center backdrop-blur-md">
    <div className="mx-auto w-fit rounded-xl bg-white/15 p-1.5 text-white">{icon}</div>
    <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-white/70">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
  </div>
);

export default Index;
