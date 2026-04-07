import React, { Suspense } from "react";
import { Droplets, Wind, Thermometer, CloudOff, LocateFixed, Info, Sun, Moon, Leaf, Clock, CalendarDays, Download, Star, SunMoon, WifiOff } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useTheme } from "@/hooks/useTheme";
import { getWeatherBackground } from "@/lib/weatherBackgrounds";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useFavorites } from "@/hooks/useFavorites";
import CitySearch from "@/components/CitySearch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import WeatherAnimations from "@/components/WeatherAnimations";
import WeatherAlerts from "@/components/WeatherAlerts";
import Footer from "@/components/Footer";
import type { AqiData, HourlyForecast } from "@/hooks/useWeather";

const AboutSection = React.lazy(() => import("@/components/AboutSection"));

const AQI_COLORS: Record<number, string> = {
  1: "var(--aqi-good)",
  2: "var(--aqi-fair)",
  3: "var(--aqi-moderate)",
  4: "var(--aqi-poor)",
  5: "var(--aqi-very-poor)",
};

const frameClass = "mx-auto w-full max-w-[440px] px-4 sm:max-w-[470px]";
const glassCardClass = "rounded-[1.5rem] border border-white/20 bg-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]";

const formatTemp = (value: number) => `${Math.round(value)}°`;
const toFahrenheit = (celsius: number) => Math.round((celsius * 9) / 5 + 32);

