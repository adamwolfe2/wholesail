import { PwaInstallPrompt } from '@/components/pwa-install-prompt'

export const dynamic = 'force-dynamic'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <PwaInstallPrompt />
    </>
  )
}
