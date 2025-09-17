import { useState, useRef, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Pin,
} from "@vis.gl/react-google-maps";
import Secrets from "../../lib/types/Misc";

const NavigationView = ({ API_KEY }: { API_KEY: Secrets }) => {
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  const [stickToPosition, setStickToPosition] = useState(true);
  const [stillDragging, setStillDragging] = useState(false);

  useEffect(() => {
    console.log("[EVENT] Map Position:", currentPosition);
  }, [currentPosition]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error("Error getting position:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    console.log("stickToPosition:", stickToPosition);
    console.log("stillDragging:", stillDragging);

    if (!stickToPosition && !stillDragging) {
      const timerId = window.setTimeout(() => setStickToPosition(true), 3000);
      return () => window.clearTimeout(timerId);
    }
  }, [stickToPosition, stillDragging]);

  return (
    <APIProvider apiKey={API_KEY?.GOOGLE_MAPS_API_KEY}>
      <Map
        id="map"
        renderingType="VECTOR"
        mapId="21a43e8c4f02ed7c83ae0f0e"
        style={{ width: "100vw", height: "100vh" }}
        {...(stickToPosition
          ? {
              center: currentPosition
                ? { lat: currentPosition.lat, lng: currentPosition.lng }
                : { lat: 0, lng: 0 },
            }
          : {
              defaultCenter: currentPosition
                ? { lat: currentPosition.lat, lng: currentPosition.lng }
                : { lat: 0, lng: 0 },
            })}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        reuseMaps
        onDragstart={() => {
          console.log("Drag started");
          setStickToPosition(false);
          setStillDragging(true);
        }}
        onDragend={() => {
          console.log("Drag ended");
          setStillDragging(false);
        }}
      >
        {currentPosition && (
          <AdvancedMarker position={currentPosition}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" />
            </svg>
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};

export default NavigationView;
