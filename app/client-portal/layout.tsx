import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { CartProvider } from '@/lib/cart-context'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
