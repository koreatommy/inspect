import { Skeleton } from "@/components/ui/skeleton"

export default function InspectionLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-8 w-64" />
        <Skeleton className="mt-1 h-4 w-80" />
      </div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  )
}
