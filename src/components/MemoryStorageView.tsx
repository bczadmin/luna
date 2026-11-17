import React, { useState } from 'react';
import {
  Search,
  Download,
  Trash2,
  Brain,
  FolderOpen,
  FileText,
  Send,
  Plus,
  Upload,
} from 'lucide-react';
import {
  ChatMessage,
  ChatSession,
  MemoryFact,
  WorkspaceFile,
} from '../types/luna';

interface MemoryStorageViewProps {
  sessions: ChatSession[];
  activeSessionId: string;
  messages: ChatMessage[];
  memories: MemoryFact[];
  files: WorkspaceFile[];
  onSwitchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onAddMemoryFact: (fact: string) => void;
  onDeleteMemoryFact: (id: string) => void;
  onClearMemories: () => void;
  onAddFile: (file: Omit<WorkspaceFile, 'id' | 'updatedAt'>) => void;
  onDeleteFile: (id: string) => void;
  onSendFileToLuna: (file: WorkspaceFile) => void;
}

export const MemoryStorageView: React.FC<MemoryStorageViewProps> = ({
  sessions,
  activeSessionId,
  messages,
  memories,
  files,
  onSwitchSession,
  onDeleteSession,
  onClearHistory,
  onAddMemoryFact,
  onDeleteMemoryFact,
  onClearMemories,
  onAddFile,
  onDeleteFile,
  onSendFileToLuna,
}) => {
  const [subTab, setSubTab] = useState<'history' | 'memories' | 'storage'>(
    'history'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [newFact, setNewFact] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const sessionMsgs = messages.filter((m) => m.sessionId === s.id);
    return (
      s.title.toLowerCase().includes(q) ||
      sessionMsgs.some((m) => m.text.toLowerCase().includes(q))
    );
  });

  const exportHistory = (format: 'txt' | 'json') => {
    let content = '';
    if (format === 'json') {
      content = JSON.stringify({ sessions, messages, memories }, null, 2);
    } else {
      content = sessions
        .map((s) => {
          const msgs = messages
            .filter((m) => m.sessionId === s.id)
            .map(
              (m) =>
                `[${new Date(m.timestamp).toLocaleString()}] ${m.sender.toUpperCase()}: ${
                  m.text
                }`
            )
            .join('\n');
          return `=== ${s.title} ===\n${msgs}\n`;
        })
        .join('\n');
    }

    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna_history_${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAddFile({
        name: file.name,
        folder: '/Documents',
        mimeType: file.type || 'text/plain',
        sizeBytes: file.size,
        content: String(reader.result || ''),
      });
    };
    reader.readAsText(file);
  };

  const handleCreateNoteFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileContent.trim()) return;
    onAddFile({
      name: newFileName.trim().endsWith('.txt')
        ? newFileName.trim()
        : `${newFileName.trim()}.txt`,
      folder: '/Notes',
      mimeType: 'text/plain',
      sizeBytes: new Blob([newFileContent]).size,
      content: newFileContent,
    });
    setNewFileName('');
    setNewFileContent('');
    setShowNewFile(false);
  };

  const folders = ['ALL', ...Array.from(new Set(files.map((f) => f.folder)))];
  const visibleFiles = files.filter((f) =>
    selectedFolder === 'ALL' ? true : f.folder === selectedFolder
  );

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          History, Memory & Storage
        </h1>
        <p className="text-sm text-[#C4B5D9] mt-1">
          আমাদের পুরনো কথোপকথন, Luna-র মনে রাখা তথ্য আর তোমার ফাইলগুলো
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#22163A] border border-white/[0.07]">
        <button
          type="button"
          onClick={() => setSubTab('history')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            subTab === 'history'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          Conversation History
        </button>
        <button
          type="button"
          onClick={() => setSubTab('memories')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            subTab === 'memories'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          Long-Term Memory ({memories.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('storage')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            subTab === 'storage'
              ? 'bg-[#FF4D8D] text-white'
              : 'text-[#C4B5D9] hover:text-white'
          }`}
        >
          Storage Browser ({files.length})
        </button>
      </div>

      {/* TAB 1: HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#C4B5D9] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পুরনো কথা খুঁজো..."
                className="w-full min-h-[42px] pl-10 pr-4 rounded-xl bg-[#22163A] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50 focus:border-[#FF4D8D] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportHistory('txt')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .txt</span>
              </button>
              <button
                type="button"
                onClick={() => exportHistory('json')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .json</span>
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FF5C5C]/15 hover:bg-[#FF5C5C]/25 border border-[#FF5C5C]/30 text-xs text-[#FF5C5C]"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const count = messages.filter(
                (m) => m.sessionId === session.id
              ).length;
              const isCurrent = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-[#22163A] border-[#FF4D8D]/45'
                      : 'bg-[#22163A]/65 border-white/[0.07]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSwitchSession(session.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-semibold text-white truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-[#C4B5D9] mt-0.5 font-mono-tabular">
                      {new Date(session.updatedAt).toLocaleDateString()} · {count}{' '}
                      messages {isCurrent ? '· Active' : ''}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteSession(session.id)}
                    className="p-2 text-[#C4B5D9]/60 hover:text-[#FF5C5C]"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LONG-TERM MEMORY */}
      {subTab === 'memories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#22163A] border border-white/[0.08] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Luna যেন মনে রাখে এমন কিছু যোগ করো (যেমন: আমার শুক্রবার Physics পরীক্ষা)..."
              className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white placeholder:text-[#C4B5D9]/50"
            />
            <button
              type="button"
              onClick={() => {
                if (newFact.trim()) {
                  onAddMemoryFact(newFact.trim());
                  setNewFact('');
                }
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF4D8D] text-xs font-semibold text-white whitespace-nowrap"
            >
              Add Memory
            </button>
            {memories.length > 0 && (
              <button
                type="button"
                onClick={onClearMemories}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-xs text-[#FF5C5C] whitespace-nowrap"
              >
                Clear Memory
              </button>
            )}
          </div>

          {memories.length === 0 ? (
            <p className="text-sm text-[#C4B5D9]">
              এখনো কোনো লং-টার্ম মেমোরি সেভ করা হয়নি। কথা বলতে থাকলে Luna নিজেই গুরুত্বপূর্ণ তথ্য মনে রাখবে।
            </p>
          ) : (
            <div className="space-y-2">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.07] flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Brain className="w-4 h-4 text-[#B57BFF] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-white">{mem.fact}</p>
                      <p className="text-[11px] text-[#C4B5D9]/70 font-mono-tabular mt-0.5">
                        Saved {new Date(mem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteMemoryFact(mem.id)}
                    className="p-2 text-[#C4B5D9]/60 hover:text-[#FF5C5C]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORAGE BROWSER */}
      {subTab === 'storage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setSelectedFolder(folder)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                    selectedFolder === folder
                      ? 'bg-[#B57BFF] text-[#1A1025]'
                      : 'bg-[#22163A] text-[#C4B5D9] hover:text-white'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{folder}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs text-white flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import File</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv,text/*"
                  className="hidden"
                  onChange={handleUploadLocalFile}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowNewFile((v) => !v)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FF4D8D] text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {showNewFile && (
            <form
              onSubmit={handleCreateNoteFile}
              className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.08] space-y-3"
            >
              <input
                type="text"
                required
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="ফাইলের নাম (যেমন: physics_notes.txt)"
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
              />
              <textarea
                rows={3}
                required
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="ফাইলের ভেতরের লেখা..."
                className="w-full p-3 rounded-xl bg-[#1A1025] border border-white/[0.1] text-sm text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFile(false)}
                  className="px-3 py-1.5 text-xs text-[#C4B5D9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF4D8D] text-xs font-semibold text-white"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-2xl bg-[#22163A] border border-white/[0.08] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#FFB347] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] font-mono-tabular text-[#C4B5D9]">
                          {file.folder} · {file.sizeBytes} bytes
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1.5 text-[#C4B5D9]/60 hover:text-[#FF5C5C]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <pre className="mt-3 p-3 rounded-xl bg-[#1A1025] text-xs text-[#C4B5D9] font-mono-tabular max-h-28 overflow-y-auto whitespace-pre-wrap">
                    {file.content}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSendFileToLuna(file)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FF4D8D]/15 hover:bg-[#FF4D8D] border border-[#FF4D8D]/40 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Luna</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
