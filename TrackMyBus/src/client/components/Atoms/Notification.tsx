import { useState } from "react";
import styles from "../../styles/css/notification.module.css";
import {
  IoIosNotifications,
  IoIosNotificationsOff,
  IoIosNotificationsOutline,
} from "react-icons/io";

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

export default function Notification_() {
  const [status, setStatus] = useState<string>("idle");

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
        {
          scope: "/",
        }
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

  const unsubscribeOnClick = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        setStatus("Service Worker not supported");
        return;
      }

      setStatus("Looking up service worker registration...");
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatus("No service worker registration found");
        return;
      }

      setStatus("Retrieving existing push subscription...");
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setStatus("No active subscription found");
        return;
      }

      setStatus("Unsubscribing locally...");
      const success = await subscription.unsubscribe();
      if (!success) {
        setStatus("Failed to unsubscribe locally");
        return;
      }

      setStatus("Notifying server to delete subscription...");
      const subJson = (subscription as any).toJSON
        ? (subscription as any).toJSON()
        : subscription;
      await fetch("/delete-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJson),
      });

      setStatus("Unsubscribed successfully");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err.message || err));
    }
  };

  return (
    <div className={styles.notification} style={{ padding: 8 }}>
      {status === "idle" ? (
        <IoIosNotificationsOutline
          className="icon"
          onClick={subscribeOnClick}
          style={{ transition: "color 0.3s", color: "#888" }}
        />
      ) : status === "Subscribed successfully" ? (
        <IoIosNotifications
          className="icon"
          onClick={unsubscribeOnClick}
          style={{
            transition: "color 0.3s",
            color: "#4caf50",
            animation: "pop 0.4s",
          }}
        />
      ) : status === "Unsubscribed successfully" ? (
        <IoIosNotificationsOff
          className="icon"
          onClick={subscribeOnClick}
          style={{
            transition: "color 0.3s",
            color: "#f44336",
            animation: "fade 0.4s",
          }}
        />
      ) : (
        <IoIosNotificationsOutline
          className="icon"
          style={{ transition: "color 0.3s", color: "#888" }}
        />
      )}
    </div>
  );
}
