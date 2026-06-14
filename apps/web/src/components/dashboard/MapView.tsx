"use client";

import { MapContainer, TileLayer, Polygon, Polyline, useMap, Circle, CircleMarker } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import type { DashboardData, GeoPoint } from "@/app/dashboard/page";

interface MapViewProps {
  territories: DashboardData["territories"];
  routes: DashboardData["routes"];
}

export default function MapView({ territories = [], routes = [] }: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Initial position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setCenter(loc);
          setUserLocation(loc);
        },
        () => {}
      );

      // Watch for live updates
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Recenter center={center} />
        <RecenterControl userLocation={userLocation} />

        {/* Claimed territories — filled polygons */}
        {territories.map((t) => (
          <Polygon
            key={t.id}
            positions={(t.points as GeoPoint[]).map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: "#06B6D4",
              fillColor: "#06B6D4",
              fillOpacity: 0.25,
              weight: 2,
            }}
          />
        ))}

        {/* Open routes — polylines */}
        {routes.filter((r) => !r.isClosed).map((r) => (
          <Polyline
            key={r.id}
            positions={(r.points as GeoPoint[]).map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: "#388BFD",
              weight: 3,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Live user location */}
        {userLocation && (
          <>
            {/* Accuracy ring */}
            <Circle
              center={userLocation}
              radius={20}
              pathOptions={{
                color: "#388BFD",
                fillColor: "#388BFD",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
            {/* Location dot */}
            <CircleMarker
              center={userLocation}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#388BFD",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}

// Sets map center once on first geolocation fix
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

// Floating "locate me" button inside the map
function RecenterControl({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();

  const handleLocate = () => {
    if (userLocation) {
      map.setView(userLocation, 16);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 16);
      });
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px" }}>
      <div className="leaflet-control">
        <button
          onClick={handleLocate}
          title="Go to my location"
          style={{
            background: "#161B24",
            border: "1px solid rgba(56,139,253,0.3)",
            borderRadius: "8px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#388BFD",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}