"use client";

import { useEffect, useMemo, useState } from "react";

const launchDate = new Date("2026-05-31T20:00:00-03:00");

function diff() {
  const distance = Math.max(0, launchDate.getTime() - Date.now());
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function LaunchCountdown() {
  const [time, setTime] = useState(() => diff());
  const units = useMemo(
    () => [
      ["Dias", time.days],
      ["Horas", time.hours],
      ["Minutos", time.minutes],
      ["Segundos", time.seconds]
    ],
    [time]
  );

  useEffect(() => {
    const timer = window.setInterval(() => setTime(diff()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative grid grid-cols-4 overflow-hidden rounded-lg border border-gold/18 bg-black/48 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
      {units.map(([label, value]) => (
        <div key={label} className="min-w-0 border-r border-gold/16 px-1.5 py-3 text-center last:border-r-0 sm:px-5 sm:py-4 md:px-7 lg:py-4">
          <strong className="subtitle block text-[clamp(1.85rem,7vw,4.3rem)] font-bold leading-none text-white">{String(value).padStart(2, "0")}</strong>
          <span className="subtitle mt-2 block text-[8px] font-semibold uppercase tracking-[0.18em] text-white/62 sm:text-xs sm:tracking-[0.34em]">{label}</span>
        </div>
      ))}
    </div>
  );
}
