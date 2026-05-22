import type { Metadata } from "next"
import type { ReactNode } from "react"

import { COPY } from "@/lib/landing/copy"

export const metadata: Metadata = {
  title: COPY.meta.title,
  description: COPY.meta.description,
  keywords: COPY.meta.keywords,
  openGraph: {
    title: COPY.meta.title,
    description: COPY.meta.description,
    type: "website",
  },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
