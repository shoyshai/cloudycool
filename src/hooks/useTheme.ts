import { useState, useEffect, useMemo } from "react";

export type ThemePref = "light" | "dark" | "auto";
export type EffectiveTheme = "light" | "dark";

const THEME_KEY = "cloudycool_theme";

export const useTheme = (sunrise?: number, sunset?: number) => {
  const [themePref, setThemePref] = useState<ThemePref>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemePref | null;
      if (saved === "light" || saved === "dark" || saved === "auto") {
        return saved;
      }
    } catch {}
    return "auto"; // Auto by default
  });

  const effectiveTheme = useMemo<EffectiveTheme>(() => {
    if (themePref !== "auto") return themePref;
    
    // Auto resolution based on weather sunrise/sunset if available
    if (sunrise && sunset) {
      const now = Date.now() / 1000;
      if (now >= sunrise && now < sunset) {
        return "light"; // It's daytime
      }
      return "dark"; // It's nighttime
    }
    
    // Fallback to system preferred color scheme
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [themePref, sunrise, sunset]);

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem(THEME_KEY, themePref); } catch {}
  }, [effectiveTheme, themePref]);

  const cycleTheme = () => {
    setThemePref((t) => {
      if (t === "auto") return "light";
      if (t === "light") return "dark";
      return "auto";
    });
  };

  return { themePref, effectiveTheme, cycleTheme };
};
