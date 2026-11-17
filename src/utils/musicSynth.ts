export interface ChordStep {
  name: string;
  midiNotes: number[];
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class LunaAccompanimentSynth {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private activeOscs: OscillatorNode[] = [];

  start(chords: ChordStep[], tempoBpm = 78): void {
    this.stop();
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    this.ctx = ctx;
    const stepMs = Math.max(900, Math.round((60 / Math.max(55, tempoBpm)) * 2 * 1000));

    let stepIndex = 0;

    const playChord = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const chord = chords[stepIndex % chords.length];
      stepIndex++;
      const now = ctx.currentTime;
      const dur = stepMs / 1000;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.085, now + 0.18);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.96);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1150, now);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      chord.midiNotes.forEach((midi, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(midiToFreq(midi), now);

        const arpeggioOffset = idx * 0.09;
        noteGain.gain.setValueAtTime(0.0001, now + arpeggioOffset);
        noteGain.gain.linearRampToValueAtTime(0.28 / chord.midiNotes.length, now + arpeggioOffset + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + arpeggioOffset);
        osc.stop(now + dur + 0.05);
        this.activeOscs.push(osc);
      });
    };

    playChord();
    this.timerId = window.setInterval(playChord, stepMs);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.activeOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // already stopped
      }
    });
    this.activeOscs = [];
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

export const lunaSynth = new LunaAccompanimentSynth();
