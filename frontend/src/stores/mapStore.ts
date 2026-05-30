import { create } from 'zustand';

interface MapState {
  center: [number, number];
  zoom: number;
  userLocation: [number, number] | null;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setUserLocation: (location: [number, number] | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [37.5666, 126.9784], // Seoul City Hall default
  zoom: 14,
  userLocation: null,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setUserLocation: (location) => set((state) => {
    const nextState: Partial<MapState> = { userLocation: location };
    if (location) {
      nextState.center = location;
    }
    return nextState;
  }),
}));
