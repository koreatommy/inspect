import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LandingPage } from "@/components/landing/landing-page"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  )
}
