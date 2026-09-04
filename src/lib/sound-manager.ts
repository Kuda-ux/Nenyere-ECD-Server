/**
 * SoundManager — Enhanced Web Audio API sound synthesis for kids' UI.
 * Rich, layered sounds with harmonics, vibrato, filters, and effects.
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
  | "magic"
  | "bubble"
  | "swoosh"
  | "sparkle"
  | "bounce"
  | "rocket"
  | "rainbow"
  | "animal"
  | "cheer"
  | "bell"
  | "coin"
  | "slide"
  | "wobble";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _muted = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private _musicPlaying = false;

  get muted() {
    return this._muted;
  }

  /** Must be called after a user gesture to unlock audio */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.08;
      this.musicGain.connect(this.ctx.destination);
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
    if (this._muted) {
      this.stopMusic();
    }
  }

  private get now() {
    return this.ctx?.currentTime ?? 0;
  }

  /** Play a note with optional harmonics for richer timbre */
  private playNote(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    delay: number = 0,
    volume: number = 0.3,
    harmonics: boolean = false,
    vibrato: boolean = false,
  ) {
    if (!this.ctx || !this.masterGain || this._muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Vibrato for warmth
    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 5;
      lfoGain.gain.value = freq * 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(this.now + delay);
      lfo.stop(this.now + delay + duration + 0.1);
    }

    const startTime = this.now + delay;
    const endTime = startTime + duration;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(endTime);

    // Add harmonics for richer sound
    if (harmonics) {
      this.playNote(freq * 2, duration * 0.7, type, delay, volume * 0.3, false, false);
      this.playNote(freq * 3, duration * 0.5, type, delay, volume * 0.15, false, false);
    }
  }

  /** Play a frequency sweep with optional filter */
  private playSweep(
    fromFreq: number,
    toFreq: number,
    duration: number,
    type: OscillatorType = "sine",
    delay: number = 0,
    volume: number = 0.3,
    filterFreq?: number,
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
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    let node: AudioNode = osc;
    if (filterFreq !== undefined) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      node = filter;
    }

    node.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(endTime);
  }

  /** Play a noise burst with filter */
  private playNoise(
    duration: number,
    delay: number = 0,
    volume: number = 0.15,
    filterType: BiquadFilterType = "highpass",
    filterFreq: number = 800,
  ) {
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
    filter.type = filterType;
    filter.frequency.value = filterFreq;

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

  /** Play a bell-like tone with inharmonic partials */
  private playBell(freq: number, duration: number, delay: number = 0, volume: number = 0.2) {
    if (!this.ctx || !this.masterGain || this._muted) return;
    const partials = [1, 2.76, 5.4, 8.93];
    const decayRates = [1, 0.6, 0.4, 0.25];
    for (let i = 0; i < partials.length; i++) {
      this.playNote(freq * partials[i], duration * decayRates[i], "sine", delay, volume * decayRates[i], false, false);
    }
  }

  /** Main sound player */
  play(sound: SoundName) {
    if (!this.ctx || this._muted) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    switch (sound) {
      case "pop": {
        // Bouncy pop with harmonics — like a bubble bursting
        this.playSweep(300, 900, 0.08, "sine", 0, 0.3);
        this.playNote(900, 0.04, "triangle", 0.06, 0.15);
        this.playNoise(0.03, 0, 0.05, "highpass", 2000);
        break;
      }

      case "tap": {
        // Soft wood-like tap
        this.playNote(700, 0.04, "triangle", 0, 0.12);
        this.playNote(350, 0.06, "sine", 0, 0.08);
        break;
      }

      case "correct": {
        // Joyful ascending arpeggio with harmonics: C-E-G-C
        this.playNote(523.25, 0.15, "sine", 0, 0.25, true, true);      // C5
        this.playNote(659.25, 0.15, "sine", 0.1, 0.25, true, true);    // E5
        this.playNote(783.99, 0.15, "sine", 0.2, 0.25, true, true);    // G5
        this.playNote(1046.5, 0.3, "sine", 0.3, 0.3, true, true);      // C6
        // Sparkle on top
        this.playNote(1567.9, 0.1, "sine", 0.35, 0.1);
        this.playNote(2093, 0.1, "sine", 0.4, 0.08);
        break;
      }

      case "wrong": {
        // Gentle "try again" — descending with soft texture
        this.playNote(440, 0.12, "triangle", 0, 0.2);
        this.playNote(349.23, 0.15, "triangle", 0.08, 0.18);
        this.playNote(293.66, 0.25, "triangle", 0.16, 0.15);
        // Soft wobble
        this.playSweep(300, 280, 0.3, "sine", 0.1, 0.08);
        break;
      }

      case "star": {
        // Magical sparkle cascade
        this.playNote(1046.5, 0.08, "sine", 0, 0.2);
        this.playNote(1318.5, 0.08, "sine", 0.04, 0.2);
        this.playNote(1567.9, 0.08, "sine", 0.08, 0.25);
        this.playNote(2093, 0.12, "sine", 0.12, 0.2);
        this.playNoise(0.05, 0.1, 0.04, "highpass", 4000);
        break;
      }

      case "tinkle": {
        // Bell-like sound with partials
        this.playBell(1760, 0.4, 0, 0.15);
        this.playBell(2093, 0.4, 0.03, 0.1);
        break;
      }

      case "whoosh": {
        // Quick sweep up with filter
        this.playSweep(150, 800, 0.2, "sawtooth", 0, 0.12, 1200);
        this.playNoise(0.15, 0, 0.06, "bandpass", 600);
        break;
      }

      case "swoosh": {
        // Longer dramatic swoosh
        this.playSweep(100, 1200, 0.35, "sawtooth", 0, 0.1, 1500);
        this.playNoise(0.3, 0, 0.08, "bandpass", 800);
        break;
      }

      case "celebrate": {
        // Joyful melody: C-E-G-C with harmonics + sparkles
        this.playNote(523.25, 0.12, "sine", 0, 0.25, true, true);
        this.playNote(659.25, 0.12, "sine", 0.1, 0.25, true, true);
        this.playNote(783.99, 0.12, "sine", 0.2, 0.25, true, true);
        this.playNote(1046.5, 0.35, "sine", 0.3, 0.3, true, true);
        // Sparkle cascade
        this.playNote(1318.5, 0.12, "sine", 0.38, 0.15);
        this.playNote(1567.9, 0.12, "sine", 0.42, 0.15);
        this.playNote(2093, 0.15, "sine", 0.46, 0.12);
        // Tinkle bell
        this.playBell(1567.9, 0.5, 0.3, 0.1);
        break;
      }

      case "fanfare": {
        // Epic triumphant fanfare: G-G-G-C with brass-like harmonics
        this.playNote(392, 0.15, "sawtooth", 0, 0.18, true);
        this.playNote(392, 0.15, "sawtooth", 0.18, 0.18, true);
        this.playNote(392, 0.15, "sawtooth", 0.36, 0.18, true);
        this.playNote(523.25, 0.5, "sawtooth", 0.54, 0.22, true);
        // Harmony
        this.playNote(659.25, 0.5, "sawtooth", 0.54, 0.12, true);
        this.playNote(783.99, 0.5, "sawtooth", 0.54, 0.1, true);
        // Sparkle on top
        this.playNote(1046.5, 0.3, "sine", 0.54, 0.12);
        this.playNote(1318.5, 0.3, "sine", 0.6, 0.1);
        // Cymbal crash
        this.playNoise(0.4, 0.54, 0.08, "highpass", 3000);
        break;
      }

      case "levelUp": {
        // Level up: ascending arpeggio with square wave (game-like)
        this.playNote(523.25, 0.08, "square", 0, 0.12);
        this.playNote(659.25, 0.08, "square", 0.06, 0.12);
        this.playNote(783.99, 0.08, "square", 0.12, 0.12);
        this.playNote(1046.5, 0.15, "square", 0.18, 0.15);
        this.playNote(1318.5, 0.15, "sine", 0.24, 0.2, true);
        this.playNote(1567.9, 0.2, "sine", 0.3, 0.15, true);
        // Coin sound
        this.playNote(987.77, 0.06, "square", 0.36, 0.1);
        this.playNote(1318.5, 0.15, "square", 0.4, 0.1);
        break;
      }

      case "giggle": {
        // Playful giggle: rising notes with vibrato
        this.playNote(440, 0.08, "sine", 0, 0.15, false, true);
        this.playNote(494, 0.08, "sine", 0.06, 0.15, false, true);
        this.playNote(523, 0.08, "sine", 0.12, 0.15, false, true);
        this.playNote(440, 0.08, "sine", 0.22, 0.15, false, true);
        this.playNote(494, 0.08, "sine", 0.28, 0.15, false, true);
        this.playNote(523, 0.12, "sine", 0.34, 0.2, false, true);
        break;
      }

      case "chime": {
        // Gentle wind chime: multiple bell tones
        this.playBell(880, 0.5, 0, 0.15);
        this.playBell(1108.7, 0.5, 0.08, 0.12);
        this.playBell(1318.5, 0.5, 0.16, 0.1);
        break;
      }

      case "bell": {
        // Single bell strike
        this.playBell(880, 0.6, 0, 0.2);
        this.playBell(659.25, 0.6, 0.02, 0.1);
        break;
      }

      case "drumroll": {
        // Drumroll with filtered noise building up
        this.playNoise(0.15, 0, 0.06, "bandpass", 200);
        this.playNoise(0.15, 0.1, 0.08, "bandpass", 200);
        this.playNoise(0.15, 0.2, 0.1, "bandpass", 200);
        this.playNoise(0.15, 0.3, 0.12, "bandpass", 200);
        this.playNoise(0.15, 0.4, 0.14, "bandpass", 200);
        // Final hit
        this.playNote(150, 0.15, "sine", 0.5, 0.25);
        this.playNoise(0.1, 0.5, 0.15, "bandpass", 300);
        break;
      }

      case "magic": {
        // Magical transformation: shimmer + sweep
        this.playSweep(400, 1800, 0.4, "sine", 0, 0.12);
        this.playNote(1800, 0.15, "sine", 0.35, 0.1);
        this.playNote(2400, 0.2, "sine", 0.4, 0.08);
        // Sparkle cascade
        this.playNote(1567.9, 0.08, "sine", 0.1, 0.08);
        this.playNote(2093, 0.08, "sine", 0.15, 0.06);
        this.playNote(2637, 0.1, "sine", 0.2, 0.05);
        break;
      }

      case "bubble": {
        // Underwater bubble pop
        this.playSweep(200, 500, 0.1, "sine", 0, 0.15);
        this.playSweep(300, 600, 0.08, "sine", 0.05, 0.1);
        this.playNoise(0.04, 0.08, 0.04, "lowpass", 500);
        break;
      }

      case "sparkle": {
        // Continuous sparkle
        this.playNote(2093, 0.06, "sine", 0, 0.1);
        this.playNote(2637, 0.06, "sine", 0.03, 0.08);
        this.playNote(1567.9, 0.06, "sine", 0.06, 0.1);
        this.playNote(2093, 0.06, "sine", 0.09, 0.08);
        this.playNote(1318.5, 0.08, "sine", 0.12, 0.1);
        break;
      }

      case "bounce": {
        // Bouncy spring sound
        this.playSweep(800, 300, 0.12, "sine", 0, 0.15);
        this.playSweep(300, 600, 0.08, "sine", 0.1, 0.1);
        break;
      }

      case "rocket": {
        // Rocket launch: rising noise + sweep
        this.playSweep(100, 800, 0.6, "sawtooth", 0, 0.1, 800);
        this.playNoise(0.6, 0, 0.08, "bandpass", 400);
        this.playNoise(0.3, 0.3, 0.1, "highpass", 2000);
        // Whoosh at peak
        this.playNote(1046.5, 0.2, "sine", 0.5, 0.15);
        break;
      }

      case "rainbow": {
        // Rainbow glide: ascending notes with color
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
        for (let i = 0; i < notes.length; i++) {
          this.playNote(notes[i], 0.1, "sine", i * 0.06, 0.15, true, true);
        }
        // Final sparkle
        this.playNote(2093, 0.2, "sine", notes.length * 0.06, 0.1);
        break;
      }

      case "animal": {
        // Fun animal sound: low moo + high squeak
        this.playSweep(200, 150, 0.3, "sawtooth", 0, 0.15, 400);
        this.playNote(150, 0.2, "triangle", 0.1, 0.1);
        break;
      }

      case "cheer": {
        // Crowd cheer: noise burst + ascending notes
        this.playNoise(0.5, 0, 0.06, "bandpass", 1000);
        this.playNote(523.25, 0.1, "sine", 0.1, 0.12);
        this.playNote(659.25, 0.1, "sine", 0.18, 0.12);
        this.playNote(783.99, 0.15, "sine", 0.26, 0.15);
        this.playNote(1046.5, 0.2, "sine", 0.36, 0.15);
        break;
      }

      case "coin": {
        // Classic coin collect sound
        this.playNote(987.77, 0.06, "square", 0, 0.12);
        this.playNote(1318.5, 0.15, "square", 0.05, 0.12);
        break;
      }

      case "slide": {
        // Slide whistle: down then up
        this.playSweep(800, 200, 0.2, "sine", 0, 0.15);
        this.playSweep(200, 500, 0.1, "sine", 0.18, 0.1);
        break;
      }

      case "wobble": {
        // Wobble bass: low frequency wobble
        this.playSweep(150, 120, 0.15, "triangle", 0, 0.15);
        this.playSweep(120, 180, 0.1, "triangle", 0.12, 0.12);
        this.playSweep(180, 100, 0.12, "triangle", 0.2, 0.1);
        break;
      }
    }
  }

  /** Start gentle background music loop */
  startMusic() {
    if (!this.ctx || !this.musicGain || this._muted || this._musicPlaying) return;
    this._musicPlaying = true;

    // Simple pentatonic melody loop
    const melody = [
      { freq: 523.25, time: 0, dur: 0.3 },     // C5
      { freq: 659.25, time: 0.4, dur: 0.3 },   // E5
      { freq: 783.99, time: 0.8, dur: 0.3 },   // G5
      { freq: 880, time: 1.2, dur: 0.3 },      // A5
      { freq: 783.99, time: 1.6, dur: 0.3 },   // G5
      { freq: 659.25, time: 2.0, dur: 0.3 },   // E5
      { freq: 587.33, time: 2.4, dur: 0.3 },   // D5
      { freq: 523.25, time: 2.8, dur: 0.5 },   // C5
    ];

    const playLoop = () => {
      if (!this.ctx || !this.musicGain || this._muted || !this._musicPlaying) return;

      for (const note of melody) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = note.freq;
        const start = this.now + note.time;
        const end = start + note.dur;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.5, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, end);
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(start);
        osc.stop(end);
      }

      // Schedule next loop
      const loopDuration = 3.3;
      setTimeout(playLoop, loopDuration * 1000);
    };

    playLoop();
  }

  stopMusic() {
    this._musicPlaying = false;
  }

  get musicPlaying() {
    return this._musicPlaying;
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
