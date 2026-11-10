import React, { useEffect, useRef } from 'react';

interface AuraCanvasProps {
  particleDensity?: number;
  showAura?: boolean;
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
  jitter: number;
}

export const AuraCanvas: React.FC<AuraCanvasProps> = ({
  particleDensity = 1.0,
  showAura = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Scattered cosmic background stars (from videoframe_183295_b04f7a20.png)
    const bgStars = [
      { xR: 0.14, yR: 0.28, size: 1.2, baseA: 0.4 },
      { xR: 0.29, yR: 0.16, size: 1.0, baseA: 0.35 },
      { xR: 0.38, yR: 0.24, size: 1.4, baseA: 0.5 },
      { xR: 0.46, yR: 0.12, size: 1.2, baseA: 0.3 },
      { xR: 0.67, yR: 0.33, size: 1.5, baseA: 0.6 },
      { xR: 0.72, yR: 0.18, size: 1.1, baseA: 0.45 },
      { xR: 0.82, yR: 0.24, size: 1.3, baseA: 0.4 },
      { xR: 0.94, yR: 0.19, size: 1.2, baseA: 0.35 },
      { xR: 0.31, yR: 0.66, size: 1.1, baseA: 0.4 },
      { xR: 0.65, yR: 0.74, size: 1.3, baseA: 0.5 },
    ];

    // Dissolution needles rising straight up from the countdown digits
    const needles: SmokeNeedle[] = [];
    const maxNeedles = Math.floor(80 * particleDensity);

    const spawnNeedle = () => {
      if (needles.length >= maxNeedles) return;
      const centerX = width / 2;
      const centerY = height / 2;

      // Span across the 4 digit pairs (approx 540px wide)
      const digitsSpan = Math.min(width * 0.58, 540);
      const px = centerX + (Math.random() - 0.5) * digitsSpan;
      // Start near top segments
      const py = centerY - 10 + (Math.random() - 0.5) * 30;

      needles.push({
        x: px,
        y: py,
        height: 35 + Math.random() * 70,
        width: 1.0 + Math.random() * 2.0,
        alpha: 0,
        maxAlpha: 0.25 + Math.random() * 0.6,
        life: 0,
        maxLife: 30 + Math.random() * 45,
        speed: 1.2 + Math.random() * 2.2,
        jitter: (Math.random() - 0.5) * 0.4,
      });
    };

    const render = () => {
      time += 0.035;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Fine Vertical Scanline Raster across background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.022)';
      for (let x = 0; x < width; x += 3.0) {
        ctx.fillRect(x, 0, 1.0, height);
      }

      // 2. Subtle Bottom Atmospheric Indigo Haze
      const btmHaze = ctx.createLinearGradient(0, height * 0.65, 0, height);
      btmHaze.addColorStop(0, 'rgba(0, 0, 0, 0)');
      btmHaze.addColorStop(1, 'rgba(12, 17, 30, 0.45)');
      ctx.fillStyle = btmHaze;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      // 3. Faint Background Cosmic Stars
      bgStars.forEach((star, idx) => {
        const sx = star.xR * width;
        const sy = star.yR * height;
        const pulse = 0.7 + Math.sin(time * 2.2 + idx * 1.5) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.baseA * pulse})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Center Dot-Matrix Crest / Heraldic Silhouette
      ctx.save();
      const crestAlpha = 0.095 + Math.sin(time * 0.7) * 0.02;
      const crestR = Math.min(width, height) * 0.23;

      // Soft circular radial breathing glow
      const crestGlow = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, crestR * 1.35
      );
      crestGlow.addColorStop(0, `rgba(255, 255, 255, ${crestAlpha * 1.1})`);
      crestGlow.addColorStop(0.45, `rgba(180, 195, 225, ${crestAlpha * 0.4})`);
      crestGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = crestGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, crestR * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Sharp central vertical needle ray (pierces from top to bottom)
      const needleGrad = ctx.createLinearGradient(
        centerX, centerY - crestR * 1.3,
        centerX, centerY + crestR * 1.3
      );
      needleGrad.addColorStop(0, 'rgba(255,255,255,0)');
      needleGrad.addColorStop(0.2, `rgba(255, 255, 255, ${crestAlpha * 1.4})`);
      needleGrad.addColorStop(0.5, `rgba(255, 255, 255, ${crestAlpha * 3.8})`);
      needleGrad.addColorStop(0.8, `rgba(255, 255, 255, ${crestAlpha * 1.4})`);
      needleGrad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.strokeStyle = needleGrad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - crestR * 1.3);
      ctx.lineTo(centerX, centerY + crestR * 1.3);
      ctx.stroke();

      // Central brilliant core highlight glint
      ctx.fillStyle = `rgba(255, 255, 255, ${crestAlpha * 3.2})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Dot-Matrix Crest Grid Columns
      const colSpacing = 3.8;
      const dotSpacing = 3.4;
      const crestCols = Math.floor((crestR * 1.8) / colSpacing);
      const startCrestX = centerX - (crestCols * colSpacing) / 2;

      for (let c = 0; c < crestCols; c++) {
        const cx = startCrestX + c * colSpacing;
        const normDistX = Math.abs(cx - centerX) / (crestR * 0.9);
        if (normDistX > 1) continue;

        const wingLobe = Math.sin(normDistX * Math.PI) * 0.35;
        const baseH = Math.sqrt(Math.max(0, 1 - normDistX * normDistX));
        const colHeight = (baseH * 0.75 + wingLobe) * crestR * 1.7;

        const numDots = Math.floor(colHeight / dotSpacing);
        const startDotY = centerY - colHeight / 2;

        for (let d = 0; d < numDots; d++) {
          const dy = startDotY + d * dotSpacing;
          const normDistY = Math.abs(dy - centerY) / (colHeight / 2);

          const dAlpha = crestAlpha * (1 - normDistX * 0.7) * (1 - normDistY * 0.45) * 0.85;
          ctx.fillStyle = `rgba(200, 215, 240, ${dAlpha})`;
          ctx.fillRect(cx, dy, 1.4, 1.8);
        }
      }
      ctx.restore();

      // 5. Bottom Left & Right Atmospheric Graphics (From vf_bottom_left.png & vf_bottom_right.png)
      // Bottom horizontal baseline with transparent 4-pointed stars
      const btmY = height * 0.91;

      // Bottom left transparent stars
      const drawTransStar = (x: number, y: number, r: number, alpha: number) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        const inner = r * 0.16;
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x, y - inner, x + inner, y);
        ctx.quadraticCurveTo(x + inner, y, x + r, y);
        ctx.quadraticCurveTo(x + inner, y, x, y + inner);
        ctx.quadraticCurveTo(x, y + inner, x - inner, y);
        ctx.quadraticCurveTo(x - inner, y, x - r, y);
        ctx.quadraticCurveTo(x - inner, y, x, y - inner);
        ctx.closePath();
        ctx.fill();
      };

      // Faint transparent stars resting in bottom corners
      drawTransStar(width * 0.05, btmY, 45, 0.045);
      drawTransStar(width * 0.15, btmY, 32, 0.035);
      drawTransStar(width * 0.78, btmY, 32, 0.035);
      drawTransStar(width * 0.88, btmY, 52, 0.05);

      // Bottom Left: Animated matrix ladder (double diamond arrows >>) at X ≈ 5%
      const ladderX = width * 0.055;
      for (let i = 0; i < 24; i++) {
        const ly = height * 0.68 + i * 11 + ((time * 15) % 11);
        if (ly < height * 0.96) {
          const lAlpha = 0.2 + (Math.sin(time * 3 + i) * 0.5 + 0.5) * 0.35;
          ctx.fillStyle = i % 2 === 0 ? `rgba(56, 189, 248, ${lAlpha})` : `rgba(236, 72, 153, ${lAlpha})`;
          ctx.fillRect(ladderX, ly, 3, 2);
          ctx.fillRect(ladderX + 4, ly, 3, 2);
        }
      }

      // Bottom Left: Chromatic blurred vertical light streak at X ≈ 14.5%
      const chStreakX = width * 0.145;
      const chStreakGrad = ctx.createLinearGradient(chStreakX, height, chStreakX, height * 0.75);
      chStreakGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      chStreakGrad.addColorStop(0.4, 'rgba(251, 146, 60, 0.35)');
      chStreakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = chStreakGrad;
      ctx.fillRect(chStreakX, height * 0.75, 4, height * 0.25);

      // Bottom Right: Solid Vertical White Pillar Bars (as seen in vf_bottom_right.png)
      // Primary white light pillar at X ≈ 84.5%
      const pillar1X = width * 0.842;
      const p1H = 240;
      const p1Grad = ctx.createLinearGradient(pillar1X, height, pillar1X, height - p1H);
      p1Grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      p1Grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
      p1Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = p1Grad;
      ctx.fillRect(pillar1X, height - p1H, 8, p1H);

      // Chromatic fringe on pillar 1 edges
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; // cyan fringe left
      ctx.fillRect(pillar1X - 2, height - p1H, 2, p1H);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.35)'; // orange fringe right
      ctx.fillRect(pillar1X + 8, height - p1H, 2, p1H);

      // Secondary white pillar at X ≈ 87.5%
      const pillar2X = width * 0.872;
      const p2H = 120;
      const p2Grad = ctx.createLinearGradient(pillar2X, height, pillar2X, height - p2H);
      p2Grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      p2Grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
      p2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = p2Grad;
      ctx.fillRect(pillar2X, height - p2H, 5, p2H);

      // Bottom Right: Vertical Dotted Matrix Squares Column at X ≈ 88.5%
      const dotColX = width * 0.885;
      for (let i = 0; i < 28; i++) {
        const dy = height - 15 - i * 10 - ((time * 25) % 10);
        if (dy > height * 0.65) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(dotColX, dy, 2, 2);
        }
      }

      // 6. Dissolution Vapor Needles Rising from the Countdown Numbers
      // In vf_digits_crop.png, tall vertical white needle streaks rise directly upwards into the void
      if (showAura) {
        if (Math.random() < 0.95) {
          spawnNeedle();
        }

        for (let i = needles.length - 1; i >= 0; i--) {
          const n = needles[i];
          n.life++;
          n.y -= n.speed;
          n.x += n.jitter + (Math.random() - 0.5) * 0.4;

          const progress = n.life / n.maxLife;
          if (progress < 0.2) {
            n.alpha = (progress / 0.2) * n.maxAlpha;
          } else {
            n.alpha = (1 - (progress - 0.2) / 0.8) * n.maxAlpha;
          }

          if (n.life >= n.maxLife) {
            needles.splice(i, 1);
            continue;
          }

          // Crisp vertical dissipation streak
          const streakH = n.height * (1 - progress * 0.2);
          const nGrad = ctx.createLinearGradient(n.x, n.y + streakH, n.x, n.y);
          nGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          nGrad.addColorStop(0.3, `rgba(255, 255, 255, ${n.alpha * 0.8})`);
          nGrad.addColorStop(0.7, `rgba(255, 255, 255, ${n.alpha})`);
          nGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = nGrad;
          ctx.lineWidth = n.width;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y + streakH);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [particleDensity, showAura]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
