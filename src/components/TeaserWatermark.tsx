import React from 'react';

interface TeaserWatermarkProps {
  visible?: boolean;
}

export const TeaserWatermark: React.FC<TeaserWatermarkProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <div
      className="absolute bottom-4 right-5 sm:bottom-6 sm:right-8 z-30 flex flex-col items-center gap-1 select-none pointer-events-none opacity-80 hover:opacity-100 transition-opacity"
      data-testid="teaser-watermark"
    >
      {/* Mascot circular avatar icon */}
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.25)] flex items-center justify-center">
        {/* Stylized vector chibi mascot silhouette/icon */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair background */}
          <circle cx="20" cy="20" r="18" fill="#1b1c28" />
          <path
            d="M8 22C8 14 13 8 20 8C27 8 32 14 32 22C32 28 27 34 20 34C13 34 8 28 8 22Z"
            fill="#e2e8f0"
          />
          {/* Face */}
          <path
            d="M13 22C13 17 16 13 20 13C24 13 27 17 27 22C27 26 24 29 20 29C16 29 13 26 13 22Z"
            fill="#ffedd5"
          />
          {/* Crown hairpin */}
          <polygon points="20,7 23,12 17,12" fill="#38bdf8" />
          <circle cx="20" cy="10" r="1.5" fill="#facc15" />
          {/* Eyes (winking cute anime face) */}
          <path
            d="M16 21C16 22.5 17 23.5 18 23.5C19 23.5 19.5 22.5 19.5 21"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Winking right eye */}
          <path
            d="M22 22L25 21L23 23"
            stroke="#1e293b"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blush */}
          <circle cx="15" cy="24" r="1.5" fill="#f43f5e" opacity="0.6" />
          <circle cx="25" cy="24" r="1.5" fill="#f43f5e" opacity="0.6" />
          {/* Smile */}
          <path
            d="M19 26C20 27 21 27 22 26"
            stroke="#e11d48"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* Brand text */}
      <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-300 font-sans drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        HOYOVERSE
      </span>
    </div>
  );
};
