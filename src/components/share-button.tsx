"use client";

import { useState } from "react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function share() {
    setError("");
    try { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setCopied(true); } }
    catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setError("Sharing unavailable. Copy the address from your browser."); }
  }
  return <><button className="button secondary" onClick={share}>{copied ? "Link copied" : "Share"}</button>{error && <span role="status">{error}</span>}</>;
}
