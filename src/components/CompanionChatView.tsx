import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Flashlight,
  Paperclip,
  Camera,
  Reply,
  Copy,
  Trash2,
  X,
  Maximize2,
  Square,
  Plus,
  BookmarkPlus,
} from 'lucide-react';
import {
  ChatMessage,
  LunaVoiceState,
  TaskItem,
  ClassRoutineEntry,
  UserProfile,
  MoodEntry,
  PhotoMemoryEntry,
  MemoryFact,
  SongEntry,
} from '../types/luna';
import { LunaFaceStage, LunaEmotion } from './LunaFaceStage';
import { SongPlayerCard } from './SongPlayerCard';
import {
  detectInputLanguage,
  speakLunaText,
  playAudioWithAnalyser,
  stopLunaSpeech,
  createBrowserSpeechRecognizer,
  SpeechRecognitionLike,
} from '../utils/speechUtils';

const VALID_EMOTIONS: LunaEmotion[] = [
  'affectionate',
  'happy',
  'playful',
  'caring_sad',
  'sleepy',
  'excited',
];

function normalizeEmotion(raw?: unknown): LunaEmotion {
  if (typeof raw === 'string' && VALID_EMOTIONS.includes(raw as LunaEmotion)) {
    return raw as LunaEmotion;
  }
  return 'affectionate';
}

