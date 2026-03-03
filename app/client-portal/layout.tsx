import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { CartProvider } from '@/lib/cart-context'

export const dynamic = 'force-dynamic'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      {children}
      <PwaInstallPrompt />
    </CartProvider>
  )
}
