'use client'

import { type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, ArrowLeft, MessageSquare, CheckCircle, XCircle, ArrowDown, AlertTriangle, CheckCheck } from 'lucide-react'
import { formatTimestamp, formatReadAt } from './message-utils'
import type { FullConversation } from './message-utils'
import { MessageComposer } from './message-composer'

interface MessageThreadProps {
  selectedId: string | null
  thread: FullConversation | null
  threadLoading: boolean
  mobileShowThread: boolean
  onMobileBack: () => void
  onToggleOpen: (isOpen: boolean) => void
  onReleaseToAI: () => void
  scrollRef: RefObject<HTMLDivElement | null>
  showScrollBtn: boolean
  onScroll: () => void
  onScrollToBottom: () => void
  iMessageWarning: boolean
  // Composer props
  newMessage: string
  onNewMessageChange: (value: string) => void
  sendLoading: boolean
  suggestLoading: boolean
  showSuggestions: boolean
  suggestedReplies: string[]
  onSend: () => void
  onSuggest: () => void
  onApplySuggestion: (reply: string) => void
  onDismissSuggestions: () => void
}

export function MessageThread({
  selectedId,
  thread,
  threadLoading,
  mobileShowThread,
  onMobileBack,
  onToggleOpen,
  onReleaseToAI,
  scrollRef,
  showScrollBtn,
  onScroll,
  onScrollToBottom,
  iMessageWarning,
  newMessage,
  onNewMessageChange,
  sendLoading,
  suggestLoading,
  showSuggestions,
  suggestedReplies,
  onSend,
  onSuggest,
  onApplySuggestion,
  onDismissSuggestions,
}: MessageThreadProps) {
  return (
    <div className={cn(
      'flex flex-col flex-1',
      !mobileShowThread && 'hidden sm:flex'
    )}>
      {!selectedId ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
          <MessageSquare className="h-10 w-10 text-sand mb-4" />
          <p className="font-serif text-lg text-ink mb-2">Select a conversation</p>
          <p className="text-sm text-sand">Choose a conversation to reply to the client.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-shell flex items-center gap-3 bg-white">
            <Button
              variant="ghost" size="icon"
              className="sm:hidden h-8 w-8"
              onClick={onMobileBack}
              aria-label="Back to conversations"
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
                  onClick={onReleaseToAI}
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
                onClick={() => onToggleOpen(!thread.isOpen)}
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
            className="flex-1 overflow-y-auto px-4 py-5 bg-cream relative"
            onScroll={onScroll}
          >
            {threadLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-sand" />
              </div>
            ) : !thread?.messages?.length ? (
              <div className="flex items-center justify-center h-full text-sm text-sand">
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
                        <p className="text-[10px] text-ink/40 bg-sand/20 px-3 py-1.5 uppercase tracking-wider">
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
                          isStaff ? 'bg-ink text-cream' : 'bg-sand text-ink'
                        )}>
                          {msg.senderName.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-ink/60">{msg.senderName}</span>
                        <span className="text-[10px] uppercase tracking-wider text-sand">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>
                      <div className={cn(
                        'max-w-[80%] px-4 py-2.5 text-sm leading-relaxed',
                        isStaff
                          ? 'bg-ink text-cream'
                          : 'bg-sand/20 text-ink border border-sand/40'
                      )}>
                        {msg.content}
                      </div>
                      {/* Read receipt: show under staff messages that the client has read */}
                      {isStaff && msg.readAt && (
                        <span className="flex items-center gap-1 text-[10px] text-sand mt-0.5 mr-0.5">
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
                onClick={onScrollToBottom}
                className="pointer-events-auto bg-ink text-cream hover:bg-ink/80 shadow-lg gap-1.5 text-xs"
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
            <MessageComposer
              newMessage={newMessage}
              onNewMessageChange={onNewMessageChange}
              sendLoading={sendLoading}
              suggestLoading={suggestLoading}
              showSuggestions={showSuggestions}
              suggestedReplies={suggestedReplies}
              onSend={onSend}
              onSuggest={onSuggest}
              onApplySuggestion={onApplySuggestion}
              onDismissSuggestions={onDismissSuggestions}
            />
          )}
        </>
      )}
    </div>
  )
}
