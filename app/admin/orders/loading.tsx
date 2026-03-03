import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-8 w-28" style={{ background: '#E5E1DB' }} />
        </div>
        <Skeleton className="h-9 w-32" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-10 w-40" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-10 w-40" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Table */}
      <div className="border border-[#E5E1DB]">
        {/* Table header */}
        <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4">
          <Skeleton className="h-3 w-4" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-28" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-12" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-16 ml-auto" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-18" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4 last:border-0"
          >
            <Skeleton className="h-4 w-4" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-24 font-mono" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-8" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-16 ml-auto" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-5 w-20" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-20" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
