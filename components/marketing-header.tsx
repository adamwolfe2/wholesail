'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Conditionally import Clerk — safe when keys aren't configured
let SignInButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null
let useAuth: (() => { isSignedIn: boolean }) | null = null
try {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require('@clerk/nextjs')
    SignInButton = clerk.SignInButton
    useAuth = clerk.useAuth
  }
} catch { /* Clerk not available */ }

const NAV_LINKS = [
  { label: 'Catalog',    href: '/catalog'     },
  { label: 'Provenance', href: '/provenance'  },
  { label: 'Guide',      href: '/guide'       },
  { label: 'About',      href: '/about'       },
  { label: 'Drops',      href: '/drops'       },
  { label: 'Journal',    href: '/journal'     },
  { label: 'Social',     href: '/social'      },
  { label: 'Wholesale',  href: '/partner' },
  { label: 'Press',      href: '/press'       },
]

export function MarketingHeader() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth ? useAuth() : { isSignedIn: false }

  function isActive(href: string) {
    if (href.startsWith('/#')) return false           // anchor links never "active" on subpages
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F9F7F4]/95 backdrop-blur-md border-b border-[#E5E1DB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">

        {/* Logo — fixed width left anchor */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="shrink-0">
            <Image
              src="/truffle-boys-logo.svg"
              alt="Truffle Boys & Girls Club"
              width={110}
              height={84}
              className="h-8 sm:h-9 w-auto"
            />
          </Link>
        </div>

        {/* Center nav — always in the same spot */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#0A0A0A]/60 shrink-0">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'hover:text-[#0A0A0A] transition-colors whitespace-nowrap',
                isActive(href) && 'text-[#0A0A0A] font-semibold'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs — fixed width right anchor */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {isSignedIn ? (
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-sm">
              <Link href="/client-portal">My Portal</Link>
            </Button>
          ) : (
            <>
              {SignInButton ? (
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-sm">
                    Sign In
                  </Button>
                </SignInButton>
              ) : (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-sm">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
              <Button
                size="sm"
                asChild
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 text-sm font-medium"
              >
                <Link href="/partner">Order Now</Link>
              </Button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
