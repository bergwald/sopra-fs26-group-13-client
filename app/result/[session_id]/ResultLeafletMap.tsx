"use client";

import React from "react";
import { CircleMarker, MapContainer, TileLayer, Popup } from "react-leaflet";

export type LeafletMapLike = {
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  invalidateSize: () => void;
};

type GuessCoordinate = {
  lat: number | null;
  lng: number | null;
  id: number;
  username: string;
  role: string;
};

type ResultLeafletMapProps = {
  worldBounds: [[number, number], [number, number]];
  correctCoordinates: [number, number]|null;

  allGuessCoordinates: GuessCoordinate[];

  onMapReady: (mapInstance: LeafletMapLike) => void;
};

const ResultLeafletMap: React.FC<ResultLeafletMapProps> = ({
  worldBounds,
  correctCoordinates,
  allGuessCoordinates,
  onMapReady,
}) => {
  const hasInitializedBoundsRef = React.useRef(false);

  return (
    <MapContainer
      className="result-osm-root"
      bounds={worldBounds}
      ref={(mapInstance) => {
        if (!mapInstance || hasInitializedBoundsRef.current) {
          return;
        }

        hasInitializedBoundsRef.current = true;
        onMapReady(mapInstance);
        mapInstance.fitBounds(worldBounds);
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Correct location marker */}
      <CircleMarker
        center={correctCoordinates}
        pathOptions={{
          color: "#0e8f00",
          fillColor: "#0e8f00",
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Popup>Correct Location</Popup>
      </CircleMarker>

      {/* All player guesses */}
      {allGuessCoordinates?.map((guess) =>
          guess.lat != null && guess.lng != null ? (
      <CircleMarker
        key={guess.id}
        center={[guess.lat, guess.lng]}
        pathOptions={{
        color: "#e60991",
        fillColor: "#e60991",
        fillOpacity: 0.9,
        weight: 2,
      }}
    />
  ) : null
      )}
    </MapContainer>
  );
};

export default ResultLeafletMap;