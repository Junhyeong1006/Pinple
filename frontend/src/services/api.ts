import { PaginatedPosts, PostDetail, Comment, Post } from '../types';

const API_BASE = '/api';

// Retrieve or generate a persistent unique Device ID for non-logged-in likes tracking
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('pinple-device-id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    localStorage.setItem('pinple-device-id', deviceId);
  }
  return deviceId;
}

// Global fetch wrapper with automatic error parsing and Device ID headers injection
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const deviceId = getOrCreateDeviceId();
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId,
    ...options?.headers
  });

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: '서버 연결에 실패했습니다.' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Posts endpoint integrations
export const postsApi = {
  getAll: (params?: URLSearchParams) =>
    request<PaginatedPosts>(`/posts?${params?.toString() || ''}`),
    
  getById: (id: number) =>
    request<PostDetail>(`/posts/${id}`),
    
  create: async (formData: FormData) => {
    // Form data requires raw fetch because of Boundary requirements
    const deviceId = getOrCreateDeviceId();
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Device-ID': deviceId
        // Content-Type is auto-injected by fetch for multipart/form-data
      }
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: '서버 전송에 실패했습니다.' }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
  
  delete: (id: number) =>
    request<{ message: string }>(`/posts/${id}`, { method: 'DELETE' }),
};

// Comments endpoint integrations
export const commentsApi = {
  create: (postId: number, data: { author: string; content: string }) =>
    request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Reactions (likes toggle) endpoint integrations
export const reactionsApi = {
  toggleLike: (postId: number) =>
    request<{ likes: number; liked: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
    }),
};
