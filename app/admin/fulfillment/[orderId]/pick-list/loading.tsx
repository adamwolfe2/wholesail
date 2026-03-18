import { Skeleton } from "@/components/ui/skeleton"

export default function PickListLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-9 w-24" style={{ background: '#E5E1DB' }} />
      </div>

      {/* Order info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-[#E5E1DB] p-4 space-y-2">
          <Skeleton className="h-3 w-16" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-24" style={{ background: '#E5E1DB' }} />
        </div>
        <div className="border border-[#E5E1DB] p-4 space-y-2">
          <Skeleton className="h-3 w-24" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-40" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-32" style={{ background: '#E5E1DB' }} />
        </div>
      </div>

      {/* Items table */}
      <div className="border border-[#E5E1DB]">
        <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4">
          <Skeleton className="h-3 w-4" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-24" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-16" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-3 w-12 ml-auto" style={{ background: '#E5E1DB' }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-4 last:border-0"
          >
            <Skeleton className="h-4 w-4" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-16" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-8 ml-auto" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
