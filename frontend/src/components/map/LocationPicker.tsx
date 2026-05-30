import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../stores/mapStore';
import { useThemeStore } from '../../stores/themeStore';

interface LocationPickerProps {
  value: { latitude: number; longitude: number } | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Sub-component to handle map click events
function MapClickEvents({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng);
    },
  });
  return null;
}

// Simple red marker for the picker
const createPickerIcon = (): L.DivIcon => {
  const html = `
    <div style="
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 40px;
    " class="animate-bounce">
      <svg width="32" height="40" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0C8.5 0 0 8.5 0 19C0 30.5 19 46 19 46C19 46 38 30.5 38 19C38 8.5 29.5 0 19 0Z" fill="#EF4444"/>
        <circle cx="19" cy="17" r="10" fill="white"/>
      </svg>
      <span style="
        position: absolute;
        top: 6px;
        font-size: 13px;
        pointer-events: none;
        user-select: none;
      ">📍</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'picker-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const defaultCenter = useMapStore((s) => s.center);
  const userLocation = useMapStore((s) => s.userLocation);
  const theme = useThemeStore((s) => s.resolved);

  const initialCenter = userLocation || defaultCenter;
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value ? [value.latitude, value.longitude] : null
  );

  useEffect(() => {
    if (value) {
      setMarkerPosition([value.latitude, value.longitude]);
    }
  }, [value]);

  const handleMapClick = (latlng: L.LatLng) => {
    const coords = { latitude: latlng.lat, longitude: latlng.lng };
    setMarkerPosition([latlng.lat, latlng.lng]);
    onChange(coords);
  };

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 z-0">
      <MapContainer
        center={markerPosition || initialCenter}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer
          key={theme}
          url={tileUrl}
          attribution={attribution}
        />
        <MapClickEvents onClick={handleMapClick} />

        {markerPosition && (
          <Marker position={markerPosition} icon={createPickerIcon()} />
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] glass px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 pointer-events-none">
        {markerPosition 
          ? `선택됨: ${markerPosition[0].toFixed(5)}, ${markerPosition[1].toFixed(5)}`
          : '지도를 클릭하여 핀을 꽂아주세요.'}
      </div>
    </div>
  );
};
