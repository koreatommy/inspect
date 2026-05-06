import { Skeleton } from "@/components/ui/skeleton"

export default function FacilityDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-8 w-56" />
        <Skeleton className="mt-1 h-4 w-80" />
      </div>
      <div className="space-y-4">
        <div className="flex gap-2 border-b pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  )
}
