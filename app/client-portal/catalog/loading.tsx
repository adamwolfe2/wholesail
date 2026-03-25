import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Simulate PortalLayout wrapper spacing */}
      <div className="lg:pl-64">
        <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 max-w-7xl space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 bg-sand/20" />
              <Skeleton className="h-4 w-64 bg-sand/20" />
            </div>
            <Skeleton className="h-10 w-24 bg-sand/20" />
          </div>

          {/* Filter skeletons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1 bg-sand/20" />
            <Skeleton className="h-10 w-full sm:w-[220px] bg-sand/20" />
          </div>

          {/* Product count */}
          <Skeleton className="h-3 w-32 bg-sand/20" />

          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-sand/30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-cream p-4 sm:p-5 space-y-3">
                <Skeleton className="h-3 w-20 bg-sand/20" />
                <Skeleton className="h-5 w-3/4 bg-sand/20" />
                <Skeleton className="h-6 w-16 bg-sand/20" />
                <Skeleton className="h-4 w-full bg-sand/20" />
                <Skeleton className="h-4 w-2/3 bg-sand/20" />
                <Skeleton className="h-9 w-full bg-sand/20 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
