import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-8 w-32" style={{ background: '#E5E1DB' }} />
        </div>
        <Skeleton className="h-9 w-36" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full" style={{ background: '#E5E1DB' }} />

      {/* Table */}
      <div className="border border-[#E5E1DB]">
        {/* Table header */}
        <div className="px-4 py-3 border-b border-[#E5E1DB] grid grid-cols-5 gap-4">
          <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-16" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-24" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-14" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-12" style={{ background: '#E5E1DB' }} />
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-[#E5E1DB] grid grid-cols-5 gap-4 items-center last:border-0"
          >
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-36" style={{ background: '#E5E1DB' }} />
            </div>
            <Skeleton className="h-4 w-20" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-5 w-16" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-8 ml-auto" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
