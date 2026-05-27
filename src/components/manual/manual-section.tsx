import { Badge } from "@/components/ui/badge"
import { FEATURE_PLANNED_LABEL } from "@/lib/manual-data"
import { cn } from "@/lib/utils"

type ManualSectionProps = {
  id: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  hidden?: boolean
  /** true이면 섹션 제목 옆에 「기능 추가 예정」 배지 표시 */
  planned?: boolean
}

export function ManualSection({
  id,
  title,
  description,
  children,
  className,
  hidden = false,
  planned = false,
}: ManualSectionProps) {
  if (hidden) {
    return null
  }

  return (
    <section
      id={id}
      data-manual-section={id}
      className={cn(
        "scroll-mt-24 space-y-4 border-b border-border/60 pb-10 last:border-b-0 print:break-inside-avoid",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h2>
          {planned ? (
            <Badge
              variant="secondary"
              className="border-violet-500/30 bg-violet-500/10 font-normal text-violet-700 dark:text-violet-300"
            >
              {FEATURE_PLANNED_LABEL}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  )
}
