/**
 * Background score.
 *
 * YouTube is the only music source. Browsers refuse audible autoplay until the
 * page has received a user gesture, so `unlock()` is wired to the first click,
 * tap or key press. There is deliberately no fallback track.
 */

export const DEFAULT_MUSIC_VIDEO_ID = '72sAni41XTg';
export const MUSIC_REFERENCE_URL = `https://www.youtube.com/watch?v=${DEFAULT_MUSIC_VIDEO_ID}`;

interface YtPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  loadVideoById: (videoId: string) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

interface YtEvent {
  target: YtPlayer;
  data?: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: string | HTMLElement,
        config: Record<string, unknown>,
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

class MusicEngine {
  private player: YtPlayer | null = null;
  private ready = false;
  private apiPromise: Promise<void> | null = null;
  private started = false;
  private volume = 0.35;
  private muted = false;
  private videoId = DEFAULT_MUSIC_VIDEO_ID;

  /** Boot the YouTube player as soon as the host element exists. */
  public start(): void {
    if (this.started) return;
    this.started = true;
    this.ensurePlayer();
  }

  public setVolume(volume: number): void {
    this.volume = clamp01(volume);
    this.apply();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.apply();
  }

  public setVideoId(videoId: string): void {
    const next = (videoId || '').trim();
    if (next === this.videoId) return;
    this.videoId = next;
    // Only reload on a complete id, otherwise every keystroke restarts the
    // stream while the field is being edited.
    if (this.player && this.ready && /^[A-Za-z0-9_-]{11}$/.test(next)) {
      try {
        this.player.loadVideoById(next);
      } catch {
        /* invalid ids are handled by the player */
      }
    }
  }

  /** Call from a real user gesture: this is what makes audible playback legal. */
  public unlock(): void {
    if (!this.started) this.start();
    if (!this.player || !this.ready) return;
    try {
      if (this.muted) {
        this.player.mute();
        return;
      }
      this.player.unMute();
      this.player.playVideo();
    } catch {
      /* ignore */
    }
  }

  private apply(): void {
    if (!this.player || !this.ready) return;
    try {
      this.player.setVolume(Math.round(this.volume * 100));
      if (this.muted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    } catch {
      /* ignore */
    }
  }

  private ensurePlayer(): void {
    if (this.player) return;
    const host = document.getElementById('yt-audio-host');
    if (!host) return;

    this.loadApi()
      .then(() => {
        if (!window.YT || this.player) return;

        this.player = new window.YT.Player(host, {
          videoId: this.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: this.videoId,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: YtEvent) => {
              this.ready = true;
              try {
                event.target.setVolume(Math.round(this.volume * 100));
                if (this.muted) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  event.target.playVideo();
                }
              } catch {
                /* ignore */
              }
            },
            onStateChange: (event: YtEvent) => {
              // Some browsers ignore playerVars.loop; keep the score seamless.
              if (event.data === 0) {
                try {
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                } catch {
                  /* ignore */
                }
              }
            },
            onError: () => {
              // No fallback by design: the score is YouTube or nothing.
            },
          },
        });
      })
      .catch(() => {
        /* YouTube unavailable — the countdown still runs silently */
      });
  }

  private loadApi(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (this.apiPromise) return this.apiPromise;

    this.apiPromise = new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('YouTube IFrame API timed out')),
        10000,
      );

      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        window.clearTimeout(timeout);
        resolve();
      };

      if (!document.getElementById('yt-iframe-api')) {
        const script = document.createElement('script');
        script.id = 'yt-iframe-api';
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error('YouTube IFrame API failed to load'));
        };
        document.head.appendChild(script);
      }
    });

    return this.apiPromise;
  }
}

export const musicEngine = new MusicEngine();
