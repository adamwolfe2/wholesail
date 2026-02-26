import { Skeleton } from "@/components/ui/skeleton";
import { PortalLayout } from "@/components/portal-nav";

export default function PortalLoading() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
