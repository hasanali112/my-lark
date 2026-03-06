import React from 'react';
import FeatureCard from '../ui/FeatureCard';
import Button from '../ui/Button';

const FeaturesGrid = () => {
  const features = [
    {
      title: "Predictive Analytics",
      description: "AI-driven models that forecast traffic congestion and energy demand before they occur.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Resilient Infrastructure",
      description: "Self-healing grid management that automatically reroutes power during localized failures.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Seamless Engagement",
      description: "Direct-to-citizen communication channels for hyper-local alerts and community feedback.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9l-4 4v-4H3a2 2 0 01-2-2V10a2 2 0 012-2h2m3 0h7a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 8l-2-2m2 2l2-2m-2-2l2 2m-2-2l-2 2" />
        </svg>
      )
    },
    {
      title: "Sustainable Scaling",
      description: "Embedded carbon tracking across all city operations to meet net-zero targets by 2030.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 space-y-8 md:space-y-0">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2329]">
              How every district <br />runs better on <span className="text-primary">UrbanSync</span>
            </h2>
            <p className="text-[#646A73] leading-relaxed">
              Everything built-in, distributed-ready, and set up for long-term scalability. 
              Work in one place and move faster as a city.
            </p>
          </div>
          <div>
            <Button variant="outline">Explore All Components</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
