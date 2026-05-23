/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  Music,
  Activity,
  Calendar,
  Compass
} from "lucide-react";
import { PlayableSong } from "./types";
import { LifeStageSynth } from "./lib/synth";
import { VinylDisk } from "./components/VinylDisk";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { Timeline } from "./components/Timeline";

// Predefined nostalgic preset songs tracing childhood to old age
const PRESET_SONGS: PlayableSong[] = [
  {
    id: "preset-childhood",
    title: "Gumam Pagi Hari",
    mood: "Damai & Hangat",
    stage: "Masa Kecil",
    bpm: 75,
    description: "Alunan lembut yang menyertai mimpi-mimpi masa kecil.",
    story: "Menggambarkan ketenangan pagi hari di teras rumah masa kecil Anda, saat dunia terasa begitu luas dan aman di dalam dekapan kasih sayang keluarga.",
    lyrics: [
      "Angin pagi berbisik tenang di dahan,",
      "Matahari menyapa jendela kayu tua,",
      "Dunia mungil penuh dengan angan,",
      "Langkah kecil siap melangkah ceria."
    ],
    chordProgression: ["C", "F", "G", "C"],
    melodyPattern: [
      { note: "E4", duration: 0.5, time: 0.0 },
      { note: "G4", duration: 0.5, time: 1.0 },
      { note: "C5", duration: 1.0, time: 2.0 },
      { note: "G4", duration: 0.5, time: 4.0 },
      { note: "F4", duration: 0.5, time: 5.0 },
      { note: "E4", duration: 1.0, time: 6.0 },
      { note: "D4", duration: 0.5, time: 8.0 },
      { note: "E4", duration: 0.5, time: 9.0 },
      { note: "G4", duration: 1.0, time: 10.0 },
      { note: "C4", duration: 1.5, time: 12.0 }
    ],
    colorTheme: "from-amber-500 to-orange-600"
  },
  {
    id: "preset-youth",
    title: "Deru Angin Malam",
    mood: "Bersemangat & Bebas",
    stage: "Masa Remaja",
    bpm: 115,
    description: "Petualangan malam pertama bersama sahabat karib.",
    story: "Mengabadikan kehangatan tawa lepas di bawah sorot lampu jalanan kota tua, janji-janji masa remaja yang penuh ambisi, dan keberanian murni menantang masa depan.",
    lyrics: [
      "Di ujung kota, motor tua melaju,",
      "Angin malam meniup lepas rambutmu,",
      "Tawa membara mengikis rasa ragu,",
      "Dua remaja melukis dunia yang baru."
    ],
    chordProgression: ["Am", "F", "C", "G"],
    melodyPattern: [
      { note: "A4", duration: 0.5, time: 0.0 },
      { note: "C5", duration: 0.5, time: 1.0 },
      { note: "E5", duration: 0.5, time: 2.0 },
      { note: "D5", duration: 0.5, time: 3.0 },
      { note: "C5", duration: 1.0, time: 4.0 },
      { note: "G4", duration: 1.0, time: 6.0 },
      { note: "A4", duration: 0.5, time: 8.0 },
      { note: "B4", duration: 0.5, time: 9.0 },
      { note: "C5", duration: 1.0, time: 10.0 },
      { note: "E5", duration: 1.5, time: 12.0 }
    ],
    colorTheme: "from-rose-500 to-purple-600"
  },
  {
    id: "preset-adulthood",
    title: "Hening Kota Sunyi",
    mood: "Reflektif & Modern",
    stage: "Masa Dewasa",
    bpm: 88,
    description: "Segelas kopi hangat di tengah gedung pencakar langit.",
    story: "Mengisahkan kedewasaan yang diwarnai oleh dedikasi, tanggung jawab, momen-momen sunyi merenung di meja kerja, dan penerimaan tulus atas segala pilihan hidup.",
    lyrics: [
      "Kopi mendingin di atas berkas berkabut,",
      "Gedung menjulang menyapa sunyi malam,",
      "Langkah tertatih melewati rasa takut,",
      "Menemukan damai di balik kota yang kelam."
    ],
    chordProgression: ["Dm", "G", "C", "Am"],
    melodyPattern: [
      { note: "D4", duration: 0.5, time: 0.0 },
      { note: "F4", duration: 0.5, time: 1.0 },
      { note: "A4", duration: 1.0, time: 2.0 },
      { note: "G4", duration: 1.0, time: 4.0 },
      { note: "E4", duration: 1.0, time: 6.0 },
      { note: "F4", duration: 0.5, time: 8.0 },
      { note: "G4", duration: 0.5, time: 9.0 },
      { note: "A4", duration: 1.0, time: 10.0 },
      { note: "C5", duration: 1.5, time: 12.0 }
    ],
    colorTheme: "from-emerald-600 to-teal-700"
  },
  {
    id: "preset-golden",
    title: "Matahari Terbenam Kita",
    mood: "Damai & Syahdu",
    stage: "Masa Tua",
    bpm: 68,
    description: "Kehangatan berdua menyaksikan matahari berpamitan.",
    story: "Sebuah persembahan untuk ketenangan hari tua, mensyukuri seluruh perjalanan berliku yang telah dilewati berdua, diselimuti kedamaian senja.",
    lyrics: [
      "Uban yang berkilau disiram jingga,",
      "Genggaman jemari erat takkan lepas,",
      "Semua perjuangan kini terasa lega,",
      "Terima kasih untuk cinta tanpa batas."
    ],
    chordProgression: ["C", "G", "Am", "Em"],
    melodyPattern: [
      { note: "E4", duration: 0.5, time: 0.0 },
      { note: "D4", duration: 0.5, time: 1.0 },
      { note: "C4", duration: 1.0, time: 2.0 },
      { note: "G4", duration: 1.0, time: 4.0 },
      { note: "E4", duration: 1.0, time: 6.0 },
      { note: "G4", duration: 0.5, time: 8.0 },
      { note: "A4", duration: 0.5, time: 9.0 },
      { note: "B4", duration: 1.0, time: 10.0 },
      { note: "G4", duration: 1.5, time: 12.0 }
    ],
    colorTheme: "from-sky-600 to-indigo-800"
  }
];

