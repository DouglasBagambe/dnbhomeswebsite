import { config } from "@/lib/config";
import { toSearchParams, type ListingQuery } from "@/lib/query";
import type { Agency, Agent, Booking, DirectoryPage, Property, PropertyPage } from "@/types/property";

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
  token?: string,
): Promise<Booking> {
  const result = await request<{ data: Booking }>("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return result.data;
}

export const getAgents = (): Promise<DirectoryPage<Agent>> => request<DirectoryPage<Agent>>("/agents?limit=50");
export const getAgencies = (): Promise<DirectoryPage<Agency>> => request<DirectoryPage<Agency>>("/agencies?limit=50");
export async function getAgent(idOrSlug: string): Promise<Agent> {
  return (await request<{ data: Agent }>(`/agents/${encodeURIComponent(idOrSlug)}`)).data;
}
export async function getAgency(idOrSlug: string): Promise<Agency> {
  return (await request<{ data: Agency }>(`/agencies/${encodeURIComponent(idOrSlug)}`)).data;
}
export async function submitInquiry(path: "/contact" | "/listing-inquiries", body: Record<string, string>) {
  return request<{ data: { id: string }; message: string }>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
