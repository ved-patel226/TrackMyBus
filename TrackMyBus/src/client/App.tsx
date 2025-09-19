import useSWR from "swr";
import NavigationView from "./components/molecules/NavigationView";
import Secrets from "./lib/types/Misc";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const { data } = useSWR<Secrets>("/api/secrets", fetcher);
  const [status, setStatus] = useState<string>("idle");

  if (!data) {
    return <div>Loading...</div>;
  }

  const subscribeOnClick = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        setStatus("Service Worker not supported");
        return;
      }
      if (!("PushManager" in window)) {
        setStatus("Push API not supported");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission denied");
        return;
      }

      setStatus("Registering service worker...");

      const registration = await navigator.serviceWorker.register(
        "/sw-push.js",
        { scope: "/" }
      );

      setStatus("Fetching VAPID key...");
      const resp = await fetch("/api/vapidPublicKey");
      const { publicKey } = await resp.json();

      setStatus("Subscribing to push... Using VAPID key: " + publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey),
      });

      setStatus("Sending subscription to server...");
      await fetch("/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      await fetch("/send-notification");

      setStatus("Subscribed successfully");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err.message || err));
    }
  };

  return (
    <>
      <div style={{ padding: 8 }}>
        <button onClick={subscribeOnClick}>Enable Notifications</button>
        <span style={{ marginLeft: 12 }}>{status}</span>
      </div>
      <NavigationView API_KEY={data} />
    </>
  );
}

export default App;
