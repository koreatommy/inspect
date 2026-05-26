import Image from "next/image"

export function SignaturePreview({
  label,
  src,
  fallbackMessage,
  showLabel = true,
}: {
  label: string
  src: string | null
  fallbackMessage: string
  showLabel?: boolean
}) {
  return (
    <div className="space-y-2">
      {showLabel ? (
        <label className="text-sm font-medium">{label}</label>
      ) : null}
      {src ? (
        <>
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-50">
            <Image
              src={src}
              alt={`${label} 서명`}
              width={220}
              height={110}
              unoptimized
              className="mx-auto h-24 w-auto max-w-full object-contain contrast-[1.08] sm:h-20"
            />
          </div>
          <p className="text-xs text-muted-foreground">저장된 서명</p>
        </>
      ) : (
        <p className="rounded-lg border bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
          {fallbackMessage}
        </p>
      )}
    </div>
  )
}
