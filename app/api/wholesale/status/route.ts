import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { publicSignupLimiter, checkRateLimit, getIp } from '@/lib/rate-limit'

// GET /api/wholesale/status?email=[email]
// Public endpoint — no auth required.
export async function GET(req: NextRequest) {
  const { allowed } = await checkRateLimit(publicSignupLimiter, getIp(req))
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const application = await prisma.wholesaleApplication.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: {
      status: true,
      businessName: true,
      createdAt: true,
      reviewedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!application) {
    return NextResponse.json({ status: 'NOT_FOUND' })
  }

  return NextResponse.json({
    status: application.status,
    businessName: application.businessName,
    submittedAt: application.createdAt,
    reviewedAt: application.reviewedAt,
  })
}
