import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminIntakesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="flex gap-1 border-b border-[#E5E1DB] pb-0">
        {["pending", "reviewed", "archived"].map((f) => (
          <Skeleton key={f} className="h-9 w-20 mb-px" />
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-5 w-24 hidden lg:block" />
                <Skeleton className="h-4 w-8 hidden sm:block" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
