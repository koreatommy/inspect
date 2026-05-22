import { BrandWordmark } from "@/components/landing/brand-wordmark"

interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="brand-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B66FF" />
          <stop offset="1" stopColor="#3385FF" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 4 6.5v9c0 7 5.2 11.5 12 14.5 6.8-3 12-7.5 12-14.5v-9z"
        fill="url(#brand-mark-gradient)"
      />
      <path
        d="m10 16 4 4 8.5-9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface BrandLogoProps {
  size?: number
  className?: string
}

export function BrandLogo({ size = 22, className }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
    >
      <BrandMark size={size + 6} />
      <BrandWordmark
        className="font-bold tracking-[-0.02em] text-label-strong"
        style={{ fontSize: size * 0.78 }}
      />
    </span>
  )
}

export function BrandLogoDark({ size = 22, className }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
    >
      <BrandMark size={size + 6} />
      <BrandWordmark
        variant="dark"
        className="font-bold tracking-[-0.02em] text-white"
        style={{ fontSize: size * 0.82 }}
      />
    </span>
  )
}
