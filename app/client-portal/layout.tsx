import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { CartProvider } from '@/lib/cart-context'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Wholesail'

export const metadata: Metadata = {
  title: { template: `%s | ${BRAND_NAME}`, default: `${BRAND_NAME} Portal` },
  robots: { index: false, follow: false },
}

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <CartProvider>
      {children}
      <PwaInstallPrompt />
    </CartProvider>
  )
}
