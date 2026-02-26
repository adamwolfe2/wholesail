'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'tbgc_pwa_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) {
      return
    }

    // Don't show if already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !installEvent) return null

  const handleInstall = async () => {
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-[#0A0A0A] text-[#F9F7F4] px-4 py-3">
      <p className="text-sm font-medium leading-snug">
        Install TBGC on your home screen for faster ordering &rarr;
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="text-sm font-semibold underline underline-offset-2 hover:text-[#C8C0B4] transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
