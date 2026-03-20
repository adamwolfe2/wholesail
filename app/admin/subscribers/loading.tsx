import { Skeleton } from "@/components/ui/skeleton";

export default function SubscribersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" style={{ background: '#E5E1DB' }} />
        <Skeleton className="h-9 w-36" style={{ background: '#E5E1DB' }} />
      </div>
      <div className="border rounded-none">
        <div className="flex items-center gap-4 px-4 py-3 border-b">
          <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-40" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-24" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-20" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-20 ml-auto" style={{ background: '#E5E1DB' }} />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-40" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-24" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-5 w-20 rounded-full" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-8 w-20 ml-auto" style={{ background: '#E5E1DB' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
