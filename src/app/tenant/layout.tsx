import { TenantLayout } from "@/components/layout/tenant/tenant-layout";

export default function TenantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantLayout>{children}</TenantLayout>;
}
