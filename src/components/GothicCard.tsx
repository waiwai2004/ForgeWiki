import React from 'react';

interface GothicCardProps {
  id?: string;
  className?: string;
  glowColor?: 'amber' | 'crimson' | 'cyan' | 'gray';
  onClick?: () => void;
  children: React.ReactNode;
}

export const GothicCard: React.FC<GothicCardProps> = ({
  id,
  className = '',
  glowColor = 'amber',
  onClick,
  children
}) => {
  const glowClasses = {
    amber: 'hover:shadow-[0_0_15px_rgba(212,168,83,0.35)] hover:border-[#d4a853]',
    crimson: 'hover:shadow-[0_0_15px_rgba(161,61,61,0.45)] hover:border-[#a13d3d]',
    cyan: 'hover:shadow-[0_0_15px_rgba(0,255,213,0.35)] hover:border-[#00ffd5]',
    gray: 'hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:border-neutral-500'
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-neutral-950/85 backdrop-blur-md
        border border-[#b89b5c]/40 rounded-lg p-5
        text-[#e6d8b5] transition-all duration-300 ease-out
        hover:-translate-y-0.5 group
        ${glowClasses[glowColor]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Accent corner brackets to simulate ancient wear and tear / gothic borders */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#b89b5c]/60 group-hover:border-[#d4a853]"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#b89b5c]/60 group-hover:border-[#d4a853]"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#b89b5c]/60 group-hover:border-[#d4a853]"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#b89b5c]/60 group-hover:border-[#d4a853]"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
