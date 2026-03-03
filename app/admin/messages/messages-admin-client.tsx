'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Send, Search, Loader2, ArrowLeft, MessageSquare, CheckCircle, XCircle, ArrowDown, AlertTriangle, Plus, Wand2, CheckCheck } from 'lucide-react'
import type { ConversationRow } from './page'

const THREAD_POLL_MS = 5000   // re-fetch active thread every 5s
const LIST_POLL_MS  = 15000  // re-fetch conversation list every 15s

interface Message {
  id: string
  senderName: string
  senderRole: string
  content: string
  createdAt: string
  readAt?: string | null
}

interface FullConversation {
  id: string
  subject: string
  isOpen: boolean
  repClaimedAt?: string | null
  organization: { name: string; id: string }
  messages: Message[]
}

interface OrgOption {
  id: string
  name: string
  phone: string
  contactPerson: string
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Returns response time label + urgency level for a conversation
// "responded" if the last message is from staff, otherwise shows how long since last client message
function getResponseTime(c: ConversationRow): { label: string; level: 'green' | 'amber' | 'red' | 'none' } {
  if (!c.isOpen) return { label: '', level: 'none' }
  // We only have lastMessage content and time — if unreadCount > 0, there are unread client messages
  if (c.unreadCount === 0) return { label: 'Responded', level: 'green' }
  const now = Date.now()
  const lastAt = new Date(c.lastMessageAt).getTime()
  const diffMins = Math.floor((now - lastAt) / 60000)
  const diffHours = diffMins / 60
  let label = ''
  if (diffMins < 60) label = `${diffMins}m waiting`
  else label = `${Math.floor(diffHours)}h waiting`
  const level = diffHours >= 4 ? 'red' : diffHours >= 1 ? 'amber' : 'green'
  return { label, level }
}

function formatReadAt(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MessagesAdminClient({ conversations: initial }: { conversations: ConversationRow[] }) {
  const [convos, setConvos] = useState(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [thread, setThread] = useState<FullConversation | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [iMessageWarning, setIMessageWarning] = useState(false)
  const [mobileShowThread, setMobileShowThread] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  // New conversation dialog state
  const [showNewConvo, setShowNewConvo] = useState(false)
  const [orgs, setOrgs] = useState<OrgOption[]>([])
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [orgSearch, setOrgSearch] = useState('')
  const [newOrgId, setNewOrgId] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newConvoLoading, setNewConvoLoading] = useState(false)
  const [newConvoIMessageWarning, setNewConvoIMessageWarning] = useState(false)
  const [newConvoError, setNewConvoError] = useState<string | null>(null)

  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open')

  const totalUnread = convos.reduce((sum, c) => sum + c.unreadCount, 0)

  // True if scroll is near the bottom (within 80px)
  function isAtBottom() {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  function scrollToBottom() {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    setShowScrollBtn(false)
  }

  // Initial full load (shows spinner, resets thread)
  const loadThread = useCallback(async (id: string) => {
    setThreadLoading(true)
    setThread(null)
    lastMessageCountRef.current = 0
    try {
      const res = await fetch(`/api/admin/messages/${id}`)
      if (res.ok) {
        const data = await res.json()
        setThread(data.conversation)
        lastMessageCountRef.current = data.conversation.messages.length
        setConvos(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c))
      }
    } catch { /* silent */ }
    finally { setThreadLoading(false) }
  }, [])

  // Silent poll — no spinner, only appends new messages
  const pollThread = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`)
      if (!res.ok) return
      const data = await res.json()
      const incoming: FullConversation = data.conversation
      setThread(prev => {
        if (!prev) return incoming
        if (incoming.messages.length === lastMessageCountRef.current) return prev
        lastMessageCountRef.current = incoming.messages.length
        // Show scroll button if user has scrolled up and new messages arrived
        if (!isAtBottom()) setShowScrollBtn(true)
        return incoming
      })
      setConvos(prev => prev.map(c =>
        c.id === id
          ? { ...c, lastMessage: incoming.messages.at(-1)?.content ?? c.lastMessage, unreadCount: 0 }
          : c
      ))
    } catch { /* silent */ }
  }, [])

  // Poll conversation list — picks up new inbound conversations
  const pollList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (!res.ok) return
      const data = await res.json()
      setConvos(prev => {
        const updated: ConversationRow[] = data.conversations
        // Preserve unreadCount=0 for the open conversation (already marked read)
        return updated.map((c: ConversationRow) =>
          c.id === selectedId ? { ...c, unreadCount: 0 } : c
        )
      })
    } catch { /* silent */ }
  }, [selectedId])

  // Fetch orgs when dialog opens
  useEffect(() => {
    if (!showNewConvo) return
    if (orgs.length > 0) return // already loaded
    setOrgsLoading(true)
    fetch('/api/admin/orgs')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.orgs) setOrgs(data.orgs) })
      .catch(() => { /* silent */ })
      .finally(() => setOrgsLoading(false))
  }, [showNewConvo, orgs.length])

  // Load thread when selection changes
  useEffect(() => {
    if (!selectedId) return
    loadThread(selectedId)
  }, [selectedId, loadThread])

  // Poll active thread every 5s
  useEffect(() => {
    if (!selectedId) return
    const interval = setInterval(() => pollThread(selectedId), THREAD_POLL_MS)
    return () => clearInterval(interval)
  }, [selectedId, pollThread])

  // Poll conversation list every 15s
  useEffect(() => {
    const interval = setInterval(pollList, LIST_POLL_MS)
    return () => clearInterval(interval)
  }, [pollList])

  // Auto-scroll to bottom when thread first loads or when already at bottom
  useEffect(() => {
    if (thread && scrollRef.current) {
      const el = scrollRef.current
      // On initial load always scroll to bottom; on updates only if near bottom
      if (!showScrollBtn) el.scrollTop = el.scrollHeight
    }
  }, [thread, showScrollBtn])

  async function sendReply() {
    if (!newMessage.trim() || !selectedId || sendLoading) return
    const content = newMessage.trim()
    setNewMessage('')
    setSendLoading(true)

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      senderName: 'Wholesail Team',
      senderRole: 'staff',
      content,
      createdAt: new Date().toISOString(),
    }
    setThread(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev)

    try {
      const res = await fetch(`/api/admin/messages/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        setThread(prev => prev
          ? { ...prev, messages: prev.messages.map(m => m.id === optimistic.id ? data.message : m) }
          : prev
        )
        setConvos(prev => prev.map(c =>
          c.id === selectedId ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() } : c
        ))
        if (data.iMessageStatus === 'failed') {
          setIMessageWarning(true)
          setTimeout(() => setIMessageWarning(false), 6000)
        }
      }
    } catch { /* keep optimistic */ }
    finally { setSendLoading(false) }
  }

  async function toggleOpen(isOpen: boolean) {
    if (!selectedId) return
    try {
      await fetch(`/api/admin/messages/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen }),
      })
      setThread(prev => prev ? { ...prev, isOpen } : prev)
      setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, isOpen } : c))
    } catch { /* silent */ }
  }

  async function handleReleaseToAI() {
    if (!selectedId) return
    try {
      await fetch(`/api/admin/messages/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repClaimedAt: null }),
      })
      setThread(prev => prev ? { ...prev, repClaimedAt: null } : prev)
      setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, repClaimedAt: null } : c))
    } catch { /* silent */ }
  }

  async function markAllRead() {
    if (markingAllRead) return
    setMarkingAllRead(true)
    try {
      // Open each unread conversation to mark client messages as read
      const unreadConvos = convos.filter(c => c.unreadCount > 0)
      await Promise.all(
        unreadConvos.map(c =>
          fetch(`/api/admin/messages/${c.id}`, { method: 'GET' }).catch(() => {})
        )
      )
      setConvos(prev => prev.map(c => ({ ...c, unreadCount: 0 })))
    } catch { /* silent */ }
    finally { setMarkingAllRead(false) }
  }

  async function suggestReply() {
    if (!selectedId || suggestLoading) return
    setSuggestLoading(true)
    setShowSuggestions(false)
    try {
      const res = await fetch(`/api/admin/messages/${selectedId}/suggest-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.replies) && data.replies.length > 0) {
          setSuggestedReplies(data.replies)
          setShowSuggestions(true)
        }
      }
    } catch { /* silent */ }
    finally { setSuggestLoading(false) }
  }

  function applySuggestion(reply: string) {
    setNewMessage(reply)
    setShowSuggestions(false)
    setSuggestedReplies([])
  }

  async function submitNewConvo() {
    if (!newOrgId || !newSubject.trim() || !newBody.trim() || newConvoLoading) return
    setNewConvoLoading(true)
    setNewConvoIMessageWarning(false)

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: newOrgId,
          subject: newSubject.trim(),
          message: newBody.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newConvoRow: ConversationRow = {
          id: data.conversation.id,
          subject: data.conversation.subject,
          isOpen: data.conversation.isOpen,
          orgId: data.conversation.organization.id,
          orgName: data.conversation.organization.name,
          lastMessage: newBody.trim(),
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
        }

        // Reload convo list and auto-select the new one
        const listRes = await fetch('/api/admin/messages')
        if (listRes.ok) {
          const listData = await listRes.json()
          setConvos(listData.conversations)
        } else {
          setConvos(prev => [newConvoRow, ...prev])
        }

        if (data.iMessageStatus === 'failed') {
          setNewConvoIMessageWarning(true)
        } else {
          // Close modal only on success or not_configured
          setShowNewConvo(false)
          resetNewConvoForm()
        }

        // Auto-select the new conversation
        setSelectedId(data.conversation.id)
        setMobileShowThread(true)

        // If iMessage warning, close the dialog after a short pause to let user see it
        if (data.iMessageStatus === 'failed') {
          setTimeout(() => {
            setShowNewConvo(false)
            resetNewConvoForm()
          }, 4000)
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        setNewConvoError(errData.error || 'Failed to create conversation — please try again')
      }
    } catch {
      setNewConvoError('Network error — please try again')
    } finally {
      setNewConvoLoading(false)
    }
  }

  function resetNewConvoForm() {
    setNewOrgId('')
    setNewSubject('')
    setNewBody('')
    setOrgSearch('')
    setNewConvoIMessageWarning(false)
    setNewConvoError(null)
  }

  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    o.phone.includes(orgSearch) ||
    o.contactPerson.toLowerCase().includes(orgSearch.toLowerCase())
  )

  const filtered = convos.filter(c => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' ? c.isOpen : !c.isOpen)
    const matchesSearch =
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orgName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Messages</h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">Client communications inbox</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <Badge className="bg-[#0A0A0A] text-[#F9F7F4]">{totalUnread} unread</Badge>
          )}
          {totalUnread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={markingAllRead}
              className="border-[#E5E1DB] text-[#0A0A0A]/70 hover:text-[#0A0A0A] text-xs gap-1.5"
            >
              {markingAllRead
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCheck className="h-3.5 w-3.5" />
              }
              Mark All Read
            </Button>
          )}
          <Button
            onClick={() => setShowNewConvo(true)}
            className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 gap-1.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvo} onOpenChange={(open) => {
        setShowNewConvo(open)
        if (!open) resetNewConvoForm()
      }}>
        <DialogContent className="sm:max-w-lg bg-[#F9F7F4] border-[#E5E1DB]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#0A0A0A]">New Conversation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Org picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0A0A0A]">Client</Label>
              {orgsLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-[#C8C0B4]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading clients...
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/40" />
                    <Input
                      placeholder="Search by name, phone, or contact..."
                      value={orgSearch}
                      onChange={e => setOrgSearch(e.target.value)}
                      className="pl-8 h-9 text-sm border-[#C8C0B4]"
                    />
                  </div>
                  <div className="border border-[#E5E1DB] max-h-40 overflow-y-auto">
                    {filteredOrgs.length === 0 ? (
                      <p className="text-sm text-[#C8C0B4] px-3 py-4 text-center">
                        {orgs.length === 0 ? 'No clients with a phone number found' : 'No matching clients'}
                      </p>
                    ) : (
                      filteredOrgs.map(org => (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => setNewOrgId(org.id)}
                          className={cn(
                            'w-full text-left px-3 py-2.5 text-sm border-b border-[#E5E1DB] last:border-b-0 transition-colors',
                            newOrgId === org.id
                              ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                              : 'hover:bg-[#0A0A0A]/[0.04] text-[#0A0A0A]'
                          )}
                        >
                          <span className="font-medium">{org.name}</span>
                          <span className={cn(
                            'ml-2 text-xs',
                            newOrgId === org.id ? 'text-[#F9F7F4]/60' : 'text-[#C8C0B4]'
                          )}>
                            {org.phone}
                          </span>
                          {org.contactPerson && (
                            <span className={cn(
                              'block text-xs mt-0.5',
                              newOrgId === org.id ? 'text-[#F9F7F4]/50' : 'text-[#0A0A0A]/40'
                            )}>
                              {org.contactPerson}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="new-subject" className="text-sm font-medium text-[#0A0A0A]">Subject</Label>
              <Input
                id="new-subject"
                placeholder="e.g. New product availability"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="border-[#C8C0B4]"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="new-body" className="text-sm font-medium text-[#0A0A0A]">Message</Label>
              <Textarea
                id="new-body"
                placeholder="Type your message to the client..."
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                rows={4}
                className="border-[#C8C0B4] resize-none"
              />
            </div>

            {/* iMessage warning */}
            {newConvoIMessageWarning && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Conversation saved, but iMessage delivery failed — check Bloo.io device status
              </div>
            )}

            {/* Submit error */}
            {newConvoError && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {newConvoError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowNewConvo(false); resetNewConvoForm() }}
              disabled={newConvoLoading}
              className="border-[#E5E1DB]"
            >
              Cancel
            </Button>
            <Button
              onClick={submitNewConvo}
              disabled={!newOrgId || !newSubject.trim() || !newBody.trim() || newConvoLoading}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
            >
              {newConvoLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send Message</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden border-[#E5E1DB]">
        <div className="flex" style={{ height: 'calc(100svh - 220px)', minHeight: '500px', maxHeight: '800px' }}>

          {/* Conversation list */}
          <div className={cn(
            'w-full sm:w-80 border-r border-[#E5E1DB] flex flex-col bg-[#F9F7F4]',
            mobileShowThread && 'hidden sm:flex'
          )}>
            <div className="border-b border-[#E5E1DB]">
              {/* Status filter tabs */}
              <div className="flex">
                {(['open', 'all', 'closed'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      'flex-1 py-2 text-[10px] uppercase tracking-widest font-medium border-b-2 transition-colors',
                      statusFilter === f
                        ? 'border-[#0A0A0A] text-[#0A0A0A]'
                        : 'border-transparent text-[#0A0A0A]/40 hover:text-[#0A0A0A]/70'
                    )}
                  >
                    {f === 'open' && convos.filter(c => c.isOpen).length > 0
                      ? `Open (${convos.filter(c => c.isOpen).length})`
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/40" />
                  <Input
                    placeholder="Search by client or subject..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm border-[#C8C0B4]"
                  />
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <MessageSquare className="h-8 w-8 text-[#C8C0B4] mb-3" />
                  <p className="text-sm text-[#0A0A0A]/50 mb-3">
                    {searchQuery ? 'No matching conversations' : 'No client messages yet'}
                  </p>
                  {!searchQuery && (
                    <button
                      type="button"
                      onClick={() => setShowNewConvo(true)}
                      className="text-xs text-[#0A0A0A]/60 underline underline-offset-2 hover:text-[#0A0A0A] transition-colors"
                    >
                      Start your first conversation &rarr;
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(c => {
                  const rt = getResponseTime(c)
                  return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setMobileShowThread(true) }}
                    className={cn(
                      'w-full text-left px-4 py-3.5 border-b border-[#E5E1DB] transition-colors',
                      selectedId === c.id
                        ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                        : 'hover:bg-[#F9F7F4]/80 text-[#0A0A0A]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h4 className={cn(
                        'text-sm font-semibold line-clamp-1',
                        selectedId === c.id ? 'text-[#F9F7F4]' : 'text-[#0A0A0A]'
                      )}>
                        {c.subject}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {c.repClaimedAt && new Date(c.repClaimedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                          <span className="text-[9px] tracking-widest uppercase bg-foreground text-background px-1.5 py-0.5">
                            REP
                          </span>
                        )}
                        {c.unreadCount > 0 && (
                          <span className={cn(
                            'h-5 min-w-[20px] rounded-full px-1.5 text-[10px] font-bold flex items-center justify-center',
                            selectedId === c.id ? 'bg-[#F9F7F4] text-[#0A0A0A]' : 'bg-[#0A0A0A] text-[#F9F7F4]'
                          )}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={cn(
                      'text-xs mb-1',
                      selectedId === c.id ? 'text-[#F9F7F4]/70' : 'text-[#0A0A0A]/50'
                    )}>
                      {c.orgName}
                    </p>
                    <p className={cn(
                      'text-xs line-clamp-1',
                      selectedId === c.id ? 'text-[#F9F7F4]/60' : 'text-[#0A0A0A]/40'
                    )}>
                      {c.lastMessage || 'No messages'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'text-[10px]',
                        selectedId === c.id ? 'text-[#F9F7F4]/40' : 'text-[#0A0A0A]/30'
                      )}>
                        {formatTimestamp(c.lastMessageAt)}
                      </span>
                      {!c.isOpen && (
                        <span className={cn(
                          'text-[10px] uppercase tracking-wider',
                          selectedId === c.id ? 'text-[#F9F7F4]/40' : 'text-[#C8C0B4]'
                        )}>
                          Closed
                        </span>
                      )}
                      {rt.level !== 'none' && rt.label && selectedId !== c.id && (
                        <span className={cn(
                          'text-[10px] font-medium',
                          rt.level === 'red' ? 'text-red-500' : rt.level === 'amber' ? 'text-amber-500' : 'text-emerald-600'
                        )}>
                          {rt.label}
                        </span>
                      )}
                    </div>
                  </button>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Thread */}
          <div className={cn(
            'flex flex-col flex-1',
            !mobileShowThread && 'hidden sm:flex'
          )}>
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
                <MessageSquare className="h-10 w-10 text-[#C8C0B4] mb-4" />
                <p className="font-serif text-lg text-[#0A0A0A] mb-2">Select a conversation</p>
                <p className="text-sm text-[#C8C0B4]">Choose a conversation to reply to the client.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#E5E1DB] flex items-center gap-3 bg-white">
                  <Button
                    variant="ghost" size="icon"
                    className="sm:hidden h-8 w-8"
                    onClick={() => setMobileShowThread(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{thread?.subject ?? ''}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread?.organization.name ?? ''}
                    </p>
                  </div>
                  {thread?.repClaimedAt && new Date(thread.repClaimedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <span className="text-amber-600 font-medium">AI paused — you&apos;re in control</span>
                      <button
                        type="button"
                        onClick={handleReleaseToAI}
                        className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Release to AI
                      </button>
                    </div>
                  )}
                  {thread && (
                    <Button
                      variant="outline" size="sm"
                      className="shrink-0 text-xs h-8"
                      onClick={() => toggleOpen(!thread.isOpen)}
                    >
                      {thread.isOpen
                        ? <><XCircle className="h-3.5 w-3.5 mr-1" />Close</>
                        : <><CheckCircle className="h-3.5 w-3.5 mr-1" />Reopen</>
                      }
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-5 bg-[#F9F7F4] relative"
                  onScroll={() => {
                    if (isAtBottom()) setShowScrollBtn(false)
                  }}
                >
                  {threadLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin text-[#C8C0B4]" />
                    </div>
                  ) : !thread?.messages?.length ? (
                    <div className="flex items-center justify-center h-full text-sm text-[#C8C0B4]">
                      No messages
                    </div>
                  ) : (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      {thread.messages.map(msg => {
                        const isStaff = msg.senderRole === 'staff'
                        const isSystem = msg.senderRole === 'system'
                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center">
                              <p className="text-[10px] text-[#0A0A0A]/40 bg-[#C8C0B4]/20 px-3 py-1.5 uppercase tracking-wider">
                                {msg.content}
                              </p>
                            </div>
                          )
                        }
                        return (
                          <div key={msg.id} className={cn('flex flex-col', isStaff ? 'items-end' : 'items-start')}>
                            <div className={cn('flex items-center gap-2 mb-1.5', isStaff ? 'flex-row-reverse' : 'flex-row')}>
                              <div className={cn(
                                'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                                isStaff ? 'bg-[#0A0A0A] text-[#F9F7F4]' : 'bg-[#C8C0B4] text-[#0A0A0A]'
                              )}>
                                {msg.senderName.charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-[#0A0A0A]/60">{msg.senderName}</span>
                              <span className="text-[10px] uppercase tracking-wider text-[#C8C0B4]">
                                {formatTimestamp(msg.createdAt)}
                              </span>
                            </div>
                            <div className={cn(
                              'max-w-[80%] px-4 py-2.5 text-sm leading-relaxed',
                              isStaff
                                ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                                : 'bg-[#C8C0B4]/20 text-[#0A0A0A] border border-[#C8C0B4]/40'
                            )}>
                              {msg.content}
                            </div>
                            {/* Read receipt: show under staff messages that the client has read */}
                            {isStaff && msg.readAt && (
                              <span className="flex items-center gap-1 text-[10px] text-[#C8C0B4] mt-0.5 mr-0.5">
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                                Read {formatReadAt(msg.readAt)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Scroll-to-bottom button */}
                {showScrollBtn && (
                  <div className="sticky bottom-4 flex justify-center pointer-events-none">
                    <Button
                      size="sm"
                      onClick={scrollToBottom}
                      className="pointer-events-auto bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 shadow-lg gap-1.5 text-xs"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      New message
                    </Button>
                  </div>
                )}

                {/* iMessage delivery warning */}
                {iMessageWarning && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Message saved but iMessage delivery failed — check Bloo.io device status
                  </div>
                )}

                {/* Compose */}
                {thread?.isOpen !== false && (
                  <div className="border-t border-[#E5E1DB] p-3 sm:p-4 bg-white">
                    {/* AI suggestions dropdown */}
                    {showSuggestions && suggestedReplies.length > 0 && (
                      <div className="max-w-2xl mx-auto mb-2 border border-[#E5E1DB] bg-[#F9F7F4]">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E5E1DB]">
                          <span className="text-[10px] uppercase tracking-widest text-[#C8C0B4] font-medium">AI Reply Suggestions</span>
                          <button
                            type="button"
                            onClick={() => { setShowSuggestions(false); setSuggestedReplies([]) }}
                            className="text-[#C8C0B4] hover:text-[#0A0A0A] text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        {suggestedReplies.map((reply, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => applySuggestion(reply)}
                            className="w-full text-left px-3 py-2.5 text-sm text-[#0A0A0A] border-b border-[#E5E1DB] last:border-b-0 hover:bg-[#0A0A0A]/[0.04] transition-colors"
                          >
                            <span className="text-[10px] uppercase tracking-wider text-[#C8C0B4] mr-2">
                              {i === 0 ? 'Concise' : i === 1 ? 'Warm' : 'Direct'}
                            </span>
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 max-w-2xl mx-auto">
                      <Input
                        placeholder="Reply to client..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[44px]"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                            e.preventDefault()
                            sendReply()
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        title="AI reply suggestions"
                        className="shrink-0 border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#F9F7F4] min-h-[44px] min-w-[44px]"
                        disabled={suggestLoading}
                        onClick={suggestReply}
                      >
                        {suggestLoading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Wand2 className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        size="icon"
                        className="shrink-0 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px] min-w-[44px]"
                        disabled={!newMessage.trim() || sendLoading}
                        onClick={sendReply}
                      >
                        {sendLoading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
