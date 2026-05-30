import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Post } from '../../types';
import { useMapStore } from '../../stores/mapStore';
import { useThemeStore } from '../../stores/themeStore';
import { createCustomMarkerIcon } from './MapPin';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  posts: Post[];
  onMarkerClick?: (post: Post) => void;
}

// Sub-component to sync map state with our zustand store
function MapEventsHandler() {
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);

  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setCenter([center.lat, center.lng]);
    },
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  return null;
}

// Sub-component to programmatically fly to a new center/zoom when they change in the store externally
function MapCenterController() {
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const map = useMapEvents({});
  const lastCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    // Only fly to if center has actually changed significantly to avoid infinite loops
    const [lat, lng] = center;
    const [lastLat, lastLng] = lastCenterRef.current;
    
    if (Math.abs(lat - lastLat) > 0.0001 || Math.abs(lng - lastLng) > 0.0001) {
      map.setView(center, zoom);
      lastCenterRef.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

// Sub-component to force Leaflet to recalculate container bounds on load and theme switch
function MapResizeTrigger({ theme }: { theme: string }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map, theme]);
  return null;
}


// Custom user location blue pulse marker
const createUserLocationIcon = (): L.DivIcon => {
  const html = `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-60"></div>
      <div class="relative w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const MapView: React.FC<MapViewProps> = ({ posts, onMarkerClick }) => {
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const userLocation = useMapStore((s) => s.userLocation);
  const theme = useThemeStore((s) => s.resolved);
  const navigate = useNavigate();

  // Leaflet tile layer URLs for Light and Dark modes
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false} // Disable default zoom controls to custom style later
        className="w-full h-full"
      >
        {/* Force re-render of TileLayer when theme changes using the key prop */}
        <TileLayer
          key={theme}
          url={tileUrl}
          attribution={attribution}
          maxZoom={20}
        />

        <MapEventsHandler />
        <MapCenterController />
        <MapResizeTrigger theme={theme} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()} zIndexOffset={1000} />
        )}

        {/* Post Markers */}
        {posts.map((post) => {
          const icon = createCustomMarkerIcon(post.category);
          return (
            <Marker
              key={post.id}
              position={[post.latitude, post.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(post);
                  } else {
                    navigate(`/posts/${post.id}`);
                  }
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
