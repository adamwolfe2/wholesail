import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'

export interface NotificationPrefs {
  emailDropAlerts: boolean
  emailOrderUpdates: boolean
  smsOrderUpdates: boolean
  emailWeeklyDigest: boolean
}

const DEFAULTS: NotificationPrefs = {
  emailDropAlerts: true,
  emailOrderUpdates: true,
  smsOrderUpdates: true,
  emailWeeklyDigest: true,
}

function withDefaults(raw: unknown): NotificationPrefs {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const p = raw as Record<string, unknown>
    return {
      emailDropAlerts:   typeof p.emailDropAlerts   === 'boolean' ? p.emailDropAlerts   : DEFAULTS.emailDropAlerts,
      emailOrderUpdates: typeof p.emailOrderUpdates === 'boolean' ? p.emailOrderUpdates : DEFAULTS.emailOrderUpdates,
      smsOrderUpdates:   typeof p.smsOrderUpdates   === 'boolean' ? p.smsOrderUpdates   : DEFAULTS.smsOrderUpdates,
      emailWeeklyDigest: typeof p.emailWeeklyDigest === 'boolean' ? p.emailWeeklyDigest : DEFAULTS.emailWeeklyDigest,
    }
  }
  return { ...DEFAULTS }
}

// GET /api/client/notification-preferences
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = await getOrganizationByUserId(userId)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const prefs = withDefaults((org as { notificationPrefs?: unknown }).notificationPrefs)
    return NextResponse.json({ prefs })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/client/notification-preferences
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = await getOrganizationByUserId(userId)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await req.json()
    const { emailDropAlerts, emailOrderUpdates, smsOrderUpdates, emailWeeklyDigest } = body

    // Merge with current prefs so partial updates are safe
    const current = withDefaults((org as { notificationPrefs?: unknown }).notificationPrefs)
    const updated: NotificationPrefs = {
      emailDropAlerts:   typeof emailDropAlerts   === 'boolean' ? emailDropAlerts   : current.emailDropAlerts,
      emailOrderUpdates: typeof emailOrderUpdates === 'boolean' ? emailOrderUpdates : current.emailOrderUpdates,
      smsOrderUpdates:   typeof smsOrderUpdates   === 'boolean' ? smsOrderUpdates   : current.smsOrderUpdates,
      emailWeeklyDigest: typeof emailWeeklyDigest === 'boolean' ? emailWeeklyDigest : current.emailWeeklyDigest,
    }

    // Cast to `any` to satisfy Prisma's NullableJsonNullValueInput union —
    // our shape is valid JSON, Prisma just needs the extra coercion.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.organization.update({
      where: { id: org.id },
      data: { notificationPrefs: updated as any },
    })

    return NextResponse.json({ prefs: updated })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
