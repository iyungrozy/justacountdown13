/**
 * Full-screen countdown.
 *
 * No HUD, no settings, no pause, no reset: the digits over the teaser
 * backdrop, the YouTube score and an escalating tick, counting to the 7.2
 * deadline. Fullscreen is requested automatically; browsers only grant it on a
 * user gesture, so the first click/tap/key does it without any prompt.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_TARGET_TIMESTAMP } from './utils/time';
import { soundEngine } from './utils/sound';
import { musicEngine } from './utils/music';
import { HoyoverseCountdownCanvas } from './components/HoyoverseCountdownCanvas';

const MUSIC_VOLUME = 0.35;

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isWhiteout, setIsWhiteout] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef = useRef(isMuted);
  mutedRef.current = isMuted;

  const handleToggleMute = useCallback(() => {
    const next = !mutedRef.current;
    setIsMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.initContext();
      musicEngine.unlock();
    }
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => setShowControls(false), 3200);
  }, []);

  useEffect(() => {
    musicEngine.start();
    musicEngine.setVolume(MUSIC_VOLUME);
  }, []);

  useEffect(() => {
    musicEngine.setMuted(isMuted);
  }, [isMuted]);

  // One silent gesture does everything: unlocks the score, warms the tick
  // context and enters fullscreen. The attempt on load is best-effort because
  // browsers reject fullscreen requests made outside a user gesture.
  useEffect(() => {
    const enterFullscreen = () => {
      if (document.fullscreenElement) return;
      const root = document.documentElement;
      if (typeof root.requestFullscreen !== 'function') return;
      root.requestFullscreen().catch(() => {});
    };

    enterFullscreen();

    const onGesture = () => {
      soundEngine.initContext();
      musicEngine.unlock();
      enterFullscreen();
    };

    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    window.addEventListener('touchstart', onGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      switch (event.key.toLowerCase()) {
        case 'm':
          handleToggleMute();
          break;
        case 'h':
          setShowControls(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const controlsVisible = !isWhiteout && showControls;

  return (
    <div
      className="relative h-screen w-screen select-none overflow-hidden bg-[#0a0a10]"
      onMouseMove={revealControls}
      onPointerDown={revealControls}
    >
      <HoyoverseCountdownCanvas
        isMuted={isMuted}
        mode="live"
        targetTimestamp={DEFAULT_TARGET_TIMESTAMP}
        onWhiteoutChange={setIsWhiteout}
      />

      {/* Hidden YouTube host — the only audio source. */}
      <div
        id="yt-audio-host"
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-[120px] w-[200px] opacity-0"
      />

      <div
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/80 p-1.5 shadow-2xl backdrop-blur-md transition-opacity duration-500 ${
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          onClick={handleToggleMute}
          className="rounded-full p-1.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
          )}
        </button>
      </div>
    </div>
  );
}
