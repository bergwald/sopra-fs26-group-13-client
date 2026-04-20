"use client";

import React from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

type GuessCoordinates = {
  latitude: number;
  longitude: number;
};

type GameLeafletMapProps = {
  worldBounds: [[number, number], [number, number]];
  selectedGuess: GuessCoordinates | null;
  onGuessSelected: (nextGuess: GuessCoordinates) => void;
  onMapReady: (mapInstance: { fitBounds: (bounds: [[number, number], [number, number]]) => void }) => void;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const MapClickHandler: React.FC<{
  onGuessSelected: (nextGuess: GuessCoordinates) => void;
}> = ({ onGuessSelected }) => {
  useMapEvents({
    click: (event: { latlng: { lat: number; lng: number } }) => {
      const latitude = Number(clamp(event.latlng.lat, -90, 90).toFixed(5));
      const longitude = Number(clamp(event.latlng.lng, -180, 180).toFixed(5));
      onGuessSelected({ latitude, longitude });
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
  return (
    <MapContainer
      className="game-osm-root"
      bounds={worldBounds}
      whenReady={(event) => {
        const mapInstance = event.target;
        onMapReady(mapInstance);
        mapInstance.fitBounds(worldBounds);
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onGuessSelected={onGuessSelected} />
      {selectedGuess ? (
        <CircleMarker
          center={[selectedGuess.latitude, selectedGuess.longitude]}
          pathOptions={{
            radius: 5,
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
