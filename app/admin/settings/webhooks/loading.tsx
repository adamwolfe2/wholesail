import { Skeleton } from "@/components/ui/skeleton"

export default function WebhooksSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20 mb-1" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-8 w-32" style={{ background: 'var(--color-shell)' }} />
        </div>
        <Skeleton className="h-9 w-36" style={{ background: 'var(--color-shell)' }} />
      </div>

      {/* Webhook entries */}
      <div className="border border-shell">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 border-b border-shell flex items-center gap-4 last:border-0"
          >
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-3 w-32" style={{ background: 'var(--color-shell)' }} />
            </div>
            <Skeleton className="h-5 w-16" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-8 w-8" style={{ background: 'var(--color-shell)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
