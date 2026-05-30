import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useStories } from '../hooks/useStories';
import { useGeolocation } from '../hooks/useGeolocation';
import { useFilterStore } from '../stores/filterStore';
import { useMapStore } from '../stores/mapStore';
import { MapView } from '../components/map/MapView';
import { StoryRingBar } from '../components/story/StoryRingBar';
import { StoryViewer } from '../components/story/StoryViewer';
import { PostDetail } from '../components/posts/PostDetail';
import { PostForm } from '../components/posts/PostForm';
import { CATEGORIES, Post } from '../types';
import { Compass, Plus, X, Search, MapPin, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  // Load posts based on current map center & filters
  const { posts, refresh: refreshPosts } = usePosts();
  
  // Geolocation trigger
  const { loading: geoLoading, retry: retryGeo } = useGeolocation();
  
  // Stories state integration
  const {
    stories,
    currentIndex: storyIndex,
    progress: storyProgress,
    isPlaying: storyPlaying,
    play: playStories,
    pause: pauseStories,
    nextStory,
    prevStory,
    selectStoryIndex,
    refreshStories
  } = useStories();

  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);
  const userLocation = useMapStore((s) => s.userLocation);

  const filter = useFilterStore();

  // Overlay states
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Focus map on current user coordinates
  const handleRecenter = () => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(15);
    } else {
      retryGeo();
    }
  };

  // When viewing post coordinates from stories
  const handleViewStoryLocation = (post: Post) => {
    setCenter([post.latitude, post.longitude]);
    setZoom(16);
    pauseStories();
    // Directly open detailed view
    setSelectedPostId(post.id);
  };

  const handlePostCreateSuccess = () => {
    setIsWriting(false);
    refreshPosts();
    refreshStories();
  };

  return (
    <div className="flex-1 relative w-full h-[500px] sm:h-[600px] md:h-[calc(100vh-80px)] overflow-hidden flex">
      {/* 1. Main Map Layer */}
      <MapView 
        posts={posts} 
        onMarkerClick={(post) => {
          setIsWriting(false); // Close writing panel if click marker
          setSelectedPostId(post.id);
        }} 
      />

      {/* 2. Floating Story Ring Bar overlay */}
      <StoryRingBar onOpenStory={(idx) => {
        selectStoryIndex(idx);
        playStories();
      }} />

      {/* 3. Floating Filter Controls (Top/Left) */}
      <div className="absolute top-[180px] left-4 z-[400] flex flex-col gap-2 max-w-[calc(100vw-32px)]">
        {/* Category Filters row */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => filter.setCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all whitespace-nowrap border
              ${filter.category === 'all'
                ? 'bg-zinc-900 border-transparent text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'glass border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300'
              }
            `}
          >
            전체핀
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => filter.setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all whitespace-nowrap border
                ${filter.category === cat.key
                  ? 'text-white border-transparent'
                  : 'glass border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                }
              `}
              style={{
                backgroundColor: filter.category === cat.key ? cat.color : undefined,
                boxShadow: filter.category === cat.key ? `0 4px 10px ${cat.glowColor}` : undefined
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        
        {/* Secondary filters toggles: Search, Radius */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className={`p-2 rounded-full glass shadow-md border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all
              ${showSearchPanel ? 'bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/30' : ''}
            `}
            title="검색 필터 열기"
          >
            <SlidersHorizontal size={18} />
          </button>
          
          {showSearchPanel && (
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-2xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 animate-fade-in text-xs font-semibold">
              <span className="text-zinc-500">반경:</span>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="1.0"
                value={filter.radius}
                onChange={(e) => filter.setRadius(parseFloat(e.target.value))}
                className="w-20 h-1 accent-violet-600 cursor-pointer"
              />
              <span className="text-violet-600 dark:text-violet-400 font-bold w-10 text-right">{filter.radius.toFixed(0)}km</span>
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <Search size={14} className="text-zinc-400" />
              <input
                type="text"
                placeholder="검색어..."
                value={filter.search}
                onChange={(e) => filter.setSearch(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-24 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 font-medium"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Floating Action Buttons (Bottom/Right) */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="p-3 rounded-full glass text-zinc-700 dark:text-zinc-300 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 hover:scale-105 active:scale-95 transition-all"
          title="내 위치 찾기"
        >
          <Compass size={22} className={`${geoLoading ? 'animate-spin text-violet-500' : ''}`} />
        </button>

        {/* Add Post FAB */}
        <button
          onClick={() => {
            setSelectedPostId(null); // Close detail view
            setIsWriting(true);
          }}
          className="p-3.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 hover:shadow-violet-600/35 hover:scale-105 active:scale-95 transition-all"
          title="새 글 쓰기"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* 5. Overlay Side Panel / Bottom Sheet (Detail & Write) */}
      {/* 5-a. Detail Side Panel */}
      {selectedPostId !== null && (
        <div className="absolute inset-y-0 right-0 z-[500] w-full sm:w-[420px] glass shadow-2xl border-l border-zinc-200/50 dark:border-zinc-800/50 flex flex-col animate-slide-in-right">
          <PostDetail
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
            onDeleteSuccess={refreshPosts}
            onLikeToggle={refreshPosts}
          />
        </div>
      )}

      {/* 5-b. Write Side Panel */}
      {isWriting && (
        <div className="absolute inset-y-0 right-0 z-[500] w-full sm:w-[480px] glass shadow-2xl border-l border-zinc-200/50 dark:border-zinc-800/50 flex flex-col animate-slide-in-right overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
              📍 새로운 핀 등록
            </h2>
            <button
              onClick={() => setIsWriting(false)}
              className="p-1.5 hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-500 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4 flex-grow">
            <PostForm onSuccess={handlePostCreateSuccess} onCancel={() => setIsWriting(false)} />
          </div>
        </div>
      )}

      {/* 6. Story Viewer Fullscreen Modal overlay */}
      {storyPlaying && (
        <StoryViewer
          stories={stories}
          currentIndex={storyIndex}
          progress={storyProgress}
          isPlaying={storyPlaying}
          onClose={pauseStories}
          onNext={nextStory}
          onPrev={prevStory}
          onPause={pauseStories}
          onPlay={playStories}
          onSelectIndex={selectStoryIndex}
          onViewLocation={handleViewStoryLocation}
        />
      )}
    </div>
  );
}
