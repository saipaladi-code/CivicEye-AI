import React, { useEffect, useRef } from 'react';
import { MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const InteractiveMap = ({ complaints = [], onSelectComplaint, activeId, height = "400px" }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    // Initialize Leaflet Map if L is available in window
    if (typeof window !== 'undefined' && window.L && mapContainerRef.current) {
      if (!leafletMapRef.current) {
        // Default center on sample coordinates (Bangalore smart city grid coordinates)
        const map = window.L.map(mapContainerRef.current).setView([12.972, 77.595], 13);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | CivicEye AI'
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof window.L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add issue markers
      complaints.forEach((item) => {
        if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
          const isHigh = item.priorityScore >= 70;
          const color = isHigh ? '#e11d48' : item.priorityScore >= 40 ? '#f59e0b' : '#10b981';

          const customIcon = window.L.divIcon({
            className: 'custom-map-pin',
            html: `
              <div style="
                background-color: ${color};
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 11px;
                cursor: pointer;
                transform: ${item.id === activeId ? 'scale(1.3)' : 'scale(1)'};
                transition: transform 0.2s ease;
              ">
                ${item.priorityScore}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = window.L.marker([item.coordinates.lat, item.coordinates.lng], { icon: customIcon }).addTo(map);
          
          const popupContent = `
            <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
                <strong style="font-size:13px; color:#0f172a;">${item.id}</strong>
                <span style="font-size:10px; font-weight:bold; padding:2px 6px; border-radius:10px; background:${isHigh ? '#ffe4e6':'#fef3c7'}; color:${isHigh ? '#9f1239':'#92400e'};">
                  ${item.priorityScore}/100
                </span>
              </div>
              <p style="margin:0 0 4px 0; font-size:12px; font-weight:600; color:#0284c7;">${item.category}</p>
              <p style="margin:0; font-size:11px; color:#475569;">📍 ${item.location}</p>
              <div style="margin-top:6px; font-size:11px; font-weight:bold; color:#334155;">Status: ${item.status}</div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('click', () => {
            if (onSelectComplaint) onSelectComplaint(item.id);
          });
        }
      });
    }
  }, [complaints, activeId, onSelectComplaint]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900" style={{ height }}>
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel px-3 py-2 rounded-xl text-xs flex items-center gap-4 shadow-md border border-white/40">
        <span className="font-semibold text-slate-700">Priority Map:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 border border-white"></span>
          <span className="text-slate-600 font-medium">High (&ge;70)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
          <span className="text-slate-600 font-medium">Medium (40-69)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
          <span className="text-slate-600 font-medium">Low (&lt;40)</span>
        </div>
      </div>
    </div>
  );
};
