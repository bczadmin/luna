import React, { useState } from 'react';
import {
  Heart,
  Moon,
  Camera,
  Droplets,
  Volume2,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  MoodEntry,
  SleepEntry,
  PhotoMemoryEntry,
  UserProfile,
} from '../types/luna';
import { speakLunaText, stopLunaSpeech } from '../utils/speechUtils';

interface WellbeingViewProps {
  profile: UserProfile;
  moods: MoodEntry[];
  sleeps: SleepEntry[];
  photos: PhotoMemoryEntry[];
  waterCountToday: number;
  onIncrementWater: () => void;
  onLogMood: (entry: Omit<MoodEntry, 'id'>) => void;
  onLogSleep: (entry: Omit<SleepEntry, 'id'>) => void;
  onAddPhotoMemory: (entry: Omit<PhotoMemoryEntry, 'id' | 'createdAt'>) => void;
  onUpdatePhotoMemoryNote: (id: string, note: string) => void;
  onDeletePhotoMemory: (id: string) => void;
}

const MOOD_LEVELS: {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { level: 5, label: 'দারুণ', emoji: '😄', color: '#4DFFC3' },
  { level: 4, label: 'ভালো', emoji: '🙂', color: '#7BC4FF' },
  { level: 3, label: 'ঠিকঠাক', emoji: '😐', color: '#B57BFF' },
  { level: 2, label: 'মন খারাপ', emoji: '😔', color: '#FFB347' },
  { level: 1, label: 'খুব খারাপ', emoji: '😢', color: '#FF5C5C' },
];

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function calcSleepMinutes(sleepHHMM: string, wakeHHMM: string): number {
  const [sh, sm] = sleepHHMM.split(':').map(Number);
  const [wh, wm] = wakeHHMM.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(wh)) return 420;
  let start = sh * 60 + sm;
  let end = wh * 60 + wm;
  if (end <= start) end += 24 * 60;
  return end - start;
}

