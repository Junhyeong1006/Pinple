import { useState, useEffect, useCallback } from 'react';
import { useMapStore } from '../stores/mapStore';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  coordinates: [number, number] | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    coordinates: null
  });

  const setUserLocation = useMapStore((s) => s.setUserLocation);

  const fetchLocation = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      const errorMsg = '이 브라우저는 위치 서비스를 지원하지 않습니다.';
      setState({
        loading: false,
        error: errorMsg,
        coordinates: null
      });
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      const coords: [number, number] = [
        position.coords.latitude,
        position.coords.longitude
      ];
      
      setState({
        loading: false,
        error: null,
        coordinates: coords
      });
      setUserLocation(coords);
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMsg = '위치 정보를 가져오는 도중 오류가 발생했습니다.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg = '위치 정보 접근 권한이 거부되었습니다. 서울시청을 중심으로 보여줍니다.';
      }
      
      setState({
        loading: false,
        error: errorMsg,
        coordinates: null
      });
      // Do not update store with null coordinates to keep default Seoul center
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [setUserLocation]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { ...state, retry: fetchLocation };
}
