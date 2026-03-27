import type { ConversationRow } from './page'

export const THREAD_POLL_MS = 5000   // re-fetch active thread every 5s
export const LIST_POLL_MS  = 15000  // re-fetch conversation list every 15s

export interface Message {
  id: string
  senderName: string
  senderRole: string
  content: string
  createdAt: string
  readAt?: string | null
}

export interface FullConversation {
  id: string
  subject: string
  isOpen: boolean
  repClaimedAt?: string | null
  organization: { name: string; id: string }
  messages: Message[]
}

export interface OrgOption {
  id: string
  name: string
  phone: string
  contactPerson: string
}

export function formatTimestamp(ts: string) {
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
export function getResponseTime(c: ConversationRow): { label: string; level: 'green' | 'amber' | 'red' | 'none' } {
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

export function formatReadAt(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
