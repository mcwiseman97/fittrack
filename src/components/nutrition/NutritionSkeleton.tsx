import { Skeleton } from "@/components/ui/skeleton"

export function NutritionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bento-card space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="bento-card space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
