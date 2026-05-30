import { useState, useEffect, useCallback, useRef } from 'react';
import { postsApi } from '../services/api';
import { Post } from '../types';
import { useMapStore } from '../stores/mapStore';

export function useStories() {
  const [stories, setStories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const center = useMapStore((s) => s.center);
  const timerRef = useRef<number | null>(null);
  const progressInterval = 50; // Update progress every 50ms
  const storyDuration = 5000; // 5 seconds per story

  // Fetch stories: Posts created in the last 24 hours within 5km of map center
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('lat', String(center[0]));
      params.append('lng', String(center[1]));
      params.append('radius', '5.0'); // 5km radius
      params.append('hours_ago', '24'); // Last 24 hours limit

      const res = await postsApi.getAll(params);
      setStories(res.posts);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  }, [center]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Story progression logic
  useEffect(() => {
    if (!isPlaying || stories.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Progress complete: Move to next story
          setCurrentIndex((prevIdx) => {
            if (prevIdx < stories.length - 1) {
              return prevIdx + 1;
            } else {
              // End of stories: close viewer
              setIsPlaying(false);
              return 0;
            }
          });
          return 0; // Reset progress
        }
        return prev + (progressInterval / storyDuration) * 100;
      });
    }, progressInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, stories, currentIndex]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const resetProgress = () => setProgress(0);

  const nextStory = () => {
    setProgress(0);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false); // Close on end
    }
  };

  const prevStory = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const selectStoryIndex = (index: number) => {
    setProgress(0);
    if (index >= 0 && index < stories.length) {
      setCurrentIndex(index);
    }
  };

  return {
    stories,
    loading,
    currentIndex,
    progress,
    isPlaying,
    play,
    pause,
    nextStory,
    prevStory,
    selectStoryIndex,
    refreshStories: fetchStories
  };
}
