import Hero from "@/components/sections/Hero";
import TrustSection from "@/components/sections/TrustSection";
import Showcase from "@/components/sections/Showcase";
import FeaturesGrid from "@/components/sections/FeaturesGrid";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Trust Section (Partners) */}
      <TrustSection />

      {/* Product Showcase */}
      <Showcase />

      {/* Core Features */}
      <FeaturesGrid />

      {/* CTA Section (Custom inline) */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass p-12 md:p-20 rounded-[48px] text-center border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[80px] -z-10" />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[#1F2329]">
            Ready to synchronize your city?
          </h2>
          <p className="text-lg text-[#646A73] mb-12 max-w-2xl mx-auto">
            Join 450+ municipalities already building the future of urban living. 
            Deploy UrbanSync in your district today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105">
              Contact Sales
            </button>
            <button className="bg-gray-100 text-[#1F2329] border border-[#DEE0E3] px-10 py-4 rounded-full font-bold hover:bg-gray-200 transition-all">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
