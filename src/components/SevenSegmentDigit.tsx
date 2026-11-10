import React from 'react';

// 7-segment mapping for digits 0-9
// segments: a (top), b (top-right), c (bottom-right), d (bottom), e (bottom-left), f (top-left), g (middle)
export const DIGIT_SEGMENTS: Record<string, { [key: string]: boolean }> = {
  '0': { a: true, b: true, c: true, d: true, e: true, f: true, g: false },
  '1': { a: false, b: true, c: true, d: false, e: false, f: false, g: false },
  '2': { a: true, b: true, c: false, d: true, e: true, f: false, g: true },
  '3': { a: true, b: true, c: true, d: true, e: false, f: false, g: true },
  '4': { a: false, b: true, c: true, d: false, e: false, f: true, g: true },
  '5': { a: true, b: false, c: true, d: true, e: false, f: true, g: true },
  '6': { a: true, b: false, c: true, d: true, e: true, f: true, g: true },
  '7': { a: true, b: true, c: true, d: false, e: false, f: false, g: false },
  '8': { a: true, b: true, c: true, d: true, e: true, f: true, g: true },
  '9': { a: true, b: true, c: true, d: true, e: false, f: true, g: true },
};

interface SevenSegmentDigitProps {
  char: string;
  showGhost?: boolean;
  glowColor?: string;
  activeColor?: string;
  ghostColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isGlitching?: boolean;
}

export const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  char,
  showGhost = true,
  activeColor = '#ffffff',
  ghostColor = 'rgba(255, 255, 255, 0.08)',
  size = 'lg',
  isGlitching = false,
}) => {
  const activeSegs = DIGIT_SEGMENTS[char] || {
    a: false, b: false, c: false, d: false, e: false, f: false, g: false,
  };

  // SVG viewBox: 62 x 106 - Exactly measured from trailer frame_004 crop
  const segmentPaths = {
    // a: top horizontal
    a: 'M 10,5 L 52,5 L 45,14 L 17,14 Z',
    // b: top right vertical
    b: 'M 53,7 L 60,14 L 60,48 L 52,43 L 52,16 Z',
    // c: bottom right vertical
    c: 'M 52,58 L 60,53 L 60,87 L 53,94 L 52,85 Z',
    // d: bottom horizontal
    d: 'M 17,87 L 45,87 L 52,96 L 10,96 Z',
    // e: bottom left vertical
    e: 'M 10,58 L 10,85 L 2,94 L 2,53 Z',
    // f: top left vertical
    f: 'M 10,16 L 10,43 L 2,48 L 2,14 L 9,7 Z',
    // g: middle horizontal
    g: 'M 13,50.5 L 18,46 L 44,46 L 49,50.5 L 44,55 L 18,55 Z',
  };

  // Responsive sizes
  const sizeClasses = {
    sm: 'w-5 h-9 sm:w-7 sm:h-12 md:w-9 md:h-16',
    md: 'w-6 h-11 sm:w-10 sm:h-18 md:w-14 md:h-26',
    lg: 'w-7 h-12 sm:w-13 sm:h-23 md:w-17 md:h-30 lg:w-[82px] lg:h-[142px]',
    xl: 'w-8 h-14 sm:w-17 sm:h-29 md:w-22 md:h-38 lg:w-30 lg:h-52',
  };

  return (
    <div
      className={`relative inline-block select-none transition-transform duration-75 ${
        sizeClasses[size]
      } ${isGlitching ? 'translate-x-[1px] -translate-y-[0.5px] opacity-90' : ''}`}
    >
      <svg
        viewBox="0 0 62 101"
        className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="digitGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.0" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Object.entries(segmentPaths).map(([segKey, pathD]) => {
          const isLit = !!activeSegs[segKey];
          if (!isLit && !showGhost) return null;

          return (
            <g key={segKey}>
              {/* Main segment shape */}
              <path
                d={pathD}
                fill={isLit ? activeColor : ghostColor}
                stroke={isLit ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.035)'}
                strokeWidth={isLit ? 0.6 : 0.4}
                style={{
                  filter: isLit ? 'url(#digitGlow)' : 'none',
                  transition: 'fill 0.08s ease-out',
                }}
              />
              {/* Inner subtle core line for lit segment */}
              {isLit && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={0.3}
                  opacity={0.9}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Colon component: exactly matches the 3x3 dot matrix square colon in trailer video
 */
export const SevenSegmentColon: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  activeColor?: string;
}> = ({ size = 'lg', activeColor = '#ffffff' }) => {
  const sizeClasses = {
    sm: 'w-2 h-9 sm:w-3 sm:h-12 md:w-3.5 md:h-16',
    md: 'w-2.5 h-11 sm:w-4 sm:h-18 md:w-5 md:h-26',
    lg: 'w-2.5 h-12 sm:w-4 sm:h-23 md:w-5 md:h-30 lg:w-7 lg:h-[142px]',
    xl: 'w-3 h-14 sm:w-5 sm:h-29 md:w-7 md:h-38 lg:w-9 lg:h-52',
  };

  return (
    <div
      className={`relative inline-flex flex-col justify-center items-center select-none ${sizeClasses[size]}`}
    >
      <svg
        viewBox="0 0 16 101"
        className="w-full h-full overflow-visible drop-shadow-[0_0_10px_rgba(255,255,255,0.65)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top 3x3 LED matrix dot block (centered at Y ≈ 34) */}
        <g transform="translate(4, 29)">
          <rect x="0" y="0" width="2" height="2" fill={activeColor} />
          <rect x="3" y="0" width="2" height="2" fill={activeColor} />
          <rect x="6" y="0" width="2" height="2" fill={activeColor} />
          <rect x="0" y="3" width="2" height="2" fill={activeColor} />
          <rect x="3" y="3" width="2" height="2" fill={activeColor} />
          <rect x="6" y="3" width="2" height="2" fill={activeColor} />
          <rect x="0" y="6" width="2" height="2" fill={activeColor} />
          <rect x="3" y="6" width="2" height="2" fill={activeColor} />
          <rect x="6" y="6" width="2" height="2" fill={activeColor} />
        </g>

        {/* Bottom 3x3 LED matrix dot block (centered at Y ≈ 67) */}
        <g transform="translate(4, 62)">
          <rect x="0" y="0" width="2" height="2" fill={activeColor} />
          <rect x="3" y="0" width="2" height="2" fill={activeColor} />
          <rect x="6" y="0" width="2" height="2" fill={activeColor} />
          <rect x="0" y="3" width="2" height="2" fill={activeColor} />
          <rect x="3" y="3" width="2" height="2" fill={activeColor} />
          <rect x="6" y="3" width="2" height="2" fill={activeColor} />
          <rect x="0" y="6" width="2" height="2" fill={activeColor} />
          <rect x="3" y="6" width="2" height="2" fill={activeColor} />
          <rect x="6" y="6" width="2" height="2" fill={activeColor} />
        </g>
      </svg>
    </div>
  );
};
