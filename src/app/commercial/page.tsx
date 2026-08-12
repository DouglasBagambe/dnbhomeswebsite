import { PurposePage } from "@/components/purpose-page"; import { pageMetadata } from "@/lib/metadata"; import { purposePages } from "@/lib/purpose";
export const metadata = pageMetadata("Commercial property in Uganda", purposePages.commercial.description, "/commercial");
export default function Page() { return <PurposePage config={purposePages.commercial} />; }
