"use client";

import { useEffect, useRef, useState } from "react";

interface HotelMapProps {
  lat: number;
  lng: number;
  hotelName: string;
  address: string;
}

export default function HotelMap({ lat, lng, hotelName, address }: HotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup existing map if it exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (e) {
        console.warn("Error cleaning up existing map:", e);
      }
    }

    // Clear the container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      // Remove any existing Leaflet classes
      mapRef.current.className = mapRef.current.className.replace(/leaflet-\S+/g, '');
    }

    // Dynamically import Leaflet only on client side
    const loadMap = async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        // Double check the container is available and clean
        if (!mapRef.current) return;

        // Generate unique ID for this map instance
        const mapId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        mapRef.current.id = mapId;

        // Initialize map with error handling
        const map = L.default.map(mapId, {
          // Prevent map from being initialized multiple times
          preferCanvas: true,
          attributionControl: true,
        }).setView([lat, lng], 15);

        // Add tile layer (OpenStreetMap)
        L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create custom icon
        const icon = L.default.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Add marker
        L.default.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${hotelName}</b><br/>${address}`)
          .openPopup();

        mapInstanceRef.current = map;
        setIsLoaded(true);
        setError(null);
      } catch (error) {
        console.error("Failed to load map:", error);
        setError("Không thể tải bản đồ");
        setIsLoaded(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(loadMap, 100);

    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.warn("Error cleaning up map on unmount:", e);
        }
      }
    };
  }, [lat, lng, hotelName, address]);

  if (error) {
    return (
      <div className="w-full h-64 rounded-xl border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-xl border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center">
      {!isLoaded && (
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p>Đang tải bản đồ...</p>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full h-full rounded-xl ${isLoaded ? 'block' : 'hidden'}`}
      />
    </div>
  );
}


