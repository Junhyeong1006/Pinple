import { useState, useEffect, useCallback } from 'react';
import { useMapStore } from '../stores/mapStore';
import { useFilterStore } from '../stores/filterStore';
import { postsApi } from '../services/api';
import { Post } from '../types';
import { useDebounce } from './useDebounce';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const category = useFilterStore((s) => s.category);
  const search = useFilterStore((s) => s.search);
  const radius = useFilterStore((s) => s.radius);
  const hoursAgo = useFilterStore((s) => s.hoursAgo);

  // Debounce the map center changes to prevent spamming API calls on every pan/zoom
  const debouncedCenter = useDebounce(center, 300);
  const debouncedSearch = useDebounce(search, 300);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (category !== 'all') {
        params.append('category', category);
      }
      
      if (debouncedSearch.trim() !== '') {
        params.append('search', debouncedSearch);
      }

      if (hoursAgo !== null) {
        params.append('hours_ago', String(hoursAgo));
      }

      // Geospatial query parameters
      params.append('lat', String(debouncedCenter[0]));
      params.append('lng', String(debouncedCenter[1]));
      params.append('radius', String(radius));

      const res = await postsApi.getAll(params);
      setPosts(res.posts);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || '게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, hoursAgo, debouncedCenter, radius]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, total, loading, error, refresh: fetchPosts };
}
