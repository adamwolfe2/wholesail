'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

export function CrispChat() {
  useEffect(() => {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = 'a1f05d8e-0c7a-48f5-b13b-188d0c962cc9'

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  return null
}
