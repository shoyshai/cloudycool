import { useState, useEffect, useRef } from "react";
import { Search, MapPin, LocateFixed } from "lucide-react";
import type { CitySuggestion } from "@/hooks/useWeather";

interface CitySearchProps {
  city: string;
  setCity: (city: string) => void;
  loading: boolean;
  suggestions: CitySuggestion[];
  onSearch: () => void;
  onLocate: () => void;
  onSelectSuggestion: (s: CitySuggestion) => void;
  onQueryChange: (q: string) => void;
}

const CitySearch = ({
  city, setCity, loading, suggestions,
  onSearch, onLocate, onSelectSuggestion, onQueryChange,
}: CitySearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setCity(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onQueryChange(value);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSelect = (s: CitySuggestion) => {
    setCity(`${s.name}, ${s.country}`);
    setShowSuggestions(false);
    onSelectSuggestion(s);
  };

  return (
    <div className="relative z-[60] mx-auto w-full max-w-[360px]" ref={wrapperRef}>
      <div className="flex items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowSuggestions(false);
              onSearch();
            }
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/30 bg-white/20 text-white placeholder:text-white/65 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.9)] backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 transition"
        />
        </div>
        <button
          onClick={() => { setShowSuggestions(false); onSearch(); }}
          disabled={loading}
          className="h-12 min-w-[90px] rounded-2xl bg-white/90 px-4 text-sm font-semibold text-sky-900 transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.85)]"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
        <button
          onClick={onLocate}
          disabled={loading}
          className="h-12 w-12 shrink-0 rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-xl transition hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed grid place-items-center shadow-[0_14px_34px_-22px_rgba(15,23,42,0.85)]"
          title="Use my location"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-2 z-[70] max-h-60 overflow-y-auto overscroll-contain rounded-2xl border border-white/35 bg-slate-950/85 shadow-[0_28px_58px_-24px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
          {suggestions.map((s, i) => (
            <li
              key={`${s.lat}-${s.lon}-${i}`}
              onClick={() => handleSelect(s)}
              className="flex cursor-pointer items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-white/95 transition-colors hover:bg-white/12 last:border-b-0"
            >
              <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
              <span className="font-medium">{s.name}</span>
              {s.state && <span className="text-white/70">{s.state},</span>}
              <span className="text-white/70">{s.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySearch;
