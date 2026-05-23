export interface SynthNote {
  note: string;     // e.g., "C4", "E4", "G4", "A4", "B4"
  duration: number; // in seconds (e.g., 0.5, 0.25)
  time: number;     // start time from start of loop (in seconds)
}

export interface PlayableSong {
  id: string;
  title: string;
  mood: string;
  stage: string; // e.g. "Childhood", "Youth", "Adulthood", "Golden Years"
  bpm: number;
  description: string;
  story: string;
  lyrics: string[]; // line-by-line strings
  chordProgression: string[]; // e.g., ["Am", "F", "C", "G"]
  melodyPattern: SynthNote[];  // melody script for our Web Audio synthesizer
  bassPattern?: SynthNote[];   // optional bassline track for Web Audio
  colorTheme: string; // Tailwind colors e.g. "from-amber-600 to-rose-600"
  isAI?: boolean; // flag to distinguish generated songs
}

export interface Milestone {
  id: string;
  title: string;
  ageRange: string;
  icon: string; // name of lucide icon
  vibe: string;
}
