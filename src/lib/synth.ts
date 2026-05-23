import { PlayableSong, SynthNote } from "../types";

export function noteToFreq(note: string): number {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const regex = /^([CDEFGAB]#?b?)(-?\d+)$/;
  const match = note.match(regex);
  if (!match) return 440;
  
  let name = match[1];
  const octave = parseInt(match[2], 10);
  
  // Normalize flats to sharps
  if (name.endsWith("b")) {
    if (name === "Db") name = "C#";
    else if (name === "Eb") name = "D#";
    else if (name === "Gb") name = "F#";
    else if (name === "Ab") name = "G#";
    else if (name === "Bb") name = "A#";
  }
  
  const idx = notes.indexOf(name);
  if (idx === -1) return 440;
  
  // Calculate relative to A4 (octave 4, note A (index 9)) which is 440Hz
  const distance = (octave - 4) * 12 + (idx - 9);
  return 440 * Math.pow(2, distance / 12);
}

export function getChordNotes(chord: string): string[] {
  // Simple triad mapping in octaves 2 and 3 for full, deep background pads
  const mapping: Record<string, string[]> = {
    "C": ["C3", "E3", "G3"],
    "G": ["G2", "B2", "D3"],
    "Am": ["A2", "C3", "E3"],
    "F": ["F2", "A2", "C3"],
    "Em": ["E2", "G2", "B2"],
    "Dm": ["D2", "F2", "A2"],
    "Bb": ["Bb2", "D3", "F3"],
    "D": ["D3", "F#3", "A3"],
    "A": ["A2", "C#3", "E3"],
    "C#m": ["C#3", "E3", "G#3"],
    "F#m": ["F#2", "A2", "C#3"],
    "Bm": ["B2", "D3", "F#3"]
  };
  
  // Default fallback if chord name is complex or unrecognized
  const key = chord.trim();
  if (mapping[key]) return mapping[key];
  
  // Try custom extraction
  if (key.endsWith("m")) {
    const root = key.substring(0, key.length - 1);
    const triad = mapping[root];
    if (triad) return [triad[0], "C3", triad[2]]; // Minor fallback chord
  }
  
  return ["C3", "E3", "G3"]; // ultimate fallback
}

export class LifeStageSynth {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentSong: PlayableSong | null = null;
  private loopTimer: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private volumeValue: number = 0.5;
  private scheduledOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  
  // Callbacks for UI updates
  public onTimeUpdate: (currentTime: number, duration: number) => void = () => {};
  public onEnded: () => void = () => {};
  
  constructor() {
    // Initialized lazily on first user interaction to bypass browser restrictions
  }
  
  private initContext() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create master structural nodes
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);
    
    // Connect masterGain -> analyser -> destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }
  
  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
  
  public setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volumeValue, this.ctx.currentTime + 0.1);
    }
  }
  
  public play(song: PlayableSong) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    
    if (this.isRunning) {
      this.stop();
    }
    
    // Resume context if suspended
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    this.currentSong = song;
    this.isRunning = true;
    this.startTime = this.ctx.currentTime;
    
    // Start playback loop
    this.playLoopCycle();
    
    // Timer to handle dynamic time indicators and loop repeating
    const beatDuration = 60 / song.bpm;
    const loopDuration = 16 * beatDuration; // standard 16 beats loop length
    
    let tickCount = 0;
    this.loopTimer = setInterval(() => {
      if (!this.ctx || !this.isRunning) return;
      const elapsed = this.ctx.currentTime - this.startTime;
      
      this.onTimeUpdate(elapsed % loopDuration, loopDuration);
      
      tickCount++;
      // Re-trigger loop once we hit the loop duration limit
      if (elapsed >= loopDuration) {
        this.startTime = this.ctx.currentTime;
        this.playLoopCycle();
      }
    }, 100);
  }
  
  private playLoopCycle() {
    if (!this.ctx || !this.currentSong || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const song = this.currentSong;
    const beatDuration = 60 / song.bpm;
    const loopDuration = 16 * beatDuration;
    
    // Clear any leftover scheduled sounds
    this.scheduledOscillators = [];

    // Trigger chords (triggered at Beat 1, Beat 5, Beat 9, Beat 13)
    const chords = song.chordProgression;
    for (let i = 0; i < 4; i++) {
      const chordIndex = i % chords.length;
      const chordName = chords[chordIndex];
      const chordNotes = getChordNotes(chordName);
      
      // Start time of the chord in the current loop (every 4 beats)
      const chordStartTime = now + (i * 4 * beatDuration);
      const chordDuration = 4 * beatDuration;
      
      // Trigger each note in the triad chord
      chordNotes.forEach((note) => {
        const freq = noteToFreq(note);
        this.schedulePadNote(freq, chordStartTime, chordDuration, song.stage);
      });
    }
    
    // Trigger melody notes
    const melody = song.melodyPattern;
    melody.forEach((noteObj) => {
      const freq = noteToFreq(noteObj.note);
      // Melody pattern noteObj.time is proportional to scale, mapping it safely
      const noteStartTime = now + (noteObj.time * beatDuration);
      const noteDuration = noteObj.duration * beatDuration;
      
      if (noteObj.time * beatDuration < loopDuration) {
        this.scheduleMelodyNote(freq, noteStartTime, noteDuration, song.stage);
      }
    });

    // Simple procedural drum beat for youthful or adult stages (subtle rhythmic accent)
    if (song.stage === "Youth" || song.stage === "Adulthood") {
      for (let beat = 0; beat < 16; beat++) {
        const beatTime = now + (beat * beatDuration);
        
        // Kick drum on 1, 5, 9, 13
        if (beat % 4 === 0) {
          this.scheduleKickNode(beatTime);
        }
        
        // Hihat on odd beats
        if (beat % 2 !== 0) {
          this.scheduleHihatNode(beatTime);
        }
      }
    }
  }
  
  private scheduleMelodyNote(freq: number, start: number, duration: number, stage: string) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    // Configure wave style according to life stages
    if (stage === "Childhood" || stage === "Masa Kecil") {
      // Warm chime lullaby
      osc.type = "sine";
    } else if (stage === "Youth" || stage === "Masa Remaja") {
      // Energetic tech synth-pop
      osc.type = "square";
    } else if (stage === "Adulthood" || stage === "Masa Dewasa") {
      // Smooth modern triangle pad
      osc.type = "triangle";
    } else {
      // Ambient atmospheric wave
      osc.type = "sine";
    }
    
    osc.frequency.setValueAtTime(freq, start);
    
    // Volume envelope ADSR
    gainNode.gain.setValueAtTime(0, start);
    const attack = 0.05; // sharp attack for melody
    const decay = 0.1;
    const sustain = 0.6;
    const release = 0.2;
    
    gainNode.gain.linearRampToValueAtTime(0.2, start + attack);
    gainNode.gain.linearRampToValueAtTime(0.2 * sustain, start + attack + decay);
    gainNode.gain.setValueAtTime(0.2 * sustain, start + duration - release);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    
    // Lowpass filter to avoid sharp aliasing
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(stage === "Youth" ? 2500 : 1500, start);
    
    osc.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.masterGain);
    
    osc.start(start);
    osc.stop(start + duration);
    
    this.scheduledOscillators.push({ osc, gain: gainNode });
  }
  
  private schedulePadNote(freq: number, start: number, duration: number, stage: string) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    // Keyboard chord pad wave
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    
    // Soft attack, long release envelope (Warm and dreamy background)
    gainNode.gain.setValueAtTime(0, start);
    const attack = 0.6; // gentle fade in
    const sustain = 0.4;
    const release = 0.8;
    
    gainNode.gain.linearRampToValueAtTime(0.12, start + attack);
    gainNode.gain.setValueAtTime(0.12 * sustain, start + duration - release);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    
    // Lowpass filter for warm, cozy sound signature
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, start); // mellow pad cutoff
    
    osc.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.masterGain);
    
    osc.start(start);
    osc.stop(start + duration);
    
    this.scheduledOscillators.push({ osc, gain: gainNode });
  }

  private scheduleKickNode(time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3); // deep pitch sweep
    
    gainNode.gain.setValueAtTime(0.25, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private scheduleHihatNode(time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    // Create structured white noise hi-hat using dynamic buffer
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms short burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7000, time); // sharp ticking frequency
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    noiseNode.start(time);
    noiseNode.stop(time + 0.05);
  }
  
  public stop() {
    this.isRunning = false;
    
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    
    // Instantly stop all scheduled oscillators and release bindings
    this.scheduledOscillators.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch (e) {
        // Safe play boundary catch
      }
    });
    this.scheduledOscillators = [];
    
    this.onTimeUpdate(0, 16);
    this.onEnded();
  }
  
  public isPlayingState() {
    return this.isRunning;
  }
  
  public getActiveSong(): PlayableSong | null {
    return this.currentSong;
  }
}
