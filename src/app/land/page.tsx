import { PurposePage } from "@/components/purpose-page"; import { pageMetadata } from "@/lib/metadata"; import { purposePages } from "@/lib/purpose";
export const metadata = pageMetadata("Land in Uganda", purposePages.land.description, "/land");
export default function Page() { return <PurposePage config={purposePages.land} />; }
