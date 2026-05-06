import { Skeleton } from "@/components/ui/skeleton"

export default function FacilitiesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  )
}
