import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RepDetailLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-4" style={{ background: 'var(--color-shell)' }} />
        <Skeleton className="h-4 w-28" style={{ background: 'var(--color-shell)' }} />
      </div>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" style={{ background: 'var(--color-shell)' }} />
        <div>
          <Skeleton className="h-8 w-40" style={{ background: 'var(--color-shell)' }} />
          <Skeleton className="h-4 w-48 mt-2" style={{ background: 'var(--color-shell)' }} />
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-3.5 w-20 mb-2" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-7 w-16" style={{ background: 'var(--color-shell)' }} />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Detail cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" style={{ background: 'var(--color-shell)' }} />
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
            <Skeleton className="h-5 w-32" style={{ background: 'var(--color-shell)' }} />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <Skeleton className="h-4 w-4" style={{ background: 'var(--color-shell)' }} />
                <Skeleton className="h-4 w-full" style={{ background: 'var(--color-shell)' }} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
