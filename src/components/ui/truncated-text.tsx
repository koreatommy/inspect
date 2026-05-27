import { cn } from "@/lib/utils"

type TruncatedTextProps = {
  text: string | null | undefined
  /** 비어 있을 때 표시할 문자 */
  emptyLabel?: string
  className?: string
  /** truncate 최대 너비 (Tailwind max-w-* 클래스) */
  maxWidthClass?: string
}

/** 한 줄 말줄임 + 마우스 오버 시 전체 텍스트(title) */
export function TruncatedText({
  text,
  emptyLabel = "-",
  className,
  maxWidthClass = "max-w-[10rem] sm:max-w-[14rem]",
}: TruncatedTextProps) {
  const value = text?.trim()
  if (!value) {
    return (
      <span className={cn("text-muted-foreground", className)}>{emptyLabel}</span>
    )
  }

  return (
    <span
      className={cn("block truncate", maxWidthClass, className)}
      title={value}
    >
      {value}
    </span>
  )
}
