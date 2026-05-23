import React from "react";
import { PlayableSong } from "../types";
import { Play, Volume2, ShieldCheck, Cpu } from "lucide-react";

interface TimelineProps {
  songs: PlayableSong[];
  activeSongId: string;
  isPlaying: boolean;
  onSongSelect: (song: PlayableSong) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  songs,
  activeSongId,
  isPlaying,
  onSongSelect,
}) => {
  // Translate stage ids into human friendly Indonesian life stage eras
  const getStageBadge = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "childhood":
      case "masa kecil":
        return { label: "Masa Kecil (Era 0-10)", color: "text-amber-400 bg-amber-400/10 border-amber-500/20" };
      case "youth":
      case "masa remaja":
        return { label: "Masa Remaja (Era 11-19)", color: "text-rose-400 bg-rose-400/10 border-rose-500/20" };
      case "adulthood":
      case "masa dewasa":
        return { label: "Masa Dewasa (Era 20-45)", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" };
      case "golden years":
      case "masa senja":
        return { label: "Masa Tua (Era 46+)", color: "text-sky-400 bg-sky-400/10 border-sky-500/20" };
      default:
        return { label: stage, color: "text-purple-400 bg-purple-400/10 border-purple-500/20" };
    }
  };

  return (
    <div id="timeline-scroll-root" className="flex flex-col relative pl-6 md:pl-8 border-l border-neutral-800 space-y-8 select-none">
      
      {/* Visual Timeline connector line pulse if playing */}
      <div className={`absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-rose-500 via-emerald-400 to-sky-500 ${isPlaying ? "animate-pulse" : "opacity-30"}`} />

      {songs.map((song, index) => {
        const isActive = song.id === activeSongId;
        const activePlaying = isActive && isPlaying;
        const badge = getStageBadge(song.stage);

        return (
          <div 
            key={song.id} 
            id={`timeline-card-${song.id}`}
            onClick={() => onSongSelect(song)}
            className={`group relative flex flex-col p-5 bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg ${isActive ? "bg-neutral-900 border-neutral-700 ring-1 ring-neutral-700/50 scale-[1.01]" : ""}`}
          >
            {/* Left timeline glowing node point */}
            <div className={`absolute -left-[30px] md:-left-[38px] top-6 w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 shadow-[0_0_12px_rgba(255,255,255,0.2)] ${isActive ? "bg-rose-500 border-neutral-950 scale-125 shadow-rose-500/80" : "bg-neutral-800 border-neutral-950 group-hover:bg-neutral-600"}`} />

            {/* Top header containing Stage Badges and Origin indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              
              {/* If song is generated dynamically by Gemini AI */}
              {song.isAI ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium text-purple-400 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded">
                  <Cpu className="w-2.5 h-2.5 text-purple-400" />
                  AI SONG
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-neutral-500">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  PRESET
                </span>
              )}
            </div>

            {/* Mid Content - Title & Genre & Story summary */}
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-base font-sans font-semibold tracking-tight transition-colors ${isActive ? "text-rose-400" : "text-neutral-100 group-hover:text-rose-400"}`}>
                  {song.title}
                </h3>
                <p className="text-xs text-neutral-400 italic mt-0.5">"{song.mood}" — {song.description}</p>
                <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                  {song.story}
                </p>
              </div>

              {/* Status playback icon indicator */}
              <div className="flex-shrink-0 mt-1">
                {activePlaying ? (
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative">
                    <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                    <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700/80 flex items-center justify-center transition-all group-hover:scale-105">
                    <Play className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-200 fill-neutral-400/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom chords block */}
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-800/60 pt-3">
              <span className="text-[10px] font-mono tracking-wider text-neutral-500">PROGRESI KORD:</span>
              <div className="flex items-center gap-1.5">
                {song.chordProgression.map((chord, cIdx) => (
                  <span 
                    key={cIdx} 
                    className="px-1.5 py-0.5 bg-neutral-950/80 border border-neutral-800/80 text-[10px] font-mono text-neutral-300 font-bold rounded"
                  >
                    {chord}
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-mono tracking-wider text-neutral-500 ml-auto">{song.bpm} BPM</span>
            </div>

          </div>
        );
      })}

    </div>
  );
};
