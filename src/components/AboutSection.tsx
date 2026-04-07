import React from 'react';
import { Info, ShieldCheck, Smartphone, SunMoon } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section className="mt-6 rounded-3xl border border-white/20 bg-slate-900/30 p-5 shadow-lg backdrop-blur-xl animate-fade-in-up md:p-6 mb-8 text-white relative z-20">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-white/80" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">About CloudyCool</h3>
      </div>
      
      <p className="text-sm text-white/80 leading-relaxed mb-6">
        CloudyCool is a premium progressive web app connecting you directly to intelligent weather forecasts and air quality metrics, wrapped in a dynamic responsive interface.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
          <Smartphone className="w-5 h-5 text-sky-300 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Install Anywhere</h4>
            <p className="text-[11px] leading-relaxed text-white/70 mt-1.5">Install CloudyCool on your device for an app-like experience with robust offline caching.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
          <SunMoon className="w-5 h-5 text-yellow-300 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Smart Themes</h4>
            <p className="text-[11px] leading-relaxed text-white/70 mt-1.5">Automatic daylight tracking shifts the UI aesthetics seamlessly based on local sunrise and sunset.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 sm:col-span-2 transition-colors hover:bg-white/10">
          <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Powered by OpenWeatherMap</h4>
            <p className="text-[11px] leading-relaxed text-white/70 mt-1.5">High-accuracy 5-day forecasts, air quality indices, and atmospheric trends refreshed dynamically.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
