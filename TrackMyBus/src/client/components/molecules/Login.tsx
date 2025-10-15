import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/css/login.module.css";
import Notification_ from "../Atoms/Notification";

declare global {
  // google identity services global
  interface Window {
    google?: any;
  }
}

type UserProfile = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [claim: string]: any;
};

type LoginProps = {
  clientId?: string; // optional, falls back to REACT_APP_GOOGLE_CLIENT_ID
  onSuccess?: (user: UserProfile) => void;
  onError?: (err: Error) => void;
};

function decodeJwtPayload(token: string): any {
  // token format: header.payload.signature
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // Add padding for base64 decoding
    const padded =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "==".slice((payload.length + 3) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const Login: React.FC<LoginProps> = ({ clientId, onSuccess, onError }) => {
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const resolvedClientId =
    clientId || process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    const src = "https://accounts.google.com/gsi/client";
    // prevent loading multiple times
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => setLoaded(true);
      script.onerror = (e) =>
        onError?.(new Error("Failed to load Google Identity Services script"));
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, [resolvedClientId, onError]);

  useEffect(() => {
    if (!loaded || !window.google || !googleButtonRef.current || redirecting)
      return;

    if (!user) {
      try {
        window.google.accounts.id.initialize({
          client_id: resolvedClientId,
          callback: (response: any) => {
            if (!response?.credential) {
              onError?.(new Error("No credential returned from Google"));
              return;
            }
            const payload = decodeJwtPayload(response.credential);
            if (!payload) {
              onError?.(new Error("Failed to decode Google credential"));
              return;
            }
            onSuccess?.(payload);
            setRedirecting(true);

            localStorage.setItem("user", JSON.stringify(payload));

            try {
              window.location.replace("/login-success");
            } catch {
              window.location.href = "/login-success";
            }
          },
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "300",
        });
      } catch (err: any) {
        onError?.(err);
      }
    }
  }, [loaded, resolvedClientId, user, onSuccess, onError, redirecting]);

  const handleSignOut = () => {
    setUser(null);
    try {
      window.google?.accounts.id.disableAutoSelect?.();
    } catch {}
  };

  if (redirecting) return null;

  return (
    <>
      <Notification_ />

      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Sign in with Google</h2>
            <p>Access your TrackMyBus account using Google</p>
          </div>

          {user ? (
            <div className={styles.userInfo}>
              <div>
                <div>{user.name || user.email}</div>
                <div>{user.email}</div>
              </div>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <div className={styles.googleBtnWrapper}>
              <div ref={googleButtonRef} />
              <p>By continuing you agree to the terms of service.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
