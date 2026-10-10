import { AccountPanel } from "@/components/account-panel";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Your account", "Your Homes account, Saved homes and viewing requests.", "/account", true);
export default function AccountPage() { return <div className="container section"><AccountPanel /></div>; }
