import { NextResponse } from "next/server";
import { consumerCookie, consumerRequest, publicIdentity, sameOrigin } from "@/lib/consumer-server";

const readPaths = new Set(["me", "state", "viewings"]);
const writePaths = new Set(["state", "merge", "preferences"]);
const authPaths = new Set(["sign-up/email", "sign-in/email", "sign-out", "email-otp/send-verification-otp", "email-otp/verify-email", "email-otp/request-password-reset", "email-otp/reset-password", "email-otp/request-email-change", "email-otp/change-email", "update-user", "change-password", "delete-user", "revoke-sessions", "revoke-other-sessions"]);
type Context = { params: Promise<{ path: string[] }> };
async function proxy(request: Request, context: Context) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const auth = endpoint.startsWith("auth/");
  const action = auth ? endpoint.slice(5) : endpoint;
  if (request.method === "GET" ? !readPaths.has(endpoint) : auth ? !authPaths.has(action) : !writePaths.has(endpoint)) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  if (request.method !== "GET" && !sameOrigin(request)) return NextResponse.json({ error: { message: "Request origin rejected" } }, { status: 403 });
  const query = new URL(request.url).search;
  let body: string | undefined;
  if (request.method !== "GET") {
    if(Number(request.headers.get("content-length"))>40000) return NextResponse.json({error:{message:"Request is too large"}},{status:413});
    const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let size=0;
    if(reader) { for(;;) { const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>40000){await reader.cancel();return NextResponse.json({error:{message:"Request is too large"}},{status:413});}chunks.push(value); } }
    try { const values=JSON.parse(Buffer.concat(chunks).toString("utf8"));if(!values || typeof values!=="object" || Array.isArray(values)) throw new Error("Invalid body");body=JSON.stringify(values); } catch { return NextResponse.json({error:{message:"Check your details"}},{status:400}); }
  }
  try {
    const upstream = await consumerRequest(auth ? `/auth/consumer/${action}` : `/consumer/${endpoint}${query}`, { method: request.method, body, headers: request.method === "GET" ? {} : { Origin: request.headers.get("origin")! } });
    const result = await upstream.json().catch(() => null) as Record<string, unknown> | null;
    if (!result) return NextResponse.json({ error: { message: "Accounts are temporarily unavailable. Please retry." } }, { status: 502 });
    const safe = auth ? upstream.ok ? { data: { success: true, user: result.user && typeof result.user === "object" ? publicIdentity(result.user as Record<string, unknown>) : undefined } } : { error: { message: result.message ?? (result.error as { message?: string } | undefined)?.message ?? "Check your details and try again.", code: result.code } } : result;
    const response = NextResponse.json(safe, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
    const token = upstream.headers.get("set-auth-token");
    if (token) response.cookies.set(consumerCookie, decodeURIComponent(token), { httpOnly: true, secure: request.headers.get("origin")?.startsWith("https://") === true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
    if (upstream.status === 401 || ["sign-out", "delete-user", "revoke-sessions"].includes(action) && upstream.ok) response.cookies.delete(consumerCookie);
    return response;
  } catch {
    return NextResponse.json({ error: { message: "Unable to connect. Your saved state is kept; please retry." } }, { status: 502 });
  }
}
export const GET = proxy;
export const POST = proxy;
