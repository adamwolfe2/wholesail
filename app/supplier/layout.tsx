import { SupplierLayoutClient } from './supplier-layout-client'

export const dynamic = 'force-dynamic'

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return <SupplierLayoutClient>{children}</SupplierLayoutClient>
}
