import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  Clock,
  Info,
  Lightbulb,
  ShieldCheck,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type ManualCalloutVariant =
  | "info"
  | "tip"
  | "warning"
  | "important"
  | "planned"

const variantConfig: Record<
  ManualCalloutVariant,
  {
    icon: LucideIcon
    label: string
    className: string
    iconClassName: string
  }
> = {
  info: {
    icon: Info,
    label: "안내",
    className:
      "border-l-primary/60 bg-primary/5 dark:bg-primary/10",
    iconClassName: "text-primary",
  },
  tip: {
    icon: Lightbulb,
    label: "팁",
    className:
      "border-l-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  warning: {
    icon: AlertTriangle,
    label: "주의",
    className:
      "border-l-orange-500/60 bg-orange-500/5 dark:bg-orange-500/10",
    iconClassName: "text-orange-600 dark:text-orange-400",
  },
  important: {
    icon: ShieldCheck,
    label: "중요",
    className:
      "border-l-destructive/60 bg-destructive/5 dark:bg-destructive/10",
    iconClassName: "text-destructive",
  },
  planned: {
    icon: Clock,
    label: "기능 추가 예정",
    className:
      "border-l-violet-500/60 bg-violet-500/5 dark:bg-violet-500/10",
    iconClassName: "text-violet-600 dark:text-violet-400",
  },
}

type ManualCalloutProps = {
  variant?: ManualCalloutVariant
  title?: string
  children: React.ReactNode
  className?: string
}

export function ManualCallout({
  variant = "info",
  title,
  children,
  className,
}: ManualCalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 border-l-4 p-4 print:break-inside-avoid",
        config.className,
        className,
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn("mt-0.5 size-5 shrink-0", config.iconClassName)}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">
            {title ?? config.label}
          </p>
          <div className="text-sm leading-relaxed text-muted-foreground [&_p+p]:mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
