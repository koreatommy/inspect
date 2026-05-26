"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resolveAccountAccess } from "@/lib/auth/account-access"
import { getSuspendedMessage } from "@/lib/auth/account-status"
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

function normalizeLoginIdentifier(identifier: string) {
  const trimmed = identifier.trim()
  if (!trimmed) return ""
  if (trimmed.includes("@")) return trimmed
  return `${trimmed}@inspect.local`
}

interface LoginFormProps {
  redirectedFrom?: string | null
  autoFocus?: boolean
}

export function LoginForm({
  redirectedFrom: redirectedFromProp,
  autoFocus = false,
}: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifierRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const redirectedFrom =
    redirectedFromProp ?? searchParams.get("redirectedFrom")

  useEffect(() => {
    if (autoFocus) {
      const id = window.setTimeout(() => identifierRef.current?.focus(), 100)
      return () => window.clearTimeout(id)
    }
  }, [autoFocus])

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
    const { data: signInData, error: authError } =
      await supabase.auth.signInWithPassword({
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
        setError("아이디(이메일) 또는 비밀번호가 일치하지 않습니다.")
      } else {
        console.error("[Login] Auth error:", msg)
        setError("로그인 정보가 올바르지 않습니다.")
      }
      setIsPending(false)
      return
    }

    const userId = signInData.user?.id
    if (userId) {
      const access = await resolveAccountAccess(supabase, userId)
      if (access.blocked) {
        toast.error(getSuspendedMessage(access.suspendReason), {
          position: "top-center",
        })
        await supabase.auth.signOut()
        setIsPending(false)
        return
      }
    }

    let redirectTo = getSafeRedirectPath(redirectedFrom)
    if (!redirectedFrom || redirectTo === "/") {
      redirectTo = "/dashboard"
    }
    router.push(redirectTo)
    router.refresh()
  }

  const motionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6" {...motionProps}>
      <div className="space-y-3">
        <label
          htmlFor="identifier"
          className="block text-sm font-medium leading-snug text-label-strong"
        >
          아이디 또는 이메일
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={identifierRef}
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            placeholder="admin 또는 admin@inspect.local"
            className="h-11 px-3 pl-11 text-base"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-snug text-label-strong"
        >
          비밀번호
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 px-3 pr-11 pl-11 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            role="alert"
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button
        type="submit"
        className="mt-2 h-11 w-full bg-[#F97316] text-base text-white hover:bg-[#EA580C]"
        disabled={isPending}
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </motion.form>
  )
}
