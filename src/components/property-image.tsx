"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { bypassImageOptimization, normalizeShowcaseImage } from "@/lib/storage";

export function PropertyImage({ src, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const url = typeof src === "string" ? normalizeShowcaseImage(src) : src;
  return failed ? <div className="image-placeholder media-fallback" role="img" aria-label={`${alt || "Property photo"} — image unavailable`}>Image unavailable</div>
    : <Image {...props} src={url} alt={alt} unoptimized={typeof url === "string" && bypassImageOptimization(url)} onError={() => setFailed(true)} />;
}
