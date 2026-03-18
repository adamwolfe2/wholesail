import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-8 w-40" style={{ background: '#E5E1DB' }} />
        </div>
        <Skeleton className="h-9 w-24" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[#E5E1DB] p-4 space-y-2">
            <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-5 w-32" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="border border-[#E5E1DB] p-6 space-y-4">
        <Skeleton className="h-5 w-28" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-4 w-full" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-4 w-3/4" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-4 w-1/2" style={{ background: '#E5E1DB' }} />
      </div>
    </div>
  )
}
