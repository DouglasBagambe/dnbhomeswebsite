import { config } from "@/lib/config";
import { toSearchParams, type ListingQuery } from "@/lib/query";
import type { Booking, Property, PropertyPage } from "@/types/property";

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(process.env.HOMES_E2E === "1" ? 750 : 8_000),
    headers: { Accept: "application/json", ...init?.headers },
    next: init?.method ? undefined : { revalidate: 60 },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error?: { message?: string } }).error?.message ?? "Request failed")
        : "Request failed";
    throw new ApiError(message, response.status);
  }
  if (payload === null) throw new ApiError("The API returned an empty response", response.status);
  return payload as T;
}

export const getProperties = (query: Partial<ListingQuery> = {}): Promise<PropertyPage> =>
  request<PropertyPage>(`/properties?${toSearchParams(query)}`);

export async function getProperty(idOrSlug: string): Promise<Property> {
  const result = await request<{ data: Property }>(`/properties/${encodeURIComponent(idOrSlug)}`);
  return result.data;
}

export async function submitBooking(
  body: Record<string, string>,
  idempotencyKey: string,
): Promise<Booking> {
  const result = await request<{ data: Booking }>("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
  return result.data;
}
