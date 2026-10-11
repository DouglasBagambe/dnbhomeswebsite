export const dynamic = "force-dynamic";
export function GET() {
  const team = process.env.IOS_APP_LINK_TEAM_ID || "";
  if (!/^[A-Z0-9]{10}$/.test(team)) return new Response(null, { status: 404 });
  return Response.json({ applinks: { apps: [], details: [{ appID: `${team}.com.nilebitlabs.dnbhomes`, paths: ["/properties/*"] }] } });
}
