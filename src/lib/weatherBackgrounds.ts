type Theme = "light" | "dark";

interface WeatherBackground {
  gradient: string;
  overlay: string;
  key: string;
}

const BACKGROUNDS: Record<string, { light: WeatherBackground; dark: WeatherBackground }> = {
  clear: {
    light: {
      gradient: "linear-gradient(135deg, hsl(205 85% 65%), hsl(45 90% 65%), hsl(30 85% 60%))",
      overlay: "rgba(255,255,255,0.05)",
      key: "clear",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(220 40% 12%), hsl(240 30% 18%), hsl(260 25% 15%))",
      overlay: "rgba(0,0,0,0.1)",
      key: "clear",
    },
  },
  clouds: {
    light: {
      gradient: "linear-gradient(135deg, hsl(210 30% 75%), hsl(200 25% 80%), hsl(215 20% 85%))",
      overlay: "rgba(255,255,255,0.08)",
      key: "clouds",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(215 25% 14%), hsl(210 20% 18%), hsl(220 15% 16%))",
      overlay: "rgba(0,0,0,0.15)",
      key: "clouds",
    },
  },
  rain: {
    light: {
      gradient: "linear-gradient(135deg, hsl(215 40% 55%), hsl(220 35% 60%), hsl(210 30% 65%))",
      overlay: "rgba(255,255,255,0.06)",
      key: "rain",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(215 35% 10%), hsl(220 30% 14%), hsl(210 25% 12%))",
      overlay: "rgba(0,0,0,0.2)",
      key: "rain",
    },
  },
  thunderstorm: {
    light: {
      gradient: "linear-gradient(135deg, hsl(250 30% 45%), hsl(230 35% 50%), hsl(220 40% 55%))",
      overlay: "rgba(255,255,255,0.04)",
      key: "thunderstorm",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(250 30% 8%), hsl(230 25% 12%), hsl(270 20% 10%))",
      overlay: "rgba(0,0,0,0.25)",
      key: "thunderstorm",
    },
  },
  snow: {
    light: {
      gradient: "linear-gradient(135deg, hsl(200 20% 90%), hsl(210 25% 92%), hsl(220 15% 95%))",
      overlay: "rgba(255,255,255,0.1)",
      key: "snow",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(210 20% 16%), hsl(220 15% 20%), hsl(200 10% 18%))",
      overlay: "rgba(0,0,0,0.1)",
      key: "snow",
    },
  },
  mist: {
    light: {
      gradient: "linear-gradient(135deg, hsl(200 15% 80%), hsl(210 10% 85%), hsl(195 12% 82%))",
      overlay: "rgba(255,255,255,0.12)",
      key: "mist",
    },
    dark: {
      gradient: "linear-gradient(135deg, hsl(210 15% 14%), hsl(200 10% 16%), hsl(215 12% 15%))",
      overlay: "rgba(0,0,0,0.15)",
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
      gradient: bg.gradient.replace(/65%\)/g, "55%)"),
    };
  }

  return bg;
}