interface CompanionChatViewProps {
  profile: UserProfile;
  messages: ChatMessage[];
  activeSessionId: string;
  tasks: TaskItem[];
  routines: ClassRoutineEntry[];
  memories: MemoryFact[];
  flashlightOn: boolean;
  onToggleFlashlight: (forcedState?: boolean) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onAddMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  onDeleteMessage: (id: string) => void;
  onNewSession: () => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onAddMemoryFact: (fact: string) => void;
  onLogMood: (entry: Omit<MoodEntry, 'id'>) => void;
  onAddPhotoMemory: (entry: Omit<PhotoMemoryEntry, 'id' | 'createdAt'>) => void;
  onAddSong: (song: Omit<SongEntry, 'id' | 'createdAt'>) => SongEntry;
  onTriggerBedtimeModal: () => void;
}

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function getDayNameToday(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

const QUICK_PROMPTS = [
  'একটা গান গাও 🎵',
  'আজকের ক্লাস কী?',
  'টর্চ জ্বালাও',
  'একটা মজার কথা বলো',
  'আমার রুটিন দেখাও',
  'ঘুমাতে যাচ্ছি',
];

export const CompanionChatView: React.FC<CompanionChatViewProps> = ({
  profile,
  messages,
  activeSessionId,
  tasks,
  routines,
  memories,
  flashlightOn,
  onToggleFlashlight,
  onUpdateProfile,
  onAddMessage,
  onDeleteMessage,
  onNewSession,
  onAddTask,
  onAddMemoryFact,
  onLogMood,
  onAddPhotoMemory,
  onAddSong,
  onTriggerBedtimeModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<LunaVoiceState>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [quotedMsg, setQuotedMsg] = useState<ChatMessage | null>(null);
  const [fullVoiceOpen, setFullVoiceOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [pendingPhotoSave, setPendingPhotoSave] = useState<{
    imageDataUrl: string;
    description: string;
  } | null>(null);
  const [pendingFileAttachment, setPendingFileAttachment] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<LunaEmotion>('affectionate');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const sessionMessages = messages.filter((m) => m.sessionId === activeSessionId);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognizerRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fallbackPulseRef = useRef<number | null>(null);
  const speakRequestIdRef = useRef<number>(0);

  const clearFallbackPulse = useCallback(() => {
    if (fallbackPulseRef.current !== null) {
      window.clearInterval(fallbackPulseRef.current);
      fallbackPulseRef.current = null;
    }
  }, []);

  const stopAllSpeech = useCallback(() => {
    speakRequestIdRef.current += 1;
    clearFallbackPulse();
    stopLunaSpeech();
    setAudioLevel(0);
  }, [clearFallbackPulse]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages.length, voiceState]);

  useEffect(() => {
    return () => {
      recognizerRef.current?.abort();
      clearFallbackPulse();
      stopLunaSpeech();
    };
  }, [clearFallbackPulse]);

  const detectedInputLang = detectInputLanguage(inputText);

  const speakWithBrowserFallback = useCallback(
    (text: string) => {
      clearFallbackPulse();
      setVoiceState('SPEAKING');
      setStatusMessage('বলছি জান...');
      speakLunaText(text, {
        rate: profile.ttsRate,
        pitch: Math.max(1.12, profile.ttsPitch || 1.15),
        voiceURI: profile.ttsVoiceURI,
        onStart: () => {
          setVoiceState('SPEAKING');
          clearFallbackPulse();
          fallbackPulseRef.current = window.setInterval(() => {
            setAudioLevel(0.28 + Math.random() * 0.55);
          }, 95);
        },
        onEnd: () => {
          clearFallbackPulse();
          setAudioLevel(0);
          setVoiceState('IDLE');
          setStatusMessage('');
        },
        onError: () => {
          clearFallbackPulse();
          setAudioLevel(0);
          setVoiceState('IDLE');
          setStatusMessage('');
        },
      });
    },
    [clearFallbackPulse, profile.ttsPitch, profile.ttsRate, profile.ttsVoiceURI]
  );

  const speakIfEnabled = useCallback(
    async (text: string, emotion?: LunaEmotion) => {
      if (!profile.voiceReplyEnabled) {
        setAudioLevel(0);
        setVoiceState('IDLE');
        setStatusMessage('');
        return;
      }

      const requestId = ++speakRequestIdRef.current;
      clearFallbackPulse();
      setVoiceState('SPEAKING');
      setStatusMessage('কথা বলছি জান...');

      try {
        const res = await fetch('/api/luna/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            emotion: emotion || currentEmotion,
          }),
        });
        if (requestId !== speakRequestIdRef.current) return;

        if (res.ok) {
          const data = await res.json();
          if (requestId !== speakRequestIdRef.current) return;

          if (data?.audioDataUrl) {
            playAudioWithAnalyser(data.audioDataUrl, {
              rate: profile.ttsRate,
              onAmplitude: (lvl) => setAudioLevel(lvl),
              onStart: () => setVoiceState('SPEAKING'),
              onEnd: () => {
                setAudioLevel(0);
                setVoiceState('IDLE');
                setStatusMessage('');
              },
              onError: () => {
                speakWithBrowserFallback(text);
              },
            });
            return;
          }
        }
      } catch {
        // Fall through to browser speech synthesis
      }

      if (requestId !== speakRequestIdRef.current) return;
      speakWithBrowserFallback(text);
    },
    [
      clearFallbackPulse,
      currentEmotion,
      profile.ttsRate,
      profile.voiceReplyEnabled,
      speakWithBrowserFallback,
    ]
  );

  const buildTasksSummary = useCallback(() => {
    const todayDay = getDayNameToday();
    const todayClasses = routines
      .filter((r) => r.active && r.day.toLowerCase() === todayDay.toLowerCase())
      .map((r) => `${r.timeDisplay} ${r.subject}${r.room ? ` (${r.room})` : ''}`);
    const activeTasks = tasks
      .filter((t) => t.active)
      .map((t) => `${t.title} at ${t.triggerTime} (${t.repeatPattern})`);
    return `Today (${todayDay}) classes: ${
      todayClasses.length ? todayClasses.join(', ') : 'None'
    }. Active reminders: ${activeTasks.length ? activeTasks.join('; ') : 'None'}.`;
  }, [routines, tasks]);

  const sendToLuna = useCallback(
    async (rawMessage: string, opts?: { isVoice?: boolean }) => {
      const trimmed = rawMessage.trim();
      if (!trimmed && !pendingFileAttachment) return;
      if (voiceState === 'PROCESSING') return;

      setErrorText('');
      const displayMsg = trimmed || `📎 ${pendingFileAttachment?.name}`;
      onAddMessage({
        sessionId: activeSessionId,
        sender: 'user',
        text: displayMsg,
        isVoice: opts?.isVoice,
        quotedText: quotedMsg?.text,
        attachmentName: pendingFileAttachment?.name,
      });

      const attachedFile = pendingFileAttachment;
      setInputText('');
      setQuotedMsg(null);
      setPendingFileAttachment(null);
      setVoiceState('PROCESSING');
      setStatusMessage('ভাবছি একটু...');

      try {
        const historyPayload = sessionMessages.slice(-14).map((m) => ({
          role: m.sender === 'luna' ? 'model' : 'user',
          text: m.text,
        }));

        const res = await fetch('/api/luna/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: quotedMsg
              ? `[Replying to: "${quotedMsg.text}"]\n${trimmed || 'এই ফাইলটা দেখো তো'}`
              : trimmed || 'এই ফাইলটা একটু দেখো তো জান',
            history: historyPayload,
            profile,
            memories: memories.map((m) => m.fact),
            tasksSummary: buildTasksSummary(),
            fileContext: attachedFile?.content || '',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server error while reaching Luna');
        }

        const replyText: string =
          data.reply || `হুম ${profile.name}, বলো ${profile.endearment} — আমি শুনছি 💕`;
        const nextEmotion = normalizeEmotion(data.emotion);
        setCurrentEmotion(nextEmotion);

        onAddMessage({
          sessionId: activeSessionId,
          sender: 'luna',
          text: replyText,
        });

        if (data.flashlightAction === 'ON') {
          onToggleFlashlight(true);
        } else if (data.flashlightAction === 'OFF') {
          onToggleFlashlight(false);
        }

        if (data.detectedMoodLevel >= 1 && data.detectedMoodLevel <= 5) {
          onLogMood({
            date: getTodayIso(),
            level: data.detectedMoodLevel,
            label: data.detectedMoodLabel || 'ঠিকঠাক',
            note: trimmed.slice(0, 80),
            autoDetected: true,
          });
        }

        if (data.memoryFact && typeof data.memoryFact === 'string' && data.memoryFact.trim()) {
          onAddMemoryFact(data.memoryFact.trim());
        }

        if (
          data.extractedTaskTitle &&
          typeof data.extractedTaskTitle === 'string' &&
          data.extractedTaskTitle.trim()
        ) {
          onAddTask({
            title: data.extractedTaskTitle.trim(),
            type:
              data.extractedTaskType && data.extractedTaskType !== 'NONE'
                ? data.extractedTaskType
                : 'ONE_TIME',
            triggerTime: data.extractedTaskTime || '18:00',
            repeatPattern:
              data.extractedTaskType === 'RECURRING' ? 'Daily' : 'Once',
            notes: 'কথোপকথন থেকে Luna সেভ করেছে',
            active: true,
          });
          onAddMessage({
            sessionId: activeSessionId,
            sender: 'system',
            text: `রিমাইন্ডার সেভ হয়েছে: ${data.extractedTaskTitle} (${data.extractedTaskTime || 'নির্ধারিত সময়'})`,
          });
        }

        if (data.sleepAction === 'BEDTIME') {
          onTriggerBedtimeModal();
        }

        if (data.singAction === 'SING') {
          setStatusMessage('সুর বাঁধছি জান... 🎵');
          try {
            const singRes = await fetch('/api/luna/sing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic: data.singTopic || trimmed,
                language: profile.language,
                profile,
              }),
            });
            const songData = await singRes.json();
            if (singRes.ok) {
              const savedSong = onAddSong({
                title: songData.title,
                mood: songData.mood,
                tempoBpm: songData.tempoBpm,
                lyrics: songData.lyrics,
                chords: songData.chords,
                vocalAudioDataUrl: songData.vocalAudioDataUrl || null,
              });
              onAddMessage({
                sessionId: activeSessionId,
                sender: 'luna',
                text: `শোনো ${profile.name}, শুধু তোমার জন্য গাইছি 💕`,
                song: savedSong,
              });
              setVoiceState('IDLE');
              setStatusMessage('');
              return;
            }
          } catch {
            // Fall through to standard reply
          }
        }

        speakIfEnabled(replyText, nextEmotion);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        setVoiceState('ERROR');
        setErrorText(`আরে, কী হলো এটা 😕 (${msg})`);
        setTimeout(() => {
          setVoiceState((prev) => (prev === 'ERROR' ? 'IDLE' : prev));
        }, 3500);
      }
    },
    [
      activeSessionId,
      buildTasksSummary,
      memories,
      onAddMemoryFact,
      onAddMessage,
      onAddSong,
      onAddTask,
      onLogMood,
      onToggleFlashlight,
      onTriggerBedtimeModal,
      pendingFileAttachment,
      profile,
      quotedMsg,
      sessionMessages,
      speakIfEnabled,
      voiceState,
    ]
  );

  const startListening = useCallback(() => {
    if (voiceState === 'LISTENING') {
      recognizerRef.current?.stop();
      setVoiceState('IDLE');
      setStatusMessage('');
      return;
    }

    stopAllSpeech();
    setErrorText('');
    setLiveTranscript('');

    const rec = createBrowserSpeechRecognizer(profile.sttLanguage || 'bn-BD');
    if (!rec) {
      setVoiceState('ERROR');
      setErrorText(
        'এই ব্রাউজারে মাইক্রোফোন স্পিচ রিকগনিশন সাপোর্ট করছে না; টাইপ করে কথা বলো সোনা।'
      );
      return;
    }

    recognizerRef.current = rec;
    setVoiceState('LISTENING');
    setStatusMessage('তোমার কথা শুনছি...');

    let finalSpoken = '';

    rec.onresult = (event) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalSpoken += chunk + ' ';
        } else {
          interim += chunk;
        }
      }
      const combined = (finalSpoken + interim).trim();
      setLiveTranscript(combined);
      setInputText(combined);
    };

    rec.onerror = (ev) => {
      setVoiceState('ERROR');
      setErrorText(`ভয়েস বুঝতে একটু সমস্যা হয়েছে (${ev.error}). আবার বলবে জান?`);
      setTimeout(() => setVoiceState('IDLE'), 2600);
    };

    rec.onend = () => {
      const spoken = finalSpoken.trim() || liveTranscript.trim();
      if (spoken) {
        sendToLuna(spoken, { isVoice: true });
      } else {
        setVoiceState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
        setStatusMessage('');
      }
    };

    try {
      rec.start();
    } catch {
      setVoiceState('IDLE');
    }
  }, [liveTranscript, profile.sttLanguage, sendToLuna, stopAllSpeech, voiceState]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) return;

      onAddMessage({
        sessionId: activeSessionId,
        sender: 'user',
        text: 'এই ছবিটা দেখো তো Luna 📸',
        attachmentName: file.name,
        attachmentPreviewUrl: dataUrl,
      });

      setVoiceState('PROCESSING');
      setStatusMessage('ছবিটা দেখছি জান...');
      setErrorText('');

      try {
        const res = await fetch('/api/luna/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: file.type || 'image/jpeg',
            profile,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Vision error');

        const desc = data.description || 'ছবিটা অনেক সুন্দর হয়েছে সোনা 💕';
        setCurrentEmotion('affectionate');
        onAddMessage({
          sessionId: activeSessionId,
          sender: 'luna',
          text: desc,
        });
        setPendingPhotoSave({ imageDataUrl: dataUrl, description: desc });
        speakIfEnabled(desc, 'affectionate');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Vision failed';
        setVoiceState('ERROR');
        setErrorText(`ছবিটা পড়তে পারিনি 😕 (${msg})`);
        setTimeout(() => setVoiceState('IDLE'), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (photoInputRef.current) {
        photoInputRef.current.files = dt.files;
        photoInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingFileAttachment({
        name: file.name,
        content: String(reader.result || '').slice(0, 12000),
      });
    };
    reader.readAsText(file);
  };

  const handleSavePhotoToDiary = () => {
    if (!pendingPhotoSave) return;
    onAddPhotoMemory({
      imageDataUrl: pendingPhotoSave.imageDataUrl,
      description: pendingPhotoSave.description,
      userNote: '',
      dateTaken: getTodayIso(),
    });
    onAddMessage({
      sessionId: activeSessionId,
      sender: 'system',
      text: 'ছবিটা আজকের Photo Memory ডায়েরিতে সেভ করা হয়েছে 📸',
    });
    setPendingPhotoSave(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const cycleLanguageHint = () => {
    const order: Array<UserProfile['language']> = ['Mixed', 'Bangla', 'English'];
    const next = order[(order.indexOf(profile.language) + 1) % order.length];
    onUpdateProfile({ language: next });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top Companion Presence Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-white/[0.07] bg-[#22163A]/60">
        <div className="flex items-center gap-4">
          <LunaFaceStage
            voiceState={voiceState}
            emotion={currentEmotion}
            audioLevel={audioLevel}
            size="sm"
            onClick={() => setFullVoiceOpen(true)}
            statusText={statusMessage}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-white">
                Luna · {profile.name}
              </h2>
            </div>
            <p className="text-xs text-[#C4B5D9]">
              {statusMessage ||
                (voiceState === 'IDLE'
                  ? `ডাকনাম: ${profile.endearment} · ভাষা: ${profile.language}`
                  : statusMessage)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFullVoiceOpen(true)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#FF4D8D]" />
            <span>Voice Mode</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateProfile({ voiceReplyEnabled: !profile.voiceReplyEnabled })
            }
            className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              profile.voiceReplyEnabled
                ? 'bg-[#FF4D8D]/15 border-[#FF4D8D]/40 text-white'
                : 'bg-white/[0.05] border-white/[0.08] text-[#C4B5D9]'
            }`}
          >
            {profile.voiceReplyEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#FF4D8D]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{profile.voiceReplyEnabled ? 'Voice Reply' : 'Text Reply'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFlashlight()}
            aria-pressed={flashlightOn}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              flashlightOn
                ? 'bg-[#FFB347]/20 border-[#FFB347]/50 text-[#FFB347]'
                : 'bg-white/[0.05] border-white/[0.08] text-[#C4B5D9] hover:text-white'
            }`}
          >
            <Flashlight className="w-3.5 h-3.5" />
            <span>{flashlightOn ? 'টর্চ চালু' : 'টর্চ'}</span>
          </button>

          <button
            type="button"
            onClick={onNewSession}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-[#C4B5D9] hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন চ্যাট</span>
          </button>
        </div>
      </div>

      {/* Main Split: Orb Stage + Chat Feed */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Quick Prompt Bar */}
        <div className="px-5 py-2.5 border-b border-white/[0.05] flex items-center gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendToLuna(prompt)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#FF4D8D]/15 border border-white/[0.08] hover:border-[#FF4D8D]/40 text-xs text-[#C4B5D9] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Scrollable Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Center Orb Hero Card when conversation is fresh */}
          {sessionMessages.length <= 2 && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <LunaFaceStage
                voiceState={voiceState}
                emotion={currentEmotion}
                audioLevel={audioLevel}
                size="md"
                onClick={startListening}
                statusText={statusMessage || 'কথা বলতে ট্যাপ করো জান ✨'}
              />
            </div>
          )}

          {sessionMessages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <p className="text-xs text-[#C4B5D9] px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl">
                    {msg.text}
                  </p>
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`group flex items-end gap-2.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#FF4D8D]/20 border border-[#FF4D8D]/40 flex items-center justify-center text-xs font-display font-bold text-[#FF4D8D] shrink-0">
                    L
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-3 border ${
                    isUser
                      ? 'bg-[#B57BFF]/20 border-[#B57BFF]/35 text-white rounded-br-sm'
                      : 'bg-[#22163A] border-[#FF4D8D]/25 text-white rounded-bl-sm'
                  }`}
                >
                  {msg.quotedText && (
                    <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-black/25 text-xs text-[#C4B5D9] line-clamp-2">
                      {msg.quotedText}
                    </div>
                  )}

                  {msg.attachmentPreviewUrl && (
                    <img
                      src={msg.attachmentPreviewUrl}
                      alt={msg.attachmentName || 'Shared memory'}
                      className="mb-2.5 max-h-56 w-auto rounded-xl object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {msg.attachmentName && !msg.attachmentPreviewUrl && (
                    <p className="mb-1.5 text-xs font-mono-tabular text-[#FFB347]">
                      📎 {msg.attachmentName}
                    </p>
                  )}

                  <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {msg.song && (
                    <SongPlayerCard
                      song={msg.song}
                      profile={profile}
                      autoPlay={
                        sessionMessages[sessionMessages.length - 1]?.id === msg.id
                      }
                      onPlayStateChange={(playing) => {
                        setVoiceState(playing ? 'SPEAKING' : 'IDLE');
                        setStatusMessage(playing ? 'গান গাইছি জান... 🎵' : '');
                      }}
                    />
                  )}

                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#C4B5D9]/75 font-mono-tabular">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {msg.isVoice ? ' · Voice' : ''}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setQuotedMsg(msg)}
                        title="Reply"
                        className="p-1 hover:text-white rounded"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy"
                        className="p-1 hover:text-white rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedId === msg.id && (
                        <span className="text-[#4DFFC3]">Copied</span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(msg.id)}
                        title="Delete"
                        className="p-1 hover:text-[#FF5C5C] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#B57BFF]/25 border border-[#B57BFF]/40 flex items-center justify-center text-xs font-display font-bold text-white shrink-0 overflow-hidden">
                    {profile.avatarDataUrl ? (
                      <img
                        src={profile.avatarDataUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {pendingPhotoSave && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FF4D8D]/12 border border-[#FF4D8D]/35">
              <p className="text-xs sm:text-sm text-white">
                ছবিটা সুন্দর জান! আজকের Photo Memory ডায়েরিতে রাখবে?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSavePhotoToDiary}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FF4D8D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>ডায়েরিতে রাখো</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingPhotoSave(null)}
                  className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-white/[0.06] text-xs text-[#C4B5D9]"
                >
                  বাদ দাও
                </button>
              </div>
            </div>
          )}

          {voiceState === 'PROCESSING' && (
            <div className="flex items-center gap-2.5 text-xs text-[#C4B5D9]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#B57BFF] animate-pulse" />
              <span>Luna লিখছে...</span>
            </div>
          )}

          {errorText && (
            <div className="p-3 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 text-xs text-[#FF5C5C]">
              {errorText}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Composer */}
        <div className="p-3 sm:p-4 border-t border-white/[0.07] bg-[#22163A]/80 backdrop-blur-md">
          {quotedMsg && (
            <div className="mb-2 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-[#C4B5D9]">
              <span className="truncate">Replying to: {quotedMsg.text}</span>
              <button
                type="button"
                onClick={() => setQuotedMsg(null)}
                className="text-[#C4B5D9] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pendingFileAttachment && (
            <div className="mb-2 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#B57BFF]/15 border border-[#B57BFF]/35 text-xs text-white">
              <span className="truncate">📎 {pendingFileAttachment.name}</span>
              <button
                type="button"
                onClick={() => setPendingFileAttachment(null)}
                className="text-[#C4B5D9] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,text/*,image/*"
              className="hidden"
              onChange={handleTextFileUpload}
            />

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              title="আজকের ছবি (Photo Vision)"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-[#C4B5D9] hover:text-white transition-colors shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="ফাইল যুক্ত করো"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-[#C4B5D9] hover:text-white transition-colors shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendToLuna(inputText);
                  }
                }}
                placeholder="Luna কে কিছু বলো... (বাংলা বা English)"
                className="w-full min-h-[44px] pl-3.5 pr-20 py-2.5 rounded-2xl bg-[#1A1025] border border-white/[0.1] focus:border-[#FF4D8D]/60 focus:outline-none text-sm text-white placeholder:text-[#C4B5D9]/50"
              />
              <button
                type="button"
                onClick={cycleLanguageHint}
                title="ভাষার ধরন বদলাও"
                className="absolute right-2 px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-[#C4B5D9]"
              >
                {inputText.trim()
                  ? detectedInputLang === 'Bangla'
                    ? 'বাং'
                    : detectedInputLang === 'English'
                    ? 'EN'
                    : 'Mix'
                  : profile.language === 'Bangla'
                  ? 'বাং'
                  : profile.language === 'English'
                  ? 'EN'
                  : 'Mix'}
              </button>
            </div>

            {voiceState === 'SPEAKING' ? (
              <button
                type="button"
                onClick={() => {
                  stopAllSpeech();
                  setVoiceState('IDLE');
                  setStatusMessage('');
                }}
                title="কথা থামাও"
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#FF5C5C] text-white flex items-center justify-center shrink-0"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                title="ভয়েসে কথা বলো"
                className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  voiceState === 'LISTENING'
                    ? 'bg-[#FFB347] text-[#1A1025]'
                    : 'bg-[#FF4D8D] hover:bg-[#FF6BA8] text-white'
                }`}
              >
                {voiceState === 'LISTENING' ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => sendToLuna(inputText)}
              disabled={!inputText.trim() && !pendingFileAttachment}
              title="পাঠাও"
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#B57BFF] hover:bg-[#B57BFF]/85 disabled:opacity-40 text-[#1A1025] font-semibold flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Voice Conversation Overlay */}
      {fullVoiceOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1025]/96 backdrop-blur-xl flex flex-col items-center justify-between p-6">
          <div className="w-full max-w-2xl flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Voice Conversation · Luna
              </h3>
              <p className="text-xs text-[#C4B5D9]">
                STT: {profile.sttLanguage} · Wake: &ldquo;{profile.wakePhrase}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFullVoiceOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.08] text-sm text-white hover:bg-white/[0.14]"
            >
              চ্যাটে ফেরো
            </button>
          </div>

          <div className="flex flex-col items-center text-center max-w-xl my-auto">
            <LunaFaceStage
              voiceState={voiceState}
              emotion={currentEmotion}
              audioLevel={audioLevel}
              size="lg"
              onClick={startListening}
              statusText={statusMessage || 'মাইকে ট্যাপ করে কথা বলো জান'}
            />

            {liveTranscript && (
              <p className="mt-6 text-sm text-[#FFB347] bg-[#FFB347]/10 border border-[#FFB347]/30 px-4 py-2.5 rounded-2xl">
                তুমি: {liveTranscript}
              </p>
            )}

            {sessionMessages.length > 0 && (
              <p className="mt-5 text-base text-white/95 leading-relaxed max-h-44 overflow-y-auto px-4">
                {sessionMessages[sessionMessages.length - 1].text}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={startListening}
              className={`min-h-[52px] px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 ${
                voiceState === 'LISTENING'
                  ? 'bg-[#FFB347] text-[#1A1025]'
                  : 'bg-[#FF4D8D] text-white'
              }`}
            >
              {voiceState === 'LISTENING' ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>শোনা বন্ধ করো</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>কথা বলো</span>
                </>
              )}
            </button>

            {voiceState === 'SPEAKING' && (
              <button
                type="button"
                onClick={() => {
                  stopAllSpeech();
                  setVoiceState('IDLE');
                  setStatusMessage('');
                }}
                className="min-h-[52px] px-5 py-3 rounded-full bg-white/[0.1] text-white text-sm font-medium"
              >
                থামাও
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
