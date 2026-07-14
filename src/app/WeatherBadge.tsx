"use client";

import { useEffect, useState } from "react";

type Weather = {
  temperature: number;
  unit: string;
  condition: string;
};

export default function WeatherBadge() {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => (res.ok ? res.json() : null))
      .then(setWeather)
      .catch(() => setWeather(null));
  }, []);

  if (!weather) return null;

  return (
    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      {weather.temperature}
      {weather.unit} · {weather.condition}
    </span>
  );
}
