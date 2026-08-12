import { NextResponse } from "next/server";
import { bookingSchema, toBookingPayload } from "@/lib/booking";
import { submitBooking } from "@/lib/api";

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { message: parsed.error.issues[0]?.message ?? "Check your details" } }, { status: 400 });
  try {
    const booking = await submitBooking(toBookingPayload(parsed.data), request.headers.get("Idempotency-Key") ?? crypto.randomUUID());
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : "Viewing request failed" } }, { status: 502 });
  }
}
