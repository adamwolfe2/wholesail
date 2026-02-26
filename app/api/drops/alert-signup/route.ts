import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { publicSignupLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await checkRateLimit(publicSignupLimiter, getIp(req))
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const { email, name, dropId } = body

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedName = name?.trim() || null

    if (dropId && typeof dropId === 'string') {
      // Sign up for a specific drop
      try {
        await prisma.dropAlert.create({
          data: {
            dropId,
            email: normalizedEmail,
            name: normalizedName,
          },
        })
      } catch (e: unknown) {
        // Unique constraint: already signed up — that's fine
        const isUniqueError =
          e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
        if (!isUniqueError) throw e
      }
    } else {
      // Sign up for all upcoming public drops
      const upcomingDrops = await prisma.productDrop.findMany({
        where: { isPublic: true, dropDate: { gte: new Date() } },
        select: { id: true },
      })

      for (const drop of upcomingDrops) {
        try {
          await prisma.dropAlert.create({
            data: {
              dropId: drop.id,
              email: normalizedEmail,
              name: normalizedName,
            },
          })
        } catch {
          // Already signed up for this drop — skip
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/drops/alert-signup error:', error)
    return NextResponse.json({ error: 'Failed to sign up for alerts' }, { status: 500 })
  }
}
