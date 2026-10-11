import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Property safety", "Practical guidance for safer property discovery and viewings with Homes.", "/safety");
export default function Page() {
  return <ContentPage eyebrow="Safety" title="Take the next step carefully." intro="Homes helps you discover property and coordinate viewings. Important property and transaction facts still need independent confirmation.">
    <h2>Before a viewing</h2><ul><li>Confirm who you are meeting and their relationship to the property.</li><li>Confirm the exact location before travelling and share your plans with someone you trust.</li><li>Prefer daylight where practical, especially for an unfamiliar location.</li><li>Do not hand over original identity documents merely to see a property.</li></ul>
    <h2>Before sending money</h2><ul><li>Inspect the property and independently verify ownership or authority to transact.</li><li>Do not pay simply to reveal an address, unlock a listing or secure an unverified viewing.</li><li>Confirm the recipient and reason for payment before transferring money.</li><li>Use written agreements and traceable payment methods after appropriate due diligence.</li></ul>
    <h2>Verification badges</h2><p>A badge appears only where Homes records the relevant listing as verified. It does not guarantee title, legal ownership, structural condition, current availability, price or the outcome of a transaction.</p>
    <h2>Suspicious activity</h2><p>Stop and verify if someone pressures you to pay immediately, refuses reasonable checks, changes payment details unexpectedly or asks you to move to an unusual payment method. Contact Homes with the listing link, request reference and relevant details.</p>
    <p><Link className="text-link" href="/contact">Contact Homes</Link></p>
  </ContentPage>;
}