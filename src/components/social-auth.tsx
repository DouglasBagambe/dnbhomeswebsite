"use client";
import Image from "next/image";
import { AppleMark } from "./provider-marks";
import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";
import { isPreviewProvider } from "@/lib/provider-preview";
import { AccountError, accountAction, type AccountCapabilities } from "./consumer-provider";

type Props = {
  capabilities: AccountCapabilities | null;
  mode?: "signin" | "link";
  disabled?: boolean;
  onSuccess: () => Promise<void> | void;
  onError: (message: string) => void;
};

type GoogleIdentity = {
  accounts?: {
    id?: {
      initialize(options: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        cancel_on_tap_outside?: boolean;
      }): void;
      renderButton(element: HTMLElement, options: Record<string, string | number>): void;
    };
  };
};
type AppleIdentity = {
  auth?: {
    init(options: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }): void;
    signIn(): Promise<{ authorization?: { id_token?: string } }>;
  };
};
declare global {
  interface Window {
    google?: GoogleIdentity;
    AppleID?: AppleIdentity;
  }
}

function providerMessage(cause: unknown, provider: "Google" | "Apple") {
  if (cause instanceof AccountError && /account_not_linked/i.test(cause.code)) {
    return `This ${provider} email already belongs to a Homes account. Sign in with your existing method, then connect ${provider} from Security.`;
  }
  return cause instanceof Error ? cause.message : `${provider} sign-in could not be completed.`;
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
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [appleBusy, setAppleBusy] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const googlePreview = isPreviewProvider(config.googleClientId, config.siteUrl);
  const applePreview = isPreviewProvider(config.appleClientId, config.siteUrl);
  const action = mode === "link" ? "auth/link-social" : "auth/sign-in/social";
  const googleReady = Boolean(capabilities?.providers.google && config.googleClientId);
  const appleReady = Boolean(capabilities?.providers.apple && config.appleClientId);

  useEffect(() => {
    if (!googleReady || googlePreview || !googleHost.current || disabled) return;
    let cancelled = false;
    void loadScript("homes-google-identity", "https://accounts.google.com/gsi/client")
      .then(() => {
        const identity = window.google?.accounts?.id;
        if (cancelled || !googleHost.current || !identity) return;
        identity.initialize({
          client_id: config.googleClientId,
          callback: async response => {
            try {
              if (!response.credential) throw new Error("Google did not return a valid identity token.");
              await accountAction(action, { provider: "google", idToken: { token: response.credential } });
              await onSuccess();
            } catch (cause) {
              onError(providerMessage(cause, "Google"));
            }
          },
          cancel_on_tap_outside: true,
        });
        googleHost.current.replaceChildren();
        identity.renderButton(googleHost.current, {
          type: "icon",
          theme: document.documentElement.dataset.resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "circle",
          text: "continue_with",
        });
        setGoogleLoaded(true);
      })
      .catch(cause => onError(providerMessage(cause, "Google")));
    return () => { cancelled = true; };
  }, [action, disabled, googlePreview, googleReady, onError, onSuccess]);

  async function apple() {
    if (!appleReady || appleBusy || disabled) return;
    if (applePreview) { setPreviewMessage("Apple sign-in will be available at launch."); return; }
    setAppleBusy(true);
    try {
      await loadScript("homes-apple-identity", "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
      const appleIdentity = window.AppleID?.auth;
      if (!appleIdentity) throw new Error("Apple sign-in is unavailable.");
      appleIdentity.init({
        clientId: config.appleClientId,
        scope: "name email",
        redirectURI: `${window.location.origin}/account`,
        usePopup: true,
      });
      const result = await appleIdentity.signIn();
      const token = result.authorization?.id_token;
      if (!token) throw new Error("Apple did not return a valid identity token.");
      await accountAction(action, { provider: "apple", idToken: { token } });
      await onSuccess();
    } catch (cause) {
      const message = providerMessage(cause, "Apple");
      if (!/popup_closed|cancel/i.test(message)) onError(message);
    } finally {
      setAppleBusy(false);
    }
  }

  if (!googleReady && !appleReady) return null;
  const googleLabel = mode === "link" ? "Connect Google" : "Continue with Google";
  const appleLabel = mode === "link" ? "Connect Apple" : "Continue with Apple";
  const googleMark = <Image src="/assets/brand/google-sign-in.png" alt="" width={24} height={24} unoptimized />;
  return <div className="social-auth social-auth-icons" aria-label={mode === "link" ? "Connect a sign-in method" : "Social sign in"}>
    <p className="social-caption">{mode === "link" ? "Connect with" : "Continue with"}</p>
    <div className="provider-icon-row">
      {googleReady && <div className="provider-option">
        {googlePreview ? <button type="button" className="provider-icon google" aria-label={googleLabel} title={googleLabel} disabled={disabled} onClick={() => setPreviewMessage("Google sign-in will be available at launch.")}>{googleMark}</button>
          : <div className="provider-sdk-slot"><div ref={googleHost} aria-disabled={disabled || undefined} />{!googleLoaded && <span className="provider-loading-mark" aria-label="Google sign-in is loading">{googleMark}</span>}</div>}
        <span className="provider-name" aria-hidden="true">Google</span>
      </div>}
      {appleReady && <div className="provider-option">
        <button type="button" className="provider-icon apple" aria-label={appleBusy ? "Connecting Apple" : appleLabel} title={appleLabel} disabled={disabled || appleBusy} onClick={apple}><AppleMark /></button>
        <span className="provider-name" aria-hidden="true">Apple</span>
      </div>}
    </div>
    {previewMessage && <p className="provider-preview-note" role="status">{previewMessage}</p>}
  </div>;
}
