import { AdminSidebar } from "@/components/layout/admin/admin-sidebar";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="ADMIN">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </RouteGuard>
  );
}
