import React, { useEffect, useState } from 'react';
import { LunaVoiceState } from '../types/luna';

export type LunaEmotion =
  | 'affectionate'
  | 'happy'
  | 'playful'
  | 'caring_sad'
  | 'sleepy'
  | 'excited';

interface LunaFaceStageProps {
  voiceState: LunaVoiceState;
  emotion: LunaEmotion;
  audioLevel: number; // 0..1 live vocal amplitude
  size?: 'sm' | 'md' | 'lg';
  statusText?: string;
  onClick?: () => void;
}

const PORTRAIT_URL = '/src/assets/images/luna_face_portrait_1794927674812.jpg';

const EMOTION_LABELS: Record<LunaEmotion, string> = {
  affectionate: 'Warm & Caring',
  happy: 'Smiling',
  playful: 'Playful',
  caring_sad: 'Empathetic',
  sleepy: 'Gentle & Calm',
  excited: 'Excited',
};

export const LunaFaceStage: React.FC<LunaFaceStageProps> = ({
  voiceState,
  emotion,
  audioLevel,
  size = 'md',
  statusText,
  onClick,
}) => {
  const [rigMode, setRigMode] = useState<'portrait' | 'animated'>('portrait');
  const [isBlinking, setIsBlinking] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [headPhase, setHeadPhase] = useState(0);

  // Natural blinking every ~3.4s
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 140);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  // Subtle organic head/breathing phase
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const loop = (now: number) => {
      setHeadPhase((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dim = size === 'lg' ? 228 : size === 'md' ? 124 : 46;
  const mouthOpen =
    voiceState === 'SPEAKING'
      ? Math.max(0.18, Math.min(1, audioLevel * 1.15 + Math.abs(Math.sin(headPhase * 10)) * 0.2))
      : voiceState === 'LISTENING'
      ? 0.08
      : 0;

  const headTiltDeg =
    voiceState === 'LISTENING'
      ? 3.2 + Math.sin(headPhase * 1.6) * 1.2
      : voiceState === 'SPEAKING'
      ? Math.sin(headPhase * 3.1) * (1.8 + audioLevel * 3.2)
      : Math.sin(headPhase * 0.9) * 1.1;

  const headScale =
    voiceState === 'SPEAKING'
      ? 1 + audioLevel * 0.035 + Math.sin(headPhase * 2) * 0.008
      : 1 + Math.sin(headPhase * 1.3) * 0.012;

  const ringColor =
    voiceState === 'LISTENING'
      ? '#FFB347'
      : voiceState === 'SPEAKING'
      ? '#FF4D8D'
      : voiceState === 'PROCESSING'
      ? '#B57BFF'
      : voiceState === 'ERROR'
      ? '#FF5C5C'
      : '#FF6BA8';

  if (size === 'sm') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Open Luna voice stage"
        style={{ width: dim, height: dim }}
        className="relative rounded-full overflow-hidden border-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D8D]"
      >
        <div
          style={{
            borderColor: ringColor,
            transform: `scale(${headScale})`,
          }}
          className="w-full h-full rounded-full overflow-hidden transition-transform duration-150"
        >
          {!portraitFailed ? (
            <img
              src={PORTRAIT_URL}
              alt="Luna"
              referrerPolicy="no-referrer"
              onError={() => setPortraitFailed(true)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF4D8D] to-[#B57BFF] flex items-center justify-center text-white font-display font-bold">
              L
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        {/* Audio-reactive ambient ring */}
        <div
          style={{
            width: dim + 22,
            height: dim + 22,
            borderColor: ringColor,
            opacity: voiceState === 'SPEAKING' ? 0.35 + audioLevel * 0.55 : 0.28,
            transform: `scale(${1 + (voiceState === 'SPEAKING' ? audioLevel * 0.14 : Math.sin(headPhase * 1.8) * 0.03)})`,
          }}
          className="absolute rounded-full border-2 transition-opacity duration-150 pointer-events-none"
        />

        {/* Secondary harmonic aura */}
        <div
          style={{
            width: dim + 38,
            height: dim + 38,
            background: `radial-gradient(circle, ${ringColor}33 0%, transparent 70%)`,
            transform: `scale(${1 + (voiceState === 'SPEAKING' ? audioLevel * 0.2 : 0.04)})`,
          }}
          className="absolute rounded-full pointer-events-none"
        />

        <button
          type="button"
          onClick={onClick}
          aria-label="Talk with Luna"
          style={{
            width: dim,
            height: dim,
            borderColor: ringColor,
            transform: `rotate(${headTiltDeg.toFixed(2)}deg) scale(${headScale.toFixed(3)})`,
          }}
          className="relative rounded-full overflow-hidden border-2 bg-[#22163A] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D8D] transition-colors"
        >
          {rigMode === 'portrait' && !portraitFailed ? (
            <>
              <img
                src={PORTRAIT_URL}
                alt="Luna"
                referrerPolicy="no-referrer"
                onError={() => setPortraitFailed(true)}
                className="w-full h-full object-cover object-top select-none"
              />
              {/* Subtle natural blink sheen & emotional rim glow */}
              {isBlinking && (
                <div className="absolute inset-0 bg-[#1A1025]/25 transition-opacity duration-75" />
              )}
              {voiceState === 'SPEAKING' && (
                <div
                  style={{ opacity: 0.12 + audioLevel * 0.28 }}
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#FF4D8D]/55 to-transparent pointer-events-none"
                />
              )}
            </>
          ) : (
            /* Expressive Live SVG Character Face Rig */
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full bg-gradient-to-b from-[#2B1B46] to-[#1A1025]"
            >
              {/* Soft back hair */}
              <ellipse cx="100" cy="108" rx="68" ry="74" fill="#180F24" />
              {/* Neck & lavender sweater */}
              <path d="M72 152 Q100 144 128 152 L145 200 L55 200 Z" fill="#A682D8" />
              <rect x="88" y="132" width="24" height="24" rx="10" fill="#E8B99B" />
              {/* Face */}
              <ellipse cx="100" cy="96" rx="46" ry="54" fill="#F2C8AE" />
              {/* Front hair bangs */}
              <path
                d="M52 92 Q54 40 100 38 Q146 40 148 92 Q132 58 100 62 Q68 58 52 92 Z"
                fill="#1D122B"
              />
              {/* Blush */}
              <ellipse
                cx="72"
                cy="108"
                rx="10"
                ry="5"
                fill="#FF6BA8"
                opacity={emotion === 'happy' || emotion === 'playful' ? 0.36 : 0.2}
              />
              <ellipse
                cx="128"
                cy="108"
                rx="10"
                ry="5"
                fill="#FF6BA8"
                opacity={emotion === 'happy' || emotion === 'playful' ? 0.36 : 0.2}
              />
              {/* Eyebrows */}
              <path
                d={
                  emotion === 'caring_sad'
                    ? 'M68 79 Q78 82 86 76'
                    : emotion === 'playful'
                    ? 'M68 78 Q78 73 86 78'
                    : 'M68 79 Q78 74 86 78'
                }
                stroke="#221433"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={
                  emotion === 'caring_sad'
                    ? 'M114 76 Q122 82 132 79'
                    : emotion === 'playful'
                    ? 'M114 75 Q122 69 132 75'
                    : 'M114 78 Q122 74 132 79'
                }
                stroke="#221433"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Eyes (blink & sleepy aware) */}
              {isBlinking || emotion === 'sleepy' ? (
                <>
                  <path
                    d="M69 92 Q78 96 87 92"
                    stroke="#221433"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M113 92 Q122 96 131 92"
                    stroke="#221433"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </>
              ) : (
                <>
                  <ellipse cx="78" cy="92" rx="7.5" ry="8.5" fill="#1E132B" />
                  <circle cx="80.5" cy="89.5" r="2.5" fill="#FFFFFF" />
                  <ellipse cx="122" cy="92" rx="7.5" ry="8.5" fill="#1E132B" />
                  <circle cx="124.5" cy="89.5" r="2.5" fill="#FFFFFF" />
                </>
              )}
              {/* Nose */}
              <path
                d="M99 100 Q101 107 98 109"
                stroke="#C99679"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lip-synced Mouth */}
              {voiceState === 'SPEAKING' ? (
                <ellipse
                  cx="100"
                  cy="122"
                  rx={8 + mouthOpen * 4}
                  ry={2.5 + mouthOpen * 7.5}
                  fill="#9E3B59"
                  stroke="#D96B8C"
                  strokeWidth="1.5"
                />
              ) : emotion === 'caring_sad' ? (
                <path
                  d="M90 123 Q100 119 110 123"
                  stroke="#B85A76"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path
                  d="M88 120 Q100 129 112 120"
                  stroke="#C45C7B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          )}
        </button>

        {/* Live Voice Waveform Bars when speaking/listening */}
        {(voiceState === 'SPEAKING' || voiceState === 'LISTENING') && (
          <div className="absolute -bottom-2 px-2.5 py-1 rounded-full bg-[#1A1025]/95 border border-white/15 flex items-center gap-1">
            {[0.6, 1.0, 0.75, 0.9, 0.55].map((mul, idx) => {
              const barH =
                voiceState === 'SPEAKING'
                  ? 4 + Math.round((audioLevel * 12 + Math.abs(Math.sin(headPhase * 11 + idx)) * 5) * mul)
                  : 4 + Math.round(Math.abs(Math.sin(headPhase * 7 + idx)) * 9 * mul);
              return (
                <span
                  key={idx}
                  style={{ height: barH, backgroundColor: ringColor }}
                  className="w-1 rounded-full transition-all duration-75"
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-medium text-[#C4B5D9]">
          {statusText || EMOTION_LABELS[emotion]}
        </p>
        {size === 'lg' && (
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setRigMode('portrait')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                rigMode === 'portrait' ? 'bg-[#FF4D8D] text-white' : 'text-[#C4B5D9]'
              }`}
            >
              Real Portrait
            </button>
            <button
              type="button"
              onClick={() => setRigMode('animated')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                rigMode === 'animated' ? 'bg-[#FF4D8D] text-white' : 'text-[#C4B5D9]'
              }`}
            >
              Animated Face
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
