'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Wand2 } from 'lucide-react'

interface MessageComposerProps {
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

export function MessageComposer({
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
}: MessageComposerProps) {
  return (
    <div className="border-t border-shell p-3 sm:p-4 bg-white">
      {/* AI suggestions dropdown */}
      {showSuggestions && suggestedReplies.length > 0 && (
        <div className="max-w-2xl mx-auto mb-2 border border-shell bg-cream">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-shell">
            <span className="text-[10px] uppercase tracking-widest text-sand font-medium">AI Reply Suggestions</span>
            <button
              type="button"
              onClick={onDismissSuggestions}
              className="text-sand hover:text-ink text-xs transition-colors"
            >
              &#x2715;
            </button>
          </div>
          {suggestedReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onApplySuggestion(reply)}
              className="w-full text-left px-3 py-2.5 text-sm text-ink border-b border-shell last:border-b-0 hover:bg-ink/[0.04] transition-colors"
            >
              <span className="text-[10px] uppercase tracking-wider text-sand mr-2">
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
          onChange={e => onNewMessageChange(e.target.value)}
          className="flex-1 min-h-[44px]"
          aria-label="Reply message"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
              e.preventDefault()
              onSend()
            }
          }}
        />
        <Button
          size="icon"
          variant="outline"
          title="AI reply suggestions"
          aria-label="AI reply suggestions"
          className="shrink-0 border-sand text-ink hover:bg-cream min-h-[44px] min-w-[44px]"
          disabled={suggestLoading}
          onClick={onSuggest}
        >
          {suggestLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Wand2 className="h-4 w-4" />
          }
        </Button>
        <Button
          size="icon"
          className="shrink-0 bg-ink text-cream hover:bg-ink/80 min-h-[44px] min-w-[44px]"
          disabled={!newMessage.trim() || sendLoading}
          onClick={onSend}
          aria-label="Send reply"
        >
          {sendLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  )
}
