import AppNavbar from "@/components/layout/AppNavbar";
import AppFooter from "@/components/layout/AppFooter";

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#1F2329]">
      <AppNavbar />
      <main className="pt-24">{children}</main>
      <AppFooter />
    </div>
  );
}
