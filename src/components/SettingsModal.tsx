import React, { useState } from 'react';
import { X, Calendar, Clock, Sliders, Sparkles, Volume2, RotateCcw, Clapperboard, Zap } from 'lucide-react';
import {
  USER_IMAGE_START_SECONDS,
  TRAILER_VIDEO_SECONDS,
  SCREENSHOT_TOTAL_SECONDS,
  WARP_JUMP_SECONDS,
  PHASE3_SECONDS,
  CLIMAX_SURGE_SECONDS,
} from '../utils/time';

export type CountdownTheme = 'void' | 'gold' | 'crimson' | 'cyan';
export type DisplaySize = 'sm' | 'md' | 'lg' | 'xl';

export interface CountdownConfig {
  eventTitle: string;
  showTitle: boolean;
  targetTimestamp: number;
  theme: CountdownTheme;
  size: DisplaySize;
  showLabels: boolean;
  showGhost: boolean;
  showAura: boolean;
  beamIntensity: number;
  particleDensity: number;
  isStopwatchMode: boolean;
  stopwatchDurationSec: number;
  showWatermark: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CountdownConfig;
  onUpdateConfig: (updated: Partial<CountdownConfig>) => void;
  onResetToVideoStart: () => void;
  onResetToScreenshot: () => void;
  onPlayTrailerSequence: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetToVideoStart,
  onResetToScreenshot,
  onPlayTrailerSequence,
}) => {
  if (!isOpen) return null;

  const targetDateObj = new Date(config.targetTimestamp);
  const dateString = targetDateObj.toISOString().slice(0, 16);

  const [customDateTime, setCustomDateTime] = useState(dateString);
  const [customTimerMinutes, setCustomTimerMinutes] = useState('10');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDateTime(e.target.value);
    const parsed = new Date(e.target.value).getTime();
    if (!isNaN(parsed)) {
      onUpdateConfig({
        targetTimestamp: parsed,
        isStopwatchMode: false,
      });
    }
  };

  const setTimestampSeconds = (seconds: number) => {
    onUpdateConfig({
      targetTimestamp: Date.now() + seconds * 1000,
      isStopwatchMode: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-950/95 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-white/80" />
            <h2 className="text-base font-semibold tracking-wider text-white uppercase font-mono">
              Countdown Calibration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300">
          {/* Trailer Scene Trigger & Climax Tester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-gradient-to-r from-white/10 to-transparent border border-white/25 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-white font-semibold font-mono text-xs uppercase tracking-wider">
                  <Clapperboard className="w-4 h-4 text-emerald-400" />
                  <span>Trailer Sequence</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Play 10.5s sequence with audio & warp
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onPlayTrailerSequence();
                }}
                className="px-3 py-1.5 bg-white text-black font-semibold text-xs font-mono rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0 shadow-lg"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                Play
              </button>
            </div>

            <div className="p-3.5 bg-gradient-to-r from-rose-950/40 to-transparent border border-rose-500/30 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold font-mono text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Zero Point Climax</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Shockwave, beam, banner & sub-bass
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setTimestampSeconds(5);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-white font-semibold text-[11px] font-mono rounded-lg transition-colors"
                  title="Count down from 5s to experience the zero climax event"
                >
                  5s Test
                </button>
                <button
                  onClick={() => {
                    setTimestampSeconds(0);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] font-mono rounded-lg transition-colors"
                  title="Instantly trigger zero point"
                >
                  Now (0s)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets matching video and teaser */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-mono">
              Keyframe Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                onClick={() => setTimestampSeconds(USER_IMAGE_START_SECONDS)}
                className="px-2 py-2.5 bg-white/15 hover:bg-white/25 border border-white/40 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1 shadow-sm"
              >
                <span className="font-semibold text-white">Reference</span>
                <span className="text-[10px] text-zinc-200">02:00:35:48</span>
              </button>
              <button
                onClick={onResetToVideoStart}
                className="px-2 py-2.5 bg-zinc-900 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold text-emerald-400">Video Start</span>
                <span className="text-[10px] text-zinc-400">41:00:35:50</span>
              </button>
              <button
                onClick={() => setTimestampSeconds(WARP_JUMP_SECONDS)}
                className="px-2 py-2.5 bg-zinc-900 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold text-amber-300">Warp Phase</span>
                <span className="text-[10px] text-zinc-400">30:00:00:00</span>
              </button>
              <button
                onClick={() => setTimestampSeconds(PHASE3_SECONDS)}
                className="px-2 py-2.5 bg-zinc-900 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold text-cyan-300">Phase 3</span>
                <span className="text-[10px] text-zinc-400">29:23:59:59</span>
              </button>
              <button
                onClick={() => setTimestampSeconds(CLIMAX_SURGE_SECONDS)}
                className="px-2 py-2.5 bg-zinc-900 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold text-purple-300">Mega Surge</span>
                <span className="text-[10px] text-zinc-400">01:00:00:01</span>
              </button>
              <button
                onClick={onResetToScreenshot}
                className="px-2 py-2.5 bg-zinc-900 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-mono transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold text-zinc-300">Thumbnail</span>
                <span className="text-[10px] text-zinc-400">41:23:59:59</span>
              </button>
            </div>
          </div>

          {/* Custom Date & Time */}
          <div className="space-y-3 p-4 bg-zinc-900/60 border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-300">
              <Calendar className="w-4 h-4 text-white/70" />
              <span>Target Date & Time</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={handleDateChange}
                className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/60"
              />
              <button
                onClick={onResetToVideoStart}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset 41:00:35:50
              </button>
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-mono">
              Event Banner Title (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.eventTitle}
                onChange={(e) => onUpdateConfig({ eventTitle: e.target.value })}
                placeholder="e.g. SPECIAL PROGRAM PREMIERE"
                className="flex-1 bg-zinc-900/80 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/60"
              />
              <button
                onClick={() => onUpdateConfig({ showTitle: !config.showTitle })}
                className={`px-3 py-2 text-xs font-mono rounded-lg border transition-colors ${
                  config.showTitle
                    ? 'bg-white/20 border-white/50 text-white'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                {config.showTitle ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Visual Appearance & Theme */}
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono">
              Visual Theme & Atmosphere
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'void', label: 'Abyssal Void', sub: 'Trailer 100% 1:1', border: 'border-white/60' },
                  { id: 'gold', label: 'Primogem Gold', sub: 'Celestial warm', border: 'border-amber-400/60' },
                  { id: 'crimson', label: 'Crimson Moon', sub: 'Blood eclipse', border: 'border-rose-500/60' },
                  { id: 'cyan', label: 'Matrix Cyan', sub: 'Cyber energy', border: 'border-cyan-400/60' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateConfig({ theme: t.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.theme === t.id
                      ? `bg-white/15 ${t.border} shadow-lg ring-1 ring-white/30`
                      : 'bg-zinc-900/50 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="font-semibold text-xs font-mono text-white">{t.label}</div>
                  <div className="text-[10px] text-zinc-400">{t.sub}</div>
                </button>
              ))}
            </div>

            {/* Display Size */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-zinc-300">Display Scale</span>
              <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg border border-white/10">
                {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateConfig({ size: s })}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded uppercase transition-colors ${
                      config.size === s
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-xl cursor-pointer">
                <span className="text-xs font-mono">Ghost Segments (LCD style)</span>
                <input
                  type="checkbox"
                  checked={config.showGhost}
                  onChange={(e) => onUpdateConfig({ showGhost: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-xl cursor-pointer">
                <span className="text-xs font-mono">Rising Vapor Dissolution</span>
                <input
                  type="checkbox"
                  checked={config.showAura}
                  onChange={(e) => onUpdateConfig({ showAura: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-xl cursor-pointer">
                <span className="text-xs font-mono">Text Labels (DAYS/HRS)</span>
                <input
                  type="checkbox"
                  checked={config.showLabels}
                  onChange={(e) => onUpdateConfig({ showLabels: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-xl cursor-pointer">
                <span className="text-xs font-mono">Teaser Watermark</span>
                <input
                  type="checkbox"
                  checked={config.showWatermark}
                  onChange={(e) => onUpdateConfig({ showWatermark: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
              </label>
            </div>

            {/* Waveform Beam Intensity */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Waveform Ripples Intensity</span>
                <span className="text-white">{Math.round(config.beamIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={config.beamIntensity}
                onChange={(e) => onUpdateConfig({ beamIntensity: parseFloat(e.target.value) })}
                className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-500">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-zinc-300">H</kbd> for Cinema Mode
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-black font-semibold text-xs font-mono rounded-lg hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
