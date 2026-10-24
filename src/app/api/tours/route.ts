import { getTours } from "@/lib/tours-server";
import { parseListingQuery } from "@/lib/query";
export async function GET(request: Request) {
  const query = parseListingQuery(Object.fromEntries(new URL(request.url).searchParams));
  try { return Response.json(await getTours(query.page, query.area ?? "", query.district ?? "")); }
  catch { return Response.json({ error: { message: "Tours couldn’t load. Please try again." } }, { status: 502 }); }
}
