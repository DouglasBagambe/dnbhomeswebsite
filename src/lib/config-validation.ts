type Values = Record<string, string | undefined>;
export function checkedUrl(value: string | undefined, key: string, local = false, originOnly = false): string {
  let url: URL;
  try { url = new URL(value || ""); } catch { throw new Error(`${key} is required and must be a valid URL`); }
  const host = url.hostname;
  const loopback = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  const reserved = !host.includes(".") || /\.(localhost|local|invalid|test|example)$/.test(host) || /(^|\.)example\.(com|org|net)$/.test(host) || /^[\d.]+$/.test(host) || host.includes(":");
  if ((local ? !loopback || !["http:", "https:"].includes(url.protocol) : url.protocol !== "https:" || reserved) || url.username || url.password || url.search || url.hash || (originOnly && url.pathname !== "/")) throw new Error(`${key} must be ${local ? "a loopback HTTP(S) URL for local validation" : "a public HTTPS URL"}`);
  return url.href.replace(/\/+$/, "");
}
export function validateProductionConfig(values: Values) {
  if (values.HOMES_BUILD_PROFILE && !["local", "production"].includes(values.HOMES_BUILD_PROFILE)) throw new Error("Invalid HOMES_BUILD_PROFILE");
  if (values.NODE_ENV !== "production") return;
  const local = values.HOMES_BUILD_PROFILE === "local";
  checkedUrl(values.NEXT_PUBLIC_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL", local);
  checkedUrl(values.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL", local, true);
  if (!local && !values.NEXT_PUBLIC_MEDIA_ORIGINS?.trim()) throw new Error("NEXT_PUBLIC_MEDIA_ORIGINS is required for production media");
  values.NEXT_PUBLIC_MEDIA_ORIGINS?.split(",").forEach((origin) => checkedUrl(origin.trim(), "NEXT_PUBLIC_MEDIA_ORIGINS", false, true));
  if (values.NEXT_PUBLIC_ANDROID_APP_URL) checkedUrl(values.NEXT_PUBLIC_ANDROID_APP_URL, "NEXT_PUBLIC_ANDROID_APP_URL");
  if (values.NEXT_PUBLIC_CONTACT_EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.NEXT_PUBLIC_CONTACT_EMAIL)) throw new Error("Invalid NEXT_PUBLIC_CONTACT_EMAIL");
  if (values.NEXT_PUBLIC_CONTACT_PHONE && !/^\+[1-9]\d{7,14}$/.test(values.NEXT_PUBLIC_CONTACT_PHONE)) throw new Error("NEXT_PUBLIC_CONTACT_PHONE must use international format");
  if (values.ANDROID_APP_LINK_FINGERPRINTS && !values.ANDROID_APP_LINK_FINGERPRINTS.split(",").every((item) => /^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/.test(item.trim()))) throw new Error("ANDROID_APP_LINK_FINGERPRINTS must contain SHA-256 certificate fingerprints");
}
