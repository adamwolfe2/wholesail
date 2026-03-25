import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AgingLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" style={{ background: 'var(--color-shell)' }} />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" style={{ background: 'var(--color-shell)' }} />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-20" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-3.5 w-32" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-3.5 w-28" style={{ background: 'var(--color-shell)' }} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <Skeleton className="h-4 w-24" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-36" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-20" style={{ background: 'var(--color-shell)' }} />
              <Skeleton className="h-4 w-20 ml-auto" style={{ background: 'var(--color-shell)' }} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
