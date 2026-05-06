"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  updateAccountEmailAction,
  type EmailChangeState,
} from "./actions"

const initialState: EmailChangeState = {}

type EmailChangeFormProps = {
  currentEmail: string
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAccountEmailAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="currentEmail" className="text-sm font-medium">
          현재 이메일
        </label>
        <Input
          id="currentEmail"
          readOnly
          value={currentEmail}
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="newEmail" className="text-sm font-medium">
          변경할 이메일
        </label>
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          autoComplete="email"
          placeholder="새 이메일 주소"
          defaultValue=""
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          {state.message ?? "요청이 처리되었습니다."}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "처리 중..." : "이메일 변경 요청"}
      </Button>
    </form>
  )
}
