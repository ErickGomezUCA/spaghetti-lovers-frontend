import { TenantLayout } from "@/components/layout/tenant/tenant-layout";
import { RouteGuard } from "@/components/auth/route-guard";

export default function TenantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="TENANT">
      <TenantLayout>{children}</TenantLayout>
    </RouteGuard>
  );
}
