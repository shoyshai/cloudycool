import React from 'react';

interface WeatherAnimationsProps {
  condition: string;
}

const WeatherAnimations: React.FC<WeatherAnimationsProps> = ({ condition }) => {
  const c = condition.toLowerCase();
  
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower") || c.includes("thunder")) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 mix-blend-overlay">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-[-10%] w-[1.5px] h-[15vh] bg-gradient-to-b from-transparent to-white/70 animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (c.includes("snow") || c.includes("sleet") || c.includes("blizzard")) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60 mix-blend-screen">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-[-5%] w-1.5 h-1.5 rounded-full bg-white/80 animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>
    );
  }

  if (c.includes("cloud") || c.includes("overcast")) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20 transition-opacity duration-1000 mix-blend-screen">
        <div className="absolute top-[10%] left-[-20%] w-[40vw] h-[10vw] rounded-[100px] bg-white/40 blur-3xl animate-cloud-drift-1" />
        <div className="absolute top-[40%] right-[-20%] w-[50vw] h-[15vw] rounded-[100px] bg-white/30 blur-3xl animate-cloud-drift-2" />
      </div>
    );
  }

  // clear, mist, or default: subtle atmospheric pulses
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 mix-blend-screen">
      <div className="absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-white blur-[1px] animate-pulse-soft" />
      <div className="absolute top-[45%] right-[20%] w-1.5 h-1.5 rounded-full bg-white blur-[1px] animate-pulse-soft delay-1000" />
      <div className="absolute top-[75%] left-[40%] w-3 h-3 rounded-full bg-white/50 blur-[2px] animate-pulse-soft delay-2000" />
    </div>
  );
};

export default WeatherAnimations;