const Index = () => {
  const {
    city, setCity, weather, forecast, hourly, aqi, loading, error,
    unit, setUnit, toDisplay,
    fetchWeather, fetchByCoords,
    suggestions, setSuggestions, fetchSuggestions,
    locationSource, detectingLocation, detectLocation, isOffline
  } = useWeather();

  const { themePref, effectiveTheme, cycleTheme } = useTheme(weather?.sunrise, weather?.sunset);
  const { canInstall, showIosHint, promptInstall } = usePwaInstall();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const bg = getWeatherBackground(weather?.condition, weather?.icon, effectiveTheme);
  const aqiTone = aqi ? `hsl(${AQI_COLORS[aqi.index]})` : "rgba(255,255,255,0.8)";
  const aqiProgress = aqi ? (aqi.index / 5) * 100 : 0;
  const todayForecast = forecast[0];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden pb-6 pt-7 text-white transition-all duration-1000" style={{ background: bg.gradient }}>
      <div className="pointer-events-none fixed inset-0 transition-all duration-1000" style={{ background: bg.overlay }} />
      <div className="pointer-events-none fixed inset-0 transition-all duration-1000" style={{ backgroundImage: bg.haze }} />
      <div className="pointer-events-none fixed -left-16 -top-16 h-56 w-56 rounded-full blur-3xl animate-float-soft transition-all duration-1000" style={{ backgroundColor: bg.glowA }} />
      <div className="pointer-events-none fixed right-[-4rem] top-36 h-64 w-64 rounded-full blur-3xl animate-float-soft-delayed transition-all duration-1000" style={{ backgroundColor: bg.glowB }} />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.38)_100%)] z-0" />

      {weather && <WeatherAnimations condition={weather.condition} />}

      <main className={`${frameClass} relative z-10 flex min-h-[calc(100vh-3.25rem)] flex-1 flex-col gap-3.5`}>
        {isOffline && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-xs font-semibold text-orange-100 backdrop-blur-xl shadow-lg">
            <WifiOff className="h-4 w-4" />
            <span>You are offline. Showing cached data.</span>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/20 bg-slate-900/20 p-2 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
          <section className={`${glassCardClass} relative z-[90] overflow-visible p-5 border-white/25 bg-white/20 shadow-none`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">CloudyCool</p>
                <h1 className="mt-2 text-xl font-semibold text-white">Weather Intelligence</h1>
                <p className="mt-1 text-[11px] text-white/75">Live weather with hourly and air quality insights</p>
              </div>
              <div className="flex items-center gap-2">
                {canInstall && (
                  <button
                    onClick={promptInstall}
                    className="flex h-10 w-10 sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-white/30 bg-white/20 px-0 sm:px-3 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/30"
                    title="Install CloudyCool"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Install</span>
                  </button>
                )}
                <button
                  onClick={cycleTheme}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-white/30 bg-white/20 px-3 text-white backdrop-blur-xl transition hover:bg-white/30"
                  title={`Switch theme (current: ${themePref})`}
                >
                  {themePref === "auto" ? <SunMoon className="h-4 w-4" /> : themePref === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-[11px] font-semibold uppercase">{themePref}</span>
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
            <section className={`${glassCardClass} mt-3.5 p-6 text-center`}>
              <LocateFixed className="mx-auto h-9 w-9 animate-pulse" />
              <p className="mt-2 text-sm text-white/85">Detecting your location...</p>
            </section>
          )}

          {loading && !detectingLocation && (
            <section className={`${glassCardClass} mt-3.5 p-6 text-center`}>
              <div className="mx-auto h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
              <p className="mt-2 text-sm text-white/85">Fetching weather data...</p>
            </section>
          )}

          {error && !loading && !detectingLocation && (
            <section className={`${glassCardClass} mt-3.5 p-5 flex items-start gap-4 border-red-500/30 bg-red-500/10`}>
              <div className="bg-red-500/20 p-2 rounded-full shrink-0">
                <CloudOff className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-100">Notice</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-red-100/90">{error}</p>
              </div>
            </section>
          )}

          <WeatherAlerts weather={weather} hourly={hourly} aqi={aqi} />

          {weather && (
            <section className={`${glassCardClass} relative mt-3.5 overflow-hidden p-5`}>
              <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-44 w-44 rounded-full bg-white/10 blur-[40px]" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-white/75">{weather.country}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="truncate text-[1.7rem] sm:text-[1.85rem] font-semibold leading-tight text-white tracking-tight">
                      {weather.state ? `${weather.city}, ${weather.state}` : weather.city}
                    </h2>
                    <button 
                      onClick={() => toggleFavorite(weather)}
                      className="transition-transform active:scale-95 shrink-0"
                      title={isFavorite(weather.lat, weather.lon) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className="h-6 w-6 filter drop-shadow-md" fill={isFavorite(weather.lat, weather.lon) ? "#FCD34D" : "rgba(255,255,255,0.15)"} strokeWidth={1} stroke={isFavorite(weather.lat, weather.lon) ? "#FCD34D" : "white"} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm capitalize text-white/85 font-medium">{weather.condition}</p>
                  <p className="mt-2 text-xs text-white/80">{formatTemp(weather.temp)}C / {formatTemp(toFahrenheit(weather.temp))}F</p>
                  {todayForecast && (
                    <p className="mt-1 text-xs text-white/75">H: {formatTemp(toDisplay(todayForecast.temp))} · L: {formatTemp(toDisplay(todayForecast.tempMin))}</p>
                  )}
                  <p className="mt-1 text-xs text-white/75">AQI: {aqi ? `${aqi.label} (${aqi.index}/5)` : "Unavailable"}</p>
                </div>
                <img src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} alt={weather.condition} className="h-24 w-24 shrink-0 -mt-2 -mr-2 drop-shadow-2xl" />
              </div>

              <div className="relative mt-4 flex items-end gap-2">
                <span className="text-[4rem] font-bold leading-none tracking-tighter text-white drop-shadow-lg">{toDisplay(weather.temp)}</span>
                <div className="mb-3 flex items-center gap-1 text-base ml-2">
                  <button
                    onClick={() => setUnit("C")}
                    className={`rounded-full px-2.5 py-0.5 font-bold transition-all text-sm ${unit === "C" ? "bg-white/25 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  >
                    °C
                  </button>
                  <span className="text-white/40 font-light">|</span>
                  <button
                    onClick={() => setUnit("F")}
                    className={`rounded-full px-2.5 py-0.5 font-bold transition-all text-sm ${unit === "F" ? "bg-white/25 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </section>
          )}

          {locationSource === "ip" && weather && (
            <section className="mt-3.5 rounded-2xl border border-white/20 bg-slate-900/30 px-4 py-2.5 text-xs text-white/85 backdrop-blur-xl relative z-20">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/70" />
                <span>Showing approximate location from network. Search a city for exact data.</span>
              </div>
            </section>
          )}

          {weather && (
            <section className={`${glassCardClass} mt-3.5 p-4`}>
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
            <section className={`${glassCardClass} mt-3.5 overflow-hidden p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/75" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">24-Hour Outlook</h3>
              </div>

              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {hourly.map((item, i) => (
                    <HourlyCard key={i} item={item} toDisplay={toDisplay} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1.5 opacity-50 hover:opacity-100 transition-opacity" />
              </ScrollArea>
            </section>
          )}

          {forecast.length > 0 && (
            <section className={`${glassCardClass} mt-3.5 overflow-hidden p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/75" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">5-Day Forecast</h3>
              </div>

              <div className="space-y-2">
                {forecast.map((day) => (
                  <div key={day.date} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-3 py-2.5 backdrop-blur-md">
                    <div className="min-w-[80px]">
                      <p className="text-sm font-semibold text-white">{day.dayName}</p>
                      <p className="text-[11px] text-white/70">{new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                    </div>
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="h-9 w-9 drop-shadow-sm" />
                    <p className="flex-1 truncate text-sm text-white/85 capitalize">{day.condition}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatTemp(toDisplay(day.temp))}</p>
                      <p className="text-[11px] text-white/60">{formatTemp(toDisplay(day.tempMin))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {weather && (
            <Suspense fallback={<div className="h-32 opacity-50 animate-pulse bg-white/5 rounded-3xl mt-6"></div>}>
              <AboutSection />
            </Suspense>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

const HourlyCard = ({ item, toDisplay }: { item: HourlyForecast; toDisplay: (c: number) => number }) => (
  <div className="min-w-[82px] rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-2.5 py-3 text-center backdrop-blur-xl">
    <p className="text-[11px] font-medium text-white/80">{item.time}</p>
    <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt={item.condition} className="mx-auto mt-1 h-9 w-9 drop-shadow-md" />
    <p className="mt-1 text-[15px] font-semibold text-white">{formatTemp(toDisplay(item.temp))}</p>
    <p className="truncate text-[10px] capitalize text-white/60 font-medium tracking-wide">{item.condition}</p>
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
  <section className={`${glassCardClass} mt-3.5 p-4`}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Air Quality</h3>
        <p className="mt-1 text-sm text-white/85 font-medium">{aqi ? aqi.hint : "AQI data unavailable"}</p>
      </div>
      <Leaf className="h-5 w-5 text-white/60" />
    </div>

    <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
      <div
        className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/10 bg-slate-900/40 shadow-inner shrink-0"
        style={{ backgroundImage: `conic-gradient(${aqiTone} ${aqiProgress}%, rgba(255,255,255,0.05) ${aqiProgress}% 100%)` }}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900/80 text-base font-bold text-white shadow-sm">
          {aqi?.index ?? "-"}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60 font-semibold">Status</p>
        <p className="truncate text-[1.05rem] font-bold text-white mt-0.5" style={{ color: aqi ? aqiTone : 'white' }}>
          {aqi?.label ?? "Unavailable"}
        </p>
      </div>
    </div>
  </section>
);

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur-md">
    <div className="mx-auto w-fit rounded-xl bg-white/10 p-1.5 text-white/90 shadow-sm">{icon}</div>
    <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-white/60 font-semibold">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
  </div>
);

export default Index;
