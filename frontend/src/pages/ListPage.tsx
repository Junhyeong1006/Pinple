import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useFilterStore } from '../stores/filterStore';
import { PostCard } from '../components/posts/PostCard';
import { PostDetail } from '../components/posts/PostDetail';
import { Post, CATEGORIES } from '../types';
import { Search, MapPin, SlidersHorizontal, Loader2, FileWarning } from 'lucide-react';

export default function ListPage() {
  const { posts, loading, error, refresh } = usePosts();
  const filter = useFilterStore();
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handlePostClick = (post: Post) => {
    setSelectedPostId(post.id);
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6 relative">
      {/* Header Search & Filter Bar */}
      <div className="glass p-4 rounded-2xl shadow-sm mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="게시글 제목이나 내용 검색..."
              value={filter.search}
              onChange={(e) => filter.setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 font-semibold transition
              ${showFilters 
                ? 'bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-950/30 dark:border-violet-900/40 dark:text-violet-400' 
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">상세필터</span>
          </button>
        </div>

        {/* Detailed Filters (Collapsible) */}
        {showFilters && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-fade-in">
            {/* Category Filter Chips */}
            <div>
              <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                카테고리
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => filter.setCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                    ${filter.category === 'all'
                      ? 'bg-zinc-900 text-white border-transparent dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }
                  `}
                >
                  전체
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => filter.setCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1
                      ${filter.category === cat.key
                        ? 'text-white border-transparent shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }
                    `}
                    style={{ 
                      backgroundColor: filter.category === cat.key ? cat.color : undefined,
                      boxShadow: filter.category === cat.key ? `0 2px 8px ${cat.glowColor}` : undefined
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Filter Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  탐색 반경
                </span>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {filter.radius.toFixed(1)} km
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={filter.radius}
                onChange={(e) => filter.setRadius(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid View / Status */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-center text-rose-700 dark:text-rose-400 font-semibold mb-6">
          ⚠️ {error}
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">가까운 게시물을 탐색하는 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4 glass rounded-3xl border-dashed border-2 border-zinc-200 dark:border-zinc-800">
          <FileWarning className="w-12 h-12 text-zinc-400" />
          <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-lg">조건에 맞는 게시물이 없습니다</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs text-center font-medium">
            검색어를 변경하거나 탐색 반경을 넓혀서 주위의 민원과 정보를 찾아보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <div key={post.id} className="h-full">
              <PostCard post={post} onClick={() => handlePostClick(post)} />
            </div>
          ))}
        </div>
      )}

      {/* Side-sliding Post Detail Panel */}
      {selectedPostId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          {/* Click outside backdrop area to close */}
          <div className="flex-grow" onClick={() => setSelectedPostId(null)} />
          
          <div className="w-full max-w-lg h-full bg-white dark:bg-slate-950 shadow-2xl border-l border-zinc-100 dark:border-zinc-900 overflow-hidden flex flex-col animate-slide-in-right">
            <PostDetail 
              postId={selectedPostId} 
              onClose={() => setSelectedPostId(null)} 
              onDeleteSuccess={refresh}
              onLikeToggle={refresh}
            />
          </div>
        </div>
      )}
    </div>
  );
}
