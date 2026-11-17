import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  ChatMessage,
  ChatSession,
  TaskItem,
  ClassRoutineEntry,
  MoodEntry,
  SleepEntry,
  PhotoMemoryEntry,
  MemoryFact,
  WorkspaceFile,
  SongEntry,
} from '../types/luna';

const STORAGE_KEY = 'luna_companion_state_v1';

export interface LunaPersistedState {
  profile: UserProfile;
  sessions: ChatSession[];
  activeSessionId: string;
  messages: ChatMessage[];
  tasks: TaskItem[];
  routines: ClassRoutineEntry[];
  moods: MoodEntry[];
  sleeps: SleepEntry[];
  photos: PhotoMemoryEntry[];
  memories: MemoryFact[];
  files: WorkspaceFile[];
  songs: SongEntry[];
  waterCountToday: number;
  waterDate: string;
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPastDateIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_SESSION_ID = 'session-initial';

const INITIAL_STATE: LunaPersistedState = {
  profile: {
    name: 'Rafid',
    endearment: 'জান',
    language: 'Mixed',
    age: '',
    birthday: '',
    avatarDataUrl: '',
    voiceReplyEnabled: true,
    ttsRate: 1.0,
    ttsPitch: 1.08,
    ttsVoiceURI: '',
    sttLanguage: 'bn-BD',
    wakePhrase: 'Hey Luna',
    waterIntervalHours: 2,
    bedtimeTime: '22:30',
    wakeUpTime: '06:30',
    bedtimeStoryEnabled: true,
    storyTheme: 'nature',
    onboardingCompleted: false,
  },
  sessions: [
    {
      id: DEFAULT_SESSION_ID,
      title: 'আজকের গল্প ও খোঁজখবর',
      createdAt: Date.now() - 3600_000,
      updatedAt: Date.now(),
    },
  ],
  activeSessionId: DEFAULT_SESSION_ID,
  messages: [
    {
      id: 'msg-welcome-1',
      sessionId: DEFAULT_SESSION_ID,
      sender: 'luna',
      text: 'হ্যালো Rafid! কেমন আছ জান? আজকে ঠিকমতো খেয়েছ আর পানি খেয়েছ তো? আমাকে বলো তোমার দিনটা কেমন যাচ্ছে ✨',
      timestamp: Date.now() - 120_000,
    },
  ],
  tasks: [
    {
      id: 'task-water',
      title: 'পানি খাওয়ার রিমাইন্ডার',
      type: 'HEALTH',
      triggerTime: '14:00',
      repeatPattern: 'Every 2h',
      notes: 'এক গ্লাস পানি খেয়ে নাও সোনা 💧',
      active: true,
    },
    {
      id: 'task-sleep',
      title: 'ঘুমানোর সময়',
      type: 'HEALTH',
      triggerTime: '22:30',
      repeatPattern: 'Daily',
      notes: 'বেশি রাত জেগে থাকলে শরীর খারাপ করবে 🌙',
      active: true,
    },
  ],
  routines: [
    {
      id: 'routine-1',
      day: 'Sunday',
      time24: '10:00',
      timeDisplay: '10:00 AM',
      subject: 'Mathematics',
      room: 'Room 302',
      teacher: '',
      active: true,
    },
    {
      id: 'routine-2',
      day: 'Sunday',
      time24: '12:00',
      timeDisplay: '12:00 PM',
      subject: 'Physics',
      room: 'Lab 2',
      teacher: '',
      active: true,
    },
    {
      id: 'routine-3',
      day: 'Monday',
      time24: '14:00',
      timeDisplay: '02:00 PM',
      subject: 'Chemistry',
      room: 'Room 204',
      teacher: '',
      active: true,
    },
  ],
  moods: [
    { id: 'm-6', date: getPastDateIso(6), level: 4, label: 'ভালো', note: 'সকালটা বেশ শান্ত ছিল', autoDetected: false },
    { id: 'm-5', date: getPastDateIso(5), level: 3, label: 'ঠিকঠাক', note: 'ক্লাসের চাপ ছিল একটু', autoDetected: false },
    { id: 'm-4', date: getPastDateIso(4), level: 5, label: 'দারুণ', note: 'সব কাজ সময়মতো শেষ হয়েছে', autoDetected: false },
    { id: 'm-3', date: getPastDateIso(3), level: 2, label: 'মন খারাপ', note: 'বৃষ্টিতে আটকে গিয়েছিলাম', autoDetected: true },
    { id: 'm-2', date: getPastDateIso(2), level: 4, label: 'ভালো', note: 'ভালো ঘুম হয়েছে', autoDetected: false },
    { id: 'm-1', date: getPastDateIso(1), level: 5, label: 'দারুণ', note: 'বন্ধুদের সাথে আড্ডা', autoDetected: false },
  ],
  sleeps: [
    { id: 's-5', dateSleep: getPastDateIso(5), timeSleep: '23:30', timeWoke: '06:30', durationMinutes: 420, qualityLevel: 3, note: '' },
    { id: 's-4', dateSleep: getPastDateIso(4), timeSleep: '01:00', timeWoke: '06:30', durationMinutes: 330, qualityLevel: 2, note: 'অ্যাসাইনমেন্ট ছিল' },
    { id: 's-3', dateSleep: getPastDateIso(3), timeSleep: '23:00', timeWoke: '06:45', durationMinutes: 465, qualityLevel: 3, note: '' },
    { id: 's-2', dateSleep: getPastDateIso(2), timeSleep: '00:15', timeWoke: '07:00', durationMinutes: 405, qualityLevel: 2, note: '' },
    { id: 's-1', dateSleep: getPastDateIso(1), timeSleep: '22:45', timeWoke: '06:30', durationMinutes: 465, qualityLevel: 3, note: 'ঘুমের গল্প শুনে ঘুমিয়েছি' },
  ],
  photos: [],
  memories: [
    {
      id: 'mem-1',
      fact: 'Prefers mixed Bangla and English conversation with caring reminders.',
      createdAt: Date.now() - 86400_000,
    },
  ],
  files: [
    {
      id: 'file-routine',
      name: 'class_routine.txt',
      folder: '/Documents',
      mimeType: 'text/plain',
      sizeBytes: 184,
      content:
        'Sunday 10:00 AM - Mathematics (Room 302)\nSunday 12:00 PM - Physics (Lab 2)\nMonday 2:00 PM - Chemistry (Room 204)\nWednesday 11:00 AM - Bangla Literature (Room 108)',
      updatedAt: Date.now() - 43200_000,
    },
    {
      id: 'file-notes',
      name: 'exam_prep_notes.txt',
      folder: '/Notes',
      mimeType: 'text/plain',
      sizeBytes: 132,
      content: 'Physics Chapter 4: Wave Optics review\nMath: Integration practice problems 1-15 before Friday.',
      updatedAt: Date.now() - 21600_000,
    },
  ],
  songs: [],
  waterCountToday: 3,
  waterDate: getTodayIso(),
};

function loadInitialState(): LunaPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<LunaPersistedState>;
    const today = getTodayIso();
    const sameWaterDay = parsed.waterDate === today;
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: { ...INITIAL_STATE.profile, ...(parsed.profile || {}) },
      waterCountToday: sameWaterDay ? (parsed.waterCountToday ?? 0) : 0,
      waterDate: today,
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function useLunaStore() {
  const [state, setState] = useState<LunaPersistedState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
    const entry: ChatMessage = {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: msg.timestamp || Date.now(),
      sessionId: msg.sessionId,
      sender: msg.sender,
      text: msg.text,
      isVoice: msg.isVoice,
      quotedText: msg.quotedText,
      attachmentName: msg.attachmentName,
      attachmentPreviewUrl: msg.attachmentPreviewUrl,
      song: msg.song,
    };
    setState((prev) => {
      const updatedSessions = prev.sessions.map((s) =>
        s.id === entry.sessionId
          ? {
              ...s,
              updatedAt: entry.timestamp,
              title:
                s.title === 'নতুন কথোপকথন' && entry.sender === 'user'
                  ? entry.text.slice(0, 36) + (entry.text.length > 36 ? '...' : '')
                  : s.title,
            }
          : s
      );
      return {
        ...prev,
        messages: [...prev.messages, entry],
        sessions: updatedSessions,
      };
    });
    return entry;
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== messageId),
    }));
  }, []);

  const startNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      activeSessionId: newId,
      sessions: [
        {
          id: newId,
          title: 'নতুন কথোপকথন',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...prev.sessions,
      ],
      messages: [
        ...prev.messages,
        {
          id: `msg-${Date.now()}`,
          sessionId: newId,
          sender: 'luna',
          text: `হ্যাঁ ${prev.profile.name}, বলো ${prev.profile.endearment} — নতুন কী গল্প করবে আমার সাথে? 💕`,
          timestamp: Date.now(),
        },
      ],
    }));
    return newId;
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    setState((prev) => ({ ...prev, activeSessionId: sessionId }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const remaining = prev.sessions.filter((s) => s.id !== sessionId);
      const remainingMsgs = prev.messages.filter((m) => m.sessionId !== sessionId);
      if (remaining.length === 0) {
        const freshId = `session-${Date.now()}`;
        return {
          ...prev,
          activeSessionId: freshId,
          sessions: [{ id: freshId, title: 'নতুন কথোপকথন', createdAt: Date.now(), updatedAt: Date.now() }],
          messages: [
            {
              id: `msg-${Date.now()}`,
              sessionId: freshId,
              sender: 'luna',
              text: `সব পুরনো গল্প মুছে দিয়েছি ${prev.profile.name}। চলো আবার নতুন করে শুরু করি ✨`,
              timestamp: Date.now(),
            },
          ],
        };
      }
      return {
        ...prev,
        sessions: remaining,
        messages: remainingMsgs,
        activeSessionId: prev.activeSessionId === sessionId ? remaining[0].id : prev.activeSessionId,
      };
    });
  }, []);

  const clearAllHistory = useCallback(() => {
    setState((prev) => {
      const freshId = `session-${Date.now()}`;
      return {
        ...prev,
        activeSessionId: freshId,
        sessions: [{ id: freshId, title: 'নতুন কথোপকথন', createdAt: Date.now(), updatedAt: Date.now() }],
        messages: [
          {
            id: `msg-${Date.now()}`,
            sessionId: freshId,
            sender: 'luna',
            text: `আমি এখানেই আছি ${prev.profile.name} 💕 যখনই কথা বলতে ইচ্ছে করবে, ডেকো।`,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  const addTask = useCallback((task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    return newTask;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<TaskItem>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const addRoutineEntries = useCallback((entries: Omit<ClassRoutineEntry, 'id'>[]) => {
    const created: ClassRoutineEntry[] = entries.map((e, idx) => ({
      ...e,
      id: `routine-${Date.now()}-${idx}`,
    }));
    setState((prev) => ({
      ...prev,
      routines: [...prev.routines, ...created],
    }));
    return created;
  }, []);

  const toggleRoutineEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    }));
  }, []);

  const deleteRoutineEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.id !== id),
    }));
  }, []);

  const logMood = useCallback((entry: Omit<MoodEntry, 'id'>) => {
    setState((prev) => {
      const existingIdx = prev.moods.findIndex((m) => m.date === entry.date);
      if (existingIdx >= 0) {
        const next = [...prev.moods];
        next[existingIdx] = { ...next[existingIdx], ...entry };
        return { ...prev, moods: next };
      }
      return {
        ...prev,
        moods: [...prev.moods, { ...entry, id: `mood-${Date.now()}` }].sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      };
    });
  }, []);

  const logSleep = useCallback((entry: Omit<SleepEntry, 'id'>) => {
    setState((prev) => {
      const existingIdx = prev.sleeps.findIndex((s) => s.dateSleep === entry.dateSleep);
      if (existingIdx >= 0) {
        const next = [...prev.sleeps];
        next[existingIdx] = { ...next[existingIdx], ...entry };
        return { ...prev, sleeps: next };
      }
      return {
        ...prev,
        sleeps: [...prev.sleeps, { ...entry, id: `sleep-${Date.now()}` }].sort((a, b) =>
          a.dateSleep.localeCompare(b.dateSleep)
        ),
      };
    });
  }, []);

  const addPhotoMemory = useCallback((entry: Omit<PhotoMemoryEntry, 'id' | 'createdAt'>) => {
    const newEntry: PhotoMemoryEntry = {
      ...entry,
      id: `photo-${Date.now()}`,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      photos: [newEntry, ...prev.photos],
    }));
    return newEntry;
  }, []);

  const updatePhotoMemoryNote = useCallback((id: string, userNote: string) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, userNote } : p)),
    }));
  }, []);

  const deletePhotoMemory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  }, []);

  const addMemoryFact = useCallback((fact: string) => {
    const clean = fact.trim();
    if (!clean) return;
    setState((prev) => {
      if (prev.memories.some((m) => m.fact.toLowerCase() === clean.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        memories: [{ id: `mem-${Date.now()}`, fact: clean, createdAt: Date.now() }, ...prev.memories],
      };
    });
  }, []);

  const deleteMemoryFact = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  }, []);

  const clearMemories = useCallback(() => {
    setState((prev) => ({ ...prev, memories: [] }));
  }, []);

  const addWorkspaceFile = useCallback((file: Omit<WorkspaceFile, 'id' | 'updatedAt'>) => {
    const created: WorkspaceFile = {
      ...file,
      id: `file-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      files: [created, ...prev.files],
    }));
    return created;
  }, []);

  const deleteWorkspaceFile = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }));
  }, []);

  const incrementWater = useCallback(() => {
    const today = getTodayIso();
    setState((prev) => ({
      ...prev,
      waterDate: today,
      waterCountToday: (prev.waterDate === today ? prev.waterCountToday : 0) + 1,
    }));
  }, []);

  const addSong = useCallback((song: Omit<SongEntry, 'id' | 'createdAt'>) => {
    const created: SongEntry = {
      ...song,
      id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      songs: [created, ...prev.songs],
    }));
    return created;
  }, []);

  const deleteSong = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      songs: prev.songs.filter((s) => s.id !== id),
    }));
  }, []);

  return {
    state,
    updateProfile,
    addMessage,
    deleteMessage,
    startNewSession,
    switchSession,
    deleteSession,
    clearAllHistory,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    addRoutineEntries,
    toggleRoutineEntry,
    deleteRoutineEntry,
    logMood,
    logSleep,
    addPhotoMemory,
    updatePhotoMemoryNote,
    deletePhotoMemory,
    addMemoryFact,
    deleteMemoryFact,
    clearMemories,
    addWorkspaceFile,
    deleteWorkspaceFile,
    incrementWater,
    addSong,
    deleteSong,
  };
}
