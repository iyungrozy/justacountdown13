/**
 * Synthesised feedback for the countdown.
 *
 * The background score comes exclusively from YouTube; this engine only makes
 * the chronometric tick (escalating with the remaining time), the reset glitch
 * and the zero-point climax.
 */

function getTickTier(totalSeconds: number): number {
  if (totalSeconds > 7 * 86400) return 0;
  if (totalSeconds > 86400) return 1;
  if (totalSeconds > 6 * 3600) return 2;
  if (totalSeconds > 3600) return 3;
  if (totalSeconds > 600) return 4;
  if (totalSeconds > 60) return 5;
  return 6;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private masterLevel = 0.6;

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.masterLevel,
          this.ctx.currentTime,
        );
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    this.initContext();
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : this.masterLevel,
        this.ctx.currentTime,
        0.05,
      );
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private beep(
    at: number,
    frequency: number,
    peak: number,
    duration: number,
    type: OscillatorType = 'sine',
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.55), at + duration);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  private subThump(at: number, level: number, frequency = 72) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, at);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.55, at + 0.18);

    const peak = 0.032 + level * 0.008;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(at);
    osc.stop(at + 0.28);
  }

  private noiseClick(at: number, level: number) {
    if (!this.ctx || !this.masterGain) return;
    const length = Math.floor(this.ctx.sampleRate * 0.045);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200 + level * 380, at);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.028 + level * 0.008, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(at);
    source.stop(at + 0.06);
  }

  /**
   * One tick per displayed second. `remainingSeconds` drives how hostile it
   * sounds; `null` means "cinematic", which uses a fixed mid tension.
   */
  public playChronoPulse(remainingSeconds: number | null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const tier = remainingSeconds === null ? 3 : getTickTier(Math.max(0, remainingSeconds));
    const now = this.ctx.currentTime;

    const baseFrequency = [900, 1200, 1500, 1850, 2200, 2700, 3200][Math.min(tier, 6)];
    const peak = [0.01, 0.016, 0.024, 0.032, 0.042, 0.055, 0.07][Math.min(tier, 6)];
    const duration = 0.035 + tier * 0.008;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFrequency * 1.15, now);
    filter.Q.setValueAtTime(5.5, now);

    osc.type = tier <= 1 ? 'sine' : tier <= 3 ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(baseFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(baseFrequency * 0.34, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.04);

    if (tier >= 2) this.noiseClick(now, tier);
    if (tier >= 3) this.subThump(now, tier - 3);
    if (tier >= 6) this.beep(now + 0.12, 2600, 0.028, 0.06, 'square');

    // Heartbeat: every 2s from 10 minutes out, every second under a minute.
    if (tier >= 4) {
      const safeSeconds = Math.floor(remainingSeconds ?? 0);
      const interval = tier >= 5 ? 1 : 2;
      if (safeSeconds % interval === 0) {
        this.playHeartbeat(tier - 3);
      }
    }
  }

  private playHeartbeat(intensity = 1) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.subThump(now, intensity * 2, 62);
    this.subThump(now + 0.17, intensity, 48);
  }

  public playGlitch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      /* ignore */
    }
  }

  /**
   * Zero point: firmament collapse, shockwave and a clean reboot chord.
   */
  public playZeroClimax() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + 2.2);
      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 4.3);

      const bufferSize = this.ctx.sampleRate * 2.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(65, now + 2.8);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 3.0);

      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, now + 0.08);

        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.setValueAtTime(0.13 / (idx + 1), now + 0.08);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        bellOsc.connect(bellGain);
        bellGain.connect(this.masterGain);
        bellOsc.start(now + 0.08);
        bellOsc.stop(now + 3.9);
      });

      const swellOsc1 = this.ctx.createOscillator();
      const swellOsc2 = this.ctx.createOscillator();
      const swellFilter = this.ctx.createBiquadFilter();
      const swellGain = this.ctx.createGain();

      swellOsc1.type = 'triangle';
      swellOsc1.frequency.setValueAtTime(220, now + 1.0);
      swellOsc1.frequency.exponentialRampToValueAtTime(880, now + 3.9);

      swellOsc2.type = 'sine';
      swellOsc2.frequency.setValueAtTime(330, now + 1.0);
      swellOsc2.frequency.exponentialRampToValueAtTime(1320, now + 3.9);

      swellFilter.type = 'lowpass';
      swellFilter.frequency.setValueAtTime(350, now + 1.0);
      swellFilter.frequency.exponentialRampToValueAtTime(5500, now + 3.9);

      swellGain.gain.setValueAtTime(0, now + 1.0);
      swellGain.gain.linearRampToValueAtTime(0.22, now + 3.8);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

      swellOsc1.connect(swellFilter);
      swellOsc2.connect(swellFilter);
      swellFilter.connect(swellGain);
      swellGain.connect(this.masterGain);

      swellOsc1.start(now + 1.0);
      swellOsc2.start(now + 1.0);
      swellOsc1.stop(now + 5.6);
      swellOsc2.stop(now + 5.6);
    } catch {
      /* ignore */
    }
  }
}

export const soundEngine = new SoundEngine();
