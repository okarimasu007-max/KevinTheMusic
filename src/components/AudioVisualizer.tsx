import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  colorThemeClass?: string; // e.g. "from-purple-500 to-pink-500"
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  colorThemeClass = "from-emerald-500 to-teal-500"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      // Loop the animation at 60fps
      animationRef.current = requestAnimationFrame(renderFrame);

      const width = canvas.width;
      const height = canvas.height;

      // Draw subtle background translucency to create motion-blur echo trails
      ctx.fillStyle = "rgba(10, 10, 16, 0.25)";
      ctx.fillRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        // Loop through frequencies
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.85;

          // Add a subtle wave height baseline even for quiet frequencies
          if (barHeight < 2) barHeight = 2;

          // Custom color styling matched to active color themes
          const percent = i / bufferLength;
          let r = 99; // emerald-like rgb default
          let g = 102;
          let b = 241;

          if (colorThemeClass.includes("purple") || colorThemeClass.includes("rose")) {
            r = Math.floor(168 + percent * 87); // purple-pink
            g = Math.floor(85 - percent * 40);
            b = Math.floor(247 - percent * 30);
          } else if (colorThemeClass.includes("amber") || colorThemeClass.includes("orange")) {
            r = Math.floor(245 - percent * 20); // orange-brown
            g = Math.floor(158 - percent * 50);
            b = Math.floor(11 + percent * 10);
          } else if (colorThemeClass.includes("blue") || colorThemeClass.includes("indigo")) {
            r = Math.floor(59 - percent * 30);  // blue wave
            g = Math.floor(130 + percent * 10);
            b = Math.floor(246 + percent * 9);
          } else {
            r = Math.floor(16 + percent * 20);   // emerald/teal
            g = Math.floor(185 + percent * 30);
            b = Math.floor(129 + percent * 10);
          }

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          // Draw rounded bars for clean modern style
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, height - barHeight, barWidth / 2.5, 0, Math.PI, true);
          ctx.fill();
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      } else {
        // Draw flat line waves when idle
        const sliceWidth = width / 40;
        let x = 0;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let i = 0; i < 40; i++) {
          const y = height / 2 + Math.sin(i * 0.5 + Date.now() * 0.002) * 2;
          ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    renderFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, colorThemeClass]);

  return (
    <div id="visualizer-container" className="w-full h-12 bg-neutral-950/60 border border-neutral-800/80 rounded-xl overflow-hidden relative">
      <canvas
        ref={canvasRef}
        id="audio-canvas"
        className="w-full h-12 block"
        width={380}
        height={48}
      />
      <div className="absolute top-1 right-2 font-mono text-[9px] text-neutral-500 tracking-wider flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`}></span>
        {isPlaying ? "LIVE FEED" : "IDLE"}
      </div>
    </div>
  );
};
