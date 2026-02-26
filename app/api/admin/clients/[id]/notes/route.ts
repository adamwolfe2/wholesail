import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// GET /api/admin/clients/[id]/notes
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  const { id } = await params
  const notes = await prisma.clientNote.findMany({
    where: { organizationId: id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ notes })
}

// POST /api/admin/clients/[id]/notes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ content: z.string().min(1) }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
  }

  const note = await prisma.clientNote.create({
    data: {
      organizationId: id,
      authorId: userId,
      content: parsed.data.content.trim(),
    },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ note }, { status: 201 })
}

// DELETE /api/admin/clients/[id]/notes?noteId=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdminOrRep()
  if (error) return error

  const { id } = await params
  const noteId = new URL(req.url).searchParams.get('noteId')
  if (!noteId) {
    return NextResponse.json({ error: 'noteId is required' }, { status: 400 })
  }

  const note = await prisma.clientNote.findUnique({
    where: { id: noteId },
    select: { authorId: true, organizationId: true },
  })

  if (!note || note.organizationId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only the author or an admin can delete notes — we allow any admin/rep here
  // since requireAdminOrRep already guards the route
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OPS'
  if (!isAdmin && note.authorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.clientNote.delete({ where: { id: noteId } })
  return NextResponse.json({ success: true })
}
