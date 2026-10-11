const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const config = {
  apiBaseUrl: trimSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ??
      (process.env.HOMES_E2E === "1"
        ? "http://127.0.0.1:9/api/v1"
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/v1"
          : process.env.NODE_ENV === "test" ? "http://127.0.0.1:9/api/v1" : ""),
  ),
  siteUrl: trimSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://dnbhomes.com",
  ),
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  androidAppUrl: process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "douglasbagambe4@gmail.com",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+256747877740",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "",
} as const;
