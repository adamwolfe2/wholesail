import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const patchSchema = z.object({
  action: z.enum(['approve', 'reject']),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error: authError } = await requireAdmin()
    if (authError) return authError

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { id } = await params
    const { action } = parsed.data

    const submission = await prisma.supplierSubmission.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedAt: action === 'approve' ? new Date() : null,
      },
    })

    await prisma.auditEvent.create({
      data: {
        entityType: 'SupplierSubmission',
        entityId: id,
        action: action === 'approve' ? 'approved' : 'rejected',
        userId,
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error updating supplier submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
