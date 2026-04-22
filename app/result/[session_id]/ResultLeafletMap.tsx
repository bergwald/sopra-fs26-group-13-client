"use client";

import React from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

export type LeafletMapLike = {
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  invalidateSize: () => void;
};


type ResultLeafletMapProps = {
  worldBounds: [[number, number ], [number, number]];
  correctCoordinates: [number,number];
  onMapReady: (mapInstance: LeafletMapLike) => void;
};


const ResultLeafletMap: React.FC<ResultLeafletMapProps> = ({
  worldBounds,
  correctCoordinates,
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
        <CircleMarker
          center={correctCoordinates}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#fb7185",
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
        {/*
        <CircleMarker
        center={guessCoordinates}
        pathOptions={{
          color: "#f43f5e",
          fillColor: "#fb7185",
          fillOpacity: 0.9,
          weight: 2,
        }}
      />*/}
    </MapContainer>
  );
};

export default ResultLeafletMap;
