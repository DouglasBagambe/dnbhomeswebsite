export const dynamic = "force-dynamic";
export function GET() {
  const fingerprints = (process.env.ANDROID_APP_LINK_FINGERPRINTS || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
  if (!fingerprints.length || !fingerprints.every((value) => /^([A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(value))) return new Response(null, { status: 404 });
  return Response.json([{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "com.nilebitlabs.dnbhomes", sha256_cert_fingerprints: fingerprints } }]);
}
