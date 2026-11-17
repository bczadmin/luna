import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Music2 } from 'lucide-react';
import { SongEntry, UserProfile } from '../types/luna';
import { lunaSynth } from '../utils/musicSynth';
import { speakLunaText, stopLunaSpeech } from '../utils/speechUtils';

interface SongPlayerCardProps {
  song: SongEntry;
  profile: UserProfile;
  autoPlay?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

export const SongPlayerCard: React.FC<SongPlayerCardProps> = ({
  song,
  profile,
  autoPlay = false,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [withMusic, setWithMusic] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopLunaSpeech();
    lunaSynth.stop();
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  const startPlayback = () => {
    stopPlayback();
    setIsPlaying(true);
    onPlayStateChange?.(true);

    if (withMusic && song.chords.length > 0) {
      lunaSynth.start(song.chords, song.tempoBpm);
    }

    if (song.vocalAudioDataUrl) {
      const audio = new Audio(song.vocalAudioDataUrl);
      audioRef.current = audio;
      audio.onended = () => {
        lunaSynth.stop();
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };
      audio.onerror = () => {
        // Fallback to browser TTS if WAV fails
        speakLunaText(song.lyrics, {
          rate: 0.88,
          pitch: 1.12,
          voiceURI: profile.ttsVoiceURI,
          onEnd: () => {
            lunaSynth.stop();
            setIsPlaying(false);
            onPlayStateChange?.(false);
          },
          onError: () => {
            lunaSynth.stop();
            setIsPlaying(false);
            onPlayStateChange?.(false);
          },
        });
      };
      audio.play().catch(() => {
        // Browser autoplay blocked or audio error -> user can tap Play
        lunaSynth.stop();
        setIsPlaying(false);
        onPlayStateChange?.(false);
      });
    } else {
      speakLunaText(song.lyrics, {
        rate: 0.88,
        pitch: 1.12,
        voiceURI: profile.ttsVoiceURI,
        onEnd: () => {
          lunaSynth.stop();
          setIsPlaying(false);
          onPlayStateChange?.(false);
        },
        onError: () => {
          lunaSynth.stop();
          setIsPlaying(false);
          onPlayStateChange?.(false);
        },
      });
    }
  };

  useEffect(() => {
    if (autoPlay) {
      startPlayback();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      lunaSynth.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  return (
    <div className="mt-2.5 p-4 rounded-2xl bg-[#1A1025]/90 border border-[#FF4D8D]/35 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-white flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#FF4D8D] shrink-0" />
            <span className="truncate">{song.title}</span>
          </p>
          <p className="text-[11px] text-[#C4B5D9] font-mono-tabular mt-0.5">
            {song.mood} · {song.tempoBpm} BPM ·{' '}
            {song.chords.map((c) => c.name).join(' – ')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setWithMusic((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
              withMusic
                ? 'bg-[#B57BFF]/20 border-[#B57BFF]/45 text-white'
                : 'bg-white/[0.04] border-white/10 text-[#C4B5D9]'
            }`}
          >
            {withMusic ? 'Music ON' : 'Vocal Only'}
          </button>

          <button
            type="button"
            onClick={isPlaying ? stopPlayback : startPlayback}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-[#FF5C5C] text-white'
                : 'bg-[#FF4D8D] hover:bg-[#FF6BA8] text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Sing</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#E9E1F5] leading-relaxed whitespace-pre-wrap border-t border-white/[0.07] pt-3">
        {song.lyrics}
      </p>
    </div>
  );
};
