import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Send, Loader2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Post, Category, parseUTCDate, Comment } from '../../types';
import { reactionsApi, commentsApi, postsApi } from '../../services/api';

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
  onLikeToggle?: () => void;
  onCommentChange?: () => void;
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
  onLikeToggle,
  onCommentChange,
}: StoryViewerProps) {
  const currentStory = stories[currentIndex];
  const touchStartX = useRef<number | null>(null);

  // Likes states
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  // Comments panel states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState(() => localStorage.getItem('pinple-nickname') || '');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Close story on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Sync likes state and reset comments panel when story index changes
  useEffect(() => {
    if (currentStory) {
      setLikeCount(currentStory.likes);
      const likedPosts = JSON.parse(localStorage.getItem('pinple-liked-posts') || '[]');
      setIsLiked(likedPosts.includes(currentStory.id));
      setShowComments(false);
    }
  }, [currentStory]);

  // Fetch comments when comments panel opens
  useEffect(() => {
    if (showComments && currentStory) {
      const fetchComments = async () => {
        setCommentsLoading(true);
        try {
          const detail = await postsApi.getById(currentStory.id);
          // Sort comments by created_at ascending
          const sorted = [...detail.comments].sort((a, b) => 
            new Date(parseUTCDate(a.created_at)).getTime() - new Date(parseUTCDate(b.created_at)).getTime()
          );
          setComments(sorted);
        } catch (err) {
          console.error('Failed to load comments in story:', err);
        } finally {
          setCommentsLoading(false);
        }
      };
      fetchComments();
    }
  }, [showComments, currentStory]);

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
    if (showComments) return; // Ignore swipe when comment list is open
    touchStartX.current = e.touches[0].clientX;
    onPause(); // Pause progress on touch-hold
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showComments) return;
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

  // Like click toggle handler
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikeAnimating(true);
    try {
      const res = await reactionsApi.toggleLike(currentStory.id);
      setLikeCount(res.likes);
      setIsLiked(res.liked);
      
      // Update local storage of liked posts
      const likedPosts = JSON.parse(localStorage.getItem('pinple-liked-posts') || '[]');
      if (res.liked) {
        if (!likedPosts.includes(currentStory.id)) likedPosts.push(currentStory.id);
      } else {
        const index = likedPosts.indexOf(currentStory.id);
        if (index > -1) likedPosts.splice(index, 1);
      }
      localStorage.setItem('pinple-liked-posts', JSON.stringify(likedPosts));
      
      if (onLikeToggle) onLikeToggle();
    } catch (err) {
      console.error('Failed to toggle like in story:', err);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 500);
    }
  };

  // Comment submit handler
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentSubmitting(true);
    setCommentError(null);
    const author = commentAuthor.trim() || '익명';

    try {
      const newComment = await commentsApi.create(currentStory.id, {
        author,
        content: commentContent.trim()
      });

      // Save nickname preference
      if (author !== '익명') {
        localStorage.setItem('pinple-nickname', author);
      }

      setComments((prev) => [...prev, newComment]);
      setCommentContent('');
      
      // Speculatively increase count in list representation
      currentStory.comment_count += 1;
      
      if (onCommentChange) onCommentChange();
    } catch (err: any) {
      setCommentError(err.message || '댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleOpenComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
    onPause();
  };

  const handleCloseComments = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowComments(false);
    onPlay();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center select-none font-sans">
      <div 
        className="relative w-full max-w-lg h-full max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl md:h-[92dvh] md:rounded-3xl border border-zinc-800/40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => { if (!showComments) onPause(); }}
        onMouseUp={() => { if (!showComments) onPlay(); }}
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
                onClick={() => { if (!showComments) onSelectIndex(index); }}
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
                  {formatDistanceToNow(parseUTCDate(currentStory.created_at), { addSuffix: true, locale: ko })}
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
        {!showComments && (
          <>
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
          </>
        )}

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
              {/* Like (Heart) Button */}
              <button
                onClick={handleLikeToggle}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                title="공감"
              >
                <Heart 
                  size={18} 
                  className={`text-rose-500 transition-all duration-300 ${isLiked ? 'fill-rose-500 scale-110' : ''} ${isLikeAnimating ? 'scale-150' : ''}`} 
                />
                <span className="text-xs font-bold">{likeCount}</span>
              </button>

              {/* Comments toggle button */}
              <button
                onClick={handleOpenComments}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                title="댓글 피드 열기"
              >
                <MessageCircle size={18} className="text-sky-400" />
                <span className="text-xs font-bold">{currentStory.comment_count}</span>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewLocation(currentStory);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <MapPin size={12} className="fill-zinc-950" />
              지도에서 보기
            </button>
          </div>
        </div>

        {/* Glassmorphic Comments Bottom Sheet Overlay */}
        {showComments && (
          <div 
            className="absolute inset-x-0 bottom-0 z-30 h-[65%] glass backdrop-blur-2xl bg-zinc-950/90 border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-sky-400" />
                <span className="font-extrabold text-sm text-white">댓글 피드</span>
                <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-black">
                  {comments.length}
                </span>
              </div>
              <button 
                onClick={handleCloseComments}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Comment Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {commentsLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  <span className="text-[10px] text-white/50 font-bold">의견 로딩 중...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-center text-white/40 py-8 border border-dashed border-white/5 rounded-2xl">
                  <span className="text-xs font-semibold">아직 의견이 없습니다.</span>
                  <span className="text-[10px] text-white/30 mt-1">첫 댓글을 든든하게 달아주세요!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-white/90 flex items-center gap-1">
                          <User size={10} className="text-white/60" /> {comment.author}
                        </span>
                        <span className="text-white/40 font-bold">
                          {formatDistanceToNow(parseUTCDate(comment.created_at), { addSuffix: true, locale: ko })}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-semibold break-all">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form 
              onSubmit={handleCommentSubmit}
              className="p-4 border-t border-white/5 bg-zinc-950/95 space-y-2"
            >
              {commentError && (
                <p className="text-rose-400 text-[10px] font-bold">⚠️ {commentError}</p>
              )}
              <div className="flex gap-2">
                <div className="relative w-20 flex-shrink-0">
                  <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="닉네임"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-extrabold text-[10px]"
                    maxLength={10}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name="nickname"
                  />
                </div>
                <div className="relative flex-grow flex items-center">
                  <input
                    type="text"
                    placeholder="댓글을 남겨주세요..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 text-[10px] font-bold placeholder-white/30"
                    required
                  />
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentContent.trim()}
                    className="absolute right-1.5 p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {commentSubmitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
