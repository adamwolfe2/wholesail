'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Send, Search, Loader2, AlertTriangle } from 'lucide-react'
import type { OrgOption } from './message-utils'

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgsLoading: boolean
  filteredOrgs: OrgOption[]
  orgs: OrgOption[]
  orgSearch: string
  onOrgSearchChange: (value: string) => void
  newOrgId: string
  onOrgSelect: (id: string) => void
  newSubject: string
  onSubjectChange: (value: string) => void
  newBody: string
  onBodyChange: (value: string) => void
  newConvoLoading: boolean
  newConvoIMessageWarning: boolean
  newConvoError: string | null
  onSubmit: () => void
  onCancel: () => void
}

export function NewConversationDialog({
  open,
  onOpenChange,
  orgsLoading,
  filteredOrgs,
  orgs,
  orgSearch,
  onOrgSearchChange,
  newOrgId,
  onOrgSelect,
  newSubject,
  onSubjectChange,
  newBody,
  onBodyChange,
  newConvoLoading,
  newConvoIMessageWarning,
  newConvoError,
  onSubmit,
  onCancel,
}: NewConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-cream border-shell">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-ink">New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Org picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-ink">Client</Label>
            {orgsLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-sand">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clients...
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
                  <Input
                    placeholder="Search by name, phone, or contact..."
                    value={orgSearch}
                    onChange={e => onOrgSearchChange(e.target.value)}
                    className="pl-8 h-9 text-sm border-sand"
                    aria-label="Search organizations"
                  />
                </div>
                <div className="border border-shell max-h-40 overflow-y-auto">
                  {filteredOrgs.length === 0 ? (
                    <p className="text-sm text-sand px-3 py-4 text-center">
                      {orgs.length === 0 ? 'No clients with a phone number found' : 'No matching clients'}
                    </p>
                  ) : (
                    filteredOrgs.map(org => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => onOrgSelect(org.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 text-sm border-b border-shell last:border-b-0 transition-colors',
                          newOrgId === org.id
                            ? 'bg-ink text-cream'
                            : 'hover:bg-ink/[0.04] text-ink'
                        )}
                      >
                        <span className="font-medium">{org.name}</span>
                        <span className={cn(
                          'ml-2 text-xs',
                          newOrgId === org.id ? 'text-cream/60' : 'text-sand'
                        )}>
                          {org.phone}
                        </span>
                        {org.contactPerson && (
                          <span className={cn(
                            'block text-xs mt-0.5',
                            newOrgId === org.id ? 'text-cream/50' : 'text-ink/40'
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
            <Label htmlFor="new-subject" className="text-sm font-medium text-ink">Subject</Label>
            <Input
              id="new-subject"
              placeholder="e.g. New product availability"
              value={newSubject}
              onChange={e => onSubjectChange(e.target.value)}
              className="border-sand"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="new-body" className="text-sm font-medium text-ink">Message</Label>
            <Textarea
              id="new-body"
              placeholder="Type your message to the client..."
              value={newBody}
              onChange={e => onBodyChange(e.target.value)}
              rows={4}
              className="border-sand resize-none"
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
            onClick={onCancel}
            disabled={newConvoLoading}
            className="border-shell"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!newOrgId || !newSubject.trim() || !newBody.trim() || newConvoLoading}
            className="bg-ink text-cream hover:bg-ink/80"
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
  )
}
