export type HomesEvent =
  | "search"
  | "property_view"
  | "favorite_added"
  | "compare_added"
  | "viewing_request_started"
  | "viewing_request_submitted";

export function track(event: HomesEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("homes:analytics", { detail: { event, properties } }));
}

// Optional PostHog and Sentry SDK adapters can subscribe at the app boundary.
// No tracking occurs until environment configuration and consent handling exist.
