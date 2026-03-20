import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 border rounded-none overflow-hidden">
      {/* Sidebar list */}
      <div className="w-72 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Skeleton className="h-9 w-full" style={{ background: '#E5E1DB' }} />
        </div>
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 border-b">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" style={{ background: '#E5E1DB' }} />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" style={{ background: '#E5E1DB' }} />
                <Skeleton className="h-3.5 w-40" style={{ background: '#E5E1DB' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <Skeleton className={`h-12 rounded-lg ${i % 2 === 0 ? "w-64" : "w-48"}`} style={{ background: '#E5E1DB' }} />
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2">
          <Skeleton className="h-10 flex-1" style={{ background: '#E5E1DB' }} />
          <Skeleton className="h-10 w-20" style={{ background: '#E5E1DB' }} />
        </div>
      </div>
    </div>
  );
}
