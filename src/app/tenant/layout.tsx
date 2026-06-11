import { TenantLayout } from '@/components/tenant/tenant-layout'

export default function TenantRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TenantLayout>{children}</TenantLayout>
}
