import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { publicAlertLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'

/**
 * POST /api/drops/[id]/alert
 *
 * Sign up for alerts for a specific drop.
 * Accepts: { email (required), name (optional), phone (optional) }
 * Silently handles duplicate email (unique constraint).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed } = await checkRateLimit(publicAlertLimiter, getIp(req))
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { email, name, phone } = body

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Confirm drop exists
    const drop = await prisma.productDrop.findUnique({ where: { id }, select: { id: true } })
    if (!drop) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }

    try {
      await prisma.dropAlert.create({
        data: {
          dropId: id,
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          phone: phone?.trim() || null,
        },
      })
    } catch (e: unknown) {
      // Unique constraint [dropId, email] — already signed up, that's fine
      const isUniqueError =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
      if (!isUniqueError) throw e
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/drops/[id]/alert error:', error)
    return NextResponse.json({ error: 'Failed to sign up for alert' }, { status: 500 })
  }
}
