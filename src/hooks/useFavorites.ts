import { useState, useEffect } from "react";
import { WeatherData } from "./useWeather";

export interface FavoriteCity {
  city: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const FAVORITES_KEY = "cloudycool_favorites";
const MAX_FAVORITES = 8;

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load favorites", e);
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteCity[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.warn("Failed to save favorites", e);
    }
  };

  const isFavorite = (lat: number, lon: number) => {
    // We use a small epsilon for float comparison to be safe, or just exact match since OpenWeather API returns stable coords mostly.
    // However exact match is fine since we saved exactly what we fetched.
    return favorites.some(
      (f) => Math.abs(f.lat - lat) < 0.01 && Math.abs(f.lon - lon) < 0.01
    );
  };

  const addFavorite = (weather: WeatherData) => {
    if (isFavorite(weather.lat, weather.lon)) return;
    if (favorites.length >= MAX_FAVORITES) {
      console.warn(`Cannot add more than ${MAX_FAVORITES} favorites`);
      // Optionally could remove oldest or show user feedback. We'll simply let it fail silently or remove oldest:
      const newFavs = [...favorites.slice(1), { city: weather.city, country: weather.country, state: weather.state, lat: weather.lat, lon: weather.lon }];
      saveFavorites(newFavs);
      return;
    }
    const newFavs = [...favorites, { city: weather.city, country: weather.country, state: weather.state, lat: weather.lat, lon: weather.lon }];
    saveFavorites(newFavs);
  };

  const removeFavorite = (lat: number, lon: number) => {
    const newFavs = favorites.filter(
      (f) => !(Math.abs(f.lat - lat) < 0.01 && Math.abs(f.lon - lon) < 0.01)
    );
    saveFavorites(newFavs);
  };

  const toggleFavorite = (weather: WeatherData | null) => {
    if (!weather) return;
    if (isFavorite(weather.lat, weather.lon)) {
      removeFavorite(weather.lat, weather.lon);
    } else {
      addFavorite(weather);
    }
  };

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
};
