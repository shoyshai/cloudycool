# CloudyCool

A weather app built with React + Vite + TypeScript that provides:

- Current weather by city search
- GPS and IP-based location detection
- Hourly forecast for today
- 5-day forecast
- AQI (air quality index) summary
- Light and dark theme toggle

## Tech Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI primitives)
- TanStack Query
- Vitest

## Prerequisites

- Node.js 18+ (or newer LTS)
- npm (or Bun, since lockfiles for both are present)

## Run Locally

```bash
npm install
npm run dev
```

Default Vite dev URL:

- `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build using development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once (Vitest)
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```text
src/
  components/       Reusable UI and feature components
  hooks/            App hooks (weather, theme, etc.)
  lib/              Utilities and weather background helpers
  pages/            Route pages
  test/             Test setup and examples
```

## Weather Data Sources

The app currently integrates:

- OpenWeatherMap APIs (weather, forecast, AQI)
- OpenStreetMap Nominatim reverse geocoding
- ipapi.co for IP-based fallback location

## API Key Note

`src/hooks/useWeather.ts` currently contains a hardcoded OpenWeatherMap API key.

For production, move this to an environment variable (for example `VITE_OPENWEATHER_API_KEY`) and read it via `import.meta.env`.

## Routing

Routes are defined in `src/App.tsx`:

- `/` -> main weather page
- `*` -> not found page
