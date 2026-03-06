import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'glass' | 'plain';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon,
  variant = 'glass' 
}) => {
  return (
    <div className={`p-8 rounded-3xl transition-all duration-500 group hover:-translate-y-2 border border-[#DEE0E3] ${
      variant === 'glass' ? 'bg-white shadow-sm hover:shadow-md' : 'bg-[#F5F6F7]'
    }`}>
      {icon && (
        <div className="w-12 h-12 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-4 text-[#1F2329] group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-[#646A73] leading-relaxed text-sm">
        {description}
      </p>
      <div className="mt-6 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
        Learn more 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default FeatureCard;
