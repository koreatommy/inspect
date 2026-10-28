import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "오산시 지도점검",
  description: "오산시 어린이놀이시설 현장 지도점검 임시 페이지",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function OsanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
