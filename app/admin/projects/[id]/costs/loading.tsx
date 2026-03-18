import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectCostsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-8 w-36" style={{ background: '#E5E1DB' }} />
        </div>
        <Skeleton className="h-9 w-28" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-[#E5E1DB] p-4 space-y-2">
            <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-6 w-24" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#E5E1DB]">
        <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4">
          <Skeleton className="h-3 w-24" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-16" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-16 ml-auto" style={{ background: '#E5E1DB' }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4 last:border-0"
          >
            <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-20" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-16 ml-auto" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
