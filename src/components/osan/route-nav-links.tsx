"use client"

import { Navigation } from "lucide-react"

import { cn } from "@/lib/utils"
import { kakaoRouteUrl, tmapRouteUrl } from "./osan-utils"

type Props = {
  name: string
  lat: number
  lng: number
  /** icon: 동선 시트용 아이콘 버튼 / text: 카드용 텍스트 버튼 */
  variant?: "icon" | "text"
  className?: string
}

export function RouteNavLinks({
  name,
  lat,
  lng,
  variant = "icon",
  className,
}: Props) {
  const kakaoHref = kakaoRouteUrl(name, lat, lng)
  const tmapHref = tmapRouteUrl(name, lat, lng)

  if (variant === "text") {
    return (
      <div className={cn("flex flex-1 gap-1", className)}>
        <a
          href={kakaoHref}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
        >
          <Navigation className="size-4" />
          카카오
        </a>
        <a
          href={tmapHref}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-[#e31c23] text-sm font-medium text-white"
        >
          <span className="text-xs font-bold leading-none">T</span>
          티맵
        </a>
      </div>
    )
  }

  return (
    <div className={cn("flex shrink-0 gap-1", className)}>
      <a
        href={kakaoHref}
        target="_blank"
        rel="noreferrer"
        className="flex size-10 items-center justify-center rounded-lg bg-background"
        aria-label="카카오맵 길찾기"
        title="카카오맵"
      >
        <Navigation className="size-4" />
      </a>
      <a
        href={tmapHref}
        target="_blank"
        rel="noreferrer"
        className="flex size-10 items-center justify-center rounded-lg bg-[#e31c23] text-white"
        aria-label="티맵 길찾기"
        title="티맵"
      >
        <span className="text-xs font-bold leading-none">T</span>
      </a>
    </div>
  )
}
