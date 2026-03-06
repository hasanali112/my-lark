import Image from "next/image";
import Container from "../layout/Container";

const Showcase = () => {
  return (
    <section className="py-32 px-6 relative">
      <Container>
        <div className="relative group">
          {/* Decorative Backdrops */}
          <div className="absolute -inset-1 bg-primary/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative bg-white p-4 rounded-[32px] overflow-hidden border border-[#DEE0E3] shadow-xl">
            <div className="relative rounded-[24px] overflow-hidden bg-[#F5F6F7] aspect-video flex items-center justify-center border border-[#DEE0E3]">
              <Image
                src="/urbansync_dashboard.png"
                alt="UrbanSync Dashboard Showcase"
                fill
                className="object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>

            {/* Floating Info Overlay */}
            <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md p-6 rounded-2xl max-w-xs border border-[#DEE0E3] shadow-lg hidden lg:block animate-float">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-[#1F2329]">
                  Real-time Synchronization Active
                </span>
              </div>
              <p className="text-sm text-[#646A73] leading-relaxed">
                Managing 1.2M sensors across 4 major districts. Automated
                emergency routing enabled.
              </p>
            </div>
          </div>

          {/* Device indicators like in Lark example */}
          <div className="mt-12 flex justify-center space-x-8">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-primary mb-2" />
              <span className="text-sm font-medium text-[#1F2329]">
                Central Operations Console
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-[#DEE0E3] pl-8">
              <div className="w-2 h-2 rounded-full bg-gray-200 mb-2" />
              <span className="text-sm font-medium text-[#646A73]">
                Field Responder Mobile
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-[#DEE0E3] pl-8">
              <div className="w-2 h-2 rounded-full bg-gray-200 mb-2" />
              <span className="text-sm font-medium text-[#646A73]">
                Public Citizen Portal
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Showcase;
