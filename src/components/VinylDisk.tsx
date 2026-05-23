import React from "react";
import { Disc, Music } from "lucide-react";

interface VinylDiskProps {
  isPlaying: boolean;
  colorTheme: string; // e.g. "from-purple-500 to-pink-500"
  stageTitle: string;  // e.g. "Masa Remaja"
  songTitle: string;   // e.g. "Deru Angin Malam"
}

export const VinylDisk: React.FC<VinylDiskProps> = ({
  isPlaying,
  colorTheme,
  stageTitle,
  songTitle,
}) => {
  return (
    <div id="vinyl-deck-root" className="flex flex-col items-center justify-center p-6 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl relative overflow-hidden group">
      
      {/* Dynamic ambient color glow that matches the song's vibe */}
      <div className={`absolute inset-[-40px] bg-gradient-to-tr ${colorTheme} opacity-5 blur-3xl transition-all duration-1000`} />

      <div className="w-full max-w-[260px] aspect-square relative flex items-center justify-center">
        {/* The Phonograph Arm / Needle Needle unit */}
        <div 
          style={{
            transform: isPlaying ? "rotate(-12deg)" : "rotate(-45deg)",
            transformOrigin: "top right"
          }}
          className="absolute top-2 right-2 w-28 h-32 z-20 pointer-events-none transition-transform duration-1000 ease-in-out"
        >
          {/* Main arm vectors */}
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
            {/* Pivot ring */}
            <circle cx="85" cy="15" r="10" fill="#a3a3a3" stroke="#525252" strokeWidth="2" />
            <circle cx="85" cy="15" r="4" fill="#171717" />
            
            {/* Tone arm stick */}
            <path d="M 85 15 L 45 70 L 35 110" fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />
            <path d="M 85 15 L 45 70 L 35 110" fill="none" stroke="#737373" strokeWidth="1" strokeLinecap="round" />
            
            {/* Ink cartridge/needle mass */}
            <rect x="25" y="105" width="16" height="10" rx="2" transform="rotate(-30, 33, 110)" fill="#262626" stroke="#404040" strokeWidth="1" />
            {/* Needle contact light point */}
            <circle cx="28" cy="112" r="1.5" fill="#f43f5e" className={isPlaying ? "animate-pulse" : ""} />
          </svg>
        </div>

        {/* Outer TurnTable Platter platter rim */}
        <div className="w-[240px] h-[240px] rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-inner flex items-center justify-center relative">
          
          {/* Static groove marks ring */}
          <div className="absolute inset-2 rounded-full border border-neutral-900/60 pointer-events-none"></div>
          <div className="absolute inset-5 rounded-full border border-neutral-900/40 pointer-events-none"></div>
          <div className="absolute inset-8 rounded-full border border-neutral-900/20 pointer-events-none"></div>
          <div className="absolute inset-12 rounded-full border border-neutral-900/10 pointer-events-none"></div>

          {/* Rotating Vinyl Disc */}
          <div 
            id="revolving-record"
            className={`w-[220px] h-[220px] rounded-full bg-[#111111] border-[14px] border-neutral-950 flex items-center justify-center relative shadow-2xl overflow-hidden cursor-pointer ${isPlaying ? "animate-[spin_4.8s_linear_infinite]" : "transition-transform duration-500 ease-out"}`}
          >
            {/* Fine shiny circular vinyl grooves using concentric vector circles */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_70%)] mix-blend-screen"></div>
            
            {/* Vinyl texture shine flare 1 */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none"></div>
            {/* Vinyl texture shine flare 2 */}
            <div className="absolute -inset-10 bg-gradient-to-bl from-transparent via-white/5 to-transparent -rotate-45 pointer-events-none"></div>

            {/* Inner vinyl grooves */}
            <div className="absolute inset-4 rounded-full border border-neutral-900/80"></div>
            <div className="absolute inset-6 rounded-full border border-neutral-900"></div>
            <div className="absolute inset-8 rounded-full border border-neutral-900/80"></div>
            <div className="absolute inset-[44px] rounded-full border border-neutral-950"></div>

            {/* Center Label Area (Sticker artwork) */}
            <div className={`w-[84px] h-[84px] rounded-full bg-gradient-to-br ${colorTheme} flex flex-col items-center justify-center p-2 relative shadow-inner text-white text-center group-hover:scale-105 transition-transform duration-300`}>
              {/* Core spindle hole layout */}
              <div className="absolute inset-[34px] rounded-full bg-neutral-950 border border-neutral-800 shadow-inner z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
              </div>
              
              {/* Very tiny labels wrap */}
              <div className="w-full flex flex-col items-center mt-[-4px]">
                <Disc className="w-4 h-4 text-white/50 mb-0.5" />
                <span className="text-[6px] font-sans font-bold tracking-tight uppercase whitespace-nowrap text-white/90 overflow-hidden w-14">
                  {stageTitle || "Life Stage"}
                </span>
                <span className="text-[5px] font-mono tracking-tighter text-white/70 overflow-hidden w-12 truncate block">
                  {songTitle || "Soundtrack"}
                </span>
              </div>
            </div>
            
          </div>
        </div>

      </div>

      <div className="w-full mt-4 flex flex-col items-center select-none text-center">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950/60 border border-neutral-800 mb-1.5 text-[10px] font-mono tracking-wider text-rose-500 font-semibold">
          <Music className={`w-3 h-3 ${isPlaying ? "animate-bounce" : ""}`} />
          {isPlaying ? "33 1/3 RPM PLAYING" : "VINYL DECK ACTIVE"}
        </div>
        <p className="text-sm font-sans font-medium text-neutral-200 truncate w-56">{songTitle}</p>
        <p className="text-xs text-neutral-500 truncate w-48 mt-0.5">{stageTitle}</p>
      </div>

    </div>
  );
};
