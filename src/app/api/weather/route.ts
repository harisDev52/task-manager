import { NextRequest, NextResponse } from "next/server";

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

// Defaults to Karachi; pass ?lat=&lon= to override.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") ?? "24.86");
  const lon = Number(searchParams.get("lon") ?? "67.01");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon must be numbers" },
      { status: 400 }
    );
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const res = await fetch(url, { next: { revalidate: 600 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Weather service unavailable" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({
    temperature: Math.round(data.current.temperature_2m),
    unit: data.current_units?.temperature_2m ?? "°C",
    condition: WEATHER_LABELS[data.current.weather_code] ?? "Unknown",
  });
}
