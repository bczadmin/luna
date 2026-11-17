export type LunaVoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export type LanguageMode = 'Mixed' | 'Bangla' | 'English';

export type TaskType = 'ONE_TIME' | 'RECURRING' | 'ROUTINE' | 'HEALTH' | 'CUSTOM';

export type NavTab = 'companion' | 'tasks' | 'wellbeing' | 'music' | 'memory' | 'settings' | 'android';

export interface UserProfile {
  name: string;
  endearment: string;
  language: LanguageMode;
  age: string;
  birthday: string;
  avatarDataUrl: string;
  voiceReplyEnabled: boolean;
  ttsRate: number;
  ttsPitch: number;
  ttsVoiceURI: string;
  sttLanguage: 'bn-BD' | 'en-US' | 'hi-IN';
  wakePhrase: string;
  waterIntervalHours: number;
  bedtimeTime: string;
  wakeUpTime: string;
  bedtimeStoryEnabled: boolean;
  storyTheme: 'surprise' | 'nature' | 'adventure' | 'fantasy';
  onboardingCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'luna' | 'system';
  text: string;
  timestamp: number;
  isVoice?: boolean;
  quotedText?: string;
  attachmentName?: string;
  attachmentPreviewUrl?: string;
  song?: SongEntry;
}

export interface SongChord {
  name: string;
  midiNotes: number[];
}

export interface SongEntry {
  id: string;
  title: string;
  mood: string;
  tempoBpm: number;
  lyrics: string;
  chords: SongChord[];
  vocalAudioDataUrl: string | null;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  triggerTime: string; // HH:mm or ISO-like label
  triggerDate?: string; // YYYY-MM-DD
  repeatPattern: string; // 'Daily', 'Weekly', 'Every 2h', 'Once', etc.
  notes: string;
  active: boolean;
  lastTriggeredDate?: string;
}

export interface ClassRoutineEntry {
  id: string;
  day: string; // Sunday..Saturday
  time24: string; // HH:mm
  timeDisplay: string;
  subject: string;
  room: string;
  teacher: string;
  active: boolean;
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  note: string;
  autoDetected: boolean;
}

export interface SleepEntry {
  id: string;
  dateSleep: string; // YYYY-MM-DD
  timeSleep: string; // HH:mm
  timeWoke: string; // HH:mm
  durationMinutes: number;
  qualityLevel: 1 | 2 | 3; // 1=অনেক ক্লান্ত, 2=একটু ক্লান্ত, 3=ভালো
  note: string;
}

export interface PhotoMemoryEntry {
  id: string;
  imageDataUrl: string;
  description: string;
  userNote: string;
  dateTaken: string; // YYYY-MM-DD
  createdAt: number;
}

export interface MemoryFact {
  id: string;
  fact: string;
  createdAt: number;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  folder: string;
  mimeType: string;
  sizeBytes: number;
  content: string;
  previewDataUrl?: string;
  updatedAt: number;
}
