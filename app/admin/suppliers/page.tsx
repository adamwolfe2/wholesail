'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Package, Loader2, Check, X } from 'lucide-react'

interface SubmissionRow {
  id: string
  productName: string
  category: string
  quantity: number
  unit: string
  pricePerUnit: number
  expectedArrival: string
  notes: string | null
  status: string
  createdAt: string
  supplier: {
    name: string
    email: string
    country: string | null
  }
}

export default function AdminSuppliersPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/supplier-submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id + action)
    try {
      const res = await fetch(`/api/admin/supplier-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchSubmissions()
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const pending = submissions.filter((s) => s.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          Supplier Submissions
        </h1>
        <p className="text-sm text-[#0A0A0A]/50 mt-1">
          Review and approve pending supplier inventory submissions
        </p>
      </div>

      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="border-b border-[#E5E1DB]">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">Pending Review</CardTitle>
          <CardDescription className="text-[#0A0A0A]/50">
            {loading ? 'Loading...' : `${pending.length} pending submission${pending.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-10 w-10 text-[#C8C0B4] mx-auto mb-3" />
              <p className="text-[#0A0A0A]/50 text-sm">No pending submissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C8C0B4]/50">
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Supplier</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Qty</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden sm:table-cell">Price/Unit</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden lg:table-cell">Expected</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((sub) => (
                    <TableRow key={sub.id} className="border-[#C8C0B4]/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-[#0A0A0A]">{sub.supplier.name}</p>
                          <p className="text-xs text-[#0A0A0A]/50">{sub.supplier.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-[#0A0A0A]">{sub.productName}</TableCell>
                      <TableCell className="text-[#0A0A0A]/60 hidden md:table-cell">{sub.category}</TableCell>
                      <TableCell className="text-right text-[#0A0A0A]/60">
                        {sub.quantity} {sub.unit}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#0A0A0A] hidden sm:table-cell">
                        ${sub.pricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-[#0A0A0A]/60 hidden lg:table-cell">
                        {new Date(sub.expectedArrival).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[#0A0A0A]/60 border-[#C8C0B4] rounded-none text-xs">
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            className="h-8 px-2 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none text-xs"
                            onClick={() => handleAction(sub.id, 'approve')}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === sub.id + 'approve' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-[#C8C0B4] text-[#0A0A0A]/60 hover:bg-[#C8C0B4]/20 rounded-none text-xs"
                            onClick={() => handleAction(sub.id, 'reject')}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === sub.id + 'reject' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All submissions history */}
      {!loading && submissions.filter((s) => s.status !== 'PENDING').length > 0 && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#E5E1DB]">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">Reviewed Submissions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C8C0B4]/50">
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Supplier</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Qty</TableHead>
                    <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions
                    .filter((s) => s.status !== 'PENDING')
                    .map((sub) => (
                      <TableRow key={sub.id} className="border-[#C8C0B4]/30">
                        <TableCell>
                          <p className="font-medium text-sm text-[#0A0A0A]">{sub.supplier.name}</p>
                        </TableCell>
                        <TableCell className="text-[#0A0A0A]/70">{sub.productName}</TableCell>
                        <TableCell className="text-[#0A0A0A]/60 hidden md:table-cell">{sub.category}</TableCell>
                        <TableCell className="text-right text-[#0A0A0A]/60">
                          {sub.quantity} {sub.unit}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'APPROVED' ? (
                            <Badge className="bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A] rounded-none text-xs">
                              {sub.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[#0A0A0A]/40 border-[#C8C0B4]/50 rounded-none text-xs">
                              {sub.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
