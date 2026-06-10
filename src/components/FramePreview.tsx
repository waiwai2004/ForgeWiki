import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Grid, Film } from 'lucide-react';

interface FramePreviewProps {
  frames: string[] | undefined;
  heightClass?: string;
  speedMs?: number;
}

export const FramePreview: React.FC<FramePreviewProps> = ({
  frames = [],
  heightClass = 'h-32',
  speedMs = 400
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGridView, setIsGridView] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (!frames || frames.length <= 1 || !isPlaying) return;

    const timer = setInterval(() => {
      // Trigger a subtle fade-in transition
      setAnimate(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % frames.length);
        setAnimate(true);
      }, 80);
    }, speedMs);

    return () => clearInterval(timer);
  }, [frames, isPlaying, speedMs]);

  // Adjust current index if frames change
  useEffect(() => {
    setCurrentIndex(0);
  }, [frames]);

  if (!frames || frames.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center border border-dashed border-[#b89b5c]/30 rounded-lg p-4 bg-neutral-900/40 text-neutral-500 text-xs text-center ${heightClass}`}>
        <Film className="w-5 h-5 mb-1.5 opacity-60" />
        <span>未上传帧序列</span>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % frames.length);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      {/* Tab toggle between Animation Player and Grid View */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-mono text-[#b89b5c] uppercase tracking-wider">
          {frames.length} 帧序列图
        </span>
        <button
          type="button"
          onClick={() => setIsGridView(!isGridView)}
          className="text-neutral-400 hover:text-[#d4a853] transition-colors text-xs flex items-center gap-1"
        >
          {isGridView ? (
            <>
              <Film className="w-3.5 h-3.5" />
              <span>动画预览</span>
            </>
          ) : (
            <>
              <Grid className="w-3.5 h-3.5" />
              <span>拆解网格</span>
            </>
          )}
        </button>
      </div>

      {!isGridView ? (
        <div className="relative group bg-neutral-900/70 border border-[#b89b5c]/25 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden">
          {/* Main frame display with safe fade transition */}
          <div className={`${heightClass} flex items-center justify-center w-full relative`}>
            <img
              src={frames[currentIndex]}
              alt={`Frame ${currentIndex}`}
              referrerPolicy="no-referrer"
              className={`max-h-full max-w-full object-contain image-render-pixelated select-none transition-all duration-150 ${
                animate ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
              }`}
            />
          </div>

          {/* Quick interactive stats */}
          <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-neutral-800 hover:bg-neutral-700 text-[#d4a853] p-1 rounded transition-colors"
                title={isPlaying ? '暂停' : '播发'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                disabled={frames.length <= 1}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-1 rounded disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={frames.length <= 1}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-1 rounded disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <span>
              第 {currentIndex + 1} / {frames.length} 帧
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900/50 border border-[#b89b5c]/20 rounded-lg p-2 max-h-44 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {frames.map((frame, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsGridView(false);
                }}
                className={`relative flex items-center justify-center p-1.5 border rounded cursor-pointer bg-neutral-950 transition-all ${
                  currentIndex === index
                    ? 'border-[#d4a853] ring-1 ring-[#d4a853]/50'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <img
                  src={frame}
                  alt={`Frame ${index}`}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 object-contain image-render-pixelated"
                />
                <span className="absolute bottom-0 right-1 text-[8px] font-mono text-neutral-500">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
