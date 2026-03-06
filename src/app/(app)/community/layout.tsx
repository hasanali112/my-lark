import AppNavbar from "@/components/layout/AppNavbar";
import AppFooter from "@/components/layout/AppFooter";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[#F5F6F7] text-[#1F2329] overflow-hidden">
      <div className="h-16 shrink-0">
        <AppNavbar />
      </div>
      <main className="flex-1 min-h-0 overflow-y-auto pt-2 md:pt-4">
        {children}
      </main>
    </div>
  );
}
