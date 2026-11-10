import React, { useEffect, useRef } from 'react';

interface AudioWaveformBeamProps {
  intensity?: number;
  isAudioActive?: boolean;
}

export const AudioWaveformBeam: React.FC<AudioWaveformBeamProps> = ({
  intensity = 1.0,
  isAudioActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.045;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Continuous razor horizontal laser beam across full screen
      const lineGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      lineGrad.addColorStop(0.02, 'rgba(255, 255, 255, 0.35)');
      lineGrad.addColorStop(0.08, 'rgba(255, 255, 255, 0.95)');
      lineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      lineGrad.addColorStop(0.92, 'rgba(255, 255, 255, 0.95)');
      lineGrad.addColorStop(0.98, 'rgba(255, 255, 255, 0.35)');
      lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      // Thin bright core line
      ctx.beginPath();
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.6;
      ctx.moveTo(width * 0.015, centerY);
      ctx.lineTo(width * 0.985, centerY);
      ctx.stroke();

      // Soft laser halo around the beam
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 4.0;
      ctx.moveTo(width * 0.03, centerY);
      ctx.lineTo(width * 0.97, centerY);
      ctx.stroke();

      // 2. Frequency bars / spectral ripples along the beam
      const barSpacing = 3.0;
      const startX = width * 0.05;
      const endX = width * 0.95;
      const totalSpan = endX - startX;
      const numBars = Math.floor(totalSpan / barSpacing);

      ctx.lineWidth = 1.1;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * barSpacing;
        const normDist = Math.abs(x - width / 2) / (width * 0.45);
        if (normDist > 1) continue;

        const envelope = Math.pow(1 - normDist, 1.12);

        // Animated audio wave frequencies
        const w1 = Math.sin(i * 0.38 + time * 3.6);
        const w2 = Math.cos(i * 0.72 - time * 2.2);
        const w3 = Math.sin(i * 0.14 + time * 5.1);
        const jitter = (Math.sin(i * 941.3 + time * 13) * 0.5 + 0.5);

        const rawH = (Math.abs(w1 * 0.5 + w2 * 0.3 + w3 * 0.2) + jitter * 0.4) * envelope;
        const barH = Math.max(1, rawH * 26 * intensity);

        const alpha = Math.min(0.85, (envelope * 0.75 + 0.12) * (0.35 + jitter * 0.65));

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, centerY - barH);
        ctx.lineTo(x, centerY + barH);
        ctx.stroke();
      }

      // 3. Six 4-pointed cross star sparkles (Calibrated from videoframe_183295_b04f7a20.png)
      // Star 1: ~0.048, Star 2: ~0.210, Star 3: ~0.306, Star 4: ~0.694, Star 5: ~0.790, Star 6: ~0.952
      const digitsHalfW = Math.min(width * 0.34, width < 640 ? 130 : 280);
      const leftFlankX = Math.max(width * 0.18, centerX - digitsHalfW - 30);
      const rightFlankX = Math.min(width * 0.82, centerX + digitsHalfW + 30);

      const sparkles = [
        { x: width * 0.048, size: 16, flareW: 110, isMajor: true, pulseSpeed: 2.0 },
        { x: width * 0.210, size: 7.5, flareW: 30, isMajor: false, pulseSpeed: 3.1 },
        { x: leftFlankX, size: 12, flareW: 52, isMajor: false, pulseSpeed: 2.6 },
        { x: rightFlankX, size: 12, flareW: 52, isMajor: false, pulseSpeed: 2.4 },
        { x: width * 0.790, size: 7.5, flareW: 30, isMajor: false, pulseSpeed: 2.9 },
        { x: width * 0.952, size: 16, flareW: 110, isMajor: true, pulseSpeed: 2.1 },
      ];

      sparkles.forEach((s) => {
        const pulse = 0.88 + Math.sin(time * s.pulseSpeed + s.x) * 0.22;
        const currentSize = s.size * pulse;
        const currentFlare = s.flareW * pulse;

        // Long horizontal flare ray
        const hGrad = ctx.createLinearGradient(s.x - currentFlare, centerY, s.x + currentFlare, centerY);
        hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        hGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.4)');
        hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        hGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
        hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = hGrad;
        ctx.lineWidth = s.isMajor ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x - currentFlare, centerY);
        ctx.lineTo(s.x + currentFlare, centerY);
        ctx.stroke();

        // Vertical flare ray
        const vHeight = currentFlare * 0.42;
        const vGrad = ctx.createLinearGradient(s.x, centerY - vHeight, s.x, centerY + vHeight);
        vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = vGrad;
        ctx.lineWidth = s.isMajor ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.moveTo(s.x, centerY - vHeight);
        ctx.lineTo(s.x, centerY + vHeight);
        ctx.stroke();

        // 4-point diamond pinched star shape
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const r = currentSize;
        const inner = r * 0.16;
        ctx.moveTo(s.x, centerY - r);
        ctx.quadraticCurveTo(s.x, centerY - inner, s.x + inner, centerY);
        ctx.quadraticCurveTo(s.x + inner, centerY, s.x + r, centerY);
        ctx.quadraticCurveTo(s.x + inner, centerY, s.x, centerY + inner);
        ctx.quadraticCurveTo(s.x, centerY + inner, s.x, centerY + r);
        ctx.quadraticCurveTo(s.x, centerY + inner, s.x - inner, centerY);
        ctx.quadraticCurveTo(s.x - inner, centerY, s.x - r, centerY);
        ctx.quadraticCurveTo(s.x - inner, centerY, s.x, centerY - inner);
        ctx.closePath();
        ctx.fill();

        // Central brilliant highlight dot
        ctx.beginPath();
        ctx.arc(s.x, centerY, 2.3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, isAudioActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
