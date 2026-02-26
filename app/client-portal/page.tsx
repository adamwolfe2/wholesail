'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ClientPortalLogin() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/client-portal/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 flex-shrink">
            <Image
              src="/truffle-boys-logo.svg"
              alt="Truffle Boys Logo"
              width={120}
              height={40}
              style={{ width: '100%', height: 'auto', maxWidth: '56px' }}
              className="sm:max-w-[80px]"
              priority
            />
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">Back to Marketplace</Link>
          </Button>
        </div>
      </header>

      {/* Login CTA */}
      <div className="container mx-auto px-3 py-12 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-56px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl sm:text-3xl">Client Portal</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign in to access your orders, invoices, and account dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full h-11" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Request Access
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
