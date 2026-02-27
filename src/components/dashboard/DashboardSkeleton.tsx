import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="bento-card space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex justify-around">
          <Skeleton className="w-28 h-28 rounded-full" />
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}
