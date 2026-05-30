import React from 'react';
import { Post, CATEGORIES, parseUTCDate } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, User, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const categoryMeta = CATEGORIES.find((c) => c.key === post.category) || CATEGORIES[2];
  
  // Format creation time nicely (e.g., "3 hours ago", "yesterday")
  const getFormattedDate = (dateStr: string) => {
    try {
      const date = parseUTCDate(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div 
      onClick={onClick}
      className="glass hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md flex flex-col h-full group"
    >
      {/* Post Image Banner (if exists) */}
      {post.image_url ? (
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm text-white"
              style={{ backgroundColor: categoryMeta.color }}
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.label}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0">
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm text-white"
            style={{ backgroundColor: categoryMeta.color }}
          >
            <span>{categoryMeta.icon}</span>
            <span>{categoryMeta.label}</span>
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1.5 line-clamp-3 mb-4 break-all">
            {post.content}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium truncate max-w-[100px]">{post.author || '익명'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{getFormattedDate(post.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            {/* Status Indicator */}
            <div>
              {post.status === 'resolved' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  해결됨
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                  처리 중
                </span>
              )}
            </div>

            {/* Counters */}
            <div className="flex items-center gap-3 font-semibold text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                <span>{post.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
