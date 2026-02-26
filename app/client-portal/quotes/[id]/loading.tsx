import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PortalLayout } from "@/components/portal-nav";

export default function QuoteDetailLoading() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <Skeleton className="h-3.5 w-20 mb-2" />
                <Skeleton className="h-6 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-20" /></CardHeader>
          <CardContent>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-end">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </PortalLayout>
  );
}
