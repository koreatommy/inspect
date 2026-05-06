import { Skeleton } from "@/components/ui/skeleton"

export default function UploadLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  )
}
