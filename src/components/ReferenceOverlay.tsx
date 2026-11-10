import React, { useState } from 'react';
import { Image as ImageIcon, X, Eye, EyeOff } from 'lucide-react';

interface ReferenceOverlayProps {
  imagePath: string;
}

export const ReferenceOverlay: React.FC<ReferenceOverlayProps> = ({ imagePath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-white/10 border border-white/20 rounded-full text-zinc-300 hover:text-white text-xs font-mono backdrop-blur-md transition-all shadow-lg group"
        title="Compare with Original Reference Screenshot"
        aria-label="Compare with Original Reference Screenshot"
      >
        <ImageIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Reference Image</span>
      </button>

      {/* Direct Opacity Ghost Overlay on Top of the App */}
      {overlayOpacity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity flex items-center justify-center overflow-hidden"
          style={{ opacity: overlayOpacity }}
        >
          <img
            src={imagePath}
            alt="Original Screenshot Reference Overlay"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Floating Modal for reference image preview & side-by-side comparison */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-white/80" />
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-mono">
                  Original Reference Comparison
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close Reference Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black aspect-video flex items-center justify-center">
                <img
                  src={imagePath}
                  alt="Original Reference Screenshot"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Ghost overlay slider */}
              <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  {overlayOpacity > 0 ? (
                    <Eye className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Live Ghost Overlay Comparison:</span>
                  <span className="text-white font-bold">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-64">
                  <span className="text-[10px] font-mono text-zinc-500">Off</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="flex-1 accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-500">100%</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                Screenshot from Hoyoverse / YouTube livestream teaser
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-white text-black font-semibold text-xs font-mono rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
