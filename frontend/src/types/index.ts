// Category types
export type Category = 'complaint' | 'suggestion' | 'info';
export type PostStatus = 'active' | 'resolved' | 'hidden';
export type ThemeMode = 'light' | 'dark' | 'system';

// Post entity representation
export interface Post {
  id: number;
  category: Category;
  title: string;
  content: string;
  author: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  likes: number;
  status: PostStatus;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// Detail of Post containing comments
export interface PostDetail extends Post {
  comments: Comment[];
}

// Comment entity
export interface Comment {
  id: number;
  post_id: number;
  author: string;
  content: string;
  created_at: string;
}

// Post submission payload
export interface CreatePostRequest {
  category: Category;
  title: string;
  content: string;
  author?: string;
  latitude: number;
  longitude: number;
  image?: File;
}

// Paginated posts list response
export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  total_pages: number;
}

// Category design metadata
export interface CategoryMeta {
  key: Category;
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
  icon: string; // Emoji
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'complaint', label: '민원', color: '#F43F5E', bgColor: 'rgba(244,63,94,0.08)', glowColor: 'rgba(244,63,94,0.4)', icon: '🚨' },
  { key: 'suggestion', label: '건의', color: '#0EA5E9', bgColor: 'rgba(14,165,233,0.08)', glowColor: 'rgba(14,165,233,0.4)', icon: '💡' },
  { key: 'info', label: '정보', color: '#10B981', bgColor: 'rgba(16,185,129,0.08)', glowColor: 'rgba(16,185,129,0.4)', icon: '📢' },
];

export function parseUTCDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Normalize spacing to ISO 'T' format
  let normalized = dateStr.trim().replace(' ', 'T');
  
  // Append 'Z' to treat as UTC if it's naive (lacks Z, +, or negative timezone offset in the time part)
  const hasZ = normalized.endsWith('Z');
  const hasPlus = normalized.includes('+');
  const hasMinusOffset = normalized.includes('T') && normalized.split('T')[1].includes('-');
  
  if (!hasZ && !hasPlus && !hasMinusOffset) {
    normalized = `${normalized}Z`;
  }
  
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
}


