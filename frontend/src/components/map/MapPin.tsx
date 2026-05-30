import L from 'leaflet';
import { Category } from '../../types';

// Category color and emoji mapping helper
export function createCustomMarkerIcon(category: Category, isHovered: boolean = false): L.DivIcon {
  let color = '#8B5CF6'; // Default brand color
  let glowColor = 'rgba(139, 92, 246, 0.4)';
  let emoji = '📌';

  if (category === 'complaint') {
    color = '#F43F5E';
    glowColor = 'rgba(244, 63, 94, 0.4)';
    emoji = '🚨';
  } else if (category === 'suggestion') {
    color = '#0EA5E9';
    glowColor = 'rgba(14, 165, 233, 0.4)';
    emoji = '💡';
  } else if (category === 'info') {
    color = '#10B981';
    glowColor = 'rgba(16, 185, 129, 0.4)';
    emoji = '📢';
  }

  const scale = isHovered ? 'scale(1.15)' : 'scale(1)';
  const shadow = isHovered 
    ? `drop-shadow(0 0 12px ${color})` 
    : `drop-shadow(0 0 6px ${glowColor})`;

  // Custom inline SVG for the pinpoint icon
  const svgHtml = `
    <div style="
      transform: ${scale};
      filter: ${shadow};
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 46px;
    " class="animate-bounce-in">
      <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0C8.5 0 0 8.5 0 19C0 30.5 19 46 19 46C19 46 38 30.5 38 19C38 8.5 29.5 0 19 0Z" fill="${color}"/>
        <circle cx="19" cy="17" r="12" fill="white"/>
      </svg>
      <span style="
        position: absolute;
        top: 8px;
        font-size: 15px;
        pointer-events: none;
        user-select: none;
      ">${emoji}</span>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin',
    iconSize: [38, 46],
    iconAnchor: [19, 46],
    popupAnchor: [0, -42]
  });
}
