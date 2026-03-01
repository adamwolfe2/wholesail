'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react'

let UserButton: React.ComponentType<{ afterSignOutUrl?: string }> | null = null
try {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    UserButton = require('@clerk/nextjs').UserButton
  }
} catch { /* Clerk not available */ }

const supplierNav = [
  { href: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supplier/submissions', label: 'Submissions', icon: FileText },
  { href: '/supplier/submit', label: 'New Submission', icon: PlusCircle },
]

export function SupplierLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 border-r border-[#E5E1DB] bg-[#F9F7F4] z-40">
        <div className="flex items-center gap-3 h-16 px-5 border-b border-[#E5E1DB]">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <Image
              src="/wholesail-logo.svg"
              alt="Logo"
              width={32}
              height={32}
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              priority
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base text-[#0A0A0A] leading-tight truncate">Portal</span>
              <span className="font-serif italic text-xs text-[#C8C0B4] leading-tight">Supplier Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col py-5 px-3 gap-0.5">
          {supplierNav.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/supplier/dashboard' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0A0A0A] text-[#F9F7F4]'
                    : 'text-[#0A0A0A]/60 hover:bg-[#0A0A0A]/[0.08] hover:text-[#0A0A0A]'
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#E5E1DB] px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            {UserButton ? <UserButton afterSignOutUrl="/" /> : null}
            <span className="text-xs text-[#0A0A0A]/50 truncate">Account</span>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-50 border-b border-[#E5E1DB] bg-[#F9F7F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F9F7F4]/80 lg:hidden w-full">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/wholesail-logo.svg"
              alt="Logo"
              width={28}
              height={28}
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-sm text-[#0A0A0A] leading-tight">Portal</span>
              <span className="font-serif italic text-[10px] text-[#C8C0B4] leading-tight">Supplier Portal</span>
            </div>
          </Link>
          {UserButton ? <UserButton afterSignOutUrl="/" /> : null}
        </div>

        <div className="flex border-t border-[#E5E1DB] overflow-x-auto scrollbar-none">
          {supplierNav.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/supplier/dashboard' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2.5 text-[10px] font-medium min-w-[72px] flex-1 min-h-[44px] justify-center transition-colors',
                  isActive
                    ? 'text-[#0A0A0A] border-b-2 border-[#0A0A0A] bg-[#C8C0B4]/10'
                    : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.08]'
                )}
              >
                <link.icon className="h-4 w-4" />
                <span className="leading-none">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </header>

      <main className="lg:pl-60 flex-1 w-full">
        <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
