import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, User } from 'lucide-react';
import { UserProfile } from '../types/luna';
import { speakLunaText } from '../utils/speechUtils';

interface ProfileSettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onReplayOnboarding: () => void;
}

const ENDEARMENT_OPTIONS = [
  'জান',
  'সোনা',
  'বেবি',
  'পাগলটা',
  'আমার মানুষ',
];

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onReplayOnboarding,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [customEndearment, setCustomEndearment] = useState(
    ENDEARMENT_OPTIONS.includes(profile.endearment) ? '' : profile.endearment
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProfile({ avatarDataUrl: String(reader.result || '') });
    };
    reader.readAsDataURL(file);
  };

  const previewTts = () => {
    speakLunaText(
      `হ্যালো ${profile.name}! আমি তোমার লুনা, তোমার পাশে সবসময় আছি।`,
      {
        rate: profile.ttsRate,
        pitch: profile.ttsPitch,
        voiceURI: profile.ttsVoiceURI,
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Profile & Luna Settings
          </h1>
          <p className="text-sm text-[#C4B5D9] mt-1">
            তোমার নাম, ডাকনাম, ভয়েস আর স্বাস্থ্য রিমাইন্ডার নিজের মতো সাজিয়ে নাও
          </p>
        </div>
        <button
          type="button"
          onClick={onReplayOnboarding}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-medium text-white flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D8D]" />
          <span>Welcome Tour</span>
        </button>
      </div>

      {/* Profile Section */}
      <section className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-5">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer w-16 h-16 rounded-full bg-[#1A1025] border border-white/[0.15] flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-[#C4B5D9]" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              {profile.name || 'তোমার নাম'}
            </h2>
            <p className="text-xs text-[#C4B5D9]">
              ছবি বদলাতে অ্যাভাটারে ক্লিক করো
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              তোমার নাম (Luna এই নামে ডাকবে)
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              পছন্দের ভাষা
            </label>
            <select
              value={profile.language}
              onChange={(e) =>
                onUpdateProfile({
                  language: e.target.value as UserProfile['language'],
                })
              }
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
            >
              <option value="Mixed">Mixed (Bangla + English)</option>
              <option value="Bangla">বাংলা (Primary)</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              বয়স (ঐচ্ছিক)
            </label>
            <input
              type="number"
              min={10}
              max={100}
              value={profile.age}
              onChange={(e) => onUpdateProfile({ age: e.target.value })}
              placeholder="যেমন: 21"
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              জন্মদিন (ঐচ্ছিক)
            </label>
            <input
              type="date"
              value={profile.birthday}
              onChange={(e) => onUpdateProfile({ birthday: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#C4B5D9] mb-2">
            Luna তোমাকে আদর করে কী বলে ডাকবে?
          </label>
          <div className="flex flex-wrap gap-2">
            {ENDEARMENT_OPTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setCustomEndearment('');
                  onUpdateProfile({ endearment: term });
                }}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium border ${
                  profile.endearment === term
                    ? 'bg-[#FF4D8D] border-[#FF4D8D] text-white'
                    : 'bg-[#1A1025] border-white/[0.08] text-[#C4B5D9]'
                }`}
              >
                {term}
              </button>
            ))}
            <input
              type="text"
              value={customEndearment}
              onChange={(e) => {
                setCustomEndearment(e.target.value);
                if (e.target.value.trim()) {
                  onUpdateProfile({ endearment: e.target.value.trim() });
                }
              }}
              placeholder="কাস্টম ডাকনাম..."
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-xs text-white w-36"
            />
          </div>
        </div>
      </section>

      {/* Voice & Speech Section */}
      <section className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-white">
            Voice & Speech Settings
          </h2>
          <button
            type="button"
            onClick={previewTts}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#B57BFF]/20 border border-[#B57BFF]/40 text-xs font-medium text-white flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Preview Voice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              Speech Rate: <span className="font-mono-tabular">{profile.ttsRate.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={profile.ttsRate}
              onChange={(e) =>
                onUpdateProfile({ ttsRate: Number(e.target.value) })
              }
              className="w-full accent-[#FF4D8D]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              Voice Pitch: <span className="font-mono-tabular">{profile.ttsPitch.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.7}
              max={1.4}
              step={0.02}
              value={profile.ttsPitch}
              onChange={(e) =>
                onUpdateProfile({ ttsPitch: Number(e.target.value) })
              }
              className="w-full accent-[#FF4D8D]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              Speech Recognition Language
            </label>
            <select
              value={profile.sttLanguage}
              onChange={(e) =>
                onUpdateProfile({
                  sttLanguage: e.target.value as UserProfile['sttLanguage'],
                })
              }
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
            >
              <option value="bn-BD">Bangla (bn-BD)</option>
              <option value="en-US">English (en-US)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              System TTS Voice
            </label>
            <select
              value={profile.ttsVoiceURI}
              onChange={(e) => onUpdateProfile({ ttsVoiceURI: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
            >
              <option value="">Auto (Bangla / English match)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              Wake Phrase (Android Background Mode)
            </label>
            <input
              type="text"
              value={profile.wakePhrase}
              onChange={(e) => onUpdateProfile({ wakePhrase: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
            />
          </div>
        </div>
      </section>

      {/* Health & Sleep Schedule */}
      <section className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-4">
        <h2 className="font-display text-base font-semibold text-white">
          Health & Sleep Schedule
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              পানি রিমাইন্ডার (ঘণ্টা পর পর)
            </label>
            <input
              type="number"
              min={1}
              max={8}
              value={profile.waterIntervalHours}
              onChange={(e) =>
                onUpdateProfile({ waterIntervalHours: Number(e.target.value) || 2 })
              }
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              ঘুমানোর সময়
            </label>
            <input
              type="time"
              value={profile.bedtimeTime}
              onChange={(e) => onUpdateProfile({ bedtimeTime: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#C4B5D9] mb-1.5">
              সকালে ওঠার সময়
            </label>
            <input
              type="time"
              value={profile.wakeUpTime}
              onChange={(e) => onUpdateProfile({ wakeUpTime: e.target.value })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular"
            />
          </div>
        </div>
      </section>

      {/* About Luna */}
      <section className="p-5 rounded-2xl bg-[#22163A]/60 border border-white/[0.07] space-y-1.5">
        <h2 className="font-display text-base font-semibold text-white">
          Luna · তোমার পাশে সবসময় ✨
        </h2>
        <p className="text-xs text-[#C4B5D9]">
          Bilingual Bangla & English emotionally aware AI companion. Includes full native Android Jetpack Compose Kotlin source project export.
        </p>
      </section>
    </div>
  );
};
