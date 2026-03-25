import { Skeleton } from "@/components/ui/skeleton"

export default function TeamSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-8 w-36" style={{ background: 'var(--color-shell)' }} />
        </div>
        <Skeleton className="h-9 w-32" style={{ background: 'var(--color-shell)' }} />
      </div>

      {/* Team members list */}
      <div className="border border-shell">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 border-b border-shell flex items-center gap-4 last:border-0"
          >
            <Skeleton className="h-10 w-10 rounded-full" style={{ background: 'var(--color-shell)' }} />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-28" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-3 w-36" style={{ background: 'var(--color-shell)' }} />
            </div>
            <Skeleton className="h-5 w-16" style={{ background: 'var(--color-shell)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
