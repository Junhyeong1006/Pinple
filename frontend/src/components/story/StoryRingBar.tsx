import { useStories } from '../../hooks/useStories';
import { Category } from '../../types';

interface StoryRingBarProps {
  onOpenStory: (index: number) => void;
}

export function StoryRingBar({ onOpenStory }: StoryRingBarProps) {
  const { stories, loading } = useStories();

  if (loading && stories.length === 0) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-lg h-24 rounded-2xl glass shadow-md flex items-center justify-start gap-4 px-4 overflow-hidden">
        <div className="flex gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-10 h-3 bg-zinc-300 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) return null;

  const getCategoryTheme = (category: Category) => {
    switch (category) {
      case 'complaint':
        return {
          border: 'from-rose-500 to-pink-500',
          emoji: '🚨',
          label: '민원'
        };
      case 'suggestion':
        return {
          border: 'from-sky-500 to-indigo-500',
          emoji: '💡',
          label: '건의'
        };
      case 'info':
        return {
          border: 'from-emerald-500 to-teal-500',
          emoji: '📢',
          label: '정보'
        };
    }
  };

  return (
    <div className="absolute top-[76px] left-1/2 -translate-x-1/2 z-[400] w-[92%] max-w-lg h-[92px] rounded-2xl glass shadow-lg flex items-center justify-start gap-4 px-4 overflow-x-auto scrollbar-none scroll-smooth">
      <div className="flex items-center gap-4 py-1">
        <div className="flex flex-col items-center justify-center min-w-[60px] h-full border-r border-zinc-300/30 dark:border-zinc-700/30 pr-3">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">동네</span>
          <span className="text-sm font-black bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-sky-400">스토리</span>
        </div>
        
        {stories.map((story, index) => {
          const theme = getCategoryTheme(story.category);
          return (
            <button
              key={story.id}
              onClick={() => onOpenStory(index)}
              className="flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
            >
              {/* Profile Story Ring */}
              <div className={`w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr ${theme.border} group-hover:rotate-12 transition-transform duration-500 shadow-md`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  {story.image_url ? (
                    <img 
                      src={story.image_url} 
                      alt={story.title} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-lg`}>
                      {theme.emoji}
                    </div>
                  )}
                  
                  {/* Floating category badge on profile */}
                  {story.image_url && (
                    <span className="absolute bottom-0 right-0 text-[10px] bg-white dark:bg-zinc-800 p-0.5 rounded-full shadow-sm">
                      {theme.emoji}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-semibold truncate max-w-[56px] text-zinc-600 dark:text-zinc-300">
                {story.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
