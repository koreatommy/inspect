export const INSPECTION_STATUS_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "작성중", variant: "secondary" },
  completed: { label: "완료", variant: "default" },
  needs_revision: { label: "수정요청", variant: "outline" },
  locked: { label: "잠김", variant: "outline" },
}

export function getStatusBadge(status: string) {
  return (
    INSPECTION_STATUS_BADGE[status] ?? {
      label: status,
      variant: "outline" as const,
    }
  )
}
