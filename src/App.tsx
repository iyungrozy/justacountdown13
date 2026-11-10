/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Clapperboard,
  Clock,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  USER_IMAGE_START_SECONDS,
  TRAILER_VIDEO_SECONDS,
  SCREENSHOT_TOTAL_SECONDS,
  WARP_JUMP_SECONDS,
} from './utils/time';
import { soundEngine } from './utils/sound';
import { HoyoverseCountdownCanvas, CountdownTheme } from './components/HoyoverseCountdownCanvas';
import { SettingsModal, CountdownConfig } from './components/SettingsModal';

export default function App() {
  const [mode, setMode] = useState<'cinematic' | 'live'>('cinematic');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWhiteout, setIsWhiteout] = useState<boolean>(false);
  const [showFloatingControls, setShowFloatingControls] = useState<boolean>(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleResetToStart = useCallback(() => {
    soundEngine.playGlitch();
    setIsWhiteout(false);
    setConfig((prev) => ({
      ...prev,
      targetTimestamp: Date.now() + USER_IMAGE_START_SECONDS * 1000,
    }));
    soundEngine.startAIAmbient();
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (isWhiteout) {
      handleResetToStart();
      return;
    }
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsMuted(false);
      soundEngine.setMuted(false);
      soundEngine.startAIAmbient();
    }
  }, [hasInteracted, isWhiteout, handleResetToStart]);

  const [config, setConfig] = useState<CountdownConfig>({
    eventTitle: 'VERSION 7.2 SPECIAL PREVIEW',
    showTitle: false,
    targetTimestamp: Date.now() + USER_IMAGE_START_SECONDS * 1000,
    theme: 'void',
    size: 'lg',
    showLabels: false,
    showGhost: true,
    showAura: true,
    beamIntensity: 1.0,
    particleDensity: 1.0,
    isStopwatchMode: false,
    stopwatchDurationSec: USER_IMAGE_START_SECONDS,
    showWatermark: false,
  });

  const handleUpdateConfig = useCallback((updated: Partial<CountdownConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  // Handle mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Mouse activity shows unobtrusive floating controls for 3s then fades away cleanly
  const handleMouseMove = () => {
    setShowFloatingControls(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setShowFloatingControls(false);
    }, 3000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        setMode((prev) => (prev === 'cinematic' ? 'live' : 'cinematic'));
      } else if (e.key === 's' || e.key === 'S') {
        setIsSettingsOpen((prev) => !prev);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetToStart();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowFloatingControls(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute, toggleFullscreen, handleResetToStart]);

  // Play full trailer sequence with sound
  const handlePlayTrailerSequence = useCallback(() => {
    soundEngine.playTrailerSequenceFromStart();
    setIsMuted(false);
    setMode('cinematic');
    handleUpdateConfig({
      targetTimestamp: Date.now() + USER_IMAGE_START_SECONDS * 1000,
    });
  }, [handleUpdateConfig]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a10] select-none font-mono"
      onMouseMove={handleMouseMove}
      onClick={handleUserInteraction}
    >
      {/* 1. Combined 1:1 Canvas Engine with Ascending Absorption & Glitch Bottom */}
      <HoyoverseCountdownCanvas
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isPaused={isPaused}
        mode={mode}
        targetTimestamp={config.targetTimestamp}
        theme={config.theme}
        absorptionIntensity={config.particleDensity}
        onWhiteoutChange={setIsWhiteout}
        onResetCountdown={handleResetToStart}
      />

      {/* Subtle AI World Reset Audio Indicator (auto-fades upon click) */}
      {!hasInteracted && isMuted && !isWhiteout && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleUserInteraction();
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-black/75 hover:bg-black/90 border border-white/20 rounded-full backdrop-blur-md text-[11px] text-zinc-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all shadow-2xl animate-pulse"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere to activate AI World Reset audio & ticks</span>
        </div>
      )}

      {/* Ghost Minimalist Reset Button on Full Whiteout (visible softly only on mouse move, preserving pure white void) */}
      {isWhiteout && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-700 ${
            showFloatingControls ? 'opacity-85' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleResetToStart();
          }}
        >
          <button className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black rounded-full border border-zinc-300/80 font-mono text-xs tracking-widest shadow-lg transition-all flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REBIRTH SAMSARA // RESET COUNTDOWN (R)</span>
          </button>
        </div>
      )}

      {/* 2. Sleek Floating Controls (Appears on mouse move, auto-fades for 100% clean screen) */}
      <div
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 bg-black/80 border border-white/15 rounded-full backdrop-blur-md shadow-2xl transition-opacity duration-500 ${
          !isWhiteout && (showFloatingControls || isSettingsOpen) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mode Toggle: Cinematic vs Live */}
        <button
          onClick={() => setMode((m) => (m === 'cinematic' ? 'live' : 'cinematic'))}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Switch Mode: Cinematic Warp Animation / Real-Time Live (L)"
          aria-label="Switch Mode"
        >
          {mode === 'cinematic' ? (
            <>
              <Clapperboard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cinematic</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Real-Time</span>
            </>
          )}
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* Pause / Resume */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
          aria-label={isPaused ? 'Resume Countdown' : 'Pause Countdown'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        {/* Reset to 02:00:35:48 */}
        <button
          onClick={() => {
            soundEngine.playGlitch();
            handleUpdateConfig({
              targetTimestamp: Date.now() + USER_IMAGE_START_SECONDS * 1000,
            });
          }}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Reset to Reference Image 02:00:35:48 (R)"
          aria-label="Reset Target"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Settings / Calibration Modal */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Open Settings & Presets (S)"
          aria-label="Open Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-300" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Toggle Fullscreen (F)"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. Settings Calibration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={(updated) => {
          handleUpdateConfig(updated);
          if (updated.targetTimestamp !== undefined) {
            setMode('live');
          }
        }}
        onResetToVideoStart={() => {
          setMode('cinematic');
          handleUpdateConfig({
            targetTimestamp: Date.now() + TRAILER_VIDEO_SECONDS * 1000,
          });
        }}
        onResetToScreenshot={() => {
          setMode('cinematic');
          handleUpdateConfig({
            targetTimestamp: Date.now() + SCREENSHOT_TOTAL_SECONDS * 1000,
          });
        }}
        onPlayTrailerSequence={handlePlayTrailerSequence}
      />
    </div>
  );
}
