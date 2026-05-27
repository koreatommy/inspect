import { Badge } from "@/components/ui/badge"
import type { UpdateEntry } from "@/lib/manual-data"

type ManualUpdateHistoryProps = {
  entries: UpdateEntry[]
}

export function ManualUpdateHistory({ entries }: ManualUpdateHistoryProps) {
  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <article
          key={`${entry.date}-${entry.version}`}
          className="rounded-lg border border-border/60 bg-card p-4 ring-1 ring-foreground/5 print:break-inside-avoid"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">v{entry.version}</Badge>
            <time
              dateTime={entry.date}
              className="text-sm text-muted-foreground"
            >
              {entry.date}
            </time>
          </div>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {entry.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
