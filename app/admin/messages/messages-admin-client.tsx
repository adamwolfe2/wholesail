'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, CheckCheck } from 'lucide-react'
import { BRAND_TEAM } from '@/lib/brand'
import type { ConversationRow } from './page'
import { THREAD_POLL_MS, LIST_POLL_MS } from './message-utils'
import type { Message, FullConversation, OrgOption } from './message-utils'
import { MessageList } from './message-list'
import { MessageThread } from './message-thread'
import { NewConversationDialog } from './new-conversation-dialog'

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
      senderName: BRAND_TEAM,
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
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">Messages</h2>
          <p className="text-sm text-ink/50 mt-1">Client communications inbox</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <Badge className="bg-ink text-cream">{totalUnread} unread</Badge>
          )}
          {totalUnread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={markingAllRead}
              className="border-shell text-ink/70 hover:text-ink text-xs gap-1.5"
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
            className="bg-ink text-cream hover:bg-ink/80 gap-1.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      <NewConversationDialog
        open={showNewConvo}
        onOpenChange={(open) => {
          setShowNewConvo(open)
          if (!open) resetNewConvoForm()
        }}
        orgsLoading={orgsLoading}
        filteredOrgs={filteredOrgs}
        orgs={orgs}
        orgSearch={orgSearch}
        onOrgSearchChange={setOrgSearch}
        newOrgId={newOrgId}
        onOrgSelect={setNewOrgId}
        newSubject={newSubject}
        onSubjectChange={setNewSubject}
        newBody={newBody}
        onBodyChange={setNewBody}
        newConvoLoading={newConvoLoading}
        newConvoIMessageWarning={newConvoIMessageWarning}
        newConvoError={newConvoError}
        onSubmit={submitNewConvo}
        onCancel={() => { setShowNewConvo(false); resetNewConvoForm() }}
      />

      <Card className="overflow-hidden border-shell">
        <div className="flex" style={{ height: 'calc(100svh - 220px)', minHeight: '500px', maxHeight: '800px' }}>
          <MessageList
            conversations={filtered}
            allConversations={convos}
            selectedId={selectedId}
            mobileShowThread={mobileShowThread}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onSelectConversation={(id) => { setSelectedId(id); setMobileShowThread(true) }}
            onStartNewConversation={() => setShowNewConvo(true)}
          />

          <MessageThread
            selectedId={selectedId}
            thread={thread}
            threadLoading={threadLoading}
            mobileShowThread={mobileShowThread}
            onMobileBack={() => setMobileShowThread(false)}
            onToggleOpen={toggleOpen}
            onReleaseToAI={handleReleaseToAI}
            scrollRef={scrollRef}
            showScrollBtn={showScrollBtn}
            onScroll={() => { if (isAtBottom()) setShowScrollBtn(false) }}
            onScrollToBottom={scrollToBottom}
            iMessageWarning={iMessageWarning}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            sendLoading={sendLoading}
            suggestLoading={suggestLoading}
            showSuggestions={showSuggestions}
            suggestedReplies={suggestedReplies}
            onSend={sendReply}
            onSuggest={suggestReply}
            onApplySuggestion={applySuggestion}
            onDismissSuggestions={() => { setShowSuggestions(false); setSuggestedReplies([]) }}
          />
        </div>
      </Card>
    </div>
  )
}
