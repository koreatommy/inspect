"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

type ChartBoxProps = {
  children: ReactNode
  /** Tailwind 등으로 부모 크기를 지정 (예: `h-[260px]`, `h-[200px] w-[200px]`) */
  className?: string
}

/**
 * Recharts 3.x: width/height="100%"만 쓰면 initialDimension(-1) 때문에
 * 콘솔 경고가 납니다. 부모를 측정한 뒤 숫자 크기로 ResponsiveContainer에 넘깁니다.
 * @see https://recharts.github.io/en-US/guide/sizes/
 */
export function ChartBox({ children, className }: ChartBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  )

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect()
      const roundedWidth = Math.round(width)
      const roundedHeight = Math.round(height)
      if (roundedWidth <= 0 || roundedHeight <= 0) return

      setSize((prev) =>
        prev?.width === roundedWidth && prev?.height === roundedHeight
          ? prev
          : { width: roundedWidth, height: roundedHeight }
      )
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={cn("w-full min-w-0", className)}>
      {size ? (
        <ResponsiveContainer width={size.width} height={size.height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  )
}
