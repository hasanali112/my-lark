import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
