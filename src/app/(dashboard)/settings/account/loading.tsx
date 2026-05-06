import { Skeleton } from "@/components/ui/skeleton"

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[220px] rounded-xl" />
        <Skeleton className="h-[220px] rounded-xl" />
      </div>
    </div>
  )
}
