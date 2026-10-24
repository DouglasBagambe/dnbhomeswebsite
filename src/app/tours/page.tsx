import type { Metadata } from "next";
import { connection } from "next/server";
import { parseListingQuery } from "@/lib/query";
import { getTours } from "@/lib/tours-server";
import { ToursExperience } from "@/components/tours-experience";
export const metadata: Metadata = { title: "Tours", description: "Step inside homes across Uganda. Watch property videos and explore each home’s photos." };
export default async function Tours({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const query = parseListingQuery(await searchParams);
  const area = query.area ?? "", district = query.district ?? "";
  let initial; let failed = false;
  try { initial = await getTours(1, area, district); } catch { failed = true; initial = { data: [], nextPage: 1, locations: [] }; }
  return <ToursExperience key={`${area}|${district}`} initial={initial} area={area} district={district} failed={failed} />;
}
