import React, { useState, useEffect, useCallback } from 'react';
import { PostDetail as IPostDetail, CATEGORIES } from '../../types';
import { postsApi, commentsApi, reactionsApi } from '../../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, Send, X, User, Calendar, Trash2, Loader2, ArrowLeft } from 'lucide-react';

interface PostDetailProps {
  postId: number;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  onLikeToggle?: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ 
  postId, 
  onClose, 
  onDeleteSuccess,
  onLikeToggle
}) => {
  const [post, setPost] = useState<IPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment form states
  const [commentAuthor, setCommentAuthor] = useState(() => localStorage.getItem('pinple-nickname') || '');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Like animation state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const fetchPostDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postsApi.getById(postId);
      setPost(res);
      setLikeCount(res.likes);
      
      // We check likes from backend if it supports checking user liked.
      // If we don't have a direct liked flag from backend, we can infer it or keep it local.
      // But backend /posts/{id} does not return "liked" directly unless configured.
      // Actually backend /posts/{id}/like returns {likes, liked}. Let's initialize isLiked state.
      // To see if user already liked, we can check localStorage where we saved liked post ids
      const likedPosts = JSON.parse(localStorage.getItem('pinple-liked-posts') || '[]');
      setIsLiked(likedPosts.includes(postId));
    } catch (err: any) {
      setError(err.message || '게시글 상세 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const handleLikeToggle = async () => {
    if (!post) return;
    setIsLikeAnimating(true);
    try {
      const res = await reactionsApi.toggleLike(post.id);
      setLikeCount(res.likes);
      setIsLiked(res.liked);
      
      // Update local storage of liked posts
      const likedPosts = JSON.parse(localStorage.getItem('pinple-liked-posts') || '[]');
      if (res.liked) {
        if (!likedPosts.includes(post.id)) likedPosts.push(post.id);
      } else {
        const index = likedPosts.indexOf(post.id);
        if (index > -1) likedPosts.splice(index, 1);
      }
      localStorage.setItem('pinple-liked-posts', JSON.stringify(likedPosts));
      
      if (onLikeToggle) onLikeToggle();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentContent.trim()) return;

    setCommentSubmitting(true);
    setCommentError(null);
    const author = commentAuthor.trim() || '익명';

    try {
      const newComment = await commentsApi.create(post.id, {
        author,
        content: commentContent.trim()
      });

      // Save nickname preference
      if (author !== '익명') {
        localStorage.setItem('pinple-nickname', author);
      }

      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comment_count: prev.comment_count + 1,
          comments: [...prev.comments, newComment]
        };
      });
      setCommentContent('');
    } catch (err: any) {
      setCommentError(err.message || '댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await postsApi.delete(post.id);
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || '게시글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <span className="text-sm font-medium text-zinc-500">불러오는 중...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-zinc-500 font-medium">{error || '게시글을 찾을 수 없습니다.'}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const categoryMeta = CATEGORIES.find((c) => c.key === post.category) || CATEGORIES[2];

  const getFormattedDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ko });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-sm">
      {/* Detail Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <button 
          onClick={onClose} 
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-xs hidden sm:inline">목록</span>
        </button>
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: categoryMeta.color }}
          >
            {categoryMeta.icon} {categoryMeta.label}
          </span>
          {post.status === 'resolved' ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              해결됨
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              처리 중
            </span>
          )}
        </div>
        <button
          onClick={handleDeletePost}
          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-xl transition"
          title="게시글 삭제"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Post Image (if any) */}
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden aspect-video border border-zinc-100 dark:border-zinc-900 shadow-sm bg-zinc-50 dark:bg-slate-900">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title and Metadata */}
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
            {post.title}
          </h2>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{post.author || '익명'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{getFormattedDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Post Body Content */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-all whitespace-pre-wrap font-medium">
          {post.content}
        </p>

        {/* Interaction Bar (Like & Info) */}
        <div className="flex items-center justify-between py-4 border-y border-zinc-100 dark:border-zinc-900">
          <button 
            onClick={handleLikeToggle}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300
              ${isLiked 
                ? 'border-transparent bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              }
            `}
          >
            <Heart 
              className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'fill-white' : ''} ${isLikeAnimating ? 'scale-150' : ''}`}
            />
            <span className="font-bold">공감 {likeCount}</span>
          </button>
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> 댓글 {post.comments.length}개
          </span>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            댓글 피드
          </h3>
          
          {post.comments.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 font-medium border border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
              아직 댓글이 없습니다. 첫 의견을 남겨주세요!
            </div>
          ) : (
            <div className="space-y-3.5">
              {post.comments.map((comment) => (
                <div 
                  key={comment.id}
                  className="p-3 bg-zinc-50 dark:bg-slate-900/40 border border-zinc-100/80 dark:border-zinc-900/80 rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" /> {comment.author}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                      {getFormattedDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 break-all leading-relaxed font-medium">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Input Sticky Footer */}
      <form onSubmit={handleCommentSubmit} className="sticky bottom-0 p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm space-y-2">
        {commentError && (
          <p className="text-rose-500 text-xs font-semibold">⚠️ {commentError}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="이름"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="w-20 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-xs"
            maxLength={10}
          />
          <div className="relative flex-grow flex items-center">
            <input
              type="text"
              placeholder="댓글을 남겨주세요..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full pl-3 pr-10 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-medium"
              required
            />
            <button
              type="submit"
              disabled={commentSubmitting || !commentContent.trim()}
              className="absolute right-1.5 p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {commentSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
