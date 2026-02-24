import React from 'react';

interface WeekSenseLogoProps {
  showWordmark?: boolean;
  className?: string;
  iconSize?: number;
}

const WeekSenseLogo = ({ showWordmark = true, className = '', iconSize = 28 }: WeekSenseLogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon mark — abstract lens/eye with wave */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle cx="16" cy="16" r="14" stroke="hsl(36 90% 55%)" strokeWidth="2" fill="none" />
        <path
          d="M6 16 C10 12, 14 20, 16 16 C18 12, 22 20, 26 16"
          stroke="hsl(36 90% 55%)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="16" r="3" fill="hsl(36 90% 55%)" opacity="0.3" />
      </svg>
      {/* Wordmark */}
      {showWordmark && (
        <span className="font-serif text-xl leading-none">
          <span className="text-foreground font-normal">Week</span>
          <span className="text-primary font-normal">Sense</span>
        </span>
      )}
    </div>
  );
};

export default WeekSenseLogo;
