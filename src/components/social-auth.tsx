"use client";
import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";
import { accountAction, type AccountCapabilities } from "./consumer-provider";

type Props = {
  capabilities: AccountCapabilities | null;
  mode?: "signin" | "link";
  disabled?: boolean;
  onSuccess: () => Promise<void> | void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === "1") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load sign-in provider.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => { script.dataset.ready = "1"; resolve(); };
    script.onerror = () => reject(new Error("Unable to load sign-in provider."));
    document.head.appendChild(script);
  });
}

export function SocialAuth({ capabilities, mode = "signin", disabled, onSuccess, onError }: Props) {
  const googleHost = useRef<HTMLDivElement>(null);
  const [appleBusy, setAppleBusy] = useState(false);
  const action = mode === "link" ? "auth/link-social" : "auth/sign-in/social";
  const googleReady = Boolean(capabilities?.providers.google && config.googleClientId);
  const appleReady = Boolean(capabilities?.providers.apple && config.appleClientId);

  useEffect(() => {
    if (!googleReady || !googleHost.current) return;
    let cancelled = false;
    void loadScript("homes-google-identity", "https://accounts.google.com/gsi/client")
      .then(() => {
        if (cancelled || !googleHost.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: async (response: { credential?: string }) => {
            try {
              if (!response.credential) throw new Error("Google did not return a valid identity token.");
              await accountAction(action, { provider: "google", idToken: { token: response.credential } });
              await onSuccess();
            } catch (cause) {
              onError(cause instanceof Error ? cause.message : "Google sign-in could not be completed.");
            }
          },
          cancel_on_tap_outside: true,
        });
        googleHost.current.replaceChildren();
        window.google.accounts.id.renderButton(googleHost.current, {
          type: "standard",
          theme: document.documentElement.dataset.theme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "link" ? "continue_with" : "continue_with",
          width: Math.min(420, googleHost.current.clientWidth || 420),
        });
      })
      .catch(cause => onError(cause instanceof Error ? cause.message : "Google sign-in is unavailable."));
    return () => { cancelled = true; };
  }, [action, googleReady, mode, onError, onSuccess]);

  async function apple() {
    if (!appleReady || appleBusy || disabled) return;
    setAppleBusy(true);
    try {
      await loadScript("homes-apple-identity", "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
      if (!window.AppleID?.auth) throw new Error("Apple sign-in is unavailable.");
      window.AppleID.auth.init({
        clientId: config.appleClientId,
        scope: "name email",
        redirectURI: `${window.location.origin}/account`,
        usePopup: true,
      });
      const result = await window.AppleID.auth.signIn();
      const token = result?.authorization?.id_token;
      if (!token) throw new Error("Apple did not return a valid identity token.");
      await accountAction(action, { provider: "apple", idToken: { token } });
      await onSuccess();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Apple sign-in could not be completed.";
      if (!/popup_closed|cancel/i.test(message)) onError(message);
    } finally {
      setAppleBusy(false);
    }
  }

  if (!googleReady && !appleReady) return null;
  return <div className="social-auth" aria-label={mode === "link" ? "Connect a sign-in method" : "Social sign in"}>
    {googleReady && <div className={disabled ? "social-provider-disabled" : ""} ref={googleHost} aria-disabled={disabled || undefined} />}
    {appleReady && <button type="button" className="social-provider apple" disabled={disabled || appleBusy} onClick={apple}>
      <span aria-hidden="true">●</span>{appleBusy ? "Connecting…" : mode === "link" ? "Connect Apple" : "Continue with Apple"}
    </button>}
  </div>;
}
