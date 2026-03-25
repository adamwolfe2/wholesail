import { Skeleton } from "@/components/ui/skeleton"

export default function BuildCartLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-8 w-32" style={{ background: 'var(--color-shell)' }} />
        </div>
        <Skeleton className="h-9 w-28" style={{ background: 'var(--color-shell)' }} />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full" style={{ background: 'var(--color-shell)' }} />

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-shell p-4 space-y-3">
            <Skeleton className="h-32 w-full" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-4 w-28" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-3 w-20" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-9 w-full" style={{ background: 'var(--color-shell)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
