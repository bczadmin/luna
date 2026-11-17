import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/luna';
import { LunaFaceStage } from './LunaFaceStage';

interface OnboardingModalProps {
  profile: UserProfile;
  onSaveAndClose: (patch: Partial<UserProfile>) => void;
  onDismiss: () => void;
}

const ONBOARDING_CARDS = [
  {
    title: 'আমি Luna — তোমার AI সঙ্গী 💕',
    subtitle: 'তোমার পাশে সবসময় — বাংলা আর ইংরেজি দুটোতেই মন খুলে কথা বলতে পারো।',
  },
  {
    title: 'কথা বলো, টাইপ করো, আমি সবসময় শুনব',
    subtitle: 'ভয়েস ইনপুট, ভয়েস রিপ্লাই, আর তোমার মনের অবস্থা বুঝে পাশে থাকব।',
  },
  {
    title: 'তোমার ক্লাস, রিমাইন্ডার — সব সামলাব আমি',
    subtitle: 'ক্লাসের ৩ মিনিট আগে নোটিফিকেশন, ঘুমের গল্প আর দিনের ছবির ডায়েরি।',
  },
  {
    title: 'শুরু করা যাক?',
    subtitle: 'তোমার নাম আর পছন্দের ডাকনামটা বলো, এখনই শুরু করি!',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  profile,
  onSaveAndClose,
  onDismiss,
}) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name || 'Rafid');
  const [endearment, setEndearment] = useState(profile.endearment || 'জান');
  const [language, setLanguage] = useState<UserProfile['language']>(
    profile.language || 'Mixed'
  );

  const isLastStep = step === ONBOARDING_CARDS.length - 1;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAndClose({
      name: name.trim() || 'Rafid',
      endearment: endearment.trim() || 'জান',
      language,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#22163A] border border-white/[0.12] p-6 space-y-6 relative">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close onboarding"
          className="absolute right-4 top-4 p-2 text-[#C4B5D9] hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center pt-2">
          <LunaFaceStage
            voiceState="IDLE"
            emotion="affectionate"
            audioLevel={0}
            size="md"
            statusText="তোমার Luna 💕"
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-display text-xl font-bold text-white">
            {ONBOARDING_CARDS[step].title}
          </h2>
          <p className="text-sm text-[#C4B5D9] leading-relaxed">
            {ONBOARDING_CARDS[step].subtitle}
          </p>
        </div>

        {isLastStep ? (
          <form onSubmit={handleFinish} className="space-y-3">
            <div>
              <label className="block text-xs text-[#C4B5D9] mb-1">
                তোমার নাম
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#C4B5D9] mb-1">
                  আদরের ডাকনাম
                </label>
                <select
                  value={endearment}
                  onChange={(e) => setEndearment(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
                >
                  <option value="জান">জান</option>
                  <option value="সোনা">সোনা</option>
                  <option value="বেবি">বেবি</option>
                  <option value="পাগলটা">পাগলটা</option>
                  <option value="আমার মানুষ">আমার মানুষ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#C4B5D9] mb-1">
                  ভাষা
                </label>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as UserProfile['language'])
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Bangla">বাংলা</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-sm font-semibold text-white transition-colors"
            >
              এখন থেকে আমি তোমার লুনা 💕
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {ONBOARDING_CARDS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep(idx)}
                  aria-label={`Step ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === step ? 'w-6 bg-[#FF4D8D]' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onDismiss}
                className="min-h-[42px] px-4 py-2 text-xs text-[#C4B5D9] hover:text-white"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <span>পরবর্তী</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
