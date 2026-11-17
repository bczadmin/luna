export type DetectedInputLang = 'Bangla' | 'English' | 'Mixed';

export function detectInputLanguage(text: string): DetectedInputLang {
  const clean = text.trim();
  if (!clean) return 'Mixed';

  let banglaCount = 0;
  let latinCount = 0;
  for (const ch of clean) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0980 && code <= 0x09ff) {
      banglaCount++;
    } else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
      latinCount++;
    }
  }

  if (banglaCount > 0 && latinCount === 0) return 'Bangla';
  if (latinCount > 0 && banglaCount === 0) return 'English';
  if (banglaCount > latinCount * 2) return 'Bangla';
  if (latinCount > banglaCount * 2) return 'English';
  return 'Mixed';
}

export function stripEmojisForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakLunaText(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const clean = stripEmojisForSpeech(text);
  if (!clean) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.08;

  const voices = window.speechSynthesis.getVoices();
  const hasBangla = /[\u0980-\u09FF]/.test(clean);

  if (options.voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === options.voiceURI);
    if (chosen) utterance.voice = chosen;
  } else if (hasBangla) {
    const bnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('bn'));
    if (bnVoice) {
      utterance.voice = bnVoice;
    }
    utterance.lang = 'bn-BD';
  } else {
    utterance.lang = 'en-US';
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();

  window.speechSynthesis.speak(utterance);
}

let activeAudioEl: HTMLAudioElement | null = null;
let activeAudioCtx: AudioContext | null = null;
let activeRafId = 0;

export function stopLunaSpeech(): void {
  if (activeRafId) {
    cancelAnimationFrame(activeRafId);
    activeRafId = 0;
  }
  if (activeAudioEl) {
    activeAudioEl.pause();
    activeAudioEl.currentTime = 0;
    activeAudioEl = null;
  }
  if (activeAudioCtx) {
    try {
      activeAudioCtx.close();
    } catch {
      // ignore
    }
    activeAudioCtx = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function playAudioWithAnalyser(
  audioDataUrl: string,
  options: {
    rate?: number;
    onAmplitude?: (level: number) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  stopLunaSpeech();
  try {
    const audio = new Audio(audioDataUrl);
    audio.playbackRate = Math.min(1.6, Math.max(0.7, options.rate ?? 1.0));
    activeAudioEl = audio;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;

    if (AudioCtx) {
      const ctx = new AudioCtx();
      activeAudioCtx = ctx;
      const source = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      source.connect(analyser);
      analyser.connect(ctx.destination);
    }

    const tick = () => {
      if (!activeAudioEl || activeAudioEl.paused || activeAudioEl.ended) {
        options.onAmplitude?.(0);
        return;
      }
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        const bins = Math.min(32, dataArray.length);
        for (let i = 0; i < bins; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bins / 255;
        options.onAmplitude?.(Math.min(1, avg * 2.2));
      } else {
        options.onAmplitude?.(0.35 + Math.random() * 0.35);
      }
      activeRafId = requestAnimationFrame(tick);
    };

    audio.onplay = () => {
      if (activeAudioCtx && activeAudioCtx.state === 'suspended') {
        activeAudioCtx.resume().catch(() => {});
      }
      options.onStart?.();
      activeRafId = requestAnimationFrame(tick);
    };
    audio.onended = () => {
      options.onAmplitude?.(0);
      stopLunaSpeech();
      options.onEnd?.();
    };
    audio.onerror = () => {
      options.onAmplitude?.(0);
      stopLunaSpeech();
      options.onError?.();
    };

    audio.play().catch(() => {
      options.onAmplitude?.(0);
      stopLunaSpeech();
      options.onError?.();
    });
  } catch {
    options.onAmplitude?.(0);
    options.onError?.();
  }
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

export function createBrowserSpeechRecognizer(
  lang: string
): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = true;
  return rec;
}
