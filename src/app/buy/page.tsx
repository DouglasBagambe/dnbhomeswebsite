import { PurposePage } from "@/components/purpose-page"; import { pageMetadata } from "@/lib/metadata"; import { purposePages } from "@/lib/purpose";
export const metadata = pageMetadata("Property for sale in Uganda", purposePages.buy.description, "/buy");
export default function Page() { return <PurposePage config={purposePages.buy} />; }
