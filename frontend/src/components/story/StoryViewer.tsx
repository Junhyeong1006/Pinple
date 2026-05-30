import { useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Post, Category } from '../../types';

interface StoryViewerProps {
  stories: Post[];
  currentIndex: number;
  progress: number;
  isPlaying: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPause: () => void;
  onPlay: () => void;
  onSelectIndex: (index: number) => void;
  onViewLocation: (post: Post) => void;
}

export function StoryViewer({
  stories,
  currentIndex,
  progress,
  isPlaying,
  onClose,
  onNext,
  onPrev,
  onPause,
  onPlay,
  onSelectIndex,
  onViewLocation,
}: StoryViewerProps) {
  const currentStory = stories[currentIndex];
  const touchStartX = useRef<number | null>(null);

  // Close story on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentStory) return null;

  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case 'complaint':
        return {
          gradient: 'from-rose-500/20 via-pink-600/30 to-violet-800/40',
          badgeBg: 'bg-rose-500',
          emoji: '🚨',
          label: '민원'
        };
      case 'suggestion':
        return {
          gradient: 'from-sky-400/20 via-blue-500/30 to-indigo-800/40',
          badgeBg: 'bg-sky-500',
          emoji: '💡',
          label: '건의'
        };
      case 'info':
        return {
          gradient: 'from-emerald-400/20 via-teal-500/30 to-slate-900/40',
          badgeBg: 'bg-emerald-500',
          emoji: '📢',
          label: '정보'
        };
    }
  };

  const style = getCategoryStyles(currentStory.category);

  // Handle mobile swipe left/right
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    onPause(); // Pause progress on touch-hold
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    onPlay(); // Resume progress on release
    if (!touchStartX.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    
    if (diffX > 60) {
      onPrev(); // Swipe Right -> Prev
    } else if (diffX < -60) {
      onNext(); // Swipe Left -> Next
    }
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center select-none font-sans">
      <div 
        className="relative w-full max-w-lg h-full max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl md:h-[92dvh] md:rounded-3xl border border-zinc-800/40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={onPause}
        onMouseUp={onPlay}
      >
        {/* Neon Gradient Background (Always active, overlays photo if present) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} z-0 pointer-events-none transition-all duration-500`} />

        {/* Story Photo */}
        {currentStory.image_url && (
          <img
            src={currentStory.image_url}
            alt={currentStory.title}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
        )}

        {/* Floating Controls Overlay */}
        <div className="relative z-10 p-4 flex flex-col gap-3 w-full bg-gradient-to-b from-black/70 via-black/20 to-transparent">
          {/* Progress Timeline Bars */}
          <div className="flex gap-1.5 w-full">
            {stories.map((_, index) => (
              <div 
                key={index} 
                onClick={() => onSelectIndex(index)}
                className="h-1 flex-1 bg-white/30 rounded-full cursor-pointer relative overflow-hidden"
              >
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white rounded-full transition-all ease-linear"
                  style={{
                    width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                    transitionDuration: index === currentIndex ? '50ms' : '0ms'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Info & Close Header */}
          <div className="flex justify-between items-center text-white mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-sm">
                {style.emoji}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wide">{currentStory.author}</span>
                <span className="text-[10px] text-white/70">
                  {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true, locale: ko })}
                </span>
              </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors duration-200"
              title="닫기"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Side Navigation Buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white/75 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white/75 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 hidden md:block"
        >
          <ChevronRight size={24} />
        </button>

        {/* Tap zones for side-to-side navigation (any viewport size) */}
        <div 
          className="absolute inset-y-1/4 left-0 w-1/4 z-10 cursor-w-resize" 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        />
        <div 
          className="absolute inset-y-1/4 right-0 w-1/4 z-10 cursor-e-resize" 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        />

        {/* Bottom Detailed Info Panel (Glassmorphic) */}
        <div className="relative z-10 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col gap-4 mt-auto">
          <div className="glass backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-2 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${style.badgeBg}`}>
                {style.label}
              </span>
              <h3 className="text-base font-extrabold text-white truncate">{currentStory.title}</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed max-h-24 overflow-y-auto pr-1">
              {currentStory.content}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between text-white px-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Heart size={18} className="text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold">{currentStory.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle size={18} className="text-sky-400" />
                <span className="text-xs font-bold">{currentStory.comment_count}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewLocation(currentStory);
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <MapPin size={12} className="fill-zinc-950" />
              지도에서 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
