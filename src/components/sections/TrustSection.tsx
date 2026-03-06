import React from "react";
import Container from "../layout/Container";

const TrustSection = () => {
  const partners = [
    { name: "Neo Tokyo", logo: "NT" },
    { name: "Seoul Digital", logo: "SD" },
    { name: "Berlin Smart", logo: "BS" },
    { name: "Copenhagen Grid", logo: "CG" },
    { name: "Singapore AI", logo: "SAI" },
    { name: "Oslo Connect", logo: "OC" },
  ];

  return (
    <section className="py-20 border-y border-[#DEE0E3] bg-[#F5F6F7]/50">
      <Container className="px-6">
        <p className="text-center text-[#646A73] text-xs font-semibold uppercase tracking-widest mb-12">
          Empowering the world's most innovative municipalities
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <div className="w-10 h-10 border border-[#DEE0E3] rounded flex items-center justify-center font-bold text-[#1F2329] group-hover:border-primary/50 group-hover:text-primary transition-colors">
                {partner.logo}
              </div>
              <span className="text-sm font-medium text-[#646A73] group-hover:text-[#1F2329] transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TrustSection;
