import { useState, useEffect } from "react";

type Theme = "light" | "dark";
const THEME_KEY = "cloudycool_theme";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") {
        console.debug("[theme] Loaded from localStorage:", saved);
        return saved;
      }
    } catch {}
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    console.debug("[theme] Using system preference:", sys);
    return sys;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    console.debug("[theme] Applied:", theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
};
