import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge className="bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A] rounded-none">
          {status}
        </Badge>
      )
    case 'REJECTED':
      return (
        <Badge variant="outline" className="text-[#0A0A0A]/40 border-[#C8C0B4]/50 rounded-none">
          {status}
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[#0A0A0A]/60 border-[#C8C0B4] rounded-none">
          {status}
        </Badge>
      )
  }
}

export default async function SupplierSubmissionsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let submissions: {
    id: string
    productName: string
    category: string
    quantity: number
    unit: string
    pricePerUnit: number
    expectedArrival: Date
    status: string
    createdAt: Date
  }[] = []

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    })

    if (supplier) {
      const raw = await prisma.supplierSubmission.findMany({
        where: { supplierId: supplier.id },
        orderBy: { createdAt: 'desc' },
      })

      submissions = raw.map((s) => ({
        id: s.id,
        productName: s.productName,
        category: s.category,
        quantity: Number(s.quantity),
        unit: s.unit,
        pricePerUnit: Number(s.pricePerUnit),
        expectedArrival: s.expectedArrival,
        status: s.status,
        createdAt: s.createdAt,
      }))
    }
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Submissions</h1>
        <p className="text-sm text-[#0A0A0A]/50 mt-1">All your inventory submissions</p>
      </div>

      <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
        <CardHeader className="border-b border-[#E5E1DB]">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">All Submissions</CardTitle>
          <CardDescription className="text-[#0A0A0A]/50">
            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
              <p className="text-[#0A0A0A]/50 text-sm">No submissions yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="overflow-x-auto hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#C8C0B4]/50">
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Category</TableHead>
                      <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Qty</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Unit</TableHead>
                      <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Price/Unit</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden lg:table-cell">Expected Arrival</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                      <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden lg:table-cell">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id} className="border-[#C8C0B4]/30">
                        <TableCell className="font-medium text-[#0A0A0A]">{sub.productName}</TableCell>
                        <TableCell className="text-[#0A0A0A]/60">{sub.category}</TableCell>
                        <TableCell className="text-right text-[#0A0A0A]/60">{sub.quantity}</TableCell>
                        <TableCell className="text-[#0A0A0A]/60">{sub.unit}</TableCell>
                        <TableCell className="text-right font-semibold text-[#0A0A0A]">
                          {formatCurrency(sub.pricePerUnit)}
                        </TableCell>
                        <TableCell className="text-[#0A0A0A]/60 hidden lg:table-cell">
                          {new Date(sub.expectedArrival).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="text-[#0A0A0A]/50 text-xs hidden lg:table-cell">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-[#C8C0B4]/50 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-[#0A0A0A]">{sub.productName}</p>
                        <p className="text-xs text-[#0A0A0A]/50">{sub.category}</p>
                      </div>
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#0A0A0A]/60">
                      <span>{sub.quantity} {sub.unit}</span>
                      <span>{formatCurrency(sub.pricePerUnit)}/unit</span>
                    </div>
                    <p className="text-xs text-[#0A0A0A]/50">
                      Expected: {new Date(sub.expectedArrival).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
