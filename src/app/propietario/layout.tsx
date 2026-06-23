import { LandlordSidebar } from "@/components/layout/landlord/landlord-sidebar";
import { RouteGuard } from "@/components/auth/route-guard";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="LANDLORD">
      <div className="flex min-h-screen bg-background">
        <LandlordSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RouteGuard>
  );
}
