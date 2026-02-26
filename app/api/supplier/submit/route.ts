import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const submitSchema = z.object({
  productName: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  pricePerUnit: z.number().positive(),
  expectedArrival: z.string().min(1),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    // Find or create supplier record linked to this Clerk user
    let supplier = await prisma.supplier.findUnique({
      where: { clerkUserId: userId },
    })

    if (!supplier) {
      // Try to find by email via Clerk (graceful fallback: create with userId as identifier)
      supplier = await prisma.supplier.create({
        data: {
          name: 'New Supplier',
          email: `supplier-${userId}@placeholder.tbgc`,
          clerkUserId: userId,
          isActive: true,
        },
      })
    }

    const { productName, category, quantity, unit, pricePerUnit, expectedArrival, notes } =
      parsed.data

    const submission = await prisma.supplierSubmission.create({
      data: {
        supplierId: supplier.id,
        productName,
        category,
        quantity,
        unit,
        pricePerUnit,
        expectedArrival: new Date(expectedArrival),
        notes: notes ?? null,
        status: 'PENDING',
      },
    })

    await prisma.auditEvent.create({
      data: {
        entityType: 'SupplierSubmission',
        entityId: submission.id,
        action: 'created',
        userId,
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
