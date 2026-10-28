"use client"

import { useEffect, useRef } from "react"

import { saveFacilityCoords } from "@/app/osan/actions"
import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { normalizeAddress } from "@/lib/osan/geocode"

type Args = {
  loaded: boolean
  facilities: OsanFacilityWithRelations[]
  onResolved: (id: string, lat: number, lng: number) => void
}

/** 카카오 JS SDK Geocoder로 좌표가 비어 있는 시설을 채우고 DB에 저장한다. */
export function useKakaoGeocode({ loaded, facilities, onResolved }: Args) {
  const started = useRef(false)

  useEffect(() => {
    if (!loaded || started.current || !window.kakao?.maps?.services) return
    const missing = facilities.filter((f) => f.lat == null && f.address)
    if (missing.length === 0) return
    started.current = true

    const geocoder = new window.kakao.maps.services.Geocoder()

    void (async () => {
      for (const facility of missing) {
        const query = normalizeAddress(facility.address ?? "")
        if (!query) continue
        const point = await new Promise<{ lat: number; lng: number } | null>(
          (resolve) => {
            geocoder.addressSearch(
              query,
              (
                result: Array<{ y: string; x: string }>,
                status: string,
              ) => {
                if (
                  status !== window.kakao.maps.services.Status.OK ||
                  !result[0]
                ) {
                  resolve(null)
                  return
                }
                resolve({
                  lat: Number.parseFloat(result[0].y),
                  lng: Number.parseFloat(result[0].x),
                })
              },
            )
          },
        )
        if (!point) continue
        const res = await saveFacilityCoords(facility.id, point.lat, point.lng)
        if (res.ok) onResolved(facility.id, point.lat, point.lng)
        await new Promise((r) => setTimeout(r, 80))
      }
    })()
  }, [facilities, loaded, onResolved])
}
