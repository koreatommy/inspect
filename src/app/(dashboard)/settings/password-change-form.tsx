"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  changePasswordAction,
  type PasswordChangeState,
} from "./actions"

const initialState: PasswordChangeState = {}

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          새 비밀번호
        </label>
        <Input id="password" name="password" type="password" minLength={8} />
      </div>
      <div className="space-y-2">
        <label htmlFor="passwordConfirm" className="text-sm font-medium">
          새 비밀번호 확인
        </label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          minLength={8}
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          비밀번호가 변경되었습니다.
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "변경 중..." : "비밀번호 변경"}
      </Button>
    </form>
  )
}