export default function App() {
  const synthRef = useRef<LifeStageSynth | null>(null);
  
  // Tracklist State loaded with defaults + local save
  const [songs, setSongs] = useState<PlayableSong[]>(() => {
    const saved = localStorage.getItem("the_music_of_your_life_ai_songs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...PRESET_SONGS, ...parsed];
      } catch (e) {
        return PRESET_SONGS;
      }
    }
    return PRESET_SONGS;
  });

  const [activeSong, setActiveSong] = useState<PlayableSong>(PRESET_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [loopDuration, setLoopDuration] = useState<number>(16);
  const [volume, setVolume] = useState<number>(0.5);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Form Creation attributes
  const [userMemory, setUserMemory] = useState<string>("");
  const [stageInput, setStageInput] = useState<string>("Masa Remaja");
  const [vibeInput, setVibeInput] = useState<string>("Ceria & Nostalgis");
  const [instrumentInput, setInstrumentInput] = useState<string>("Synth Pop Wave");
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load and configure Web Audio synth engine
  useEffect(() => {
    synthRef.current = new LifeStageSynth();
    synthRef.current.setVolume(volume);
    
    // Bind time updates
    synthRef.current.onTimeUpdate = (time, duration) => {
      setPlaybackTime(time);
      setLoopDuration(duration || 16);
    };

    synthRef.current.onEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Update volume engine-side when slider updates
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (synthRef.current) {
      synthRef.current.setVolume(vol);
    }
  };

  // Toggle play-pause loop
  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.stop();
      setIsPlaying(false);
    } else {
      synthRef.current.play(activeSong);
      setIsPlaying(true);
      // Grab analyser handle once AudioContext triggers
      setAnalyser(synthRef.current.getAnalyser());
    }
  };

  // Force play specific selected song from playlist
  const handleSelectSong = (song: PlayableSong) => {
    setActiveSong(song);
    setPlaybackTime(0);
    
    if (synthRef.current) {
      if (isPlaying) {
        synthRef.current.play(song);
        setAnalyser(synthRef.current.getAnalyser());
      } else {
        // Just load, trigger play on next click
        // But for convenience, let's start playing directly for immediate feedback!
        synthRef.current.play(song);
        setIsPlaying(true);
        setAnalyser(synthRef.current.getAnalyser());
      }
    }
  };

  // Delete generated song
  const handleDeleteSong = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering play select
    
    const isPreset = PRESET_SONGS.some(p => p.id === idToDelete);
    if (isPreset) return; // Prevent deleting defaults

    const updated = songs.filter(s => s.id !== idToDelete);
    setSongs(updated);

    // Save remainder to storage
    const customList = updated.filter(s => s.isAI);
    localStorage.setItem("the_music_of_your_life_ai_songs", JSON.stringify(customList));

    // If active song is being deleted, fallback to the first preset
    if (activeSong.id === idToDelete) {
      if (synthRef.current && isPlaying) {
        synthRef.current.stop();
        setIsPlaying(false);
      }
      setActiveSong(PRESET_SONGS[0]);
    }
  };

  // Form submit to trigger AI custom song creation
  const handleGenerateAISong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMemory.trim()) {
      setErrorMsg("Harap ceritakan sekilas kenangan hidup atau kisah impianmu terlebih dahulu!");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/songs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory: userMemory,
          stage: stageInput,
          vibe: vibeInput,
          instrument: instrumentInput
        })
      });

      if (!response.ok) {
        throw new Error("Gagal memperoleh respon dari server musik.");
      }

      const newSong: PlayableSong = await response.json();
      
      // Update playlist & persistence
      const updatedPlaylist = [...songs, newSong];
      setSongs(updatedPlaylist);

      const customOnly = updatedPlaylist.filter(s => s.isAI);
      localStorage.setItem("the_music_of_your_life_ai_songs", JSON.stringify(customOnly));

      // Instantly load & play the brand new creation
      handleSelectSong(newSong);

      // Clean memory input text area
      setUserMemory("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ada gangguan jaringan atau API Key belum disetel. Coba kirim ulang!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Highlighting lyric block index proportional to loop timing ticks
  const totalLyrics = activeSong.lyrics.length;
  const progressPercent = playbackTime / loopDuration;
  const activeLyricIdx = Math.min(
    totalLyrics - 1,
    Math.floor(progressPercent * totalLyrics)
  );

  return (
    <div id="full-page-theme" className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-0 md:p-6 font-sans selection:bg-[#ff3e00] selection:text-white">
      
      {/* Heavy stylized retro-brutalist tech frame */}
      <div 
        id="applet-core-box"
        className="w-full max-w-7xl min-h-screen md:min-h-0 md:h-[880px] bg-[#080808] text-white flex flex-col p-6 md:p-12 overflow-y-auto md:overflow-hidden border-0 md:border-8 border-[#1a1a1a] shadow-2xl relative"
      >
        
        {/* DESIGN HEADER */}
        <header id="aesthetic-header" className="flex justify-between items-baseline mb-8 md:mb-12 border-b border-white/10 pb-4 select-none">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#ff3e00]" />
            KEVINTHEMUSIC
          </div>
          <nav className="hidden md:flex gap-8 text-[10px] tracking-[0.2em] uppercase opacity-60">
            <span className="hover:text-[#ff3e00] transition-colors cursor-pointer">Playlists</span>
            <span className="hover:text-[#ff3e00] transition-colors cursor-pointer text-[#ff3e00] font-semibold">Discovery</span>
            <span className="hover:text-[#ff3e00] transition-colors cursor-pointer">Archival</span>
            <span className="hover:text-[#ff3e00] transition-colors cursor-pointer">Journal</span>
          </nav>
          <div className="text-[10px] md:text-xs font-mono tracking-wider font-bold text-neutral-400">
            MAY // 2026
          </div>
        </header>

        {/* BOLD TYPOGRAPHY VIEW */}
        <main id="curator-main-section" className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col mb-4 select-none">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[100px] xl:text-[115px] font-black leading-[0.78] tracking-[-0.04em] uppercase m-0 text-white">
              Kevin
            </h1>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[100px] xl:text-[115px] font-black leading-[0.78] tracking-[-0.04em] uppercase m-0 flex flex-wrap items-center gap-2 md:gap-5 text-white">
              The <span className="text-[#ff3e00] italic font-serif tracking-normal">Music</span>
            </h1>
          </div>

          {/* 12-COLUMN MAIN FLEX GRID */}
          <div className="grid grid-cols-12 gap-8 flex-1 mt-4 items-stretch md:overflow-hidden">
            
            {/* COLUMN A: CURRENTLY LISTENING (Col Span 4) */}
            <div id="col-spinning-lyrics" className="col-span-12 lg:col-span-4 border-t border-white/20 pt-4 flex flex-col justify-between h-full md:overflow-hidden">
              <div className="flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-[#ff3e00] font-bold mb-4 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  CURRENTLY SPINNING
                </div>
                
                {/* Visual song title detail info */}
                <div className="mb-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {activeSong.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-mono uppercase bg-white/10 px-1.5 py-0.5 tracking-wider rounded font-semibold text-neutral-300">
                      {activeSong.stage}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">• {activeSong.bpm} BPM</span>
                    <span className="text-[9px] font-mono text-[#ff3e00] font-bold italic">• {activeSong.mood}</span>
                  </div>
                </div>

                {/* Narrative / AI interpretation context block */}
                <p className="text-xs text-neutral-400 leading-relaxed mt-2 border-l border-white/10 pl-3 italic mb-4">
                  {activeSong.story}
                </p>

                {/* INTERACTIVE LYRICS PLAYER (SYNCED HIGHLIGHTING) */}
                <div className="bg-neutral-950/80 rounded-xl p-4 border border-white/5 space-y-3 mt-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono flex items-center justify-between">
                    <span>Karaoke / Sing along</span>
                    <span className="text-[#ff3e00]">Beat synced</span>
                  </div>
                  <div className="space-y-2">
                    {activeSong.lyrics.map((line, idx) => (
                      <div 
                        key={idx}
                        className={`text-xs md:text-sm transition-all duration-300 rounded p-1.5 ${idx === activeLyricIdx && isPlaying ? "text-[#ff3e00] translate-x-1.5 font-bold bg-white/[0.03] border-l-2 border-[#ff3e00]" : "text-neutral-500 hover:text-neutral-300"}`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INTEGRATED AUDIO MEDIA CONTROLLER (FOOTER OF COL A) */}
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                
                {/* Wave visualizer */}
                <AudioVisualizer 
                  analyser={analyser} 
                  isPlaying={isPlaying} 
                  colorThemeClass={activeSong.colorTheme} 
                />

                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={handleTogglePlay}
                    id="primary-play-btn"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-white" />
                        PAUSE TRACK
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white animate-bounce" />
                        PLAY TRACK
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 accent-[#ff3e00] bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                      title="Adjust synth volume"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
                  <span>PROGRESI: {activeSong.chordProgression.join(" - ")}</span>
                  <span>TEMPO: {activeSong.bpm} bpm</span>
                </div>
              </div>

            </div>

            {/* COLUMN B: COLOURED VINYL DECORATION + MEMORIES MAKER (Col Span 5) */}
            <div id="col-synth-vinyl" className="col-span-12 lg:col-span-5 flex flex-col justify-between h-full md:overflow-hidden select-none">
              
              {/* Spinning deck assembly */}
              <div className="mb-4">
                <VinylDisk 
                  isPlaying={isPlaying} 
                  colorTheme={activeSong.colorTheme} 
                  stageTitle={activeSong.stage} 
                  songTitle={activeSong.title} 
                />
              </div>

              {/* GENERATE CUSTOM LIFE MEMORY FORM PANEL */}
              <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a]/90 flex-1 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-purple-400 w-4 h-4" />
                      <span className="text-xs font-bold tracking-widest uppercase">Komposer AI</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Gemini 3.5-Flash</span>
                  </div>
                  
                  <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                    Bagikan satu penggalan ingatanmu (misal: "jatuh dari sepeda dengan ayah", "nongkrong di warung remaja", atau "pernikahan sederhana"). AI akan mengubah narasi emosional ini menjadi untaian puisi indah, melodi instrumental yang berenergi dan track synth analog!
                  </p>

                  <form onSubmit={handleGenerateAISong} className="space-y-3">
                    <div>
                      <textarea
                        value={userMemory}
                        onChange={(e) => setUserMemory(e.target.value)}
                        placeholder="Tulis ingatanmu di sini... (contoh: Saat pertama kali merantau ke Jakarta dengan satu tas ransel dan bekal doa Ibu)"
                        className="w-full h-16 max-h-24 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#ff3e00]/60 resize-none font-sans"
                        maxLength={280}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold mb-1">FASE HIDUP</label>
                        <select 
                          value={stageInput} 
                          onChange={(e) => setStageInput(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-[10px] text-neutral-300 focus:outline-none"
                        >
                          <option value="Masa Kecil">Masa Kecil</option>
                          <option value="Masa Remaja">Masa Remaja</option>
                          <option value="Masa Dewasa">Masa Dewasa</option>
                          <option value="Masa Senja">Masa Senja</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold mb-1">SUASANA HATI</label>
                        <select 
                          value={vibeInput} 
                          onChange={(e) => setVibeInput(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-[10px] text-neutral-300 focus:outline-none"
                        >
                          <option value="Ceria & Nostalgis">Ceria / Pop</option>
                          <option value="Sunyi & Sendu">Syahdu / Sendu</option>
                          <option value="Semangat Berapi">Menggebu / Rock</option>
                          <option value="Damai Sejahtera">Tenang / Ambient</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold mb-1">TIMBRE SYNTH</label>
                        <select 
                          value={instrumentInput} 
                          onChange={(e) => setInstrumentInput(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-[10px] text-neutral-300 focus:outline-none"
                        >
                          <option value="Suling Chime">Chime Lullaby</option>
                          <option value="Synth Pop Wave">Square Bass POP</option>
                          <option value="Melankolis Organ">Atmosphere Pad</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="mt-4">
                  {errorMsg && (
                    <div className="p-2 mb-2 bg-red-950/40 border border-red-500/30 rounded text-[10px] text-red-400 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateAISong}
                    disabled={isGenerating}
                    id="compose-ai-btn"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-colors rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        MENYUSUN MELODI INDAH...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        BUAT LAGU MEMORI DENGAN AI
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* COLUMN C: LIFE JOURNEY CHRONOLOGICAL TIMELINE (Col Span 3) */}
            <div id="col-timeline" className="col-span-12 lg:col-span-3 border-l border-white/10 pl-0 lg:pl-6 flex flex-col justify-between h-full md:overflow-hidden select-none">
              
              <div className="flex flex-col h-full md:overflow-hidden">
                <div className="mb-4">
                  <div className="text-3xl font-black mb-1 font-mono text-[#ff3e00] flex items-baseline gap-1">
                    {songs.length} <span className="text-xs uppercase font-sans text-neutral-400 font-bold tracking-widest"> TRACKS</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-[#ff3e00] font-bold">Soundtrack Lifetime Journey</div>
                </div>

                {/* SCROLLABLE SONGS PLATFORM */}
                <div className="flex-1 md:overflow-y-auto pr-1 pb-4 custom-scrollbar">
                  <Timeline 
                    songs={songs} 
                    activeSongId={activeSong.id} 
                    isPlaying={isPlaying} 
                    onSongSelect={handleSelectSong} 
                  />
                </div>

                {/* Dynamic custom track count metrics */}
                <div className="border-t border-white/10 pt-3 mt-2 text-[10px] text-neutral-500 font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span>PRESET STANDAR:</span>
                    <span className="text-white">4 ERA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DIGENERASI AI:</span>
                    <span className="text-purple-400">{songs.filter(s => s.isAI).length} LAGU</span>
                  </div>
                  
                  {songs.filter(s => s.isAI).length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Hapus semua lagu AI yang tersimpan di perangkat Anda?")) {
                          localStorage.removeItem("the_music_of_your_life_ai_songs");
                          setSongs(PRESET_SONGS);
                          setActiveSong(PRESET_SONGS[0]);
                          if (isPlaying && synthRef.current) {
                            synthRef.current.stop();
                            setIsPlaying(false);
                          }
                        }
                      }}
                      className="text-red-400 hover:text-red-300 inline-flex items-center gap-1.5 mt-2 transition-colors cursor-pointer text-[9px] font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      BERSIHKAN MEMORI AI
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>

        {/* BOTTOM METADATA BAR FOOTER */}
        <footer id="aesthetic-footer" className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-12 select-none border-t border-white/10 pt-4">
          <div className="flex gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff3e00] animate-[#ping_1s_infinite]"></div>
            <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-emerald-500" : "bg-neutral-800"}`} />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff3e00]/40"></div>
          </div>
          
          <div className="flex-1 h-[1px] bg-white/10 relative w-full">
            {/* Dynamic visual slider tracker based on playtime of 16 beats */}
            <div 
              style={{ width: `${(playbackTime / loopDuration) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff3e00] to-orange-500" 
            />
            <div 
              style={{ left: `${(playbackTime / loopDuration) * 100}%` }}
              className="absolute -top-1 w-3 h-3 bg-white rounded-full transition-all duration-100 shadow-[0_0_8px_white]" 
            />
          </div>

          <div className="text-[10px] font-mono tracking-tighter uppercase text-neutral-400 flex items-center gap-3">
            <span>LIVE AUDIO SYNT-ENGINE</span>
            <span className="text-[#ff3e00]/80">/</span>
            <span>LOOP: {playbackTime.toFixed(1)}s / {loopDuration.toFixed(1)}s</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
