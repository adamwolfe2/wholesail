import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function QuoteDetailLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-4" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-16" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-4" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-28" style={{ background: 'var(--color-shell)' }} />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-4 w-48 mt-2" style={{ background: 'var(--color-shell)' }} />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-9 w-28" style={{ background: 'var(--color-shell)' }} />
        </div>
      </div>
      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" style={{ background: 'var(--color-shell)' }} />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" style={{ background: 'var(--color-shell)' }} />
                <Skeleton className="h-4 w-20" style={{ background: 'var(--color-shell)' }} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" style={{ background: 'var(--color-shell)' }} />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" style={{ background: 'var(--color-shell)' }} />
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Line items */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" style={{ background: 'var(--color-shell)' }} />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <Skeleton className="h-4 w-40" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-8" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-16" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-16" style={{ background: 'var(--color-shell)' }} />
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <Skeleton className="h-6 w-32" style={{ background: 'var(--color-shell)' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
