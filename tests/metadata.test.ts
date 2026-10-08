import { describe, expect, it } from "vitest";
import { config } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

describe("metadata", () => { it("sets canonical and noindex state", () => { const metadata = pageMetadata("Discover", "Search", "/discover", true); expect(metadata.alternates?.canonical).toBe(`${config.siteUrl}/discover`); expect(metadata.robots).toMatchObject({ index: false, follow: true }); }); });
