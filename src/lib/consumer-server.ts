import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { config } from "./config";

export const consumerCookie = "homes-consumer-session";
export async function consumerRequest(path: string, init: RequestInit = {}, token?: string) {
  const proxy: Record<string,string> = {};
  if (process.env.VERCEL === "1") {
    const secret = process.env.CONSUMER_WEB_PROXY_SECRET;
    if (!secret || secret.length < 32) throw new Error("Consumer web proxy configuration is incomplete");
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim();
    if (!ip || !isIP(ip)) throw new Error("Verified client address unavailable");
    const stamp = String(Date.now());
    proxy["x-homes-web-ip"] = ip; proxy["x-homes-web-time"] = stamp;
    proxy["x-homes-web-signature"] = createHmac("sha256",secret).update([init.method ?? "GET",new URL(`${config.apiBaseUrl}${path}`).pathname,ip,stamp].join("\n")).digest("hex");
  }
  const session = token ?? (await cookies()).get(consumerCookie)?.value;
  return fetch(`${config.apiBaseUrl}${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000), headers: { ...proxy, Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...(session ? { Authorization: `Bearer ${session}` } : {}), ...init.headers } });
}
export function sameOrigin(request: Request) {
  const allowed = [new URL(config.siteUrl).origin];
  for(const host of [process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL]) if(host) allowed.push(`https://${host}`);
  return allowed.includes(request.headers.get("origin") ?? "") && request.headers.get("sec-fetch-site") !== "cross-site";
}
export function publicIdentity(value: Record<string, unknown>) {
  return { id: value.id, name: value.name, email: value.email, phone: value.phone, emailVerified: value.emailVerified };
}
