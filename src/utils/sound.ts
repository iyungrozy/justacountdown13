/**
 * Sound Engine for Ethereal Horizon Countdown
 * Generates continuous majestic AI cosmic ambient drone ("Resetting Teyvat"),
 * subtle tactical chronometric ticks, glitch surges, and cataclysmic zero-impact audio.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Continuous Majestic AI Ambient Drone ("Resetting Teyvat World Matrix")
  private isAmbientRunning: boolean = false;
  private subOsc1: OscillatorNode | null = null;
  private subOsc2: OscillatorNode | null = null;
  private subFilter: BiquadFilterNode | null = null;
  private subGain: GainNode | null = null;

  // High Ethereal AI Chime Pad
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private padGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private trailerAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.trailerAudio = new Audio('/audio/trailer_countdown_audio.mp3');
        this.trailerAudio.preload = 'auto';
        this.trailerAudio.loop = true;
      } catch {}
    }
  }

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Starts the continuous, subtle yet majestic AI Ambient Drone
   * Feels like a quantum AI supercomputer calculating the dissolution & reset of Teyvat
   */
  public startAIAmbient() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isAmbientRunning) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Deep Sub-Bass Cosmic Foundation (55Hz / A1 & 55.4Hz with slow phase beating)
      this.subFilter = this.ctx.createBiquadFilter();
      this.subFilter.type = 'lowpass';
      this.subFilter.frequency.setValueAtTime(115, now);
      this.subFilter.Q.setValueAtTime(2.8, now);

      this.subOsc1 = this.ctx.createOscillator();
      this.subOsc1.type = 'sine';
      this.subOsc1.frequency.setValueAtTime(55, now); // A1

      this.subOsc2 = this.ctx.createOscillator();
      this.subOsc2.type = 'triangle';
      this.subOsc2.frequency.setValueAtTime(55.28, now); // Slow warm chorus beat

      this.subGain = this.ctx.createGain();
      // "Tipis aja" - subtle and warm volume
      this.subGain.gain.setValueAtTime(0, now);
      this.subGain.gain.setTargetAtTime(0.18, now, 1.5);

      this.subOsc1.connect(this.subFilter);
      this.subOsc2.connect(this.subFilter);
      this.subFilter.connect(this.subGain);
      this.subGain.connect(this.masterGain);

      // 2. High Ethereal AI Choir Pad (Cosmic Firmament Chime)
      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'bandpass';
      this.padFilter.frequency.setValueAtTime(520, now);
      this.padFilter.Q.setValueAtTime(4.0, now);

      // Slow breathing LFO to sweep the filter subtly
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, now); // 12-second slow breath cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(140, now);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.padFilter.frequency);

      this.padOsc1 = this.ctx.createOscillator();
      this.padOsc1.type = 'sine';
      this.padOsc1.frequency.setValueAtTime(440, now); // A4

      this.padOsc2 = this.ctx.createOscillator();
      this.padOsc2.type = 'sine';
      this.padOsc2.frequency.setValueAtTime(659.25, now); // E5 celestial fifth

      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0, now);
      this.padGain.gain.setTargetAtTime(0.11, now, 2.0); // Soft, angelic, non-intrusive

      this.padOsc1.connect(this.padFilter);
      this.padOsc2.connect(this.padFilter);
      this.padFilter.connect(this.padGain);
      this.padGain.connect(this.masterGain);

      this.subOsc1.start(now);
      this.subOsc2.start(now);
      this.padOsc1.start(now);
      this.padOsc2.start(now);
      this.lfo.start(now);

      this.isAmbientRunning = true;
    } catch {}
  }

  public stopAIAmbient() {
    if (!this.isAmbientRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.subGain) this.subGain.gain.setTargetAtTime(0, now, 0.2);
      if (this.padGain) this.padGain.gain.setTargetAtTime(0, now, 0.2);

      setTimeout(() => {
        try {
          this.subOsc1?.stop();
          this.subOsc2?.stop();
          this.padOsc1?.stop();
          this.padOsc2?.stop();
          this.lfo?.stop();
          this.subOsc1?.disconnect();
          this.subOsc2?.disconnect();
          this.padOsc1?.disconnect();
          this.padOsc2?.disconnect();
          this.lfo?.disconnect();
          this.lfoGain?.disconnect();
          this.subFilter?.disconnect();
          this.padFilter?.disconnect();
        } catch {}
        this.isAmbientRunning = false;
      }, 250);
    } catch {
      this.isAmbientRunning = false;
    }
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    this.initContext();

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.6, now, 0.05);
    }

    if (!muted) {
      this.startAIAmbient();
      if (this.trailerAudio) {
        this.trailerAudio.muted = false;
      }
    } else {
      if (this.trailerAudio) {
        this.trailerAudio.muted = true;
      }
    }

    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Subtle tactical chronometric AI pulse (ticks down Teyvat's world clock)
   * High-tech, crystalline, quiet ("tipis aja, tapi megah")
   */
  public playAITick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(6.0, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);

      // Very subtle volume ("tipis")
      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
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

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  /**
   * Cataclysmic Singularity Sound: "RESETTING TEYVAT"
   * Deep sub-bass firmament collapse, expanding shockwave rumble, and angelic/AI reboot chord
   */
  public playZeroClimax() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Teyvat Firmament Collapse - Sub-Bass Drop (130Hz -> 24Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + 2.2);

      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 4.3);

      // 2. Resonant Shockwave Expansion (White Noise filter sweep)
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
      noiseGain.gain.setValueAtTime(0.38, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 3.0);

      // 3. Ethereal Samsara Reboot Chime Chord (A4, C#5, E5, A5, C#6)
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, now + 0.08);

        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.setValueAtTime(0.14 / (idx + 1), now + 0.08);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        bellOsc.connect(bellGain);
        bellGain.connect(this.masterGain);
        bellOsc.start(now + 0.08);
        bellOsc.stop(now + 3.9);
      });

      // 4. Genesis Portal Opening Swell & Whiteout Crescendo
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
      swellGain.gain.linearRampToValueAtTime(0.25, now + 3.8);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

      swellOsc1.connect(swellFilter);
      swellOsc2.connect(swellFilter);
      swellFilter.connect(swellGain);
      swellGain.connect(this.masterGain);

      swellOsc1.start(now + 1.0);
      swellOsc2.start(now + 1.0);
      swellOsc1.stop(now + 5.6);
      swellOsc2.stop(now + 5.6);

      // Smoothly stop the background AI ambient drone as the screen reaches pure white
      setTimeout(() => {
        this.stopAIAmbient();
      }, 4200);
    } catch {}
  }

  public playTrailerSequenceFromStart() {
    if (this.trailerAudio) {
      this.trailerAudio.currentTime = 0;
      this.trailerAudio.muted = false;
      this.isMuted = false;
      this.trailerAudio.play().catch(() => {});
    }
  }
}

export const soundEngine = new SoundEngine();
