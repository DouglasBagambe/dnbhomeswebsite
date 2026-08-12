import { PurposePage } from "@/components/purpose-page"; import { pageMetadata } from "@/lib/metadata"; import { purposePages } from "@/lib/purpose";
export const metadata = pageMetadata("Short stays in Uganda", purposePages["short-stay"].description, "/short-stay");
export default function Page() { return <PurposePage config={purposePages["short-stay"]} />; }
