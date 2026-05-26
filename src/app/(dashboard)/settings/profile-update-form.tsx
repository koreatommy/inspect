"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  PERSON_NAME_HTML_PATTERN,
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
} from "@/lib/inspection/person-name"
import { formatKoreanMobilePhone } from "@/lib/validation/korean-phone"

import { updateMyProfileAction, type ProfileUpdateState } from "./actions"

const initialState: ProfileUpdateState = {}

type ProfileUpdateFormProps = {
  displayName: string
  phone: string
}

export function ProfileUpdateForm({ displayName, phone }: ProfileUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMyProfileAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          이름
        </label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          defaultValue={displayName}
          minLength={PERSON_NAME_MIN_LENGTH}
          maxLength={PERSON_NAME_MAX_LENGTH}
          pattern={PERSON_NAME_HTML_PATTERN}
          title="한글 또는 영문 이름만 입력할 수 있습니다 (2~30자)."
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          전화번호
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          defaultValue={formatKoreanMobilePhone(phone)}
          placeholder="010-1234-5678"
          pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}"
          title="휴대전화 번호 형식 (예: 010-1234-5678)"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          내 정보가 변경되었습니다.
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "내 정보 저장"}
      </Button>
    </form>
  )
}
