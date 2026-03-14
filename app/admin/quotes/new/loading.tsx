import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewQuoteLoading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Skeleton className="h-8 w-36" style={{ background: '#E5E1DB' }} />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" style={{ background: '#E5E1DB' }} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" style={{ background: '#E5E1DB' }} />
                <Skeleton className="h-9 w-full" style={{ background: '#E5E1DB' }} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-20 w-full" style={{ background: '#E5E1DB' }} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" style={{ background: '#E5E1DB' }} />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 flex-1" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-9 w-20" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-9 w-20" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-9 w-9" style={{ background: '#E5E1DB' }} />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-9 w-32" style={{ background: '#E5E1DB' }} />
      </div>
    </div>
  );
}
