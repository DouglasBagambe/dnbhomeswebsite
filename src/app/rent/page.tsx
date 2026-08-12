import { PurposePage } from "@/components/purpose-page"; import { pageMetadata } from "@/lib/metadata"; import { purposePages } from "@/lib/purpose";
export const metadata = pageMetadata("Property for rent in Uganda", purposePages.rent.description, "/rent");
export default function Page() { return <PurposePage config={purposePages.rent} />; }
