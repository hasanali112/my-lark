import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#1F2329]">
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
}
