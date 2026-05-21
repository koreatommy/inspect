"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import {
  PERSON_NAME_HTML_PATTERN,
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
} from "@/lib/inspection/person-name"
import type { AppRole } from "@/types/inspection"

import {
  createUserAction,
  type CreateUserState,
} from "./user-actions"

const ASSIGNABLE: AppRole[] = ["MANAGER", "INSPECTOR", "VIEWER"]

const initialState: CreateUserState = {}

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState
  )

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold">사용자 생성</h3>
      <form action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="new-user-email" className="text-sm font-medium">
              아이디(이메일)
            </label>
            <Input
              id="new-user-email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-user-display-name" className="text-sm font-medium">
              이름
            </label>
            <Input
              id="new-user-display-name"
              name="displayName"
              autoComplete="name"
              minLength={PERSON_NAME_MIN_LENGTH}
              maxLength={PERSON_NAME_MAX_LENGTH}
              pattern={PERSON_NAME_HTML_PATTERN}
              title="한글 또는 영문 이름만 입력할 수 있습니다 (2~30자)."
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-user-phone" className="text-sm font-medium">
              핸드폰 번호
            </label>
            <Input
              id="new-user-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="010-1234-5678"
              pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}"
              title="휴대전화 번호 형식 (예: 010-1234-5678)"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-user-password" className="text-sm font-medium">
              초기 비밀번호
            </label>
            <Input
              id="new-user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-user-password-confirm"
              className="text-sm font-medium"
            >
              초기 비밀번호 확인
            </label>
            <Input
              id="new-user-password-confirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="new-user-role" className="text-sm font-medium">
              역할
            </label>
            <select
              id="new-user-role"
              name="role"
              className="flex h-9 w-full max-w-md rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue="VIEWER"
              required
            >
              {ASSIGNABLE.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {state.error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            사용자가 생성되었습니다. 생성 시 지정한 비밀번호로 로그인할 수 있습니다.
          </p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "생성 중..." : "사용자 생성"}
        </Button>
      </form>
    </div>
  )
}
