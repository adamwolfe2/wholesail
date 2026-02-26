'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MessageSquare, Plus, Trash2, X } from 'lucide-react'

interface Note {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string }
}

export function ClientNotes({
  organizationId,
  initialNotes,
  currentUserId,
  currentUserRole,
}: {
  organizationId: string
  initialNotes: Note[]
  currentUserId: string
  currentUserRole: string
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'OPS'

  async function addNote() {
    if (!draft.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setNotes((prev) => [data.note, ...prev])
        setDraft('')
        setAdding(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(noteId: string) {
    setDeletingId(noteId)
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Rep Notes ({notes.length})
        </CardTitle>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
            <Textarea
              placeholder="Write a note about this client..."
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setAdding(false); setDraft('') }}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={addNote} disabled={saving || !draft.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Note
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground py-2">
            No notes yet. Add context, call summaries, or follow-up reminders for this client.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-3 text-sm space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-wrap flex-1">{note.content}</p>
                  {(isAdmin || note.author.id === currentUserId) && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      disabled={deletingId === note.id}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      title="Delete note"
                    >
                      {deletingId === note.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {note.author.name} &middot; {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
