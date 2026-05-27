import { Badge } from "@/components/ui/badge"
import type { StepItem } from "@/lib/manual-data"
import { FEATURE_PLANNED_LABEL } from "@/lib/manual-data"
import { cn } from "@/lib/utils"

type ManualStepGuideProps = {
  steps: StepItem[]
  className?: string
}

export function ManualStepGuide({ steps, className }: ManualStepGuideProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li
            key={step.title}
            className="relative flex gap-4 pb-8 last:pb-0 print:break-inside-avoid"
          >
            <div className="flex flex-col items-center">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                aria-hidden
              >
                {index + 1}
              </span>
              {!isLast ? (
                <span
                  className="mt-2 w-px flex-1 bg-border"
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-foreground">{step.title}</h4>
                {step.planned ? (
                  <Badge
                    variant="secondary"
                    className="h-5 border-violet-500/30 bg-violet-500/10 font-normal text-violet-700 dark:text-violet-300"
                  >
                    {FEATURE_PLANNED_LABEL}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
