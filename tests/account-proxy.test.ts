import { describe, expect, it, vi } from "vitest";
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/lib/consumer-server", () => ({
  consumerRequest: request, consumerCookie: "fixture-session",
  sameOrigin: () => true, publicIdentity: (user: unknown) => user,
}));
import { POST } from "../src/app/api/account/[...path]/route";
function submit() {
  return POST(new Request("https://homes.example/api/account/auth/sign-in/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://homes.example" }, body: "{}",
  }), { params: Promise.resolve({ path: ["auth", "sign-in", "email"] }) });
}
describe("account proxy errors", () => {
  it("keeps upstream throttling and its retry duration visible to the browser", async () => {
    request.mockResolvedValue(new Response(JSON.stringify({ message: "Too many requests" }), { status: 429, headers: { "Retry-After": "900" } }));
    const result = await submit();
    expect(result.status).toBe(429);
    expect(result.headers.get("Retry-After")).toBe("900");
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(result.headers.get("Set-Cookie")).toBeNull();
    expect(await result.json()).toEqual({ error: { code: "RATE_LIMITED", message: "Please wait 15 minutes before trying again." } });
  });
  it("preserves genuine authentication errors", async () => {
    request.mockResolvedValue(new Response(JSON.stringify({ message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" }), { status: 401 }));
    const result = await submit();
    expect(result.status).toBe(401);
    expect(result.headers.get("Retry-After")).toBeNull();
    expect((await result.json()).error.code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });
});
