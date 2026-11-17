import React, { useState, useEffect } from 'react';
import {
  MessageCircleHeart,
  CalendarClock,
  HeartPulse,
  FolderArchive,
  Settings,
  Smartphone,
  Moon,
  Flashlight,
  Music2,
} from 'lucide-react';
import { NavTab, WorkspaceFile } from './types/luna';
import { useLunaStore } from './hooks/useLunaStore';
import { CompanionChatView } from './components/CompanionChatView';
import { TaskManagerView } from './components/TaskManagerView';
import { WellbeingView } from './components/WellbeingView';
import { MusicStudioView } from './components/MusicStudioView';
import { MemoryStorageView } from './components/MemoryStorageView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AndroidProjectView } from './components/AndroidProjectView';
import { OnboardingModal } from './components/OnboardingModal';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'companion', label: 'Luna', icon: MessageCircleHeart },
  { id: 'tasks', label: 'Tasks', icon: CalendarClock },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'wellbeing', label: 'Wellbeing', icon: HeartPulse },
  { id: 'memory', label: 'Memory', icon: FolderArchive },
  { id: 'android', label: 'Android Code', icon: Smartphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const {
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
  } = useLunaStore();

  const [activeTab, setActiveTab] = useState<NavTab>('companion');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [bedtimePromptActive, setBedtimePromptActive] = useState(false);

  const handleToggleFlashlight = (forcedState?: boolean) => {
    setFlashlightOn((prev) => (typeof forcedState === 'boolean' ? forcedState : !prev));
  };

  // Real minute-tick check for 3-minute pre-class reminders & active tasks via Browser Notification API
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    const firedKeys = new Set<string>();
    const checkReminders = () => {
      const now = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = dayNames[now.getDay()];
      const nowTotalMins = now.getHours() * 60 + now.getMinutes();
      const todayDate = now.toISOString().slice(0, 10);

      state.routines.forEach((cls) => {
        if (!cls.active || cls.day.toLowerCase() !== todayName.toLowerCase()) return;
        const [h, m] = cls.time24.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return;
        const classMins = h * 60 + m;
        const diff = classMins - nowTotalMins;
        const key = `cls-${cls.id}-${todayDate}`;
        if (diff === 3 && !firedKeys.has(key)) {
          firedKeys.add(key);
          new Notification(`⏰ ${cls.subject} এর ক্লাস ৩ মিনিট পরে!`, {
            body: `মনে আছে তো ${state.profile.name}? ${cls.room || ''}`,
          });
        }
      });

      state.tasks.forEach((task) => {
        if (!task.active) return;
        const [h, m] = task.triggerTime.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return;
        const key = `task-${task.id}-${todayDate}-${h}:${m}`;
        if (now.getHours() === h && now.getMinutes() === m && !firedKeys.has(key)) {
          firedKeys.add(key);
          new Notification(`Luna · ${task.title}`, {
            body: task.notes || `সময় হয়ে গেছে ${state.profile.name} 💕`,
          });
        }
      });
    };

    const timer = setInterval(checkReminders, 30_000);
    return () => clearInterval(timer);
  }, [state.routines, state.tasks, state.profile.name]);

  const handleSendFileToLuna = (file: WorkspaceFile) => {
    addMessage({
      sessionId: state.activeSessionId,
      sender: 'user',
      text: `এই "${file.name}" ফাইলটা দেখো তো Luna:\n\n${file.content.slice(0, 3000)}`,
      attachmentName: file.name,
    });
    setActiveTab('companion');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1A1025] text-white flex flex-col md:flex-row">
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col justify-between bg-[#22163A]/85 border-r border-white/[0.07] p-5">
        <div className="space-y-6">
          <div className="px-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-white">
              Luna
            </h1>
            <p className="text-xs text-[#C4B5D9] mt-0.5">
              তোমার পাশে সবসময় ✨
            </p>
          </div>

          <nav className="space-y-1.5" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FF4D8D] text-white'
                      : 'text-[#C4B5D9] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-white/[0.07]">
          {!state.profile.onboardingCompleted && (
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#B57BFF]/20 hover:bg-[#B57BFF]/30 border border-[#B57BFF]/40 text-xs font-medium text-white text-left transition-colors"
            >
              প্রোফাইল সেটআপ করো ✨
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('wellbeing')}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-[#C4B5D9] hover:text-white flex items-center gap-2 transition-colors"
          >
            <Moon className="w-3.5 h-3.5 text-[#B57BFF]" />
            <span>ঘুমের গল্প শোনো</span>
          </button>
        </div>
      </aside>

      {/* Mobile Compact Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.07] bg-[#22163A]/90 shrink-0">
        <span className="font-display text-lg font-bold text-white whitespace-nowrap shrink-0">
          Luna
        </span>
        <button
          type="button"
          onClick={() => setActiveTab('android')}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FF4D8D] text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          Android Code
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col relative pb-16 md:pb-0">
        {bedtimePromptActive && (
          <div className="px-5 py-3 bg-[#22163A] border-b border-[#B57BFF]/40 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-white">
              একটা শান্ত ঘুমের গল্প শুনবে নাকি ঘুমানোর আগে? 🌙
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setBedtimePromptActive(false);
                  setActiveTab('wellbeing');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF4D8D] text-xs font-semibold text-white"
              >
                হ্যাঁ, শোনাও
              </button>
              <button
                type="button"
                onClick={() => setBedtimePromptActive(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-xs text-[#C4B5D9]"
              >
                পরে
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {activeTab === 'companion' && (
            <CompanionChatView
              profile={state.profile}
              messages={state.messages}
              activeSessionId={state.activeSessionId}
              tasks={state.tasks}
              routines={state.routines}
              memories={state.memories}
              flashlightOn={flashlightOn}
              onToggleFlashlight={handleToggleFlashlight}
              onUpdateProfile={updateProfile}
              onAddMessage={addMessage}
              onDeleteMessage={deleteMessage}
              onNewSession={startNewSession}
              onAddTask={addTask}
              onAddMemoryFact={addMemoryFact}
              onLogMood={logMood}
              onAddPhotoMemory={addPhotoMemory}
              onAddSong={addSong}
              onTriggerBedtimeModal={() => setBedtimePromptActive(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManagerView
              profile={state.profile}
              tasks={state.tasks}
              routines={state.routines}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddRoutineEntries={addRoutineEntries}
              onToggleRoutineEntry={toggleRoutineEntry}
              onDeleteRoutineEntry={deleteRoutineEntry}
            />
          )}

          {activeTab === 'wellbeing' && (
            <WellbeingView
              profile={state.profile}
              moods={state.moods}
              sleeps={state.sleeps}
              photos={state.photos}
              waterCountToday={state.waterCountToday}
              onIncrementWater={incrementWater}
              onLogMood={logMood}
              onLogSleep={logSleep}
              onAddPhotoMemory={addPhotoMemory}
              onUpdatePhotoMemoryNote={updatePhotoMemoryNote}
              onDeletePhotoMemory={deletePhotoMemory}
            />
          )}

          {activeTab === 'music' && (
            <MusicStudioView
              profile={state.profile}
              songs={state.songs}
              onAddSong={addSong}
              onDeleteSong={deleteSong}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryStorageView
              sessions={state.sessions}
              activeSessionId={state.activeSessionId}
              messages={state.messages}
              memories={state.memories}
              files={state.files}
              onSwitchSession={(id) => {
                switchSession(id);
                setActiveTab('companion');
              }}
              onDeleteSession={deleteSession}
              onClearHistory={clearAllHistory}
              onAddMemoryFact={addMemoryFact}
              onDeleteMemoryFact={deleteMemoryFact}
              onClearMemories={clearMemories}
              onAddFile={addWorkspaceFile}
              onDeleteFile={deleteWorkspaceFile}
              onSendFileToLuna={handleSendFileToLuna}
            />
          )}

          {activeTab === 'android' && <AndroidProjectView />}

          {activeTab === 'settings' && (
            <ProfileSettingsView
              profile={state.profile}
              onUpdateProfile={updateProfile}
              onReplayOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Thumb Navigation (<= 15% height) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#22163A]/95 backdrop-blur-md border-t border-white/[0.08] grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.filter((i) => i.id !== 'android' && i.id !== 'memory').map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                active ? 'text-[#FF4D8D]' : 'text-[#C4B5D9]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Screen Torch Mode when Flashlight is turned ON */}
      {flashlightOn && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-[#1A1025]">
          <Flashlight className="w-12 h-12 text-[#FFB347] mb-4" />
          <p className="font-display text-lg font-bold mb-2">
            টর্চ চালু আছে 🔦
          </p>
          <p className="text-sm text-[#22163A]/80 mb-6 text-center">
            অ্যান্ড্রয়েড ফোনে এটি ক্যামেরা ফ্ল্যাশ এলইডি জ্বালায়; ব্রাউজারে স্ক্রিন টর্চ হিসেবে কাজ করছে।
          </p>
          <button
            type="button"
            onClick={() => setFlashlightOn(false)}
            className="min-h-[48px] px-6 py-3 rounded-full bg-[#1A1025] text-white text-sm font-semibold"
          >
            টর্চ নিভাও ✨
          </button>
        </div>
      )}

      {/* Onboarding & Profile Setup Modal */}
      {showOnboarding && (
        <OnboardingModal
          profile={state.profile}
          onSaveAndClose={(patch) => {
            updateProfile(patch);
            setShowOnboarding(false);
          }}
          onDismiss={() => {
            updateProfile({ onboardingCompleted: true });
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
