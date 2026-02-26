import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PortalLayout } from "@/components/portal-nav";

export default function OrderDetailLoading() {
  return (
    <PortalLayout>
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-36" />

        {/* Progress Tracker */}
        <div className="flex items-center justify-between py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Skeleton className="h-6 w-28" />
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
