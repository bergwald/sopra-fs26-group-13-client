"use client";

import React from "react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";

export type LeafletMapLike = {
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  invalidateSize: () => void;
};

type ResultLeafletMapProps = {
  worldBounds: [[number, number], [number, number]];
  correctCoordinates: [number, number] | null;
  userGuessCoordinates: [number, number] | null;
  onMapReady: (mapInstance: LeafletMapLike) => void;
};

const ResultLeafletMap: React.FC<ResultLeafletMapProps> = ({
  worldBounds,
  correctCoordinates,
  userGuessCoordinates,
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
      {correctCoordinates
        ? (
          <CircleMarker
            center={correctCoordinates}
            pathOptions={{
              color: "#0e8f00",
              fillColor: "#0e8f00",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        )
        : null}
      {userGuessCoordinates
        ? (
          <CircleMarker
            center={userGuessCoordinates}
            pathOptions={{
              color: "#e60991",
              fillColor: "#e60991",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        )
        : null}
    </MapContainer>
  );
};

export default ResultLeafletMap;
