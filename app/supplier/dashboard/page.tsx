import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, Clock, CheckCircle2, XCircle, PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A] rounded-none">{status}</Badge>
    case 'REJECTED':
      return <Badge variant="outline" className="text-[#0A0A0A]/40 border-[#C8C0B4]/50 rounded-none">{status}</Badge>
    default:
      return <Badge variant="outline" className="text-[#0A0A0A]/60 border-[#C8C0B4] rounded-none">{status}</Badge>
  }
}

export default async function SupplierDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let supplier = null
  let submissions: {
    id: string
    productName: string
    category: string
    quantity: number
    expectedArrival: Date
    status: string
    createdAt: Date
  }[] = []

  let stats = { total: 0, pending: 0, approved: 0, rejected: 0 }

  try {
    supplier = await prisma.supplier.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, name: true },
    })

    if (supplier) {
      const allSubmissions = await prisma.supplierSubmission.findMany({
        where: { supplierId: supplier.id },
        orderBy: { createdAt: 'desc' },
      })

      stats = {
        total: allSubmissions.length,
        pending: allSubmissions.filter((s) => s.status === 'PENDING').length,
        approved: allSubmissions.filter((s) => s.status === 'APPROVED').length,
        rejected: allSubmissions.filter((s) => s.status === 'REJECTED').length,
      }

      submissions = allSubmissions.slice(0, 5).map((s) => ({
        id: s.id,
        productName: s.productName,
        category: s.category,
        quantity: Number(s.quantity),
        expectedArrival: s.expectedArrival,
        status: s.status,
        createdAt: s.createdAt,
      }))
    }
  } catch {
    // DB not connected
  }

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const displayName = supplier?.name ?? 'Supplier'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">
            Overview of your supplier submissions
          </p>
        </div>
        <Button
          asChild
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px] w-full sm:w-auto rounded-none"
        >
          <Link href="/supplier/submit">
            <PlusCircle className="h-4 w-4 mr-2" />
            Submit New Inventory
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Total Submissions
            </CardTitle>
            <Package className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-[#0A0A0A]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-[#0A0A0A]">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Approved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-[#0A0A0A]">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-[#0A0A0A]">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
        <CardHeader className="border-b border-[#E5E1DB] flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">Recent Submissions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none"
          >
            <Link href="/supplier/submissions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {submissions.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-10 w-10 text-[#C8C0B4] mx-auto mb-3" />
              <p className="text-[#0A0A0A]/50 text-sm">No submissions yet.</p>
              <Button
                asChild
                className="mt-4 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none min-h-[44px]"
              >
                <Link href="/supplier/submit">Submit Your First Inventory</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C8C0B4]/50">
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden sm:table-cell">Category</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Qty</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden md:table-cell">Expected</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id} className="border-[#C8C0B4]/30">
                      <TableCell className="font-medium text-[#0A0A0A]">{sub.productName}</TableCell>
                      <TableCell className="text-[#0A0A0A]/60 hidden sm:table-cell">{sub.category}</TableCell>
                      <TableCell className="text-right text-[#0A0A0A]/60">{sub.quantity}</TableCell>
                      <TableCell className="text-[#0A0A0A]/60 hidden md:table-cell">
                        {new Date(sub.expectedArrival).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
