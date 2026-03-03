import { Skeleton } from "@/components/ui/skeleton"
import { PortalLayout } from "@/components/portal-nav"

export default function DashboardLoading() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-52 mb-1" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-4 w-44" style={{ background: '#E5E1DB' }} />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-28" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-11 w-32" style={{ background: '#E5E1DB' }} />
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-[#E5E1DB] bg-[#F9F7F4] p-4">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
                <Skeleton className="h-4 w-4" style={{ background: '#E5E1DB' }} />
              </div>
              <Skeleton className="h-7 w-24 mt-1" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-16 mt-2" style={{ background: '#E5E1DB' }} />
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent orders */}
          <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
            <div className="px-4 pt-4 pb-3 border-b border-[#E5E1DB]">
              <Skeleton className="h-5 w-32 mb-1" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-40" style={{ background: '#E5E1DB' }} />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" style={{ background: '#E5E1DB' }} />
                    <Skeleton className="h-3 w-36" style={{ background: '#E5E1DB' }} />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-14 ml-auto" style={{ background: '#E5E1DB' }} />
                    <Skeleton className="h-4 w-18" style={{ background: '#E5E1DB' }} />
                  </div>
                </div>
              ))}
              <Skeleton className="h-11 w-full mt-1" style={{ background: '#E5E1DB' }} />
            </div>
          </div>

          {/* Monthly spending chart */}
          <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
            <div className="px-4 pt-4 pb-3 border-b border-[#E5E1DB]">
              <Skeleton className="h-5 w-36 mb-1" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-48" style={{ background: '#E5E1DB' }} />
            </div>
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-8" style={{ background: '#E5E1DB' }} />
                  <Skeleton
                    className="h-7 flex-1"
                    style={{ background: '#E5E1DB', width: `${40 + Math.floor(i * 8)}%` }}
                  />
                  <Skeleton className="h-3 w-12" style={{ background: '#E5E1DB' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="border border-[#E5E1DB] bg-[#F9F7F4]">
          <div className="px-4 pt-4 pb-3 border-b border-[#E5E1DB]">
            <Skeleton className="h-5 w-28 mb-1" style={{ background: '#E5E1DB' }} />
            <Skeleton className="h-3 w-40" style={{ background: '#E5E1DB' }} />
          </div>
          <div className="p-4">
            <div className="flex gap-4 pb-2 border-b border-[#E5E1DB] mb-2">
              <Skeleton className="h-3 w-20" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-12 ml-auto" style={{ background: '#E5E1DB' }} />
              <Skeleton className="h-3 w-16" style={{ background: '#E5E1DB' }} />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2.5 border-b border-[#E5E1DB] last:border-0">
                <Skeleton className="h-4 w-32" style={{ background: '#E5E1DB' }} />
                <Skeleton className="h-4 w-8 ml-auto" style={{ background: '#E5E1DB' }} />
                <Skeleton className="h-4 w-16" style={{ background: '#E5E1DB' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
