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
    <div className="flex gap-2" ref={wrapperRef}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg bg-card border border-border shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}-${i}`}
                onClick={() => handleSelect(s)}
                className="px-4 py-2.5 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{s.name}</span>
                {s.state && <span className="text-muted-foreground">{s.state},</span>}
                <span className="text-muted-foreground">{s.country}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => { setShowSuggestions(false); onSearch(); }}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
      <button
        onClick={onLocate}
        disabled={loading}
        className="px-3 py-3 rounded-lg bg-card text-card-foreground border border-border hover:bg-accent transition-colors disabled:opacity-50"
        title="Use my location"
      >
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CitySearch;
