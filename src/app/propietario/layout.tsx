import { LandlordSidebar } from "@/components/layout/landlord/landlord-sidebar";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <LandlordSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
