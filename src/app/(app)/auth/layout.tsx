import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-12">
        <Container>
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#1F2329]">
                  Welcome to <span className="text-primary">MyLark</span>
                </h1>
                <p className="text-[#6B7280]">
                  Connect with your team in real-time
                </p>
              </div>
              {children}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
