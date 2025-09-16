import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import Secrets from "../../lib/types/Misc";
import { GoogleMapsStyles } from "../../lib/static/GoogleMapsStyles";

const NavigationView = ({ API_KEY }: { API_KEY: Secrets }) => {
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting position:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 50000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <APIProvider apiKey={API_KEY?.GOOGLE_MAPS_API_KEY}>
      <Map
        id="map"
        style={{ width: "100vw", height: "100vh" }}
        // center={currentPosition ?? { lat: 22.54992, lng: 0 }}
        // zoom={currentPosition ? 15 : 3}
        styles={GoogleMapsStyles}
        gestureHandling="greedy"
        disableDefaultUI
        reuseMaps
      >
        {currentPosition && <Marker position={currentPosition} />}
      </Map>
    </APIProvider>
  );
};

export default NavigationView;
