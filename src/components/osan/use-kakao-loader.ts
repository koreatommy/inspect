"use client"

import { useEffect, useState } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any
  }
}

let loadingPromise: Promise<void> | null = null

/** 카카오 지도 SDK(services 포함)를 1회 로드하는 훅 */
export function useKakaoLoader() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    if (!key) {
      setError("NEXT_PUBLIC_KAKAO_MAP_KEY 가 설정되지 않았습니다.")
      return
    }
    if (typeof window !== "undefined" && window.kakao?.maps) {
      setLoaded(true)
      return
    }

    if (!loadingPromise) {
      loadingPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`
        script.async = true
        script.onload = () => window.kakao.maps.load(() => resolve())
        script.onerror = () => reject(new Error("카카오 지도 스크립트 로드 실패"))
        document.head.appendChild(script)
      })
    }

    loadingPromise
      .then(() => setLoaded(true))
      .catch((e: Error) => setError(e.message))
  }, [])

  return { loaded, error }
}
