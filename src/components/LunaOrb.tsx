import React, { useEffect, useRef } from 'react';
import { LunaVoiceState } from '../types/luna';

interface LunaOrbProps {
  state: LunaVoiceState;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  label?: string;
}

const STATE_CONFIG: Record<
  LunaVoiceState,
  { core: string; outer: string; glow: string; statusText: string }
> = {
  IDLE: {
    core: '#FF4D8D',
    outer: '#B57BFF',
    glow: 'rgba(255, 77, 141, 0.28)',
    statusText: 'তোমার পাশে আছি ✨',
  },
  LISTENING: {
    core: '#FFB347',
    outer: '#FF7B54',
    glow: 'rgba(255, 179, 71, 0.36)',
    statusText: 'তোমার কথা শুনছি...',
  },
  PROCESSING: {
    core: '#B57BFF',
    outer: '#FF4D8D',
    glow: 'rgba(181, 123, 255, 0.34)',
    statusText: 'ভাবছি একটু...',
  },
  SPEAKING: {
    core: '#FF6BA8',
    outer: '#FF4D8D',
    glow: 'rgba(255, 107, 168, 0.40)',
    statusText: 'বলছি জান...',
  },
  ERROR: {
    core: '#FF5C5C',
    outer: '#B57BFF',
    glow: 'rgba(255, 92, 92, 0.35)',
    statusText: 'আরে, কী হলো এটা 😕',
  },
};

export const LunaOrb: React.FC<LunaOrbProps> = ({
  state,
  size = 'md',
  onClick,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const config = STATE_CONFIG[state];

  const pixelSize = size === 'lg' ? 210 : size === 'md' ? 116 : 44;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = pixelSize * dpr;
    canvas.height = pixelSize * dpr;
    ctx.scale(dpr, dpr);

    let rafId = 0;
    const startTime = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (now: number) => {
      const elapsed = reduceMotion ? 0 : (now - startTime) / 1000;
      ctx.clearRect(0, 0, pixelSize, pixelSize);

      const cx = pixelSize / 2;
      const cy = pixelSize / 2;
      const baseR = pixelSize * 0.31;

      const breathSpeed =
        state === 'LISTENING'
          ? 4.2
          : state === 'SPEAKING'
          ? 5.6
          : state === 'PROCESSING'
          ? 3.4
          : 1.4;
      const breathAmp =
        state === 'SPEAKING'
          ? 0.1
          : state === 'LISTENING'
          ? 0.08
          : state === 'PROCESSING'
          ? 0.05
          : 0.04;

      const pulse = 1 + Math.sin(elapsed * breathSpeed) * breathAmp;

      // Ambient radial aura
      const auraGrad = ctx.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, baseR * 1.55 * pulse);
      auraGrad.addColorStop(0, config.glow);
      auraGrad.addColorStop(1, 'rgba(26, 16, 37, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.55 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Harmonic rings for listening/speaking/processing
      if (size !== 'sm') {
        const ringCount = state === 'SPEAKING' || state === 'LISTENING' ? 2 : 1;
        for (let rIdx = 0; rIdx < ringCount; rIdx++) {
          ctx.beginPath();
          const points = 64;
          const ringBase = baseR * (1.16 + rIdx * 0.14);
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const waveAmp =
              state === 'SPEAKING'
                ? 4.5
                : state === 'LISTENING'
                ? 3.5
                : state === 'PROCESSING'
                ? 2.2
                : 1.0;
            const wave =
              Math.sin(angle * (3 + rIdx) + elapsed * (state === 'PROCESSING' ? 5 : 3.2)) *
              waveAmp;
            const radius = ringBase * pulse + wave;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle =
            rIdx === 0 ? `${config.outer}66` : `${config.core}44`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      // Main orb sphere gradient
      const offsetAngle = state === 'PROCESSING' ? elapsed * 2.4 : elapsed * 0.5;
      const gx = cx - baseR * 0.3 * Math.cos(offsetAngle);
      const gy = cy - baseR * 0.3 * Math.sin(offsetAngle);
      const coreGrad = ctx.createRadialGradient(gx, gy, baseR * 0.12, cx, cy, baseR * pulse);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.28, config.core);
      coreGrad.addColorStop(0.85, config.outer);
      coreGrad.addColorStop(1, '#22163A');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Subtle inner crescent highlight
      ctx.beginPath();
      ctx.arc(cx - baseR * 0.18, cy - baseR * 0.18, baseR * 0.42 * pulse, 0.2, Math.PI * 1.15);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = size === 'sm' ? 1.2 : 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (!reduceMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [state, pixelSize, size, config]);

  if (size === 'sm') {
    return (
      <canvas
        ref={canvasRef}
        style={{ width: pixelSize, height: pixelSize }}
        className="shrink-0"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={label || config.statusText}
        className="group relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D8D] transition-transform duration-200 active:scale-95"
      >
        <canvas
          ref={canvasRef}
          style={{ width: pixelSize, height: pixelSize }}
          className="block"
        />
      </button>
      <p className="mt-1 text-xs font-medium text-[#C4B5D9] tracking-wide">
        {label || config.statusText}
      </p>
    </div>
  );
};
