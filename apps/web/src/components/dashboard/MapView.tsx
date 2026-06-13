"use client";

import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/app/dashboard/page";

// Tile grid configuration — each game tile = a small lat/lng square
const TILE_SIZE_DEG = 0.001; // ~111m per tile at the equator

interface MapViewProps {
  tiles: DashboardData["tiles"];
}

export default function MapView({ tiles }: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209]); // default: Delhi

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {} // fall back to default on denial
      );
    }
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <Recenter center={center} />
      {tiles.map((t) => {
        const lat = t.tileY * TILE_SIZE_DEG;
        const lng = t.tileX * TILE_SIZE_DEG;
        const bounds: [[number, number], [number, number]] = [
          [lat, lng],
          [lat + TILE_SIZE_DEG, lng + TILE_SIZE_DEG],
        ];

        const color =
          t.state === "owned"
            ? "#06B6D4"
            : t.state === "claimed"
            ? "#388BFD"
            : "transparent";

        return (
          <Rectangle
            key={`${t.tileX}-${t.tileY}`}
            bounds={bounds}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.25,
              weight: 1,
            }}
          />
        );
      })}
    </MapContainer>
  );
}

// Recenters the map once geolocation resolves
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const hasSet = useRef(false);
  useEffect(() => {
    if (!hasSet.current) {
      map.setView(center);
      hasSet.current = true;
    }
  }, [center, map]);
  return null;
}