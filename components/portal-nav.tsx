'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserButton, useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  LogOut,
  Settings,
} from 'lucide-react'

interface NotificationCounts {
  unreadMessages: number
}

const portalLinks = [
  { href: '/client-portal/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null as keyof NotificationCounts | null },
  { href: '/client-portal/messages', label: 'Messages', icon: MessageSquare, badge: 'unreadMessages' as keyof NotificationCounts | null },
  { href: '/client-portal/payments', label: 'Payments', icon: CreditCard, badge: null as keyof NotificationCounts | null },
  { href: '/client-portal/settings', label: 'Settings', icon: Settings, badge: null as keyof NotificationCounts | null },
]

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 flex items-center justify-center">
      {count > 9 && (
        <span className="text-[8px] font-bold text-white leading-none">{count > 99 ? '99' : count}</span>
      )}
    </span>
  )
}

export function PortalNav() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [counts, setCounts] = useState<NotificationCounts>({ unreadMessages: 0 })

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/client/notifications/counts')
        if (res.ok) {
          const data = await res.json()
          setCounts({ unreadMessages: data.unreadMessages ?? 0 })
        }
      } catch {
        // Ignore errors — badges just won't show
      }
    }
    fetchCounts()
  }, [])

  const handleLogout = () => {
    signOut({ redirectUrl: '/' })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r border-[#E5E1DB] bg-[#F9F7F4] z-40">
        {/* Wordmark */}
        <div className="flex items-center h-16 px-5 border-b border-[#E5E1DB]">
          <Link href="/" className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-lg sm:text-xl text-[#0A0A0A] tracking-tight leading-tight">Wholesail</span>
            <span className="font-serif italic text-sm text-[#C8C0B4] leading-tight">Portal</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col py-5 px-3 gap-0.5">
          {portalLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/client-portal/dashboard' && pathname?.startsWith(link.href))
            const badgeCount = link.badge ? counts[link.badge] : 0
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                    : 'text-[#0A0A0A]/60 hover:bg-[#0A0A0A]/[0.08] hover:text-[#0A0A0A]'
                )}
              >
                <span className="relative shrink-0">
                  <link.icon className="h-4 w-4" />
                  <NotificationBadge count={badgeCount} />
                </span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E5E1DB] px-3 py-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs text-[#0A0A0A]/50 truncate">Account</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.08] transition-colors" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 border-b border-[#E5E1DB] bg-[#F9F7F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F9F7F4]/80 lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-sm sm:text-base text-[#0A0A0A] leading-tight">Wholesail</span>
            <span className="font-serif italic text-[10px] text-[#C8C0B4] leading-tight">Portal</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.08] transition-colors min-h-[44px] min-w-[44px]" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile bottom tab bar — all 4 items */}
        <div className="flex border-t border-[#E5E1DB]">
          {portalLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/client-portal/dashboard' && pathname?.startsWith(link.href))
            const badgeCount = link.badge ? counts[link.badge] : 0
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2.5 text-[10px] font-medium flex-1 min-h-[44px] justify-center transition-colors',
                  isActive
                    ? 'text-[#0A0A0A] border-b-2 border-[#0A0A0A] bg-[#C8C0B4]/10'
                    : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.08]'
                )}
              >
                <span className="relative">
                  <link.icon className="h-4 w-4" />
                  <NotificationBadge count={badgeCount} />
                </span>
                <span className="leading-none truncate max-w-[56px]">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </header>
    </>
  )
}

export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <PortalNav />
      <main className="lg:pl-64">
        <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
