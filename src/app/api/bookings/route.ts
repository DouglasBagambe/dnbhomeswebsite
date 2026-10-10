import { NextResponse } from "next/server";
import { bookingSchema, toBookingPayload } from "@/lib/booking";
import { submitBooking } from "@/lib/api";
import { cookies } from "next/headers";
import { consumerCookie, consumerRequest, sameOrigin } from "@/lib/consumer-server";

export async function POST(request: Request) {
  const token = (await cookies()).get(consumerCookie)?.value;
  if (token && !sameOrigin(request)) return NextResponse.json({ error: { message: "Request origin rejected" } }, { status: 403 });
  let input = await request.json().catch(() => null);
  if (token) {
    try {
      const response = await consumerRequest("/consumer/me");
      if (!response.ok) return NextResponse.json({ error: { message: response.status === 401 ? "Your session ended. Please sign in again." : "Account contacts are temporarily unavailable. Please retry." } }, { status: response.status });
      const { data } = await response.json();
      input = { ...input, guestName: data.name, guestEmail: data.email, guestPhone: data.phone || input?.guestPhone };
    } catch { return NextResponse.json({ error: { message: "Unable to load your contact details. Please retry." } }, { status: 502 }); }
  }
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: { message: parsed.error.issues[0]?.message ?? "Check your details" } }, { status: 400 });
  try {
    const booking = await submitBooking(toBookingPayload(parsed.data), request.headers.get("Idempotency-Key") ?? crypto.randomUUID(), token);
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : "Viewing request failed" } }, { status: 502 });
  }
}
