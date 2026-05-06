import { Skeleton } from "@/components/ui/skeleton"

export default function NewInspectionLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <Skeleton className="h-[200px] rounded-xl" />
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  )
}
