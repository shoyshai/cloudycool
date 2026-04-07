import React from 'react';
import { AqiData, HourlyForecast, WeatherData } from '@/hooks/useWeather';
import { AlertTriangle, Droplets, ThermometerSun } from 'lucide-react';

interface WeatherAlertsProps {
  weather: WeatherData | null;
  hourly: HourlyForecast[];
  aqi: AqiData | null;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ weather, hourly, aqi }) => {
  const alerts = [];

  // AQI Alert
  if (aqi && aqi.index >= 4) {
    alerts.push({
      id: 'aqi',
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
      title: 'Poor Air Quality',
      message: aqi.hint || 'Air quality is poor. Limit outdoor activities.',
      bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-100'
    });
  }

  // Extreme Temp Alert (e.g. > 35C / 95F is hot)
  if (weather && weather.temp > 35) {
    alerts.push({
      id: 'heat',
      icon: <ThermometerSun className="w-4 h-4 text-red-400" />,
      title: 'Extreme Heat Warning',
      message: `Temperatures are unusually high (${Math.round(weather.temp)}°C). Stay hydrated.`,
      bgColor: 'bg-red-500/10 border-red-500/20 text-red-100'
    });
  } else if (weather && weather.temp < -5) {
     alerts.push({
      id: 'cold',
      icon: <ThermometerSun className="w-4 h-4 text-blue-400" />,
      title: 'Extreme Cold Warning',
      message: `Temperatures are very low (${Math.round(weather.temp)}°C). Dress warmly.`,
      bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-100'
    });
  }

  // Rain Incoming Alert
  // Check the next 12 hours of forecast (first 4 items out of 8)
  if (weather && !weather.condition.toLowerCase().includes('rain')) {
    const upcomingRain = hourly.slice(0, 4).find(h => h.condition.toLowerCase().includes('rain'));
    if (upcomingRain) {
      alerts.push({
        id: 'rain',
        icon: <Droplets className="w-4 h-4 text-sky-400" />,
        title: 'Rain Expected',
        message: `Rain is expected around ${upcomingRain.time}.`,
        bgColor: 'bg-sky-500/10 border-sky-500/30 text-sky-100'
      });
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4 transition-all animate-fade-in-up z-20 relative">
      {alerts.map((alert) => (
        <div key={alert.id} className={`flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-[0_8px_30px_-15px_rgba(0,0,0,0.3)] ${alert.bgColor}`}>
          <div className="mt-0.5 shrink-0">
            {alert.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold">{alert.title}</h4>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlerts;
