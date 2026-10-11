import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Help", "Help with accounts, saving, comparing and requesting property viewings on Homes.", "/help");

export default function Page() {
  return <ContentPage eyebrow="Help centre" title="How can we help?" intro="Straightforward guidance for using Homes on the web and mobile app.">
    <h2>Browse without an account</h2>
    <p>You can search, filter, view property media, save homes, compare a shortlist and request a viewing without signing in. Guest Saved and Compare selections stay on the device you are using and can be lost if you clear browser/app storage.</p>

    <h2>Create or sign in to your Homes account</h2>
    <p>A Homes account keeps supported activity together across devices. You can use email and password, and—when configured for the live service—Google or Apple. Email accounts require verification before they can be used. If you forget your password, use the reset flow on the sign-in screen.</p>

    <h2>Saved, Compare and recent homes</h2>
    <p>When you are signed in, Saved homes, Compare selections and recently viewed properties synchronize through your Homes account. If you first used Homes as a guest, your current guest selections are merged into your account without duplicating homes. Compare remains intentionally limited to a small shortlist so side-by-side decisions stay useful.</p>

    <h2>Request a viewing</h2>
    <p>Guests provide their name, email and phone number with a preferred date/time and optional note. Signed-in users do not have to re-enter contact information Homes already has; their verified account details are reused, and missing contact details can be completed before submitting.</p>
    <p>A successful submission means Homes received the request. It is not a confirmed appointment until the request status says confirmed. Keep your request reference. Signed-in users can also review their requests in <Link className="text-link" href="/bookings">Viewings</Link>.</p>

    <h2>Viewing status and changes</h2>
    <p>Statuses can change as a request is reviewed. If you need to correct contact details or discuss timing, use the <Link className="text-link" href="/contact">Contact page</Link>. Homes does not currently promise instant rescheduling or cancellation through an automated self-service control unless that option is shown in the product.</p>

    <h2>Property availability and listing information</h2>
    <p>Availability, price and property details can change. A Homes verification badge reflects only the checks actually recorded for that listing; it is not a guarantee of title, ownership, legal condition, physical condition or future availability. Read the <Link className="text-link" href="/safety">Safety guide</Link> before making commitments.</p>

    <h2>Google and Apple sign-in</h2>
    <p>If a social sign-in email already belongs to an existing Homes account, Homes may ask you to sign in using the method already connected to that account and then link the additional provider from Security. This prevents an unverified matching email from silently taking over an existing account.</p>

    <h2>Account security and deletion</h2>
    <p>From Your Homes you can update profile details, review connected sign-in methods, change your password where applicable, sign out, sign out other devices, and delete your account. Account deletion removes consumer profile/session/synced-selection data. Operational viewing records may be retained only in anonymized form as explained in the <Link className="text-link" href="/privacy">Privacy policy</Link>.</p>

    <h2>Need help?</h2>
    <p>Use the <Link className="text-link" href="/contact">Contact page</Link> for account access, privacy requests, suspicious listings or general product support.</p>
  </ContentPage>;
}
