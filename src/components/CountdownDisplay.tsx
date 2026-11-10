import React from 'react';
import { SevenSegmentDigit, SevenSegmentColon } from './SevenSegmentDigit';

interface CountdownDisplayProps {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  showLabels?: boolean;
  showGhost?: boolean;
  theme?: 'void' | 'gold' | 'crimson' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isGlitching?: boolean;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  days,
  hours,
  minutes,
  seconds,
  showLabels = false,
  showGhost = true,
  theme = 'void',
  size = 'lg',
  isGlitching = false,
}) => {
  // Theme color settings
  const themeColors = {
    void: {
      active: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.85)',
      ghost: 'rgba(255, 255, 255, 0.08)',
      label: 'text-zinc-400',
    },
    gold: {
      active: '#ffea9f',
      glow: 'rgba(255, 215, 100, 0.85)',
      ghost: 'rgba(240, 190, 80, 0.09)',
      label: 'text-amber-300/70',
    },
    crimson: {
      active: '#ff8a8a',
      glow: 'rgba(255, 80, 90, 0.85)',
      ghost: 'rgba(230, 60, 80, 0.09)',
      label: 'text-rose-400/70',
    },
    cyan: {
      active: '#bdfaff',
      glow: 'rgba(100, 240, 255, 0.85)',
      ghost: 'rgba(80, 210, 255, 0.09)',
      label: 'text-cyan-300/70',
    },
  };

  const currentColors = themeColors[theme] || themeColors.void;

  // Split string pairs
  const d1 = days[0] || '0';
  const d2 = days[1] || '0';
  const h1 = hours[0] || '0';
  const h2 = hours[1] || '0';
  const m1 = minutes[0] || '0';
  const m2 = minutes[1] || '0';
  const s1 = seconds[0] || '0';
  const s2 = seconds[1] || '0';

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-20">
      {/* Digits Container */}
      <div
        className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3"
        data-testid="countdown-digits"
      >
        {/* DAYS */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <SevenSegmentDigit
              char={d1}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
            <SevenSegmentDigit
              char={d2}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
          </div>
          {showLabels && (
            <span
              className={`text-[9px] sm:text-xs tracking-[0.25em] font-mono uppercase mt-2 ${currentColors.label}`}
            >
              DAYS
            </span>
          )}
        </div>

        {/* COLON */}
        <div className="flex flex-col items-center">
          <SevenSegmentColon size={size} activeColor={currentColors.active} />
          {showLabels && <span className="opacity-0 text-[9px] sm:text-xs mt-2">:</span>}
        </div>

        {/* HOURS */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <SevenSegmentDigit
              char={h1}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
            <SevenSegmentDigit
              char={h2}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
          </div>
          {showLabels && (
            <span
              className={`text-[9px] sm:text-xs tracking-[0.25em] font-mono uppercase mt-2 ${currentColors.label}`}
            >
              HOURS
            </span>
          )}
        </div>

        {/* COLON */}
        <div className="flex flex-col items-center">
          <SevenSegmentColon size={size} activeColor={currentColors.active} />
          {showLabels && <span className="opacity-0 text-[9px] sm:text-xs mt-2">:</span>}
        </div>

        {/* MINUTES */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <SevenSegmentDigit
              char={m1}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
            <SevenSegmentDigit
              char={m2}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
          </div>
          {showLabels && (
            <span
              className={`text-[9px] sm:text-xs tracking-[0.25em] font-mono uppercase mt-2 ${currentColors.label}`}
            >
              MINS
            </span>
          )}
        </div>

        {/* COLON */}
        <div className="flex flex-col items-center">
          <SevenSegmentColon size={size} activeColor={currentColors.active} />
          {showLabels && <span className="opacity-0 text-[9px] sm:text-xs mt-2">:</span>}
        </div>

        {/* SECONDS */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <SevenSegmentDigit
              char={s1}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
            <SevenSegmentDigit
              char={s2}
              size={size}
              showGhost={showGhost}
              activeColor={currentColors.active}
              glowColor={currentColors.glow}
              ghostColor={currentColors.ghost}
              isGlitching={isGlitching}
            />
          </div>
          {showLabels && (
            <span
              className={`text-[9px] sm:text-xs tracking-[0.25em] font-mono uppercase mt-2 ${currentColors.label}`}
            >
              SECS
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
