// Known placeholder IDs are presentation-only on the Homes preview host.
// A real client ID always uses the provider SDK and its real error handling.
export function isPreviewProvider(clientId: string, siteUrl: string): boolean {
  let hostname: string;
  try { hostname = new URL(siteUrl).hostname; } catch { return false; }
  const preview = hostname === "dnbhomeswebsite-psi.vercel.app" || hostname === "localhost" || hostname === "127.0.0.1";
  return preview && ["123456789012-previewhomes.apps.googleusercontent.com", "com.nilebitlabs.dnbhomes.preview.web"].includes(clientId);
}
