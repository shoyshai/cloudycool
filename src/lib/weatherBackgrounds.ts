type Theme = "light" | "dark";

interface WeatherBackground {
  gradient: string;
  overlay: string;
  haze: string;
  glowA: string;
  glowB: string;
  key: string;
}

const BACKGROUNDS: Record<string, { light: WeatherBackground; dark: WeatherBackground }> = {
  clear: {
    light: {
      gradient: "linear-gradient(170deg, hsl(206 95% 70%) 0%, hsl(199 92% 62%) 46%, hsl(186 86% 55%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 45%, rgba(2,32,56,0.14) 100%)",
      haze: "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.36), transparent 45%), radial-gradient(circle at 78% 78%, rgba(147,197,253,0.3), transparent 46%)",
      glowA: "rgba(255,245,196,0.78)",
      glowB: "rgba(125,211,252,0.55)",
      key: "clear",
    },
    dark: {
      gradient: "linear-gradient(160deg, hsl(224 42% 14%) 0%, hsl(215 38% 18%) 48%, hsl(205 36% 14%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.22) 100%)",
      haze: "radial-gradient(circle at 18% 16%, rgba(191,219,254,0.2), transparent 40%), radial-gradient(circle at 82% 82%, rgba(56,189,248,0.14), transparent 45%)",
      glowA: "rgba(234,179,8,0.26)",
      glowB: "rgba(56,189,248,0.22)",
      key: "clear",
    },
  },
  clouds: {
    light: {
      gradient: "linear-gradient(170deg, hsl(213 45% 74%) 0%, hsl(208 38% 68%) 46%, hsl(201 34% 64%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(26,53,77,0.18) 100%)",
      haze: "radial-gradient(circle at 14% 14%, rgba(255,255,255,0.24), transparent 42%), radial-gradient(circle at 80% 70%, rgba(186,230,253,0.25), transparent 46%)",
      glowA: "rgba(226,232,240,0.6)",
      glowB: "rgba(186,230,253,0.34)",
      key: "clouds",
    },
    dark: {
      gradient: "linear-gradient(170deg, hsl(218 28% 14%) 0%, hsl(211 23% 18%) 52%, hsl(205 22% 16%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.22) 100%)",
      haze: "radial-gradient(circle at 18% 22%, rgba(148,163,184,0.28), transparent 45%), radial-gradient(circle at 74% 76%, rgba(56,189,248,0.14), transparent 47%)",
      glowA: "rgba(148,163,184,0.3)",
      glowB: "rgba(14,165,233,0.2)",
      key: "clouds",
    },
  },
  rain: {
    light: {
      gradient: "linear-gradient(170deg, hsl(218 47% 52%) 0%, hsl(214 43% 46%) 48%, hsl(207 40% 42%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(2,20,40,0.28) 100%)",
      haze: "radial-gradient(circle at 16% 16%, rgba(148,163,184,0.3), transparent 44%), radial-gradient(circle at 80% 82%, rgba(56,189,248,0.2), transparent 46%)",
      glowA: "rgba(125,211,252,0.35)",
      glowB: "rgba(56,189,248,0.24)",
      key: "rain",
    },
    dark: {
      gradient: "linear-gradient(170deg, hsl(221 45% 10%) 0%, hsl(214 42% 13%) 50%, hsl(206 38% 11%) 100%)",
      overlay: "linear-gradient(180deg, rgba(148,163,184,0.08) 0%, rgba(0,0,0,0.3) 100%)",
      haze: "radial-gradient(circle at 18% 18%, rgba(56,189,248,0.2), transparent 42%), radial-gradient(circle at 82% 78%, rgba(30,41,59,0.5), transparent 48%)",
      glowA: "rgba(56,189,248,0.24)",
      glowB: "rgba(100,116,139,0.22)",
      key: "rain",
    },
  },
  thunderstorm: {
    light: {
      gradient: "linear-gradient(165deg, hsl(244 38% 45%) 0%, hsl(226 39% 42%) 50%, hsl(216 41% 40%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(15,23,42,0.35) 100%)",
      haze: "radial-gradient(circle at 20% 14%, rgba(196,181,253,0.3), transparent 42%), radial-gradient(circle at 80% 74%, rgba(59,130,246,0.22), transparent 48%)",
      glowA: "rgba(196,181,253,0.42)",
      glowB: "rgba(96,165,250,0.27)",
      key: "thunderstorm",
    },
    dark: {
      gradient: "linear-gradient(160deg, hsl(245 42% 9%) 0%, hsl(228 39% 12%) 48%, hsl(258 33% 11%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.36) 100%)",
      haze: "radial-gradient(circle at 19% 15%, rgba(196,181,253,0.16), transparent 40%), radial-gradient(circle at 82% 78%, rgba(56,189,248,0.16), transparent 44%)",
      glowA: "rgba(147,197,253,0.22)",
      glowB: "rgba(196,181,253,0.24)",
      key: "thunderstorm",
    },
  },
  snow: {
    light: {
      gradient: "linear-gradient(170deg, hsl(200 40% 92%) 0%, hsl(211 42% 90%) 46%, hsl(222 34% 88%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(148,163,184,0.16) 100%)",
      haze: "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.52), transparent 43%), radial-gradient(circle at 80% 80%, rgba(191,219,254,0.4), transparent 48%)",
      glowA: "rgba(255,255,255,0.82)",
      glowB: "rgba(191,219,254,0.55)",
      key: "snow",
    },
    dark: {
      gradient: "linear-gradient(170deg, hsl(213 26% 15%) 0%, hsl(219 22% 18%) 50%, hsl(204 22% 16%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(15,23,42,0.24) 100%)",
      haze: "radial-gradient(circle at 20% 18%, rgba(226,232,240,0.26), transparent 42%), radial-gradient(circle at 82% 78%, rgba(147,197,253,0.18), transparent 46%)",
      glowA: "rgba(226,232,240,0.35)",
      glowB: "rgba(191,219,254,0.28)",
      key: "snow",
    },
  },
  mist: {
    light: {
      gradient: "linear-gradient(170deg, hsl(200 22% 78%) 0%, hsl(210 17% 72%) 48%, hsl(205 16% 69%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(71,85,105,0.18) 100%)",
      haze: "radial-gradient(circle at 20% 16%, rgba(255,255,255,0.34), transparent 44%), radial-gradient(circle at 78% 82%, rgba(186,230,253,0.25), transparent 48%)",
      glowA: "rgba(226,232,240,0.55)",
      glowB: "rgba(203,213,225,0.42)",
      key: "mist",
    },
    dark: {
      gradient: "linear-gradient(165deg, hsl(208 20% 14%) 0%, hsl(210 17% 16%) 52%, hsl(214 15% 14%) 100%)",
      overlay: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(15,23,42,0.24) 100%)",
      haze: "radial-gradient(circle at 18% 18%, rgba(203,213,225,0.22), transparent 44%), radial-gradient(circle at 82% 78%, rgba(148,163,184,0.2), transparent 48%)",
      glowA: "rgba(148,163,184,0.32)",
      glowB: "rgba(125,211,252,0.2)",
      key: "mist",
    },
  },
};

function mapCondition(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "thunderstorm";
  if (c.includes("snow") || c.includes("sleet") || c.includes("blizzard")) return "snow";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "rain";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze") || c.includes("smoke")) return "mist";
  if (c.includes("cloud") || c.includes("overcast")) return "clouds";
  return "clear";
}

export function getWeatherBackground(
  condition: string | undefined,
  icon: string | undefined,
  theme: Theme
): WeatherBackground {
  const mapped = mapCondition(condition || "");
  const isNight = icon?.endsWith("n");

  console.debug(`[weather-bg] condition="${condition}", icon="${icon}", mapped="${mapped}", night=${isNight}`);

  const bg = BACKGROUNDS[mapped]?.[theme] || BACKGROUNDS.clear[theme];

  // darken slightly for nighttime in light mode
  if (isNight && theme === "light") {
    return {
      ...bg,
      gradient: bg.gradient.replace(/(\d+%)\)/g, (_match, pct) => {
        const value = Math.max(8, Number.parseInt(pct, 10) - 8);
        return `${value}%)`;
      }),
    };
  }

  return bg;
}
