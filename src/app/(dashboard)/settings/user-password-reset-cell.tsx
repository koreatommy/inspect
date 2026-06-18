"use client"

import { useActionState, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  resetUserPasswordByAdminAction,
  type ResetPasswordState,
} from "./user-actions"

const initialState: ResetPasswordState = {}

type UserPasswordResetCellProps = {
  userId: string
}

export function UserPasswordResetCell({ userId }: UserPasswordResetCellProps) {
  const [state, formAction, isPending] = useActionState(
    resetUserPasswordByAdminAction,
    initialState
  )
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (state.success) {
      setShowForm(false)
    }
  }, [state.success])

  if (!showForm) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setShowForm(true)}
      >
        비밀번호 재설정
      </Button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex min-w-[200px] flex-col gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <Input
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="새 비밀번호"
        minLength={8}
        className="h-8 text-sm"
        required
      />
      <Input
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        placeholder="새 비밀번호 확인"
        minLength={8}
        className="h-8 text-sm"
        required
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "재설정 중..." : "재설정"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowForm(false)}
        >
          취소
        </Button>
        {state.error ? (
          <span className="text-xs text-destructive">{state.error}</span>
        ) : null}
        {state.success ? (
          <span className="text-xs text-emerald-600">재설정됨</span>
        ) : null}
      </div>
    </form>
  )
}
