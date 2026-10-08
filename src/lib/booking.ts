import { z } from "zod";

export const bookingSchema = z.object({
  property: z.string().min(1),
  propertyTitle: z.string().min(1).max(200),
  guestName: z.string().trim().min(2, "Enter your name").max(100),
  guestEmail: z.email("Enter a valid email address"),
  guestPhone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time"),
  notes: z.string().trim().max(1000).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export function toBookingPayload(input: BookingInput): Record<string, string> {
  // Viewings take place in Uganda (UTC+03:00), regardless of the host timezone.
  const scheduledAt = new Date(`${input.date}T${input.time}:00+03:00`);
  if (Number.isNaN(scheduledAt.valueOf()) || scheduledAt <= new Date()) throw new Error("Choose a future date and time");
  return { property: input.property, guestName: input.guestName, guestEmail: input.guestEmail, guestPhone: input.guestPhone, scheduledAt: scheduledAt.toISOString(), notes: input.notes };
}
