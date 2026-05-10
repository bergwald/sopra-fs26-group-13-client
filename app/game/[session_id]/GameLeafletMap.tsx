"use client";

import React from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

type GuessCoordinates = {
  latitude: number;
  displayLongitude: number;
  normalizedLongitude: number;
};

export type LeafletMapLike = {
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  invalidateSize: () => void;
};

type LeafletClickEventLike = {
  latlng: {
    lat: number;
    lng: number;
  };
};

type GameLeafletMapProps = {
  worldBounds: [[number, number], [number, number]];
  selectedGuess: GuessCoordinates | null;
  onGuessSelected: (nextGuess: GuessCoordinates) => void;
  onMapReady: (mapInstance: LeafletMapLike) => void;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
const normalizeLongitude = (lng: number): number => {
  return ((lng + 180) % 360 + 360) % 360 - 180;
};

const MapClickHandler: React.FC<{
  onGuessSelected: (nextGuess: GuessCoordinates) => void;
}> = ({ onGuessSelected }) => {
  useMapEvents({
    click: (event: LeafletClickEventLike) => {
      const rawLng = event.latlng.lng;
      onGuessSelected({
        latitude: Number(event.latlng.lat.toFixed(5)),
        displayLongitude: Number(rawLng.toFixed(5)),
        normalizedLongitude: Number(
          normalizeLongitude(rawLng).toFixed(5)
        ),
      });
    },
  });

  return null;
};

const GameLeafletMap: React.FC<GameLeafletMapProps> = ({
  worldBounds,
  selectedGuess,
  onGuessSelected,
  onMapReady,
}) => {
  const hasInitializedBoundsRef = React.useRef(false);

  return (
    <MapContainer
      className="game-osm-root"
      bounds={worldBounds}
      ref={(mapInstance) => {
        if (!mapInstance || hasInitializedBoundsRef.current) {
          return;
        }

        hasInitializedBoundsRef.current = true;
        onMapReady(mapInstance);
        mapInstance.fitBounds(worldBounds);
      }}
      {...{        
      worldCopyJump: false,
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      noWrap={false}
      <MapClickHandler onGuessSelected={onGuessSelected} />
      {selectedGuess ? (
        <CircleMarker
          center={[selectedGuess.latitude, selectedGuess.displayLongitude]}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#fb7185",
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      ) : null}
    </MapContainer>
  );
};

export default GameLeafletMap;
