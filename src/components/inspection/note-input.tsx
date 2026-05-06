export function NoteInput({
  itemId,
  defaultValue,
  disabled = false,
}: {
  itemId: string
  defaultValue: string | null
  disabled?: boolean
}) {
  return (
    <textarea
      name={`note:${itemId}`}
      defaultValue={defaultValue ?? ""}
      disabled={disabled}
      placeholder="요주의, 요수리, 이용금지 선택 시 점검내용을 입력하세요."
      className="min-h-16 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
