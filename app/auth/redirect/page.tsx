'use client'

/**
 * Smart auth redirect — runs after Clerk sign-in or sign-up.
 * Must be a client component so Clerk's session is available
 * immediately after the post-sign-in redirect.
 */
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function AuthRedirectPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      router.replace('/sign-in')
      return
    }

    // Fetch role from DB and redirect accordingly
    fetch('/api/auth/role')
      .then(r => r.json())
      .then(({ role }) => {
        if (role === 'ADMIN' || role === 'OPS' || role === 'SALES_REP') {
          router.replace('/admin')
        } else if (role === 'SUPPLIER') {
          router.replace('/supplier/dashboard')
        } else {
          router.replace('/client-portal/dashboard')
        }
      })
      .catch(() => {
        // DB not ready or no record yet — default to client portal
        router.replace('/client-portal/dashboard')
      })
  }, [isLoaded, userId, router])

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
      <p className="text-sm text-[#0A0A0A]/40">Redirecting…</p>
    </div>
  )
}
