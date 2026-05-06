"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Lock, User } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

function normalizeLoginIdentifier(identifier: string) {
  const trimmed = identifier.trim()
  if (!trimmed) return ""
  if (trimmed.includes("@")) return trimmed
  return `${trimmed}@inspect.local`
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const identifier = String(formData.get("identifier") ?? "")
    const email = normalizeLoginIdentifier(identifier)
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
      setError("아이디(또는 이메일)와 비밀번호를 모두 입력해 주세요.")
      setIsPending(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const msg = authError.message ?? ""
      if (/invalid api key/i.test(msg)) {
        console.error("[Login] Auth error:", msg)
        setError(
          "Supabase API 키가 거부되었습니다. Dashboard에서 이 프로젝트 URL과 짝이 맞는 Publishable 키 또는 Legacy anon 키를 복사했는지, 오타·공백·다른 프로젝트 키 혼용이 없는지 확인해 주세요.",
        )
      } else if (/invalid login credentials/i.test(msg)) {
        console.warn("[Login] signInWithPassword: invalid credentials")
        setError(
          "아이디(이메일) 또는 비밀번호가 일치하지 않습니다.",
        )
      } else {
        console.error("[Login] Auth error:", msg)
        setError("로그인 정보가 올바르지 않습니다.")
      }
      setIsPending(false)
      return
    }

    const redirectTo = searchParams.get("redirectedFrom") || "/"
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <label htmlFor="identifier" className="text-sm font-medium">
          아이디 또는 이메일
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            placeholder="admin 또는 admin@inspect.local"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-10"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </motion.form>
  )
}
