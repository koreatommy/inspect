import { cn } from "@/lib/utils"

/** Input과 동일한 높이·테두리의 날짜/월 피커 트리거 */
export const pickerTriggerClassName = cn(
  "h-8 w-full min-w-0 justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base font-normal shadow-none md:text-sm",
  "hover:bg-muted/40 dark:bg-input/30 dark:hover:bg-input/50",
  "data-[empty=true]:text-muted-foreground"
)
