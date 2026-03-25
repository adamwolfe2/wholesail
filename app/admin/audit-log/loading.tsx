import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" style={{ background: 'var(--color-shell)' }} />
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-9 w-32" style={{ background: 'var(--color-shell)' }} />
      </div>
      <div className="border rounded-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-32" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-4 w-24" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-4 w-48" style={{ background: 'var(--color-shell)' }} />
            <Skeleton className="h-4 w-20 ml-auto" style={{ background: 'var(--color-shell)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
