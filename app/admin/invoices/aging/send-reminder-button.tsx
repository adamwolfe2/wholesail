'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SendReminderButtonProps {
  invoiceId: string
  invoiceNumber: string
}

export function SendReminderButton({ invoiceId, invoiceNumber }: SendReminderButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/remind`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.success(`Reminder sent for ${invoiceNumber}`)
        setSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to send reminder')
      }
    } catch {
      toast.error('Network error — reminder not sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={loading || sent}
      onClick={handleClick}
      className="border-shell text-ink hover:bg-ink/[0.06] h-7 px-2.5 text-xs font-medium"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <Bell className="h-3 w-3 mr-1.5" />
          {sent ? 'Sent' : 'Remind'}
        </>
      )}
    </Button>
  )
}
