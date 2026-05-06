"use client"

import { useCallback, useEffect, useState } from "react"

import { Cloud, CloudFog, CloudRain, CloudSnow, Loader2, MapPin, Sun, Zap } from "lucide-react"

import { weatherCodeToKo } from "@/lib/weather/wmo-weather-label"
import { cn } from "@/lib/utils"

const SEOUL_LAT = 37.5665
const SEOUL_LON = 126.978

type WeatherPayload = {
  tempC: number
  weatherCode: number
  windKmh: number
  humidity: number
  placeLabel: string
  usedGeolocation: boolean
}

function fetchOpenMeteoCurrent(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    wind_speed_unit: "kmh",
    timezone: "Asia/Seoul",
  })
  return fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
}

async function reversePlaceLabel(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
    )
    if (!res.ok) return "현재 위치"
    const data = (await res.json()) as {
      city?: string
      locality?: string
      principalSubdivision?: string
    }
    return (
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      "현재 위치"
    )
  } catch {
    return "현재 위치"
  }
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cnProps = cn("size-9 shrink-0 text-primary", className)
  if (code === 0 || code === 1) return <Sun className={cnProps} aria-hidden />
  if (code === 2 || code === 3) return <Cloud className={cnProps} aria-hidden />
  if (code === 45 || code === 48) return <CloudFog className={cnProps} aria-hidden />
  if (code >= 71 && code <= 77) return <CloudSnow className={cnProps} aria-hidden />
  if (code >= 95) return <Zap className={cnProps} aria-hidden />
  if (code >= 51) return <CloudRain className={cnProps} aria-hidden />
  return <Cloud className={cnProps} aria-hidden />
}

export function WeatherWidget({ className }: { className?: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ok"; data: WeatherPayload }
    | { status: "error"; message: string }
  >({ status: "loading" })

  const load = useCallback(async (lat: number, lon: number, usedGeolocation: boolean) => {
    setState({ status: "loading" })
    try {
      const [meteoRes, placeLabel] = await Promise.all([
        fetchOpenMeteoCurrent(lat, lon),
        reversePlaceLabel(lat, lon),
      ])
      if (!meteoRes.ok) {
        setState({ status: "error", message: "날씨 정보를 불러오지 못했습니다." })
        return
      }
      const json = (await meteoRes.json()) as {
        current?: {
          temperature_2m?: number
          weather_code?: number
          wind_speed_10m?: number
          relative_humidity_2m?: number
        }
      }
      const cur = json.current
      if (
        cur?.temperature_2m === undefined ||
        cur.weather_code === undefined ||
        cur.wind_speed_10m === undefined ||
        cur.relative_humidity_2m === undefined
      ) {
        setState({ status: "error", message: "날씨 응답 형식이 올바르지 않습니다." })
        return
      }
      setState({
        status: "ok",
        data: {
          tempC: Math.round(cur.temperature_2m * 10) / 10,
          weatherCode: cur.weather_code,
          windKmh: Math.round(cur.wind_speed_10m * 10) / 10,
          humidity: Math.round(cur.relative_humidity_2m),
          placeLabel,
          usedGeolocation,
        },
      })
    } catch {
      setState({ status: "error", message: "네트워크 오류가 발생했습니다." })
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      void load(SEOUL_LAT, SEOUL_LON, false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void load(pos.coords.latitude, pos.coords.longitude, true)
      },
      () => {
        void load(SEOUL_LAT, SEOUL_LON, false)
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 }
    )
  }, [load])

  if (state.status === "loading") {
    return (
      <div
        className={cn(
          "mt-3 flex max-w-md items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground ring-1 ring-foreground/5",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
        <span>위치·날씨를 불러오는 중입니다…</span>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div
        className={cn(
          "mt-3 max-w-md rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground",
          className
        )}
        role="alert"
      >
        {state.message}
      </div>
    )
  }

  const { data } = state
  const summary = weatherCodeToKo(data.weatherCode)

  return (
    <div
      className={cn(
        "mt-3 flex max-w-md flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10",
        className
      )}
      aria-label={`${data.placeLabel} 날씨 ${summary} 기온 섭씨 ${data.tempC}도`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <WeatherIcon code={data.weatherCode} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {data.placeLabel}
              {!data.usedGeolocation ? " · 위치 미허용(서울 기준)" : ""}
            </span>
          </div>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {summary}{" "}
            <span className="tabular-nums text-primary">{data.tempC}°C</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            습도 {data.humidity}% · 풍속 {data.windKmh} km/h
          </p>
        </div>
      </div>
    </div>
  )
}
