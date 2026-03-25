import { Skeleton } from "@/components/ui/skeleton"

export default function WholesaleDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-8 w-40" style={{ background: 'var(--color-shell)' }} />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-9 w-24" style={{ background: 'var(--color-shell)' }} />
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-shell p-4 space-y-2">
            <Skeleton className="h-3 w-20" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-5 w-32" style={{ background: 'var(--color-shell)' }} />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="border border-shell p-6 space-y-4">
        <Skeleton className="h-5 w-28" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-full" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-3/4" style={{ background: 'var(--color-shell)' }} />
      </div>
    </div>
  )
}
