import { useState, useRef, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import Secrets from "../../lib/types/Misc";
import styles from "../../styles/css/directions.module.css";
const NavigationView = ({ API_KEY }: { API_KEY: Secrets }) => {
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  const [stickToPosition, setStickToPosition] = useState(true);
  const [stillDragging, setStillDragging] = useState(false);

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
              zoom: 16,
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
        <Directions />

        {currentPosition && (
          <AdvancedMarker position={currentPosition}>
            <img
              id="location_marker"
              src="./images/crosshair.png"
              alt="Current Location Marker"
            />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const selected = routes[0];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        draggable: false,
        map,
      })
    );
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      directionsService
        .route({
          origin,
          destination: "100 Technology Dr, Edison, NJ 08837",
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
          setRoutes(response.routes);
        })
        .catch((err) => console.error("Directions request failed:", err));
    });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer]);

  if (!leg) return null;

  return (
    <div className={styles.directions}>
      <div className={styles.top}>
        <h1>{leg.duration?.text}</h1>

        <h2>{selected.summary}</h2>
      </div>

      <p>{leg.distance?.text}</p>
    </div>
  );
}

export default NavigationView;
