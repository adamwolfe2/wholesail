import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminIntakeDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      <Skeleton className="h-5 w-64" />

      <div className="space-y-1">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
