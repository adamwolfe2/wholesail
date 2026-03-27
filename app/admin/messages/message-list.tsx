'use client'

import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Search, MessageSquare } from 'lucide-react'
import { formatTimestamp, getResponseTime } from './message-utils'
import type { ConversationRow } from './page'

interface MessageListProps {
  conversations: ConversationRow[]
  allConversations: ConversationRow[]
  selectedId: string | null
  mobileShowThread: boolean
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: 'open' | 'closed' | 'all'
  onStatusFilterChange: (filter: 'open' | 'closed' | 'all') => void
  onSelectConversation: (id: string) => void
  onStartNewConversation: () => void
}

export function MessageList({
  conversations,
  allConversations,
  selectedId,
  mobileShowThread,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectConversation,
  onStartNewConversation,
}: MessageListProps) {
  return (
    <div className={cn(
      'w-full sm:w-80 border-r border-shell flex flex-col bg-cream',
      mobileShowThread && 'hidden sm:flex'
    )}>
      <div className="border-b border-shell">
        {/* Status filter tabs */}
        <div className="flex">
          {(['open', 'all', 'closed'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => onStatusFilterChange(f)}
              className={cn(
                'flex-1 py-2 text-[10px] uppercase tracking-widest font-medium border-b-2 transition-colors',
                statusFilter === f
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink/40 hover:text-ink/70'
              )}
            >
              {f === 'open' && allConversations.filter(c => c.isOpen).length > 0
                ? `Open (${allConversations.filter(c => c.isOpen).length})`
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
            <Input
              placeholder="Search by client or subject..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-sm border-sand"
              aria-label="Search conversations"
            />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <MessageSquare className="h-8 w-8 text-sand mb-3" />
            <p className="text-sm text-ink/50 mb-3">
              {searchQuery ? 'No matching conversations' : 'No client messages yet'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={onStartNewConversation}
                className="text-xs text-ink/60 underline underline-offset-2 hover:text-ink transition-colors"
              >
                Start your first conversation &rarr;
              </button>
            )}
          </div>
        ) : (
          conversations.map(c => {
            const rt = getResponseTime(c)
            return (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={cn(
                'w-full text-left px-4 py-3.5 border-b border-shell transition-colors',
                selectedId === c.id
                  ? 'bg-ink text-cream'
                  : 'hover:bg-cream/80 text-ink'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <h4 className={cn(
                  'text-sm font-semibold line-clamp-1',
                  selectedId === c.id ? 'text-cream' : 'text-ink'
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
                      selectedId === c.id ? 'bg-cream text-ink' : 'bg-ink text-cream'
                    )}>
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <p className={cn(
                'text-xs mb-1',
                selectedId === c.id ? 'text-cream/70' : 'text-ink/50'
              )}>
                {c.orgName}
              </p>
              <p className={cn(
                'text-xs line-clamp-1',
                selectedId === c.id ? 'text-cream/60' : 'text-ink/40'
              )}>
                {c.lastMessage || 'No messages'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-[10px]',
                  selectedId === c.id ? 'text-cream/40' : 'text-ink/30'
                )}>
                  {formatTimestamp(c.lastMessageAt)}
                </span>
                {!c.isOpen && (
                  <span className={cn(
                    'text-[10px] uppercase tracking-wider',
                    selectedId === c.id ? 'text-cream/40' : 'text-sand'
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
  )
}
