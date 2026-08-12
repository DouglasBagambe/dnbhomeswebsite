"use client";

import { useState } from "react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setCopied(true); } }
  return <button className="button secondary" onClick={share}>{copied ? "Link copied" : "Share"}</button>;
}
