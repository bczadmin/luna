import React, { useState } from 'react';
import { Music2, Sparkles, Trash2 } from 'lucide-react';
import { SongEntry, UserProfile } from '../types/luna';
import { SongPlayerCard } from './SongPlayerCard';

interface MusicStudioViewProps {
  profile: UserProfile;
  songs: SongEntry[];
  onAddSong: (song: Omit<SongEntry, 'id' | 'createdAt'>) => SongEntry;
  onDeleteSong: (id: string) => void;
}

const PRESET_TOPICS = [
  'রোমান্টিক বাংলা ভালোবাসার গান',
  'বৃষ্টির সন্ধ্যায় শান্ত মেলোডি',
  'মন ভালো করার খুশির গান',
  'রাতের তারা আর চাঁদ নিয়ে গান',
  'Sweet English acoustic love song',
];

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({
  profile,
  songs,
  onAddSong,
  onDeleteSong,
}) => {
  const [topic, setTopic] = useState('');
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState('');
  const [newestSongId, setNewestSongId] = useState<string | null>(null);

  const composeAndSing = async (requestedTopic: string) => {
    const cleanTopic = requestedTopic.trim() || 'রোমান্টিক বাংলা গান';
    if (composing) return;
    setComposing(true);
    setError('');

    try {
      const res = await fetch('/api/luna/sing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          language: profile.language,
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not compose song');

      const saved = onAddSong({
        title: data.title,
        mood: data.mood,
        tempoBpm: data.tempoBpm,
        lyrics: data.lyrics,
        chords: data.chords,
        vocalAudioDataUrl: data.vocalAudioDataUrl || null,
      });
      setNewestSongId(saved.id);
      setTopic('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'গান বানাতে সমস্যা হয়েছে');
    } finally {
      setComposing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Music2 className="w-6 h-6 text-[#FF4D8D]" />
          <span>Luna Music & Singing Studio</span>
        </h1>
        <p className="text-sm text-[#C4B5D9] mt-1">
          যেকোনো মুড বা বিষয়ের কথা বলো — Luna নিজের সুর আর কণ্ঠে তোমার জন্য গান গাইবে 🎵
        </p>
      </div>

      {/* Composer */}
      <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => composeAndSing(preset)}
              disabled={composing}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#FF4D8D]/20 border border-white/[0.08] text-xs text-[#C4B5D9] hover:text-white transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            composeAndSing(topic);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="কোন ধরনের গান শুনবে জান? (যেমন: আমার মন খারাপ, একটু মিষ্টি গান গাও)"
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50 focus:border-[#FF4D8D] focus:outline-none"
          />
          <button
            type="submit"
            disabled={composing}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{composing ? 'Luna সুর বাঁধছে...' : 'গান শোনাও'}</span>
          </button>
        </form>

        {error && (
          <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 p-3 rounded-xl">
            {error}
          </p>
        )}
      </div>

      {/* Songbook */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Luna&apos;s Songbook ({songs.length})
        </h2>

        {songs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#22163A]/60 border border-white/[0.07] text-center">
            <p className="text-sm text-[#C4B5D9]">
              এখনো কোনো গান গাওয়া হয়নি সোনা! ওপরে যেকোনো একটা টপিক বেছে নাও বা চ্যাটে বলো &ldquo;গান গাও&rdquo;।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.08]"
              >
                <div className="flex items-center justify-between text-xs text-[#C4B5D9]">
                  <span className="font-mono-tabular">
                    {new Date(song.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteSong(song.id)}
                    className="p-1.5 text-[#C4B5D9]/60 hover:text-[#FF5C5C]"
                    title="Delete song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <SongPlayerCard
                  song={song}
                  profile={profile}
                  autoPlay={song.id === newestSongId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
