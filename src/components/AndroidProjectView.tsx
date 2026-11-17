import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  Copy,
  Check,
  FileCode2,
  FolderTree,
  Smartphone,
} from 'lucide-react';
import { ANDROID_CORE_FILES, AndroidSourceFile } from '../data/androidCoreFiles';
import { ANDROID_UI_FILES } from '../data/androidUiFiles';

const ALL_FILES: AndroidSourceFile[] = [...ANDROID_CORE_FILES, ...ANDROID_UI_FILES];

export const AndroidProjectView: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>(ALL_FILES[0].path);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const selectedFile =
    ALL_FILES.find((f) => f.path === selectedPath) || ALL_FILES[0];

  const handleCopyFile = () => {
    navigator.clipboard?.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      ALL_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LunaCompanion-Android.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-[#FF4D8D]" />
            <span>Luna Android Studio Kotlin Project</span>
          </h1>
          <p className="text-sm text-[#C4B5D9] mt-1">
            Complete Jetpack Compose, Room DB, Hilt, WorkManager, AccessibilityService & Camera2 source suite ({ALL_FILES.length} files)
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FF4D8D] hover:bg-[#FF6BA8] text-xs font-semibold text-white flex items-center gap-2 transition-colors self-start md:self-auto whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloadingZip
              ? 'Generating .zip...'
              : 'Download Android Project (.zip)'}
          </span>
        </button>
      </div>

      {/* APK Build Note */}
      <div className="p-4 rounded-2xl bg-[#22163A] border border-[#B57BFF]/30 text-xs sm:text-sm text-[#C4B5D9] leading-relaxed">
        <p className="text-white font-semibold mb-1">
          How to get your installable <code className="font-mono-tabular text-[#FF4D8D]">luna.apk</code> file:
        </p>
        <p>
          This browser sandbox runs Node.js without an Android SDK compiler, so click{' '}
          <strong className="text-white">Download Android Project (.zip)</strong> above to get the full ready-to-build project (including{' '}
          <code className="font-mono-tabular text-[#FF4D8D]">.github/workflows/build-apk.yml</code>). Push the extracted folder to a GitHub repository and open{' '}
          <strong className="text-white">Actions &gt; Build luna.apk</strong> to download{' '}
          <code className="font-mono-tabular text-white">luna.apk</code> automatically—or open in Android Studio and click{' '}
          <strong className="text-white">Build APK(s)</strong>.
        </p>
      </div>

      {/* Explorer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[540px]">
        {/* File Tree */}
        <div className="lg:col-span-4 rounded-2xl bg-[#22163A] border border-white/[0.08] p-3 flex flex-col max-h-[600px]">
          <div className="px-2 py-2 border-b border-white/[0.07] flex items-center gap-2 text-xs font-semibold text-[#C4B5D9]">
            <FolderTree className="w-4 h-4 text-[#B57BFF]" />
            <span>Project Files</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1">
            {ALL_FILES.map((file) => {
              const active = file.path === selectedFile.path;
              const shortName = file.path.split('/').pop();
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex flex-col gap-0.5 ${
                    active
                      ? 'bg-[#FF4D8D]/20 border border-[#FF4D8D]/45 text-white'
                      : 'hover:bg-white/[0.05] text-[#C4B5D9]'
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-2 truncate">
                    <FileCode2 className="w-3.5 h-3.5 text-[#FF4D8D] shrink-0" />
                    <span className="truncate">{shortName}</span>
                  </span>
                  <span className="text-[10px] font-mono-tabular text-[#C4B5D9]/65 truncate pl-5">
                    {file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 rounded-2xl bg-[#22163A] border border-white/[0.08] flex flex-col max-h-[600px] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono-tabular text-white truncate">
                {selectedFile.path}
              </p>
              <p className="text-xs text-[#C4B5D9] truncate mt-0.5">
                {selectedFile.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyFile}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-white flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#4DFFC3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 overflow-auto p-4 bg-[#1A1025] text-xs font-mono-tabular text-[#E9E1F5] leading-relaxed">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
