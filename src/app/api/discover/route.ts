import { getProperties } from "@/lib/api";
import { parseListingQuery } from "@/lib/query";

export async function GET(request: Request) {
  const query = parseListingQuery(Object.fromEntries(new URL(request.url).searchParams));
  try { return Response.json(await getProperties(query)); }
  catch { return Response.json({ error: { message: "Homes are temporarily unavailable. Please retry." } }, { status: 502 }); }
}
