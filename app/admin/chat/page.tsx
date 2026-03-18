'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  Send, Loader2, Bot, User, RotateCcw, Sparkles,
  ChevronRight, ChevronDown, Check, History, X, MessageSquare, Trash2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolCallRecord {
  tool: string
  label: string
}

interface ActiveToolCall extends ToolCallRecord {
  id: string
  done: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallRecord[]
}

interface ChatSession {
  id: string
  title: string
  createdAt: number
  messages: ChatMessage[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSIONS_KEY = 'wholesail-chat-sessions-v2'
const MAX_SESSIONS = 30

const SUGGESTED_PROMPTS = [
  { label: 'What needs my attention right now?', category: 'daily' },
  { label: 'Who owes me money?', category: 'daily' },
  { label: "What's low on stock?", category: 'daily' },
  { label: 'Are there any pending partner applications?', category: 'daily' },
  { label: 'Any orders stuck waiting on step 1?', category: 'daily' },
  { label: 'How did we do this month vs last month?', category: 'insights' },
  { label: "Who hasn't ordered in the last 30 days?", category: 'insights' },
  { label: "What's selling best right now?", category: 'insights' },
  { label: 'Give me a full platform overview', category: 'insights' },
  { label: 'Who are my top clients by revenue?', category: 'insights' },
  { label: "What's our total outstanding invoices?", category: 'insights' },
  { label: 'Confirm all orders waiting on step 1', category: 'action' },
  { label: 'Send payment reminders for overdue invoices', category: 'action' },
  { label: 'Approve any pending wholesale applications', category: 'action' },
  { label: 'Which products have no distributor set up?', category: 'setup' },
  { label: 'Show me all my distributors', category: 'setup' },
  { label: 'Walk me through the order fulfillment workflow', category: 'learn' },
  { label: 'What can you actually do for me?', category: 'learn' },
]

const categoryColors: Record<string, string> = {
  daily:    'bg-amber-50 border-amber-200 text-amber-700',
  insights: 'bg-blue-50 border-blue-200 text-blue-700',
  action:   'bg-green-50 border-green-200 text-green-700',
  setup:    'bg-purple-50 border-purple-200 text-purple-700',
  learn:    'bg-[#F9F7F4] border-[#E5E1DB] text-[#0A0A0A]/50',
}

const categoryLabels: Record<string, string> = {
  daily:    'Today',
  insights: 'Insights',
  action:   'Action',
  setup:    'Setup',
  learn:    'Learn',
}

// ---------------------------------------------------------------------------
// Session storage helpers
// ---------------------------------------------------------------------------

function loadSessions(): ChatSession[] {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
  } catch { /* ignore */ }
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// ThinkingPanel
// ---------------------------------------------------------------------------

function ThinkingPanel({
  toolCalls, expanded, onToggle,
}: {
  toolCalls: ActiveToolCall[]
  expanded: boolean
  onToggle: () => void
}) {
  const doneCount = toolCalls.filter(tc => tc.done).length
  const total = toolCalls.length

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-[#E5E1DB] bg-[#F9F7F4] text-[#0A0A0A]">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 pt-0.5">
        {total === 0 ? (
          <div className="flex items-center gap-1.5 h-7">
            <span className="w-1.5 h-1.5 bg-[#0A0A0A]/25 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-[#0A0A0A]/25 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-[#0A0A0A]/25 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <>
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/35 hover:text-[#0A0A0A]/55 transition-colors mb-2"
            >
              <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              <span>
                {doneCount < total
                  ? `Querying ${doneCount === 0 ? '' : `${doneCount}/`}${total} source${total !== 1 ? 's' : ''}…`
                  : `Reviewed ${total} source${total !== 1 ? 's' : ''}`}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && (
              <div className="space-y-1.5 pl-0.5 mb-1">
                {toolCalls.map((tc) => (
                  <div key={tc.id} className="flex items-center gap-2 text-xs">
                    {tc.done
                      ? <Check className="h-3 w-3 text-[#0A0A0A]/20 shrink-0" />
                      : <Loader2 className="h-3 w-3 animate-spin text-[#0A0A0A]/30 shrink-0" />}
                    <span className={tc.done ? 'text-[#0A0A0A]/25' : 'text-[#0A0A0A]/45'}>{tc.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const hasCalls = !isUser && message.toolCalls && message.toolCalls.length > 0

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-7 h-7 flex items-center justify-center border ${
          isUser
            ? 'bg-[#0A0A0A] border-[#0A0A0A] text-[#F9F7F4]'
            : 'bg-[#F9F7F4] border-[#E5E1DB] text-[#0A0A0A]'
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {hasCalls && (
          <div className="mb-1.5 w-full">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/25 hover:text-[#0A0A0A]/45 transition-colors"
            >
              <span>Reviewed {message.toolCalls!.length} source{message.toolCalls!.length !== 1 ? 's' : ''}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${toolsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {toolsExpanded && (
              <div className="mt-1.5 space-y-1 pl-0.5">
                {message.toolCalls!.map((tc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#0A0A0A]/25">
                    <Check className="h-3 w-3 shrink-0" />
                    {tc.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-[#0A0A0A] text-[#F9F7F4]'
              : 'bg-white border border-[#E5E1DB] text-[#0A0A0A]'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#0A0A0A] prose-strong:font-semibold">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    const isInternal = href?.startsWith('/')
                    if (isInternal) {
                      return (
                        <Link
                          href={href ?? '#'}
                          className="inline-flex items-center gap-0.5 text-[#0A0A0A] underline underline-offset-2 hover:opacity-70"
                        >
                          {children}
                          <ChevronRight className="h-3 w-3 shrink-0" />
                        </Link>
                      )
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="border-collapse border border-[#E5E1DB] text-xs w-full">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-[#E5E1DB] bg-[#F9F7F4] px-2 py-1.5 text-left font-medium whitespace-nowrap">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-[#E5E1DB] px-2 py-1.5">{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HistoryPanel
// ---------------------------------------------------------------------------

function HistoryPanel({
  sessions,
  currentSessionId,
  onLoad,
  onDelete,
  onClose,
}: {
  sessions: ChatSession[]
  currentSessionId: string | null
  onLoad: (session: ChatSession) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="absolute inset-0 z-10 flex">
      {/* Panel */}
      <div className="w-72 bg-[#F9F7F4] border-r border-[#E5E1DB] flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E1DB] shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0A0A0A]/40">
            Chat History
          </p>
          <button
            onClick={onClose}
            className="text-[#0A0A0A]/30 hover:text-[#0A0A0A] transition-colors"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare className="h-8 w-8 text-[#0A0A0A]/15 mb-3" />
              <p className="text-xs text-[#0A0A0A]/30">No saved chats yet.</p>
              <p className="text-xs text-[#0A0A0A]/20 mt-1">Start a conversation and it will appear here.</p>
            </div>
          ) : (
            sorted.map((session) => {
              const isActive = session.id === currentSessionId
              const msgCount = session.messages.length
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-start gap-3 px-4 py-3 mx-2 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                      : 'hover:bg-[#0A0A0A]/[0.05] text-[#0A0A0A]'
                  }`}
                  onClick={() => onLoad(session)}
                >
                  <MessageSquare className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isActive ? 'text-[#F9F7F4]/60' : 'text-[#0A0A0A]/25'}`} />
                  <div className="flex-1 min-w-0 pr-5">
                    <p className={`text-xs leading-snug truncate font-medium ${isActive ? 'text-[#F9F7F4]' : 'text-[#0A0A0A]'}`}>
                      {session.title}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? 'text-[#F9F7F4]/45' : 'text-[#0A0A0A]/35'}`}>
                      {formatSessionDate(session.createdAt)} · {msgCount} message{msgCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id) }}
                    className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-0 max-sm:opacity-60 transition-opacity p-0.5 ${
                      isActive ? 'text-[#F9F7F4]/50 hover:text-[#F9F7F4]' : 'text-[#0A0A0A]/30 hover:text-[#0A0A0A]'
                    }`}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Backdrop — click to close */}
      <div className="flex-1 bg-[#0A0A0A]/10 cursor-pointer" onClick={onClose} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let nextId = 1
function genId() { return String(nextId++) }
function genSessionId() { return `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIAssistantPage() {
  const { user } = useUser()
  const firstName = user?.firstName ?? user?.username ?? 'there'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const [isThinking, setIsThinking] = useState(false)
  const [activeToolCalls, setActiveToolCalls] = useState<ActiveToolCall[]>([])
  const [thinkingExpanded, setThinkingExpanded] = useState(true)

  // Session history
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loaded = loadSessions()
    setSessions(loaded)
    setHasLoaded(true)
  }, [])

  // Auto-save the current session whenever messages change
  useEffect(() => {
    if (!hasLoaded || messages.length === 0) return

    const title = messages.find(m => m.role === 'user')?.content.slice(0, 60) ?? 'New chat'

    setSessions(prev => {
      let sessionId = currentSessionId

      if (!sessionId) {
        // Create a new session ID on first message
        sessionId = genSessionId()
        setCurrentSessionId(sessionId)
      }

      const exists = prev.find(s => s.id === sessionId)
      let updated: ChatSession[]

      if (exists) {
        updated = prev.map(s =>
          s.id === sessionId ? { ...s, title, messages } : s
        )
      } else {
        updated = [
          { id: sessionId, title, createdAt: Date.now(), messages },
          ...prev,
        ]
      }

      saveSessions(updated)
      return updated
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, hasLoaded])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, activeToolCalls])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setIsThinking(true)
    setActiveToolCalls([])
    setThinkingExpanded(true)
    setErrorMsg(null)

    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
    }

    const collectedToolCalls: ToolCallRecord[] = []
    let responseText = ''

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (res.status === 429) {
        setErrorMsg('Rate limit reached. Please wait a moment.')
        setMessages(prev => prev.filter(m => m.id !== userMsg.id))
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setErrorMsg(errData.error ?? 'Something went wrong. Please try again.')
        return
      }

      if (!res.body) {
        setErrorMsg('No response body received.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const event = JSON.parse(part.slice(6))

            if (event.type === 'tool_start') {
              const tc: ActiveToolCall = { id: event.id, tool: event.tool, label: event.label, done: false }
              collectedToolCalls.push({ tool: event.tool, label: event.label })
              setActiveToolCalls(prev => [...prev, tc])
            } else if (event.type === 'tool_done') {
              setActiveToolCalls(prev => prev.map(tc => tc.id === event.id ? { ...tc, done: true } : tc))
            } else if (event.type === 'text') {
              responseText = event.text
            } else if (event.type === 'error') {
              setErrorMsg(event.message)
            } else if (event.type === 'done') {
              if (responseText) {
                const assistantMsg: ChatMessage = {
                  id: genId(),
                  role: 'assistant',
                  content: responseText,
                  toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
                }
                setMessages(prev => [...prev, assistantMsg])
              }
            }
          } catch { /* ignore malformed events */ }
        }
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.')
    } finally {
      setLoading(false)
      setIsThinking(false)
      setActiveToolCalls([])
    }
  }, [messages, loading])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function startNewChat() {
    // Current messages are already saved to sessions via the useEffect above.
    // Just reset the active chat.
    setMessages([])
    setCurrentSessionId(null)
    setErrorMsg(null)
    setShowHistory(false)
    textareaRef.current?.focus()
  }

  function loadSession(session: ChatSession) {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setErrorMsg(null)
    setShowHistory(false)
  }

  function deleteSession(id: string) {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      saveSessions(updated)
      return updated
    })
    // If deleting the active session, start fresh
    if (id === currentSessionId) {
      setMessages([])
      setCurrentSessionId(null)
    }
  }

  const showEmpty = hasLoaded && messages.length === 0

  return (
    <div className="-m-4 md:-m-6 overflow-hidden bg-[#F9F7F4]" style={{ height: 'calc(100dvh - 56px)' }}>
      <div className="relative flex flex-col h-full max-w-3xl mx-auto">

        {/* History panel — absolute overlay */}
        {showHistory && (
          <HistoryPanel
            sessions={sessions}
            currentSessionId={currentSessionId}
            onLoad={loadSession}
            onDelete={deleteSession}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-[#F9F7F4]" />
            </div>
            <div>
              <p className="font-serif text-base font-normal text-[#0A0A0A] leading-tight">AI Assistant</p>
              <p className="text-[11px] text-[#0A0A0A]/35 leading-tight">Live data · Can take actions</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* History button — always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(p => !p)}
              className={`gap-1.5 h-8 text-xs ${showHistory ? 'text-[#0A0A0A] bg-[#0A0A0A]/[0.06]' : 'text-[#0A0A0A]/40 hover:text-[#0A0A0A]'}`}
            >
              <History className="h-3.5 w-3.5" />
              History
              {sessions.length > 0 && (
                <span className="ml-0.5 text-[9px] font-bold bg-[#0A0A0A]/10 px-1.5 py-0.5 leading-tight">
                  {sessions.length}
                </span>
              )}
            </Button>

            {/* New chat button — only when there are active messages */}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewChat}
                className="text-[#0A0A0A]/40 hover:text-[#0A0A0A] gap-1.5 h-8 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                New chat
              </Button>
            )}
          </div>
        </div>

        <div className="mx-8 border-t border-[#E5E1DB] shrink-0" />

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-full pb-4">
              <div className="w-full max-w-xl">
                <div className="mb-8">
                  <h3 className="font-serif text-3xl text-[#0A0A0A] mb-1">
                    Hi, {firstName}.
                  </h3>
                  <p className="text-sm text-[#0A0A0A]/45">
                    Ask me anything — I have live access to your orders, clients, invoices, and products.
                    I can also take actions for you.
                  </p>
                </div>

                <div className="space-y-5">
                  {(['daily', 'insights', 'action', 'setup', 'learn'] as const).map((cat) => {
                    const prompts = SUGGESTED_PROMPTS.filter(p => p.category === cat)
                    return (
                      <div key={cat}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0A0A0A]/25 mb-2">
                          {categoryLabels[cat]}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {prompts.map((prompt) => (
                            <button
                              key={prompt.label}
                              onClick={() => sendMessage(prompt.label)}
                              disabled={loading}
                              className="text-left px-3.5 py-2.5 text-xs border border-[#E5E1DB] bg-white hover:bg-[#F9F7F4] hover:border-[#0A0A0A]/15 transition-all text-[#0A0A0A]/60 hover:text-[#0A0A0A] disabled:opacity-50 group"
                            >
                              <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm mb-1 ${categoryColors[cat]}`}>
                                {categoryLabels[cat]}
                              </span>
                              <div className="leading-snug">{prompt.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isThinking && (
                <ThinkingPanel
                  toolCalls={activeToolCalls}
                  expanded={thinkingExpanded}
                  onToggle={() => setThinkingExpanded(p => !p)}
                />
              )}
            </>
          )}

          {errorMsg && (
            <div className="flex justify-center">
              <p className="text-xs text-destructive border border-destructive/20 bg-destructive/5 px-4 py-2.5 max-w-md text-center">
                {errorMsg}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-[#E5E1DB] px-8 pt-4 pb-6">
          <div className="flex gap-2.5 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 140)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything — or say "confirm all orders", "approve that application"…`}
              rows={1}
              className="flex-1 resize-none border border-[#E5E1DB] bg-white px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/30 focus:outline-none focus:border-[#0A0A0A]/40 transition-colors leading-relaxed overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ minHeight: '44px', maxHeight: '140px' }}
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none h-11 w-11 p-0 shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-[11px] text-[#0A0A0A]/25 mt-2">
            Enter to send · Shift+Enter for new line · Confirms before any action · Claude Haiku
          </p>
        </div>

      </div>
    </div>
  )
}
