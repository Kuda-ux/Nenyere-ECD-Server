/**
 * SoundManager — Web Audio API based sound synthesis for kids' UI.
 * No audio files needed — all sounds are generated programmatically.
 * Works offline, instant playback, perfect for ECD learners.
 */

type SoundName =
  | "pop"
  | "tap"
  | "celebrate"
  | "correct"
  | "wrong"
  | "star"
  | "tinkle"
  | "whoosh"
  | "fanfare"
  | "levelUp"
  | "giggle"
  | "chime"
  | "drumroll"
  | "magic";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _muted = false;
  private masterGain: GainNode | null = null;

  get muted() {
    return this._muted;
  }

  /** Must be called after a user gesture to unlock audio */
  unlock() {
    if (this.ctx) return;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext not available
    }
  }

  init() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("nenyere:sound-muted");
    if (stored === "true") {
      this._muted = true;
    }
  }

  toggleMute() {
    this._muted = !this._muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("nenyere:sound-muted", String(this._muted));
    }
  }

  private get now() {
    return this.ctx?.currentTime ?? 0;
  }

  /** Play a single oscillator note */
  private playNote(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    delay: number = 0,
    volume: number = 0.3,
  ) {
    if (!this.ctx || !this.masterGain || this._muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const startTime = this.now + delay;
    const endTime = startTime + duration;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(endTime);
  }

  /** Play a frequency sweep */
  private playSweep(
    fromFreq: number,
    toFreq: number,
    duration: number,
    type: OscillatorType = "sine",
    delay: number = 0,
    volume: number = 0.3,
  ) {
    if (!this.ctx || !this.masterGain || this._muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    const startTime = this.now + delay;
    const endTime = startTime + duration;

    osc.frequency.setValueAtTime(fromFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(toFreq, endTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(endTime);
  }

  /** Play a noise burst (for percussion-like sounds) */
  private playNoise(duration: number, delay: number = 0, volume: number = 0.15) {
    if (!this.ctx || !this.masterGain || this._muted) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    const startTime = this.now + delay;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  /** Main sound player */
  play(sound: SoundName) {
    if (!this.ctx || this._muted) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    switch (sound) {
      case "pop":
        this.playSweep(400, 800, 0.08, "sine", 0, 0.25);
        break;

      case "tap":
        this.playNote(600, 0.05, "sine", 0, 0.15);
        break;

      case "correct":
        // Happy ascending arpeggio: C-E-G
        this.playNote(523.25, 0.12, "sine", 0, 0.25);     // C5
        this.playNote(659.25, 0.12, "sine", 0.08, 0.25);   // E5
        this.playNote(783.99, 0.2, "sine", 0.16, 0.3);     // G5
        break;

      case "wrong":
        // Gentle descending "try again" tone
        this.playNote(440, 0.15, "triangle", 0, 0.2);      // A4
        this.playNote(349.23, 0.25, "triangle", 0.1, 0.2); // F4
        break;

      case "star":
        // Magical sparkle: high notes ascending fast
        this.playNote(1046.5, 0.06, "sine", 0, 0.2);       // C6
        this.playNote(1318.5, 0.06, "sine", 0.04, 0.2);    // E6
        this.playNote(1567.9, 0.08, "sine", 0.08, 0.25);   // G6
        break;

      case "tinkle":
        // Bell-like sound
        this.playNote(1760, 0.3, "sine", 0, 0.15);
        this.playNote(2093, 0.3, "sine", 0.02, 0.1);
        break;

      case "whoosh":
        // Quick sweep up
        this.playSweep(200, 600, 0.15, "sine", 0, 0.15);
        break;

      case "celebrate":
        // Joyful melody: C-E-G-C octave jump
        this.playNote(523.25, 0.1, "sine", 0, 0.25);       // C5
        this.playNote(659.25, 0.1, "sine", 0.08, 0.25);    // E5
        this.playNote(783.99, 0.1, "sine", 0.16, 0.25);    // G5
        this.playNote(1046.5, 0.3, "sine", 0.24, 0.3);     // C6
        // Sparkle on top
        this.playNote(1318.5, 0.15, "sine", 0.3, 0.15);
        this.playNote(1567.9, 0.15, "sine", 0.35, 0.15);
        break;

      case "fanfare":
        // Triumphant fanfare: G-G-G-C (like a horn)
        this.playNote(392, 0.12, "sawtooth", 0, 0.2);      // G4
        this.playNote(392, 0.12, "sawtooth", 0.14, 0.2);   // G4
        this.playNote(392, 0.12, "sawtooth", 0.28, 0.2);   // G4
        this.playNote(523.25, 0.4, "sawtooth", 0.42, 0.25); // C5
        // Add a little sparkle
        this.playNote(1046.5, 0.3, "sine", 0.42, 0.15);
        break;

      case "levelUp":
        // Level up sound: ascending notes with sparkle
        this.playNote(523.25, 0.08, "square", 0, 0.15);    // C5
        this.playNote(659.25, 0.08, "square", 0.06, 0.15); // E5
        this.playNote(783.99, 0.08, "square", 0.12, 0.15); // G5
        this.playNote(1046.5, 0.2, "sine", 0.18, 0.25);    // C6
        this.playNote(1318.5, 0.2, "sine", 0.22, 0.2);     // E6
        break;

      case "giggle":
        // Playful giggle: quick rising notes
        this.playNote(440, 0.06, "sine", 0, 0.15);
        this.playNote(494, 0.06, "sine", 0.05, 0.15);
        this.playNote(523, 0.06, "sine", 0.1, 0.15);
        this.playNote(440, 0.06, "sine", 0.18, 0.15);
        this.playNote(494, 0.06, "sine", 0.23, 0.15);
        this.playNote(523, 0.1, "sine", 0.28, 0.2);
        break;

      case "chime":
        // Gentle chime: two notes
        this.playNote(880, 0.4, "sine", 0, 0.2);    // A5
        this.playNote(1108.7, 0.4, "sine", 0.05, 0.15); // C#6
        break;

      case "drumroll":
        // Short drumroll using noise
        this.playNoise(0.3, 0, 0.1);
        this.playNoise(0.2, 0.15, 0.12);
        this.playNote(200, 0.1, "sine", 0.35, 0.2);
        break;

      case "magic":
        // Magical transformation sound
        this.playSweep(400, 1600, 0.3, "sine", 0, 0.15);
        this.playNote(1600, 0.15, "sine", 0.3, 0.15);
        this.playNote(2000, 0.2, "sine", 0.35, 0.1);
        break;
    }
  }
}

// Singleton
let soundInstance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!soundInstance) {
    soundInstance = new SoundEngine();
    soundInstance.init();
  }
  return soundInstance;
}

export type { SoundName };
