import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Bell,
  Sparkles,
  Check,
  Upload,
} from 'lucide-react';
import {
  TaskItem,
  TaskType,
  ClassRoutineEntry,
  UserProfile,
} from '../types/luna';

interface TaskManagerViewProps {
  profile: UserProfile;
  tasks: TaskItem[];
  routines: ClassRoutineEntry[];
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddRoutineEntries: (entries: Omit<ClassRoutineEntry, 'id'>[]) => void;
  onToggleRoutineEntry: (id: string) => void;
  onDeleteRoutineEntry: (id: string) => void;
}

const DAYS_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  profile,
  tasks,
  routines,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddRoutineEntries,
  onToggleRoutineEntry,
  onDeleteRoutineEntry,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | TaskType>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Task Form State
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('ONE_TIME');
  const [triggerTime, setTriggerTime] = useState('09:00');
  const [triggerDate, setTriggerDate] = useState('');
  const [repeatPattern, setRepeatPattern] = useState('Daily');
  const [notes, setNotes] = useState('');

  // Routine Parser State
  const [routineInput, setRoutineInput] = useState('');
  const [parsingRoutine, setParsingRoutine] = useState(false);
  const [routineFeedback, setRoutineFeedback] = useState('');
  const [routineError, setRoutineError] = useState('');
  const [notifStatus, setNotifStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const filteredTasks =
    activeFilter === 'ALL'
      ? tasks
      : tasks.filter((t) => t.type === activeFilter);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      type: taskType,
      triggerTime,
      triggerDate: taskType === 'ONE_TIME' ? triggerDate : undefined,
      repeatPattern: taskType === 'ONE_TIME' ? 'Once' : repeatPattern,
      notes: notes.trim(),
      active: true,
    });
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleParseRoutine = async () => {
    if (!routineInput.trim() || parsingRoutine) return;
    setParsingRoutine(true);
    setRoutineError('');
    setRoutineFeedback('');

    try {
      const res = await fetch('/api/luna/parse-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: routineInput, profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not parse routine');

      const parsedClasses = Array.isArray(data.classes) ? data.classes : [];
      if (parsedClasses.length === 0) {
        setRoutineError('রুটিনে কোনো ক্লাসের সময় খুঁজে পাইনি সোনা। একটু স্পষ্ট করে লিখো তো।');
      } else {
        onAddRoutineEntries(
          parsedClasses.map((c: Omit<ClassRoutineEntry, 'id' | 'active'>) => ({
            day: c.day || 'Sunday',
            time24: c.time24 || '10:00',
            timeDisplay: c.timeDisplay || c.time24 || '10:00 AM',
            subject: c.subject || 'Class',
            room: c.room || '',
            teacher: c.teacher || '',
            active: true,
          }))
        );
        setRoutineFeedback(
          data.confirmationMessage ||
            'তোমার রুটিন সেভ করে নিলাম সোনা 🗓️ প্রতিদিন ক্লাসের ৩ মিনিট আগে মনে করিয়ে দেব!'
        );
        setRoutineInput('');
      }
    } catch (err: unknown) {
      setRoutineError(err instanceof Error ? err.message : 'Routine parse error');
    } finally {
      setParsingRoutine(false);
    }
  };

  const handleUploadRoutineFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRoutineInput(String(reader.result || ''));
    };
    reader.readAsText(file);
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setNotifStatus('unsupported');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === 'granted') {
      new Notification(`Luna · ${profile.name}`, {
        body: 'রিমাইন্ডার চালু হয়েছে জান! ক্লাসের ৩ মিনিট আগে আমি মনে করিয়ে দেব ✨',
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Task & Class Routine
          </h1>
          <p className="text-sm text-[#C4B5D9] mt-1">
            এই হলো তোমার সব কাজের লিস্ট জান — ক্লাসের ৩ মিনিট আগে রিমাইন্ডার পাবে
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={requestNotifications}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-[#C4B5D9] hover:text-white flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5 text-[#FFB347]" />
            <span>
              {notifStatus === 'granted'
                ? 'Notifications Active'
                : 'Enable Reminders'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-xs font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Drawer/Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.09] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-white">
              নতুন কাজ বা রিমাইন্ডার
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#C4B5D9] hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TASK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTaskType(t.value)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  taskType === t.value
                    ? 'bg-[#FF4D8D] text-white'
                    : 'bg-white/[0.06] text-[#C4B5D9] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#C4B5D9] mb-1.5">
                কাজের নাম
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: রাত ১০টায় ঘুমাতে যাও বা Physics assignment"
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white focus:border-[#FF4D8D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#C4B5D9] mb-1.5">
                সময়
              </label>
              <input
                type="time"
                value={triggerTime}
                onChange={(e) => setTriggerTime(e.target.value)}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular focus:border-[#FF4D8D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskType === 'ONE_TIME' ? (
              <div>
                <label className="block text-xs text-[#C4B5D9] mb-1.5">
                  তারিখ
                </label>
                <input
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white font-mono-tabular focus:border-[#FF4D8D] focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-[#C4B5D9] mb-1.5">
                  Repeat
                </label>
                <select
                  value={repeatPattern}
                  onChange={(e) => setRepeatPattern(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white focus:border-[#FF4D8D] focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Every 2h">Every 2 hours</option>
                  <option value="Sun-Thu">Sun – Thu</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-[#C4B5D9] mb-1.5">
                নোট (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="অতিরিক্ত তথ্য..."
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white focus:border-[#FF4D8D] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#FF4D8D] text-sm font-semibold text-white"
            >
              সেভ করো
            </button>
          </div>
        </form>
      )}

      {/* Two-Column Split: Active Tasks & Class Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tasks */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-white">
              Scheduled Tasks
            </h2>
            <div className="flex items-center gap-1 bg-[#22163A] p-1 rounded-xl border border-white/[0.06] overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === 'ALL'
                    ? 'bg-[#FF4D8D] text-white'
                    : 'text-[#C4B5D9] hover:text-white'
                }`}
              >
                All
              </button>
              {TASK_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActiveFilter(t.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === t.value
                      ? 'bg-[#FF4D8D] text-white'
                      : 'text-[#C4B5D9] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#22163A]/60 border border-white/[0.06] text-center">
              <p className="text-sm text-[#C4B5D9]">
                এই ক্যাটাগরিতে কোনো কাজ নেই জান। নতুন রিমাইন্ডার যোগ করো।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.07] flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label="Toggle task active"
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        task.active
                          ? 'bg-[#4DFFC3]/20 border-[#4DFFC3] text-[#4DFFC3]'
                          : 'bg-white/[0.04] border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.active ? 'text-white' : 'text-[#C4B5D9]/60 line-through'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-[#C4B5D9] mt-0.5 font-mono-tabular">
                        {task.triggerTime}
                        {task.triggerDate ? ` · ${task.triggerDate}` : ''} ·{' '}
                        {task.repeatPattern} · {task.type}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-[#C4B5D9]/80 mt-1">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label="Delete task"
                    className="p-2 text-[#C4B5D9]/60 hover:text-[#FF5C5C] rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Class Routine + AI Parser */}
        <section className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
                <h2 className="font-display text-base font-semibold text-white">
                  AI Class Routine Parser
                </h2>
              </div>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#C4B5D9] hover:text-white flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Load .txt</span>
                <input
                  type="file"
                  accept=".txt,.csv,.md"
                  className="hidden"
                  onChange={handleUploadRoutineFile}
                />
              </label>
            </div>

            <textarea
              rows={3}
              value={routineInput}
              onChange={(e) => setRoutineInput(e.target.value)}
              placeholder="রুটিন পেস্ট করো — যেমন: রবিবার ১০টায় Math (Room 302), ১২টায় Physics (Lab 2), সোমবার ২টায় Chemistry"
              className="w-full p-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50 focus:border-[#FF4D8D] focus:outline-none"
            />

            {routineFeedback && (
              <p className="text-xs text-[#4DFFC3] bg-[#4DFFC3]/10 border border-[#4DFFC3]/25 p-2.5 rounded-xl">
                {routineFeedback}
              </p>
            )}
            {routineError && (
              <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 border border-[#FF5C5C]/25 p-2.5 rounded-xl">
                {routineError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseRoutine}
                disabled={parsingRoutine || !routineInput.trim()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B57BFF] hover:bg-[#B57BFF]/85 disabled:opacity-40 text-xs font-semibold text-[#1A1025] transition-colors"
              >
                {parsingRoutine ? 'Luna রুটিন সাজাচ্ছে...' : 'রুটিন বিশ্লেষণ করে সেভ করো'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B57BFF]" />
              <span>Weekly Timetable (3-min pre-class alert)</span>
            </h3>

            {routines.length === 0 ? (
              <p className="text-sm text-[#C4B5D9]">
                এখনো কোনো ক্লাস রুটিন সেভ করা হয়নি।
              </p>
            ) : (
              <div className="space-y-2.5">
                {DAYS_ORDER.map((day) => {
                  const dayClasses = routines
                    .filter((r) => r.day.toLowerCase() === day.toLowerCase())
                    .sort((a, b) => a.time24.localeCompare(b.time24));
                  if (dayClasses.length === 0) return null;

                  return (
                    <div
                      key={day}
                      className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.07] space-y-2.5"
                    >
                      <p className="text-xs font-display font-semibold text-[#FF4D8D]">
                        {day}
                      </p>
                      <div className="divide-y divide-white/[0.06]">
                        {dayClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={cls.active}
                                onChange={() => onToggleRoutineEntry(cls.id)}
                                className="accent-[#FF4D8D] w-4 h-4 rounded"
                              />
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    cls.active
                                      ? 'text-white'
                                      : 'text-[#C4B5D9]/50 line-through'
                                  }`}
                                >
                                  {cls.subject}
                                </p>
                                <p className="text-xs text-[#C4B5D9] font-mono-tabular flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{cls.timeDisplay}</span>
                                  {cls.room && <span>· {cls.room}</span>}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteRoutineEntry(cls.id)}
                              className="p-1.5 text-[#C4B5D9]/50 hover:text-[#FF5C5C]"
                              title="Remove class"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