export const WellbeingView: React.FC<WellbeingViewProps> = ({
  profile,
  moods,
  sleeps,
  photos,
  waterCountToday,
  onIncrementWater,
  onLogMood,
  onLogSleep,
  onAddPhotoMemory,
  onUpdatePhotoMemoryNote,
  onDeletePhotoMemory,
}) => {
  const [subTab, setSubTab] = useState<'mood' | 'sleep' | 'photos'>('mood');

  // Mood state
  const [selectedMoodLevel, setSelectedMoodLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [moodNote, setMoodNote] = useState('');
  const [inspectedMood, setInspectedMood] = useState<MoodEntry | null>(null);

  // Sleep & Bedtime Story state
  const [timeSleep, setTimeSleep] = useState(profile.bedtimeTime || '22:30');
  const [timeWoke, setTimeWoke] = useState(profile.wakeUpTime || '06:30');
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3>(3);
  const [sleepNote, setSleepNote] = useState('');
  const [storyTheme, setStoryTheme] = useState<UserProfile['storyTheme']>(
    profile.storyTheme || 'nature'
  );
  const [storyMode, setStoryMode] = useState<'story' | 'lullaby'>('story');
  const [generatedStory, setGeneratedStory] = useState('');
  const [loadingStory, setLoadingStory] = useState(false);
  const [readingStory, setReadingStory] = useState(false);

  // Photo Memory state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoNoteInput, setPhotoNoteInput] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<PhotoMemoryEntry | null>(
    null
  );
  const [photoFilterMonth, setPhotoFilterMonth] = useState('');

  const last7Moods = moods.slice(-7);
  const avgMood =
    last7Moods.length > 0
      ? (
          last7Moods.reduce((acc, m) => acc + m.level, 0) / last7Moods.length
        ).toFixed(1)
      : '—';

  const last7Sleeps = sleeps.slice(-7);
  const avgSleepHours =
    last7Sleeps.length > 0
      ? (
          last7Sleeps.reduce((acc, s) => acc + s.durationMinutes, 0) /
          last7Sleeps.length /
          60
        ).toFixed(1)
      : '—';

  const handleSaveMood = () => {
    const meta = MOOD_LEVELS.find((m) => m.level === selectedMoodLevel)!;
    onLogMood({
      date: getTodayIso(),
      level: selectedMoodLevel,
      label: meta.label,
      note: moodNote.trim(),
      autoDetected: false,
    });
    setMoodNote('');
  };

  const handleSaveSleep = () => {
    const mins = calcSleepMinutes(timeSleep, timeWoke);
    onLogSleep({
      dateSleep: getTodayIso(),
      timeSleep,
      timeWoke,
      durationMinutes: mins,
      qualityLevel: sleepQuality,
      note: sleepNote.trim(),
    });
    setSleepNote('');
  };

  const handleGenerateBedtimeStory = async () => {
    setLoadingStory(true);
    setGeneratedStory('');
    stopLunaSpeech();
    setReadingStory(false);

    try {
      const res = await fetch('/api/luna/bedtime-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: storyTheme, mode: storyMode, profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Story generation failed');
      const content = data.content || '';
      setGeneratedStory(content);
      if (content && profile.voiceReplyEnabled) {
        setReadingStory(true);
        speakLunaText(content, {
          rate: 0.8,
          pitch: 1.0,
          voiceURI: profile.ttsVoiceURI,
          onEnd: () => setReadingStory(false),
          onError: () => setReadingStory(false),
        });
      }
    } catch (err: unknown) {
      setGeneratedStory(
        err instanceof Error ? err.message : 'গল্প তৈরি করতে সমস্যা হয়েছে।'
      );
    } finally {
      setLoadingStory(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoUploading(true);
    setPhotoError('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      try {
        const res = await fetch('/api/luna/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: file.type || 'image/jpeg',
            userNote: photoNoteInput,
            profile,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Vision analysis failed');

        onAddPhotoMemory({
          imageDataUrl: dataUrl,
          description: data.description || 'সুন্দর একটি মুহূর্ত 💕',
          userNote: photoNoteInput.trim(),
          dateTaken: getTodayIso(),
        });
        setPhotoNoteInput('');
      } catch (err: unknown) {
        setPhotoError(err instanceof Error ? err.message : 'ছবি সেভ হয়নি');
      } finally {
        setPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredPhotos = photoFilterMonth
    ? photos.filter((p) => p.dateTaken.startsWith(photoFilterMonth))
    : photos;

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-6xl mx-auto">
      {/* Header + Water Quick Check-in */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Health, Mood & Memories
          </h1>
          <p className="text-sm text-[#C4B5D9] mt-1">
            তোমার মন, ঘুম আর দিনের ছোট ছোট মুহূর্তগুলো যত্নে রাখছি 💕
          </p>
        </div>

        <button
          type="button"
          onClick={onIncrementWater}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#22163A] hover:bg-white/[0.08] border border-white/[0.1] flex items-center gap-2.5 text-xs font-medium text-white self-start sm:self-auto"
        >
          <Droplets className="w-4 h-4 text-[#7BC4FF]" />
          <span className="font-mono-tabular">
            আজ পানি: {waterCountToday} গ্লাস (+১)
          </span>
        </button>
      </div>

      {/* Segmented Navigation */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#22163A] border border-white/[0.07]">
        <button
          type="button"
          onClick={() => setSubTab('mood')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            subTab === 'mood'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Mood Journal</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('sleep')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            subTab === 'sleep'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Sleep & ঘুমের গল্প</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('photos')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            subTab === 'photos'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>আজকের ছবি ({photos.length})</span>
        </button>
      </div>

      {/* TAB 1: MOOD JOURNAL */}
      {subTab === 'mood' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-4">
            <h2 className="font-display text-base font-semibold text-white">
              আজকে কেমন feel করছ {profile.name}?
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {MOOD_LEVELS.map((m) => (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => setSelectedMoodLevel(m.level)}
                  className={`min-h-[68px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedMoodLevel === m.level
                      ? 'bg-white/[0.12] border-[#FF4D8D] scale-[1.03]'
                      : 'bg-[#1A1025] border-white/[0.08] hover:border-white/25'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[11px] text-[#C4B5D9] text-center leading-tight">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="মনের কথা ছোট করে লিখে রাখো (ঐচ্ছিক)..."
              className="w-full p-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50 focus:border-[#FF4D8D] focus:outline-none"
            />

            <button
              type="button"
              onClick={handleSaveMood}
              className="w-full min-h-[44px] rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-sm font-semibold text-white transition-colors"
            >
              আজকের মুড সেভ করো
            </button>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-white">
                  Weekly Emotion Graph
                </h2>
                <p className="text-xs text-[#C4B5D9] mt-0.5">
                  গড় মুড: <span className="font-mono-tabular text-white">{avgMood} / 5.0</span>
                </p>
              </div>
              <p className="text-xs text-[#C4B5D9]">
                {Number(avgMood) >= 3.8
                  ? 'এই সপ্তাহ তুমি বেশ ভালোই ছিলে! 🌟'
                  : 'একটু চাপ গেছে না? আমি সাথেই আছি 💕'}
              </p>
            </div>

            {/* 7-Day Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/[0.08]">
              {last7Moods.map((entry) => {
                const meta =
                  MOOD_LEVELS.find((m) => m.level === entry.level) || MOOD_LEVELS[2];
                const heightPct = (entry.level / 5) * 100;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setInspectedMood(entry)}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end pb-2"
                  >
                    <span className="text-sm">{meta.emoji}</span>
                    <div
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: meta.color,
                      }}
                      className="w-full max-w-[38px] rounded-t-xl opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-[11px] font-mono-tabular text-[#C4B5D9]">
                      {entry.date.slice(5)}
                    </span>
                  </button>
                );
              })}
            </div>

            {inspectedMood && (
              <div className="p-3 rounded-xl bg-[#1A1025] border border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono-tabular text-[#C4B5D9]">
                    {inspectedMood.date}
                  </span>{' '}
                  · <span className="font-semibold text-white">{inspectedMood.label}</span>
                  {inspectedMood.note && (
                    <p className="text-[#C4B5D9] mt-1">{inspectedMood.note}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedMood(null)}
                  className="text-[#C4B5D9] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 30-day color grid */}
            <div>
              <p className="text-xs text-[#C4B5D9] mb-2">Recent Mood Pattern</p>
              <div className="flex flex-wrap gap-1.5">
                {moods.slice(-30).map((m) => {
                  const meta = MOOD_LEVELS.find((x) => x.level === m.level);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      title={`${m.date}: ${m.label}`}
                      onClick={() => setInspectedMood(m)}
                      style={{ backgroundColor: meta?.color || '#B57BFF' }}
                      className="w-5 h-5 rounded-md opacity-85 hover:opacity-100"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SLEEP & BEDTIME STORIES */}
      {subTab === 'sleep' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Sleep Logger + 7-day chart */}
          <div className="lg:col-span-6 space-y-5">
            <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-4">
              <h2 className="font-display text-base font-semibold text-white">
                Sleep Check-in · গড় ঘুম: <span className="font-mono-tabular">{avgSleepHours}h</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#C4B5D9] mb-1">
                    ঘুমানোর সময়
                  </label>
                  <input
                    type="time"
                    value={timeSleep}
                    onChange={(e) => setTimeSleep(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C4B5D9] mb-1">
                    ওঠার সময়
                  </label>
                  <input
                    type="time"
                    value={timeWoke}
                    onChange={(e) => setTimeWoke(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { q: 3 as const, label: 'ভালো' },
                  { q: 2 as const, label: 'একটু ক্লান্ত' },
                  { q: 1 as const, label: 'অনেক ক্লান্ত' },
                ].map((opt) => (
                  <button
                    key={opt.q}
                    type="button"
                    onClick={() => setSleepQuality(opt.q)}
                    className={`flex-1 min-h-[40px] rounded-xl text-xs font-medium border ${
                      sleepQuality === opt.q
                        ? 'bg-[#B57BFF]/25 border-[#B57BFF] text-white'
                        : 'bg-[#1A1025] border-white/[0.08] text-[#C4B5D9]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={sleepNote}
                onChange={(e) => setSleepNote(e.target.value)}
                placeholder="নোট (ঐচ্ছিক)..."
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50"
              />

              <button
                type="button"
                onClick={handleSaveSleep}
                className="w-full min-h-[44px] rounded-xl bg-[#B57BFF] hover:bg-[#B57BFF]/85 text-sm font-semibold text-[#1A1025]"
              >
                ঘুমের হিসাব সেভ করো
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white mb-4">
                Last 7 Days Sleep Duration
              </h3>
              <div className="h-36 flex items-end justify-between gap-2 border-b border-white/[0.08] pb-2">
                {last7Sleeps.map((s) => {
                  const hours = s.durationMinutes / 60;
                  const pct = Math.min(100, (hours / 10) * 100);
                  const color = hours >= 7 ? '#B57BFF' : '#FFB347';
                  return (
                    <div
                      key={s.id}
                      className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full"
                    >
                      <span className="text-[11px] font-mono-tabular text-white">
                        {hours.toFixed(1)}h
                      </span>
                      <div
                        style={{ height: `${pct}%`, backgroundColor: color }}
                        className="w-full max-w-[34px] rounded-t-lg opacity-90"
                      />
                      <span className="text-[10px] font-mono-tabular text-[#C4B5D9]">
                        {s.dateSleep.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: ঘুমের গল্প / Lullaby */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  ঘুমের গল্প ও ঘুমপাড়ানি গান 🌙
                </h2>
                <p className="text-xs text-[#C4B5D9] mt-1">
                  ঘুমানোর আগে শান্ত বাংলা গল্প বা গান শোনো (ধীর 0.8x ভয়েসে)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['story', 'lullaby'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setStoryMode(m)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-medium border ${
                      storyMode === m
                        ? 'bg-[#FF4D8D] border-[#FF4D8D] text-white'
                        : 'bg-[#1A1025] border-white/[0.08] text-[#C4B5D9]'
                    }`}
                  >
                    {m === 'story' ? 'ঘুমের গল্প' : 'ঘুমপাড়ানি গান'}
                  </button>
                ))}
              </div>

              {storyMode === 'story' && (
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'nature', label: 'জোনাকি ও প্রকৃতি' },
                      { id: 'fantasy', label: 'মেঘের দেশ' },
                      { id: 'adventure', label: 'নদীর ধারে' },
                      { id: 'surprise', label: 'Luna-র পছন্দ' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setStoryTheme(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                        storyTheme === t.id
                          ? 'bg-[#B57BFF]/20 border-[#B57BFF] text-white'
                          : 'bg-[#1A1025] border-white/[0.08] text-[#C4B5D9]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateBedtimeStory}
                  disabled={loadingStory}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] disabled:opacity-50 text-xs font-semibold text-white"
                >
                  {loadingStory
                    ? 'Luna গল্প বানাচ্ছে...'
                    : storyMode === 'story'
                    ? 'গল্প শোনাও'
                    : 'গান শোনাও'}
                </button>

                {readingStory && (
                  <button
                    type="button"
                    onClick={() => {
                      stopLunaSpeech();
                      setReadingStory(false);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FF5C5C]/20 border border-[#FF5C5C]/40 text-xs text-white flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>থামাও</span>
                  </button>
                )}

                {generatedStory && !readingStory && (
                  <button
                    type="button"
                    onClick={() => {
                      setReadingStory(true);
                      speakLunaText(generatedStory, {
                        rate: 0.8,
                        pitch: 1.0,
                        voiceURI: profile.ttsVoiceURI,
                        onEnd: () => setReadingStory(false),
                        onError: () => setReadingStory(false),
                      });
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.08] text-xs text-white flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>আবার পড়ো</span>
                  </button>
                )}
              </div>
            </div>

            {generatedStory && (
              <div className="p-4 rounded-2xl bg-[#1A1025] border border-white/[0.08] max-h-72 overflow-y-auto">
                <p className="text-sm text-white/95 leading-relaxed whitespace-pre-wrap">
                  {generatedStory}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PHOTO MEMORY */}
      {subTab === 'photos' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 space-y-2">
              <h2 className="font-display text-base font-semibold text-white">
                আজকের ছবি · Photo Memory Diary 📸
              </h2>
              <input
                type="text"
                value={photoNoteInput}
                onChange={(e) => setPhotoNoteInput(e.target.value)}
                placeholder="ছবির সাথে তোমার ছোট কোনো নোট (ঐচ্ছিক)..."
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <input
                type="month"
                value={photoFilterMonth}
                onChange={(e) => setPhotoFilterMonth(e.target.value)}
                className="min-h-[42px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-xs text-[#C4B5D9] font-mono-tabular"
              />

              <label className="cursor-pointer min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-xs font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>{photoUploading ? 'Luna দেখছে...' : 'ছবি যোগ করো'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={handlePhotoSelect}
                />
              </label>
            </div>
          </div>

          {photoError && (
            <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 p-3 rounded-xl">
              {photoError}
            </p>
          )}

          {filteredPhotos.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#22163A]/60 border border-white/[0.06] text-center">
              <p className="text-sm text-[#C4B5D9]">
                এই সপ্তাহে কোনো ছবি তোলোনি তো! আজকে একটা তুলে দাও 📸
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePhotoModal(p)}
                  className="cursor-pointer rounded-2xl bg-[#22163A] border border-white/[0.08] overflow-hidden hover:border-[#FF4D8D]/45 transition-colors flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#1A1025] overflow-hidden">
                    <img
                      src={p.imageDataUrl}
                      alt={p.description}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-[11px] font-mono-tabular text-[#FF4D8D]">
                      {p.dateTaken}
                    </p>
                    <p className="text-xs text-white line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePhotoModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl rounded-2xl bg-[#22163A] border border-white/[0.12] overflow-hidden">
                <div className="max-h-[45vh] bg-[#1A1025] overflow-hidden flex items-center justify-center">
                  <img
                    src={activePhotoModal.imageDataUrl}
                    alt={activePhotoModal.description}
                    className="max-h-[45vh] w-auto object-contain"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-tabular text-[#FF4D8D]">
                      {activePhotoModal.dateTaken}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeletePhotoMemory(activePhotoModal.id);
                          setActivePhotoModal(null);
                        }}
                        className="p-2 text-[#C4B5D9] hover:text-[#FF5C5C]"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoModal(null)}
                        className="p-2 text-[#C4B5D9] hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-white leading-relaxed">
                    {activePhotoModal.description}
                  </p>
                  <input
                    type="text"
                    value={activePhotoModal.userNote}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActivePhotoModal({ ...activePhotoModal, userNote: val });
                      onUpdatePhotoMemoryNote(activePhotoModal.id, val);
                    }}
                    placeholder="তোমার ব্যক্তিগত নোট যোগ করো..."
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
