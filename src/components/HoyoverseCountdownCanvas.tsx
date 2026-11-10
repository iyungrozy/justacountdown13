import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../utils/sound';

export type CountdownTheme = 'void' | 'gold' | 'crimson' | 'cyan';

interface HoyoverseCountdownCanvasProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  mode: 'cinematic' | 'live';
  targetTimestamp: number;
  theme?: CountdownTheme;
  absorptionIntensity?: number;
  onTimeUpdate?: (days: string, hours: string, minutes: string, seconds: string) => void;
  onWhiteoutChange?: (isWhiteout: boolean) => void;
  onResetCountdown?: () => void;
}

interface SmokeNeedle {
  x: number;
  y: number;
  height: number;
  width: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  speed: number;
  drift: number;
}

interface GlitchBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  offsetX: number;
}

interface CosmicStar {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
}

interface AscendingStreamer {
  x: number;
  y: number;
  len: number;
  speed: number;
  width: number;
  alpha: number;
  colorType: 'white' | 'cyan' | 'violet';
}

interface DigitGlitchTrigger {
  frameCountdown: number;
  digitIdx: number;
}

interface ClimaxShockwave {
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  width: number;
}

export const HoyoverseCountdownCanvas: React.FC<HoyoverseCountdownCanvasProps> = ({
  isMuted,
  onToggleMute,
  isPaused,
  mode = 'cinematic',
  targetTimestamp,
  theme = 'void',
  absorptionIntensity = 1.0,
  onTimeUpdate,
  onWhiteoutChange,
  onResetCountdown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const animTimeRef = useRef<{ t0: number; isRunning: boolean }>({
    t0: performance.now(),
    isRunning: true,
  });

  const hasPlayedClimaxAudioRef = useRef<boolean>(false);
  const lastSecondRef = useRef<string>('');

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;

    const W = 1920;
    const H = 1080;

    // Responsive fit keeping 16:9 aspect ratio centered
    const fit = () => {
      const s = Math.min(window.innerWidth / W, window.innerHeight / H);
      cv.style.transform = `scale(${s}) translate(-50%, -50%)`;
      cv.style.left = '50%';
      cv.style.top = '50%';
    };

    fit();
    window.addEventListener('resize', fit);

    const R = (a: number, b: number) => a + Math.random() * (b - a);
    const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

    // Theme palette mappings
    const themePalettes = {
      void: {
        glow: 'rgba(230,235,255,.95)',
        segmentActive: 'rgba(242,246,255,.96)',
        segmentStroke: 'rgba(110,120,140,.9)',
        flameColor: 'rgba(230,238,255,',
        starGlow: '#ffffff',
        accentCyan: 'rgba(56, 189, 248,',
        accentMagenta: 'rgba(236, 72, 153,',
        accentOrange: 'rgba(251, 146, 60,',
      },
      gold: {
        glow: 'rgba(255,225,120,.95)',
        segmentActive: 'rgba(255,240,180,.96)',
        segmentStroke: 'rgba(160,135,70,.9)',
        flameColor: 'rgba(255,230,150,',
        starGlow: '#ffeaa0',
        accentCyan: 'rgba(250, 204, 21,',
        accentMagenta: 'rgba(249, 115, 22,',
        accentOrange: 'rgba(253, 224, 71,',
      },
      crimson: {
        glow: 'rgba(255,100,110,.95)',
        segmentActive: 'rgba(255,180,185,.96)',
        segmentStroke: 'rgba(160,60,70,.9)',
        flameColor: 'rgba(255,140,150,',
        starGlow: '#ff7b7b',
        accentCyan: 'rgba(244, 63, 94,',
        accentMagenta: 'rgba(190, 18, 60,',
        accentOrange: 'rgba(251, 113, 133,',
      },
      cyan: {
        glow: 'rgba(100,240,255,.95)',
        segmentActive: 'rgba(200,250,255,.96)',
        segmentStroke: 'rgba(40,130,160,.9)',
        flameColor: 'rgba(140,240,255,',
        starGlow: '#a5f3fc',
        accentCyan: 'rgba(34, 211, 238,',
        accentMagenta: 'rgba(99, 102, 241,',
        accentOrange: 'rgba(56, 189, 248,',
      },
    };

    const currentPalette = themePalettes[theme] || themePalettes.void;

    // Background gradients
    const bgTop = g.createRadialGradient(960, -100, 0, 960, -100, 950);
    bgTop.addColorStop(0, '#464552');
    bgTop.addColorStop(0.42, '#282734');
    bgTop.addColorStop(1, '#0e0e14');

    const bgBot = g.createLinearGradient(0, 560, 0, 1080);
    bgBot.addColorStop(0, 'rgba(18, 30, 62, 0)');
    bgBot.addColorStop(0.65, 'rgba(24, 42, 92, 0.42)');
    bgBot.addColorStop(1, 'rgba(14, 22, 52, 0.75)');

    const cg = g.createRadialGradient(960, 540, 0, 960, 540, 420);
    cg.addColorStop(0, 'rgba(55,55,70,.45)');
    cg.addColorStop(1, 'rgba(0,0,0,0)');

    const dc = g.createRadialGradient(945, 525, 300, 945, 525, 420);
    dc.addColorStop(0, 'rgba(0,0,0,0)');
    dc.addColorStop(1, 'rgba(5,5,10,.35)');

    const rg = g.createLinearGradient(545, 0, 1345, 0);
    rg.addColorStop(0, 'rgba(120,60,60,.0)');
    rg.addColorStop(0.2, 'rgba(150,70,60,.45)');
    rg.addColorStop(0.4, 'rgba(190,120,70,.55)');
    rg.addColorStop(0.55, 'rgba(150,130,110,.5)');
    rg.addColorStop(0.75, 'rgba(80,100,160,.45)');
    rg.addColorStop(1, 'rgba(60,60,120,0)');

    const lg = g.createLinearGradient(0, 410, 0, 800);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(0.5, 'rgba(255,255,255,.5)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');

    const vGrad = g.createRadialGradient(960, 540, 500, 960, 540, 1150);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(0,0,0,.45)');

    // 1. Cosmic Stars Twinkling
    const stars: CosmicStar[] = Array.from({ length: 320 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.15 + 0.3,
      a: Math.random() * 0.55 + 0.15,
      p: Math.random() * 6.28,
    }));

    // 2. Ascending Light Streamers ("TERSERET KE ATAS" - Upward Dragging Light Beams)
    // Continually streaming upwards from bottom into the atmosphere
    const streamers: AscendingStreamer[] = [];
    const numStreamers = 110;
    for (let i = 0; i < numStreamers; i++) {
      const colRand = Math.random();
      streamers.push({
        x: Math.random() * W,
        y: R(650, 1150),
        len: R(70, 320),
        speed: R(2.2, 5.8), // Smooth upward drag
        width: Math.random() < 0.2 ? R(2.0, 3.2) : R(1.0, 1.8),
        alpha: R(0.2, 0.75),
        colorType: colRand < 0.6 ? 'white' : colRand < 0.85 ? 'cyan' : 'violet',
      });
    }

    // 3. Ethereal Dissolution Smoke Needles Rising from Numbers
    const needles: SmokeNeedle[] = [];
    const maxNeedles = Math.floor(80 * absorptionIntensity);

    const spawnNeedleAt = (x: number, y: number, hMult = 1.0, speedMult = 1.0) => {
      if (needles.length >= maxNeedles + 30) return;
      needles.push({
        x,
        y,
        height: R(35, 110) * hMult,
        width: R(1.0, 2.2),
        alpha: 0,
        maxAlpha: R(0.4, 0.95),
        life: 0,
        maxLife: Math.floor(R(45, 90)),
        speed: R(0.9, 1.9) * speedMult,
        drift: (Math.random() - 0.5) * 0.35,
      });
    };

    const DX = [700, 744, 843, 887, 985, 1029, 1127, 1171];
    const DY = 510;
    const colonX1 = (744 + 42 + 843) / 2;
    const colonX2 = (887 + 42 + 985) / 2;
    const colonX3 = (1029 + 42 + 1127) / 2;
    const colonY = DY + 68 / 2;

    const spawnNeedle = () => {
      if (needles.length >= maxNeedles) return;
      const digitIdx = Math.floor(Math.random() * 8);
      const px = DX[digitIdx] + R(0, 42);
      const py = DY + R(-8, 25);
      spawnNeedleAt(px, py, 1.0);
    };

    // 4. Background Streaks
    const streaks: { x: number; y0: number; y1: number; a: number; w: number; ph: number }[] = [];
    for (let i = 0; i < 95; i++) {
      const s = Math.random();
      streaks.push({
        x: s < 0.45 ? R(20, 640) : s < 0.9 ? R(1290, 1900) : R(640, 1290),
        y0: R(160, 520),
        y1: R(700, 1030),
        a: R(0.04, 0.24),
        w: Math.random() < 0.25 ? 2 : 1,
        ph: R(0, 6),
      });
    }

    // 5. Cosmic Dust
    const dust: { x: number; y: number; r: number; a: number; ph: number }[] = [];
    for (let i = 0; i < 80; i++) {
      dust.push({
        x: R(0, W),
        y: R(0, H),
        r: R(0.5, 1.8),
        a: R(0.2, 0.85),
        ph: R(0, 6),
      });
    }

    // 6. Dotted vertical lines
    const dots = [
      [25, 705, 930],
      [55, 710, 820],
      [128, 710, 920],
      [225, 970, 1050],
      [60, 960, 1000],
      [1445, 890, 990],
      [1510, 870, 1040],
      [1665, 740, 1050],
      [1842, 820, 1050],
      [1860, 710, 900],
      [1265, 940, 1050],
    ];

    // 7-segment display logic and geometry
    const SEG: Record<number, string> = {
      0: 'abcdef',
      1: 'bc',
      2: 'abged',
      3: 'abgcd',
      4: 'fgbc',
      5: 'afgcd',
      6: 'afgedc',
      7: 'abc',
      8: 'abcdefg',
      9: 'abcdfg',
    };
    const dw = 42;
    const dh = 68;
    const t = 9;

    const hs = (x: number, y: number, l: number) => [
      [x, y + t / 2],
      [x + t / 2, y],
      [x + l - t / 2, y],
      [x + l, y + t / 2],
      [x + l - t / 2, y + t],
      [x + t / 2, y + t],
    ];
    const vs = (x: number, y: number, l: number) => [
      [x + t / 2, y],
      [x + t, y + t / 2],
      [x + t, y + l - t / 2],
      [x + t / 2, y + l],
      [x, y + l - t / 2],
      [x, y + t / 2],
    ];

    const P: Record<string, number[][]> = {
      a: hs(0, 0, dw),
      g: hs(0, dh / 2 - t / 2, dw),
      d: hs(0, dh - t, dw),
      f: vs(0, 0, dh / 2 + t / 2),
      b: vs(dw - t, 0, dh / 2 + t / 2),
      e: vs(0, dh / 2 - t / 2, dh / 2 + t / 2),
      c: vs(dw - t, dh / 2 - t / 2, dh / 2 + t / 2),
    };

    // Track digit values to trigger MEGA transition effects when changed
    const lastDigitsVal: number[] = [-1, -1, -1, -1, -1, -1, -1, -1];
    const digitGlitches: DigitGlitchTrigger[] = [];

    // MEGA Digit Drawing Function: Crisp, beveled, solid, with kinetic chromatic surge on change!
    function drawMegaDigit(digitIdx: number, n: number, x: number, y: number) {
      if (!g) return;

      // Check if digit changed: trigger MEGA kinetic glitch & upward vapor surge!
      if (lastDigitsVal[digitIdx] !== -1 && lastDigitsVal[digitIdx] !== n) {
        digitGlitches.push({
          frameCountdown: 5, // 5 frames of mega chromatic glitch
          digitIdx,
        });

        // Fire an upward eruption of ethereal dissolution needles!
        for (let k = 0; k < 5; k++) {
          spawnNeedleAt(x + R(0, dw), y + R(-10, 20), R(1.3, 2.0), R(1.6, 2.5));
        }
      }
      lastDigitsVal[digitIdx] = n;

      const activeGlitch = digitGlitches.find((dg) => dg.digitIdx === digitIdx);
      const isGlitching = !!activeGlitch;
      const activeSegs = SEG[n] || '';

      const drawSegmentsAt = (offsetX: number, offsetY: number, colorStyle: string, shadowB = 14) => {
        g.save();
        g.translate(x + offsetX, y + offsetY);
        g.shadowColor = currentPalette.glow;
        g.shadowBlur = shadowB;
        g.fillStyle = colorStyle;

        for (const k in P) {
          if (activeSegs.includes(k)) {
            g.beginPath();
            P[k].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
            g.closePath();
            g.fill();
          } else {
            g.fillStyle = 'rgba(255,255,255,.03)';
            g.beginPath();
            P[k].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
            g.closePath();
            g.fill();
            g.fillStyle = colorStyle;
          }
        }
        g.restore();
      };

      if (isGlitching) {
        // 1. Chromatic Cyan Fringe
        drawSegmentsAt(-3.5, 0, `${currentPalette.accentCyan} 0.75)`, 22);
        // 2. Chromatic Magenta Fringe
        drawSegmentsAt(3.5, 0, `${currentPalette.accentMagenta} 0.75)`, 22);
        // 3. Supercharged White Core
        drawSegmentsAt(0, 0, 'rgba(255,255,255,1)', 28);

        // 4. Horizontal Holographic Scan Slash
        g.save();
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.shadowColor = '#fff';
        g.shadowBlur = 14;
        const slashY = y + (activeGlitch.frameCountdown * 13) % dh;
        g.fillRect(x - 6, slashY, dw + 12, 2.5);
        g.restore();
      } else {
        // Standard Solid Pristine Segment Render
        g.save();
        g.translate(x, y);

        for (const k in P) {
          const on = activeSegs.includes(k);
          g.beginPath();
          P[k].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
          g.closePath();

          if (on) {
            g.shadowColor = currentPalette.glow;
            g.shadowBlur = 14;
            g.fillStyle = currentPalette.segmentActive;
            g.fill();
            g.shadowBlur = 0;

            g.strokeStyle = currentPalette.segmentStroke;
            g.lineWidth = 1;
            g.stroke();

            // Bevel cut highlight
            g.save();
            g.clip();
            g.fillStyle = 'rgba(95,105,125,.4)';
            g.fillRect(2.5, 2.5, dw, dh);
            g.restore();
          } else {
            g.fillStyle = 'rgba(255,255,255,.03)';
            g.fill();
          }
        }
        g.restore();
      }
    }

    // 3x3 LED matrix square dots with glow
    function drawColon(cx: number, cy: number) {
      if (!g) return;
      g.save();
      g.shadowColor = currentPalette.glow;
      g.shadowBlur = 10;
      g.fillStyle = currentPalette.segmentActive;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          g.fillRect(cx - 4 + c * 3, cy - 17 + r * 3, 2, 2);
          g.fillRect(cx - 4 + c * 3, cy + 11 + r * 3, 2, 2);
        }
      }
      g.restore();
    }

    // Transparent 4-pointed stars resting on bottom baseline
    function drawBaselineStar(x: number, y: number, r: number, alpha: number) {
      if (!g) return;
      g.save();
      g.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      g.beginPath();
      const inner = r * 0.16;
      g.moveTo(x, y - r);
      g.quadraticCurveTo(x, y - inner, x + inner, y);
      g.quadraticCurveTo(x + inner, y, x + r, y);
      g.quadraticCurveTo(x + inner, y, x, y + inner);
      g.quadraticCurveTo(x, y + inner, x - inner, y);
      g.quadraticCurveTo(x - inner, y, x - r, y);
      g.quadraticCurveTo(x - inner, y, x, y - inner);
      g.closePath();
      g.fill();
      g.restore();
    }

    function sparkle(x: number, y: number, s: number, a: number) {
      if (!g) return;
      g.save();
      g.translate(x, y);
      g.globalAlpha = a;
      g.shadowColor = currentPalette.starGlow;
      g.shadowBlur = 14;
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(0, -s);
      g.quadraticCurveTo(s * 0.1, -s * 0.1, s, 0);
      g.quadraticCurveTo(s * 0.1, s * 0.1, 0, s);
      g.quadraticCurveTo(-s * 0.1, s * 0.1, -s, 0);
      g.quadraticCurveTo(-s * 0.1, -s * 0.1, 0, -s);
      g.fill();
      g.restore();
    }

    const ticks: { o: number; h: number }[] = [];
    for (let i = 0; i < 50; i++) {
      ticks.push({ o: Math.random(), h: R(4, 24) });
    }

    function hline(x0: number, x1: number, dir: number, tm: number) {
      if (!g) return;
      g.fillStyle = 'rgba(255,255,255,.95)';
      g.fillRect(x0, 539, x1 - x0, 1.5);
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 14; i++) {
        const x = dir > 0 ? x0 + (x1 - x0) * (0.1 + i * 0.045) : x1 - (x1 - x0) * (0.1 + i * 0.045);
        g.fillRect(x, 537 + Math.sin(i * 3) * 1.5, 2, 3);
      }
      const n = ticks.length;
      const inner = dir > 0 ? x1 : x0;
      for (let i = 0; i < n; i++) {
        const d = i / n;
        const x = inner - dir * d * 210 + Math.sin(i * 7) * 3;
        const hh = ticks[i].h * (1 - d) * (0.6 + 0.4 * Math.sin(tm * 4.5 + i));
        g.fillStyle = `rgba(255,255,255,${0.65 * (1 - d)})`;
        g.fillRect(x, 540 - hh, 1.2, hh * 2);
      }
    }

    // Glitch Blocks for Lower Zone
    const glitchBlocks: GlitchBlock[] = [];
    const spawnGlitchBlock = () => {
      if (glitchBlocks.length > 20) return;
      const x = R(50, W - 150);
      const y = R(720, 1040);
      const w = R(25, 130);
      const h = R(3, 14);
      const color =
        Math.random() < 0.5 ? `${currentPalette.accentCyan} 0.55)` : `${currentPalette.accentMagenta} 0.55)`;

      glitchBlocks.push({
        x,
        y,
        w,
        h,
        alpha: R(0.4, 0.8),
        color,
        life: 0,
        maxLife: Math.floor(R(6, 20)),
        offsetX: (Math.random() - 0.5) * 6,
      });
    };

    const A = ((2 * 60 + 0) * 60 + 35) * 60 + 48; // 02:00:35:48
    const B = ((41 * 60 + 23) * 60 + 59) * 60 + 59; // 41:23:59:59

    let animId: number;
    let lastRenderTime = 0;
    let zeroClimaxStartSec = -1;

    // Organic animated heraldic arcs state
    const arcPhases = Array.from({ length: 16 }, () => R(0, 6.28));

    // Zero Point Climax shockwaves & burst trigger
    const shockwaves: ClimaxShockwave[] = [];
    const triggerClimaxBurst = () => {
      for (let i = 0; i < 4; i++) {
        shockwaves.push({
          r: 10 + i * 45,
          maxR: 1400,
          alpha: 0.95 - i * 0.15,
          speed: 8.0 + i * 2.5,
          width: 5.0 - i * 0.8,
        });
      }
      for (let k = 0; k < 35; k++) {
        spawnNeedleAt(960 + R(-260, 260), 540 + R(-20, 20), R(1.8, 3.2), R(2.5, 4.5));
      }
    };

    const draw = (ts: number) => {
      if (ts - lastRenderTime < 22) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastRenderTime = ts;

      const tm = (ts - animTimeRef.current.t0) / 1000;
      const p = 1 - cl((tm - 1.2) / 8.0);
      const e = p * p * p;
      const q = 1 - p;

      // Decrement active digit glitch triggers
      for (let i = digitGlitches.length - 1; i >= 0; i--) {
        digitGlitches[i].frameCountdown--;
        if (digitGlitches[i].frameCountdown <= 0) {
          digitGlitches.splice(i, 1);
        }
      }

      g.clearRect(0, 0, W, H);
      g.fillStyle = '#0d0d13';
      g.fillRect(0, 0, W, H);

      g.fillStyle = bgTop;
      g.fillRect(0, 0, W, H);

      if (q > 0.01) {
        g.globalAlpha = q;
        g.fillStyle = bgBot;
        g.fillRect(0, 560, W, 520);
        g.globalAlpha = 1;
      }

      // 1. Cosmic Stars Twinkling
      for (const st of stars) {
        const tw = 0.65 + 0.35 * Math.sin(tm * 1.8 + st.p);
        g.fillStyle = `rgba(235,239,255,${st.a * tw})`;
        g.beginPath();
        g.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        g.fill();
      }

      g.fillStyle = cg;
      g.fillRect(0, 0, W, H);

      // 2. Halo with chromatic rainbow rim
      if (p > 0) {
        g.save();
        g.globalAlpha = p;
        g.fillStyle = dc;
        g.beginPath();
        g.arc(945, 525, 400, 0, 6.3);
        g.fill();

        g.strokeStyle = rg;
        g.lineWidth = 4;
        g.shadowColor = 'rgba(180,130,100,.5)';
        g.shadowBlur = 10;
        g.beginPath();
        g.arc(945, 525, 398, 0.05 * Math.PI, 0.95 * Math.PI);
        g.stroke();
        g.restore();
      }

      // ==========================================
      // ANIMATED ORGANIC HERALDIC EMBLEM BEHIND COUNTDOWN (NON-BOXY, BREATHING)
      // ==========================================
      g.save();
      const cx = 960;
      const cy = 540;

      // Soft circular radial breathing glow
      const emblemAlpha = 0.12 + 0.03 * Math.sin(tm * 1.6);
      const eGlow = g.createRadialGradient(cx, cy, 10, cx, cy, 280);
      eGlow.addColorStop(0, `rgba(215, 225, 255, ${emblemAlpha * 1.3})`);
      eGlow.addColorStop(0.45, `rgba(160, 185, 230, ${emblemAlpha * 0.45})`);
      eGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = eGlow;
      g.beginPath();
      g.arc(cx, cy, 280, 0, Math.PI * 2);
      g.fill();

      // Organic dot-matrix raster with soft radial falloff (NO boxy clipping!)
      const dotSpacing = 4.0;
      const maxR = 210;
      for (let dy = -maxR; dy <= maxR; dy += dotSpacing) {
        for (let dx = -maxR * 0.75; dx <= maxR * 0.75; dx += dotSpacing) {
          const dist = Math.hypot(dx / (maxR * 0.75), dy / maxR);
          if (dist > 1.0) continue; // organic elliptical silhouette

          // Organic wing lobe shaping
          const lobe = Math.sin(Math.abs(dx / (maxR * 0.75)) * Math.PI) * 0.28;
          if (dist > 0.88 + lobe) continue;

          // Animated shimmer wave across dots
          const wave = Math.sin(dx * 0.045 + dy * 0.065 + tm * 1.8);
          const dotAlpha =
            (1 - dist * 0.8) *
            (0.55 + 0.45 * wave) *
            (0.18 + 0.05 * Math.sin(tm * 0.8));

          g.fillStyle = `rgba(205, 215, 240, ${dotAlpha})`;
          g.fillRect(cx + dx, cy + dy, 1.6, 1.6);
        }
      }

      // Animated curved energy arcs swirling gently
      g.lineWidth = 1.8;
      for (let i = 0; i < 14; i++) {
        const a = arcPhases[i] + tm * 0.12;
        const r = 50 + (i % 5) * 32;
        const arcA = 0.08 + 0.05 * Math.sin(tm * 1.4 + i);

        g.strokeStyle = `rgba(195, 210, 240, ${arcA})`;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r);
        g.quadraticCurveTo(
          cx + Math.cos(a + 1) * r,
          cy + Math.sin(a + 1) * r * 1.25,
          cx + Math.cos(a + 2) * r * 0.5,
          cy + Math.sin(a + 2) * r * 0.8
        );
        g.stroke();
      }

      // Concentric delicate rings
      g.strokeStyle = 'rgba(205, 220, 255, 0.085)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, 64, 0, Math.PI * 2);
      g.arc(cx, cy, 140, 0, Math.PI * 2);
      g.stroke();

      g.restore();

      // Central sharp vertical laser needle
      g.fillStyle = lg;
      g.fillRect(959, 410, 2, 390);

      // Streaks
      for (const s of streaks) {
        g.fillStyle = `rgba(200,210,240,${s.a * q * (0.75 + 0.25 * Math.sin(tm * 1.5 + s.ph))})`;
        g.fillRect(s.x, s.y0, s.w, s.y1 - s.y0);
      }

      // Cosmic Dust
      for (const d of dust) {
        g.fillStyle = `rgba(255,255,255,${d.a * (0.6 + 0.4 * Math.sin(tm * 1.2 + d.ph))})`;
        g.beginPath();
        g.arc(d.x, d.y, d.r, 0, 6.3);
        g.fill();
      }

      // Dotted verticals
      g.fillStyle = 'rgba(210,220,240,.45)';
      for (const [x, a, b] of dots) {
        for (let y = a; y < b; y += 8) {
          g.globalAlpha = p * 0.55 * (1 - (Math.abs(y - (a + b) / 2) / ((b - a) / 2)) * 0.5);
          g.fillRect(x, y, 1.5, 2.5);
        }
      }
      g.globalAlpha = 1;

      // ==========================================
      // "TERSERET KE ATAS" - ASCENDING LIGHT STREAMERS AT BOTTOM
      // (Streamers continuously dragged / pulled upwards into the atmosphere)
      // ==========================================
      if (q > 0.01) {
        g.save();
        g.globalAlpha = q;

        // Draw and update upward-moving streamers
        for (const st of streamers) {
          st.y -= st.speed; // Move continuously upwards!

          // Reset to bottom once dragged high enough
          if (st.y + st.len < 640) {
            st.y = H + R(0, 180);
            st.x = Math.random() * W;
            st.len = R(70, 320);
            st.speed = R(2.2, 5.8);
          }

          // Gradient: Denser at bottom of streamer, fading out to 0 at top
          const strGrad = g.createLinearGradient(st.x, st.y + st.len, st.x, st.y);
          if (st.colorType === 'cyan') {
            strGrad.addColorStop(0, `${currentPalette.accentCyan} ${st.alpha * 0.6})`);
            strGrad.addColorStop(0.35, `${currentPalette.accentCyan} ${st.alpha * 0.85})`);
            strGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          } else if (st.colorType === 'violet') {
            strGrad.addColorStop(0, `${currentPalette.accentMagenta} ${st.alpha * 0.5})`);
            strGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.7)');
            strGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          } else {
            strGrad.addColorStop(0, `rgba(215, 225, 255, ${st.alpha * 0.4})`);
            strGrad.addColorStop(0.4, `rgba(240, 245, 255, ${st.alpha * 0.85})`);
            strGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }

          g.fillStyle = strGrad;
          g.fillRect(st.x - st.width / 2, st.y, st.width, st.len);
        }

        // Procedural Digital Glitch Slices
        if (Math.random() < 0.35) {
          spawnGlitchBlock();
        }

        for (let i = glitchBlocks.length - 1; i >= 0; i--) {
          const gb = glitchBlocks[i];
          gb.life++;
          const progress = gb.life / gb.maxLife;
          const currentA = gb.alpha * (1 - progress);

          g.fillStyle = gb.color;
          g.fillRect(gb.x + gb.offsetX, gb.y, gb.w, gb.h);

          // Chromatic edge slice
          g.fillStyle = `${currentPalette.accentCyan} ${currentA * 0.5})`;
          g.fillRect(gb.x + gb.offsetX - 3, gb.y, 3, gb.h);
          g.fillStyle = `${currentPalette.accentMagenta} ${currentA * 0.5})`;
          g.fillRect(gb.x + gb.offsetX + gb.w, gb.y, 3, gb.h);

          if (gb.life >= gb.maxLife) {
            glitchBlocks.splice(i, 1);
          }
        }

        // Stepping Glitch Matrix Ladder (>> chevron blocks at x ≈ 105)
        const ladderX = 105;
        for (let i = 0; i < 22; i++) {
          const ly = 730 + i * 14 + ((tm * 20) % 14);
          if (ly < 1040) {
            const lAlpha = 0.25 + (Math.sin(tm * 2 + i) * 0.5 + 0.5) * 0.45;
            g.fillStyle = i % 2 === 0 ? `${currentPalette.accentCyan} ${lAlpha})` : `${currentPalette.accentMagenta} ${lAlpha})`;
            g.fillRect(ladderX, ly, 4, 3);
            g.fillRect(ladderX + 6, ly, 4, 3);
          }
        }

        // Solid Vertical Pillars on Left & Right
        // Left Pillar at x ≈ 278
        const chStreakX = 278;
        const chStreakGrad = g.createLinearGradient(chStreakX, 1080, chStreakX, 780);
        chStreakGrad.addColorStop(0, `${currentPalette.accentCyan} 0.5)`);
        chStreakGrad.addColorStop(0.4, `${currentPalette.accentOrange} 0.4)`);
        chStreakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        g.fillStyle = chStreakGrad;
        g.fillRect(chStreakX, 780, 5, 300);

        // Right Pillar 1 at x = 1618
        const p1X = 1618;
        const p1H = 220 * (0.94 + 0.06 * Math.sin(tm * 1.5));
        const p1Grad = g.createLinearGradient(p1X, 1080, p1X, 1080 - p1H);
        p1Grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        p1Grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.45)');
        p1Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        g.save();
        g.fillStyle = p1Grad;
        g.shadowColor = 'rgba(160,185,255,.8)';
        g.shadowBlur = 10;
        g.fillRect(p1X - 4, 1080 - p1H, 8, p1H);
        g.restore();

        // Pillar 1 Chromatic edge fringe
        g.fillStyle = `${currentPalette.accentCyan} 0.45)`;
        g.fillRect(p1X - 7, 1080 - p1H, 3, p1H);
        g.fillStyle = `${currentPalette.accentOrange} 0.45)`;
        g.fillRect(p1X + 4, 1080 - p1H, 3, p1H);

        // Right Pillar 2 at x = 1687
        const p2X = 1687;
        const p2H = 160 * (0.92 + 0.08 * Math.sin(tm * 1.8));
        const p2Grad = g.createLinearGradient(p2X, 1080, p2X, 1080 - p2H);
        p2Grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        p2Grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
        p2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        g.fillStyle = p2Grad;
        g.fillRect(p2X - 3, 1080 - p2H, 6, p2H);

        // Right Pillar 3 at x = 1885
        const p3X = 1885;
        const p3H = 340;
        const p3Grad = g.createLinearGradient(p3X, 1080, p3X, 1080 - p3H);
        p3Grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        p3Grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        p3Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        g.fillStyle = p3Grad;
        g.fillRect(p3X - 8, 1080 - p3H, 16, p3H);

        // Stepping vertical matrix dots columns
        g.fillStyle = 'rgba(210,220,250,.85)';
        for (let y = 830; y < 1070; y += 8) g.fillRect(1697, y, 4, 4);
        for (let y = 795; y < 1070; y += 8) g.fillRect(1876, y, 4, 4);

        // Transparent Baseline Stars
        drawBaselineStar(95, 960, 48, 0.05);
        drawBaselineStar(240, 960, 32, 0.04);
        drawBaselineStar(1740, 960, 35, 0.04);
        drawBaselineStar(1860, 960, 55, 0.06);

        g.restore();
      }

      // Horizontal lines + sparkles
      hline(140, 655, 1, tm);
      hline(1265, 1782, -1, tm);
      const tw = 0.92 + 0.08 * Math.sin(tm * 2.2);
      for (const [x, s] of [
        [140, 18],
        [655, 20],
        [458, 10],
        [1265, 20],
        [1461, 10],
        [1782, 18],
      ]) {
        sparkle(x, 540, s * tw, 1);
      }

      // ==========================================
      // ASCENDING ABSORPTION UPWARDS FROM NUMBERS ("TERABSORB KE ATAS")
      // ==========================================
      if (Math.random() < 0.85) {
        spawnNeedle();
      }

      // Draw rising dissolution needles streaming upwards
      for (let i = needles.length - 1; i >= 0; i--) {
        const n = needles[i];
        n.life++;
        n.y -= n.speed;
        n.x += n.drift + (Math.random() - 0.5) * 0.2;

        const progress = n.life / n.maxLife;
        if (progress < 0.25) {
          n.alpha = (progress / 0.25) * n.maxAlpha;
        } else {
          n.alpha = (1 - (progress - 0.25) / 0.75) * n.maxAlpha;
        }

        if (n.life >= n.maxLife) {
          needles.splice(i, 1);
          continue;
        }

        const streakH = n.height * (1 - progress * 0.3);
        const nGrad = g.createLinearGradient(n.x, n.y + streakH, n.x, n.y);
        nGrad.addColorStop(0, `${currentPalette.flameColor} 0)`);
        nGrad.addColorStop(0.35, `${currentPalette.flameColor} ${n.alpha * 0.75})`);
        nGrad.addColorStop(0.7, `${currentPalette.flameColor} ${n.alpha})`);
        nGrad.addColorStop(1, `${currentPalette.flameColor} 0)`);

        g.strokeStyle = nGrad;
        g.lineWidth = n.width;
        g.beginPath();
        g.moveTo(n.x, n.y + streakH);
        g.lineTo(n.x, n.y);
        g.stroke();
      }

      // Timecode calculation
      let s = '02003548';
      let daysStr = '02';
      let hoursStr = '00';
      let minsStr = '35';
      let secsStr = '48';
      let isTimeZero = false;

      if (mode === 'cinematic') {
        let tot: number;
        if (p > 0) {
          tot = Math.round(A + (B - A) * (p < 1 ? e : 1));
        } else {
          const elapsedAfterWarp = Math.max(0, tm - 9.2);
          const frameTick = isPaused ? 0 : Math.floor(elapsedAfterWarp * 30);
          tot = Math.max(0, A - frameTick);
        }
        if (tot <= 0) isTimeZero = true;

        const ff = tot % 60;
        const ss = Math.floor(tot / 60) % 60;
        const mm = Math.floor(tot / 3600) % 60;
        const hh = Math.floor(tot / 216000);
        const parts = [hh, mm, ss, ff].map((v) => String(v).padStart(2, '0'));
        s = parts.join('');
        daysStr = parts[0];
        hoursStr = parts[1];
        minsStr = parts[2];
        secsStr = parts[3];
      } else {
        const diffMs = Math.max(0, targetTimestamp - Date.now());
        if (diffMs <= 0) isTimeZero = true;

        const totalSec = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        const parts = [days, hours, mins, secs].map((v) => String(v).padStart(2, '0'));
        s = parts.join('');
        daysStr = parts[0];
        hoursStr = parts[1];
        minsStr = parts[2];
        secsStr = parts[3];
      }

      if (isTimeZero) {
        if (zeroClimaxStartSec < 0) {
          zeroClimaxStartSec = tm;
          triggerClimaxBurst();
        }
        if (!hasPlayedClimaxAudioRef.current) {
          hasPlayedClimaxAudioRef.current = true;
          soundEngine.playZeroClimax();
        }
      } else {
        zeroClimaxStartSec = -1;
        hasPlayedClimaxAudioRef.current = false;
      }

      if (onTimeUpdate) {
        onTimeUpdate(daysStr, hoursStr, minsStr, secsStr);
      }

      // Trigger subtle majestic AI Chrono Tick on second change
      if (lastSecondRef.current !== secsStr && !isTimeZero) {
        lastSecondRef.current = secsStr;
        if (!isMuted) {
          soundEngine.playAITick();
        }
      }

      // ==========================================
      // CLIMAX EVENT: "RESETTING TEYVAT" -> "BUKA DUNIA BARU" -> "FULL SOLID WHITEOUT"
      // ==========================================
      let climaxTm = 0;
      let digitsAlpha = 1.0;
      let isFullWhite = false;

      if (zeroClimaxStartSec >= 0) {
        climaxTm = tm - zeroClimaxStartSec;

        // 1. Digits evaporate into energy needles and VANISH COMPLETELY within 0.75s
        digitsAlpha = Math.max(0, 1.0 - climaxTm / 0.75);
        if (climaxTm < 0.75 && Math.random() < 0.85) {
          const randD = Math.floor(Math.random() * 8);
          spawnNeedleAt(DX[randD] + R(0, dw), DY + R(-8, 20), R(1.6, 2.6), R(2.2, 4.0));
        }

        // Periodic expanding shockwave pulses
        if (Math.random() < 0.08) {
          shockwaves.push({
            r: 20,
            maxR: 1450,
            alpha: 0.92,
            speed: 12.5,
            width: 5.0,
          });
        }

        // Draw Expanding Shockwaves across full screen
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.r += sw.speed;
          const swProgress = sw.r / sw.maxR;
          const currentA = sw.alpha * (1 - swProgress);

          g.save();
          g.beginPath();
          g.arc(960, 540, sw.r, 0, Math.PI * 2);
          g.strokeStyle = `rgba(255, 255, 255, ${currentA * 0.95})`;
          g.lineWidth = sw.width * (1 - swProgress * 0.5);
          g.shadowColor = currentPalette.glow;
          g.shadowBlur = 24;
          g.stroke();

          // Chromatic aberration ring
          g.beginPath();
          g.arc(960, 540, sw.r + 4, 0, Math.PI * 2);
          g.strokeStyle = `${currentPalette.accentCyan} ${currentA * 0.5})`;
          g.lineWidth = 2.8;
          g.stroke();
          g.restore();

          if (sw.r >= sw.maxR) {
            shockwaves.splice(i, 1);
          }
        }

        // Volumetric Celestial Light Pillar
        const beamW = 44 + 20 * Math.sin(climaxTm * 3.8);
        const clBeam = g.createLinearGradient(960 - beamW, 0, 960 + beamW, 0);
        clBeam.addColorStop(0, 'rgba(255,255,255,0)');
        clBeam.addColorStop(0.3, `${currentPalette.accentCyan} 0.4)`);
        clBeam.addColorStop(0.5, `rgba(255,255,255,${0.85 + 0.15 * Math.sin(climaxTm * 6)})`);
        clBeam.addColorStop(0.7, `${currentPalette.accentMagenta} 0.4)`);
        clBeam.addColorStop(1, 'rgba(255,255,255,0)');

        g.save();
        g.fillStyle = clBeam;
        g.fillRect(960 - beamW, 0, beamW * 2, H);
        g.restore();

        // ==========================================
        // "BUKA DUNIA BARU" — CELESTIAL GENESIS PORTAL IN THE CENTER
        // ==========================================
        const portalProgress = Math.min(1.0, Math.max(0, (climaxTm - 0.25) / 2.8));
        const easePortal = portalProgress * portalProgress * (3 - 2 * portalProgress); // Smooth cubic S-curve
        const portalR = 25 + easePortal * 980;

        g.save();
        // 16 Divine Volumetric Rays of Genesis bursting 360 degrees
        for (let r = 0; r < 16; r++) {
          const angle = (r * Math.PI) / 8 + tm * 0.28;
          const rayLength = 180 + easePortal * 1450;
          const rx = 960 + Math.cos(angle) * rayLength;
          const ry = 540 + Math.sin(angle) * rayLength;
          const rayGrad = g.createLinearGradient(960, 540, rx, ry);
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          rayGrad.addColorStop(0.25, `${currentPalette.flameColor} 0.65)`);
          rayGrad.addColorStop(0.65, `${currentPalette.accentCyan} 0.35)`);
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          g.strokeStyle = rayGrad;
          g.lineWidth = 3.5 + easePortal * 12.0;
          g.beginPath();
          g.moveTo(960, 540);
          g.lineTo(rx, ry);
          g.stroke();
        }

        // Concentric Sacred Genesis Rings
        const ringRot1 = tm * 0.45;
        const ringRot2 = -tm * 0.35;
        [
          { r: 80 + easePortal * 240, rot: ringRot1, lw: 3.5, a: 0.8 },
          { r: 160 + easePortal * 460, rot: ringRot2, lw: 2.5, a: 0.65 },
          { r: 250 + easePortal * 720, rot: ringRot1, lw: 1.8, a: 0.5 },
        ].forEach((ring) => {
          g.strokeStyle = `rgba(255, 255, 255, ${ring.a})`;
          g.lineWidth = ring.lw;
          g.shadowColor = currentPalette.glow;
          g.shadowBlur = 18;
          g.beginPath();
          g.arc(960, 540, ring.r, 0, Math.PI * 2);
          g.stroke();

          // Rotating glyph ticks on the ring
          for (let k = 0; k < 12; k++) {
            const ga = ring.rot + (k * Math.PI) / 6;
            const gx1 = 960 + Math.cos(ga) * (ring.r - 8);
            const gy1 = 540 + Math.sin(ga) * (ring.r - 8);
            const gx2 = 960 + Math.cos(ga) * (ring.r + 8);
            const gy2 = 540 + Math.sin(ga) * (ring.r + 8);
            g.beginPath();
            g.moveTo(gx1, gy1);
            g.lineTo(gx2, gy2);
            g.stroke();
          }
        });

        // Blinding Central Portal Core
        const portalGrad = g.createRadialGradient(960, 540, 0, 960, 540, portalR);
        portalGrad.addColorStop(0, '#ffffff');
        portalGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.98)');
        portalGrad.addColorStop(0.55, 'rgba(240, 245, 255, 0.85)');
        portalGrad.addColorStop(0.85, `${currentPalette.flameColor} 0.5)`);
        portalGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        g.fillStyle = portalGrad;
        g.beginPath();
        g.arc(960, 540, portalR, 0, Math.PI * 2);
        g.fill();

        // Horizontal Anamorphic Genesis Flare across equator
        const flareAlpha = 0.85 + 0.15 * Math.sin(climaxTm * 6);
        const flareGrad = g.createLinearGradient(0, 540, W, 540);
        flareGrad.addColorStop(0, 'rgba(255,255,255,0)');
        flareGrad.addColorStop(0.2, `${currentPalette.accentCyan} ${flareAlpha * 0.4})`);
        flareGrad.addColorStop(0.5, `rgba(255,255,255,${flareAlpha})`);
        flareGrad.addColorStop(0.8, `${currentPalette.accentMagenta} ${flareAlpha * 0.4})`);
        flareGrad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = flareGrad;
        g.shadowColor = '#ffffff';
        g.shadowBlur = 35;
        g.fillRect(0, 536, W, 8);

        // Core Sparkle
        sparkle(960, 540, 55 + easePortal * 80, 1.0);
        g.restore();

        // ==========================================
        // MASSIVE CINEMATIC "RESETTING TEYVAT" TYPOGRAPHY
        // ==========================================
        const titleAlpha = Math.max(0, Math.min(1.0, 1 - (climaxTm - 2.6) / 1.2));
        if (titleAlpha > 0.01) {
          g.save();
          g.globalAlpha = titleAlpha;
          g.textAlign = 'center';
          g.textBaseline = 'middle';

          const titleY = 380;
          const pulseTextA = 0.9 + 0.1 * Math.sin(climaxTm * 6.0);

          // Main Title: Massive 64px Font
          g.font = '900 64px monospace';

          // Cyan Offset
          g.fillStyle = `${currentPalette.accentCyan} ${pulseTextA * 0.85})`;
          g.fillText('[  R E S E T T I N G   T E Y V A T  ]', 960 - 5, titleY);

          // Magenta Offset
          g.fillStyle = `${currentPalette.accentMagenta} ${pulseTextA * 0.85})`;
          g.fillText('[  R E S E T T I N G   T E Y V A T  ]', 960 + 5, titleY);

          // Pristine White-Hot Core
          g.fillStyle = `rgba(255, 255, 255, ${pulseTextA})`;
          g.shadowColor = '#ffffff';
          g.shadowBlur = 45;
          g.fillText('[  R E S E T T I N G   T E Y V A T  ]', 960, titleY);
          g.shadowBlur = 0;

          // Subtitle 1: 20px
          g.font = '700 20px monospace';
          g.fillStyle = `${currentPalette.accentCyan} 0.95)`;
          g.fillText('SAMSARA CYCLICAL REBOOT INITIATED • FIRMAMENT COLLAPSE: 100%', 960, titleY + 56);

          // Subtitle 2: 15px
          g.font = '600 15px monospace';
          g.fillStyle = 'rgba(230, 240, 255, 0.85)';
          g.fillText('THE GENESIS PORTAL AWAKENS // TRANSCENDING TO THE NEW WORLD', 960, titleY + 86);

          // Flanking holographic laser bars
          g.fillStyle = `${currentPalette.accentCyan} 0.75)`;
          g.fillRect(280, titleY, 180, 2.5);
          g.fillRect(1460, titleY, 180, 2.5);

          g.restore();
        }
      }

      // Draw 8 digits only if not dissolved (vanishes when 0 reached)
      if (digitsAlpha > 0.005) {
        g.save();
        g.globalAlpha = digitsAlpha * (p < 1 ? 0.94 + 0.06 * Math.random() : 1);
        for (let i = 0; i < 8; i++) {
          drawMegaDigit(i, +s[i] || 0, DX[i], DY);
        }

        // Draw colons between pairs
        drawColon(colonX1, colonY);
        drawColon(colonX2, colonY);
        drawColon(colonX3, colonY);
        g.restore();
      }

      // Vignette
      g.fillStyle = vGrad;
      g.fillRect(0, 0, W, H);

      // ==========================================
      // THE GREAT WHITEOUT: FULL SOLID PRISTINE WHITE ("BENERAN PUTIH, CUMA KOSONG GITU PUTIH DOANG")
      // ==========================================
      if (zeroClimaxStartSec >= 0) {
        const climaxTm = tm - zeroClimaxStartSec;
        if (climaxTm >= 2.2) {
          // Exponential swelling curve into pure blinding white
          const wp = Math.min(1.0, (climaxTm - 2.2) / 1.8);
          const whiteoutAlpha = wp * wp; // Accelerates smoothly to 1.0

          g.save();
          g.fillStyle = `rgba(255, 255, 255, ${whiteoutAlpha})`;
          g.fillRect(0, 0, W, H);
          g.restore();

          if (climaxTm >= 4.0) {
            isFullWhite = true;
          }
        }
      }

      if (onWhiteoutChange) {
        onWhiteoutChange(isFullWhite);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const handlePointerDown = () => {
      soundEngine.initContext();

      // If already in pure whiteout, clicking allows restarting
      if (
        zeroClimaxStartSec >= 0 &&
        (performance.now() - animTimeRef.current.t0) / 1000 - zeroClimaxStartSec >= 4.0
      ) {
        if (onResetCountdown) {
          onResetCountdown();
        }
        return;
      }

      if (isMuted) {
        onToggleMute();
      } else {
        soundEngine.startAIAmbient();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', fit);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [
    isMuted,
    onToggleMute,
    isPaused,
    mode,
    targetTimestamp,
    theme,
    absorptionIntensity,
    onTimeUpdate,
    onWhiteoutChange,
    onResetCountdown,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a10] flex items-center justify-center cursor-pointer select-none"
    >
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="block absolute origin-top-left shadow-2xl"
      />
    </div>
  );
};
