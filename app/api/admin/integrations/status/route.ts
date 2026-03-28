import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  return NextResponse.json({
    resend: process.env.RESEND_API_KEY ? 'configured' : 'missing',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
    blooio: process.env.BLOOIO_API_KEY ? 'configured' : 'missing',
    clerk: process.env.CLERK_SECRET_KEY ? 'configured' : 'missing',
  })
}
