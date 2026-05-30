import { create } from 'zustand';
import { Category } from '../types';

interface FilterState {
  category: Category | 'all';
  search: string;
  radius: number;
  hoursAgo: number | null;
  setCategory: (category: Category | 'all') => void;
  setSearch: (search: string) => void;
  setRadius: (radius: number) => void;
  setHoursAgo: (hoursAgo: number | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: 'all',
  search: '',
  radius: 5.0, // Default 5km
  hoursAgo: null,
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  setRadius: (radius) => set({ radius }),
  setHoursAgo: (hoursAgo) => set({ hoursAgo }),
  resetFilters: () => set({ category: 'all', search: '', radius: 5.0, hoursAgo: null }),
}));
