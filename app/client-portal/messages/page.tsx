'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Send, Search, Loader2, ArrowLeft, Plus, X, MessageSquare, ShieldCheck,
} from 'lucide-react'

const THREAD_POLL_MS = 15_000 // poll active thread every 15s
const LIST_POLL_MS  = 30_000 // poll conversation list every 30s

/* ─── Types ─────────────────────────────────────────────── */
interface ConvoSummary {
  id: string
  subject: string
  isOpen: boolean
  lastMessageAt: string
  lastMessage: string
  unreadCount: number
}

interface Message {
  id: string
  senderName: string
  senderRole: string // "client" | "staff" | "system"
  content: string
  createdAt: string
  readAt: string | null
}

interface FullConversation {
  id: string
  subject: string
  isOpen: boolean
  repClaimedAt?: string | null
  messages: Message[]
}

/* ─── Helpers ───────────────────────────────────────────── */
function formatTimestamp(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

/* ─── Page ──────────────────────────────────────────────── */
export default function MessagesPage() {
  const { isLoaded, user } = useUser()

  const [convos, setConvos] = useState<ConvoSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [thread, setThread] = useState<FullConversation | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [mobileShowThread, setMobileShowThread] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showNewConvo, setShowNewConvo] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newConvoLoading, setNewConvoLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [newConvoError, setNewConvoError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  // Load conversation list
  const loadConvos = useCallback(async () => {
    try {
      const res = await fetch('/api/client/messages')
      if (!res.ok) return
      const data = await res.json()
      setConvos(data.conversations ?? [])
    } catch { /* silent */ }
    finally { setListLoading(false) }
  }, [])

  useEffect(() => { loadConvos() }, [loadConvos])

  // Silent poll — conversation list
  const pollList = useCallback(async () => {
    try {
      const res = await fetch('/api/client/messages')
      if (!res.ok) return
      const data = await res.json()
      setConvos(prev => {
        const updated: ConvoSummary[] = data.conversations ?? []
        // Keep unreadCount=0 for the currently open conversation
        return updated.map(c => c.id === selectedId ? { ...c, unreadCount: 0 } : c)
      })
    } catch { /* silent */ }
  }, [selectedId])

  // Silent poll — active thread
  const pollThread = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/client/messages/${id}`)
      if (!res.ok) return
      const data = await res.json()
      const incoming: FullConversation = data.conversation
      setThread(prev => {
        if (!prev) return incoming
        if (incoming.messages.length === lastMessageCountRef.current) return prev
        lastMessageCountRef.current = incoming.messages.length
        return incoming
      })
    } catch { /* silent */ }
  }, [])

  // Scroll to bottom when thread loads or new messages arrive
  useEffect(() => {
    if (thread && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thread])

  // Load thread when selection changes
  useEffect(() => {
    if (!selectedId) return
    setThreadLoading(true)
    setThread(null)
    lastMessageCountRef.current = 0

    fetch(`/api/client/messages/${selectedId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.conversation) {
          setThread(data.conversation)
          lastMessageCountRef.current = data.conversation.messages.length
          // Mark as read locally
          setConvos(prev =>
            prev.map(c => c.id === selectedId ? { ...c, unreadCount: 0 } : c)
          )
          // Mark staff messages as read via dedicated endpoint
          fetch(`/api/client/conversations/${selectedId}/read`, { method: 'PATCH' }).catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => setThreadLoading(false))
  }, [selectedId])

  // Poll active thread every 15s
  useEffect(() => {
    if (!selectedId) return
    const interval = setInterval(() => pollThread(selectedId), THREAD_POLL_MS)
    return () => clearInterval(interval)
  }, [selectedId, pollThread])

  // Poll conversation list every 30s
  useEffect(() => {
    const interval = setInterval(pollList, LIST_POLL_MS)
    return () => clearInterval(interval)
  }, [pollList])

  const filteredConvos = convos.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = convos.reduce((sum, c) => sum + c.unreadCount, 0)

  async function sendMessage() {
    if (!newMessage.trim() || !selectedId || sendLoading) return
    const content = newMessage.trim()
    setSendError(null)
    setNewMessage('')
    setSendLoading(true)

    // Optimistically add to thread
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      senderName: user?.fullName ?? 'You',
      senderRole: 'client',
      content,
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    setThread(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev)

    try {
      const res = await fetch(`/api/client/messages/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        // Replace optimistic with real message
        setThread(prev =>
          prev
            ? { ...prev, messages: prev.messages.map(m => m.id === optimistic.id ? data.message : m) }
            : prev
        )
        lastMessageCountRef.current += 1
        // Update last message in list
        setConvos(prev =>
          prev.map(c => c.id === selectedId ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() } : c)
        )
      } else {
        // Revert optimistic message and restore input
        setThread(prev =>
          prev ? { ...prev, messages: prev.messages.filter(m => m.id !== optimistic.id) } : prev
        )
        setNewMessage(content)
        const data = await res.json().catch(() => ({}))
        setSendError(data.error ?? `Failed to send (${res.status})`)
      }
    } catch {
      // Network error — revert optimistic
      setThread(prev =>
        prev ? { ...prev, messages: prev.messages.filter(m => m.id !== optimistic.id) } : prev
      )
      setNewMessage(content)
      setSendError('Network error. Check your connection and try again.')
    } finally {
      setSendLoading(false)
    }
  }

  async function createConversation() {
    if (!newSubject.trim() || !newBody.trim() || newConvoLoading) return
    setNewConvoError(null)
    setNewConvoLoading(true)
    try {
      const res = await fetch('/api/client/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject.trim(), message: newBody.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowNewConvo(false)
        setNewSubject('')
        setNewBody('')
        await loadConvos()
        setSelectedId(data.conversation.id)
        setMobileShowThread(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setNewConvoError(data.error ?? `Failed to send (${res.status})`)
      }
    } catch {
      setNewConvoError('Network error. Check your connection and try again.')
    } finally {
      setNewConvoLoading(false)
    }
  }

  // Determine if repClaimedAt is active (within last 24h)
  const repIsActive = thread?.repClaimedAt
    ? new Date(thread.repClaimedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    : false

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8C0B4]" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Messages</h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">Communicate with your account team</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {totalUnread > 0 && (
              <Badge className="bg-[#0A0A0A] text-[#F9F7F4] shrink-0">
                {totalUnread} unread
              </Badge>
            )}
            <Button
              size="sm"
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 shrink-0"
              onClick={() => setShowNewConvo(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* New conversation modal */}
        {showNewConvo && (
          <Card className="border-[#C8C0B4] bg-[#F9F7F4] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">New Conversation</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
                onClick={() => { setShowNewConvo(false); setNewSubject(''); setNewBody(''); setNewConvoError(null) }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Subject"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="bg-[#F9F7F4] border-[#C8C0B4] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus-visible:ring-[#0A0A0A]"
            />
            <Textarea
              placeholder="Write your message..."
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              rows={3}
              className="bg-[#F9F7F4] border-[#C8C0B4] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus-visible:ring-[#0A0A0A] resize-none"
            />
            {newConvoError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                {newConvoError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#C8C0B4]"
                onClick={() => { setShowNewConvo(false); setNewSubject(''); setNewBody(''); setNewConvoError(null) }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80"
                disabled={!newSubject.trim() || !newBody.trim() || newConvoLoading}
                onClick={createConversation}
              >
                {newConvoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden border-[#C8C0B4] bg-[#F9F7F4]">
          <div className="flex" style={{ height: 'calc(100svh - 280px)', minHeight: '500px', maxHeight: '720px' }}>

            {/* ─── Conversation List ─────────────── */}
            <div className={cn(
              'w-full sm:w-72 lg:w-80 border-r border-[#C8C0B4] flex flex-col bg-[#F9F7F4]',
              mobileShowThread && 'hidden sm:flex'
            )}>
              <div className="p-3 border-b border-[#C8C0B4]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0A0A0A]/40" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 bg-[#F9F7F4] border-[#C8C0B4] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus-visible:ring-[#0A0A0A] text-sm"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {listLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-[#C8C0B4]" />
                  </div>
                ) : filteredConvos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <MessageSquare className="h-8 w-8 text-[#C8C0B4] mb-3" />
                    <p className="font-serif text-base text-[#0A0A0A] mb-1">
                      {searchQuery ? 'No results' : 'No messages yet'}
                    </p>
                    <p className="text-xs text-[#C8C0B4] leading-relaxed">
                      {searchQuery
                        ? 'Try a different search term.'
                        : 'Start a conversation with your account team using the New button above.'}
                    </p>
                  </div>
                ) : (
                  filteredConvos.map(convo => (
                    <button
                      key={convo.id}
                      onClick={() => { setSelectedId(convo.id); setMobileShowThread(true); setSendError(null) }}
                      className={cn(
                        'w-full text-left px-4 py-3.5 border-b border-[#C8C0B4]/50 transition-colors',
                        selectedId === convo.id
                          ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                          : convo.unreadCount > 0
                            ? 'hover:bg-[#C8C0B4]/20 bg-[#F9F7F4]'
                            : 'hover:bg-[#C8C0B4]/15 text-[#0A0A0A]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn(
                          'text-sm leading-tight line-clamp-1',
                          convo.unreadCount > 0 ? 'font-bold' : 'font-semibold',
                          selectedId === convo.id ? 'text-[#F9F7F4]' : 'text-[#0A0A0A]'
                        )}>
                          {convo.subject}
                        </h4>
                        {convo.unreadCount > 0 && (
                          <span className={cn(
                            'h-5 min-w-[20px] rounded-full px-1.5 text-[10px] font-bold shrink-0 flex items-center justify-center',
                            selectedId === convo.id
                              ? 'bg-[#F9F7F4] text-[#0A0A0A]'
                              : 'bg-[#0A0A0A] text-[#F9F7F4]'
                          )}>
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-xs line-clamp-1 mb-1',
                        selectedId === convo.id ? 'text-[#F9F7F4]/70' : 'text-[#0A0A0A]/50'
                      )}>
                        {convo.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className={cn(
                          'text-[10px]',
                          selectedId === convo.id ? 'text-[#F9F7F4]/50' : 'text-[#0A0A0A]/40'
                        )}>
                          {formatTimestamp(convo.lastMessageAt)}
                        </p>
                        {!convo.isOpen && (
                          <span className={cn(
                            'text-[10px] uppercase tracking-wider',
                            selectedId === convo.id ? 'text-[#F9F7F4]/40' : 'text-[#C8C0B4]'
                          )}>
                            · Closed
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* ─── Message Thread ────────────────── */}
            <div className={cn(
              'flex flex-col flex-1 bg-[#F9F7F4]',
              !mobileShowThread && 'hidden sm:flex'
            )}>
              {!selectedId ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
                  <MessageSquare className="h-10 w-10 text-[#C8C0B4] mb-4" />
                  <p className="font-serif text-lg text-[#0A0A0A] mb-2">Select a conversation</p>
                  <p className="text-sm text-[#C8C0B4]">
                    Choose a conversation on the left, or start a new one.
                  </p>
                </div>
              ) : (
                <>
                  {/* Thread Header */}
                  <div className="px-4 py-3 border-b border-[#C8C0B4] flex items-center gap-3 bg-[#F9F7F4]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden shrink-0 h-8 w-8 text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#C8C0B4]/20"
                      onClick={() => setMobileShowThread(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-[#0A0A0A] truncate">
                        {thread?.subject ?? convos.find(c => c.id === selectedId)?.subject ?? ''}
                      </h3>
                      <p className="text-xs text-[#0A0A0A]/50">Wholesail Account Team</p>
                    </div>
                    {thread && !thread.isOpen && (
                      <Badge variant="secondary" className="text-xs shrink-0">Closed</Badge>
                    )}
                  </div>

                  {/* Rep claimed banner */}
                  {repIsActive && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F4] border-b border-[#C8C0B4]/50 text-xs text-[#0A0A0A]/60">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0A0A0A]/50 shrink-0" />
                      Your dedicated rep is handling this conversation
                    </div>
                  )}

                  {/* Messages */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 py-5"
                  >
                    {threadLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin text-[#C8C0B4]" />
                      </div>
                    ) : !thread?.messages?.length ? (
                      <div className="flex items-center justify-center h-full text-sm text-[#C8C0B4]">
                        No messages yet
                      </div>
                    ) : (
                      <div className="space-y-5 max-w-2xl mx-auto">
                        {thread.messages.map(msg => {
                          const isClient = msg.senderRole === 'client'
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
                            <div key={msg.id} className={cn('flex flex-col', isClient ? 'items-end' : 'items-start')}>
                              <div className={cn('flex items-center gap-2 mb-1.5', isClient ? 'flex-row-reverse' : 'flex-row')}>
                                <div className={cn(
                                  'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                                  isClient ? 'bg-[#0A0A0A] text-[#F9F7F4]' : 'bg-[#C8C0B4] text-[#0A0A0A]'
                                )}>
                                  {msg.senderName.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-[#0A0A0A]/60">{msg.senderName}</span>
                                <span className="text-[10px] tracking-wide uppercase text-[#C8C0B4]">
                                  {formatTimestamp(msg.createdAt)}
                                </span>
                              </div>
                              <div className={cn(
                                'max-w-[82%] sm:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed',
                                isClient
                                  ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                                  : 'bg-white text-[#0A0A0A] border border-[#E5E1DB]'
                              )}>
                                {msg.content}
                              </div>
                              {/* Read receipt: show under client messages that staff has read */}
                              {isClient && msg.readAt && (
                                <span className="text-[10px] text-[#C8C0B4] mt-0.5 mr-0.5">
                                  Read {formatReadAt(msg.readAt)}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Compose */}
                  {thread?.isOpen !== false && (
                    <div className="border-t border-[#C8C0B4] p-3 sm:p-4 bg-[#F9F7F4]">
                      {sendError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 mb-2 max-w-2xl mx-auto">
                          {sendError}
                        </p>
                      )}
                      <div className="flex gap-2 max-w-2xl mx-auto items-end">
                        <Textarea
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={e => { setNewMessage(e.target.value); if (sendError) setSendError(null) }}
                          rows={1}
                          className="flex-1 bg-[#F9F7F4] border-[#C8C0B4] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus-visible:ring-[#0A0A0A] resize-none min-h-[44px] max-h-[120px]"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="shrink-0 bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px] min-w-[44px]"
                          disabled={!newMessage.trim() || sendLoading}
                          onClick={sendMessage}
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
    </PortalLayout>
  )
}
