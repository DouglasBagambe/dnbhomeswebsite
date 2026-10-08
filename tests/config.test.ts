import { describe, expect, it } from "vitest";
import { validateProductionConfig } from "../src/lib/config-validation";
import { GET } from "../src/app/.well-known/assetlinks.json/route";
const valid = { NODE_ENV: "production", NEXT_PUBLIC_API_BASE_URL: "https://api.homes-fixture.co.ug/api/v1", NEXT_PUBLIC_SITE_URL: "https://homes-fixture.co.ug", NEXT_PUBLIC_MEDIA_ORIGINS: "https://media.homes-fixture.co.ug" };
describe("production configuration", () => {
  it("requires explicit production URLs and media origins", () => { expect(() => validateProductionConfig({ NODE_ENV: "production" })).toThrow(); expect(() => validateProductionConfig(valid)).not.toThrow(); });
  it.each(["http://localhost:3000/api/v1", "https://api.example.invalid/api/v1", "https://api.example.com/api/v1", "https://user:password@api.homes-fixture.co.ug/api/v1"])("rejects unsafe API %s", (url) => expect(() => validateProductionConfig({ ...valid, NEXT_PUBLIC_API_BASE_URL: url })).toThrow());
  it("allows explicit loopback validation but rejects public endpoints in that profile", () => { const local = { NODE_ENV: "production", HOMES_BUILD_PROFILE: "local", NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:9/api/v1", NEXT_PUBLIC_SITE_URL: "http://localhost:3001" }; expect(() => validateProductionConfig(local)).not.toThrow(); expect(() => validateProductionConfig({ ...local, NEXT_PUBLIC_API_BASE_URL: valid.NEXT_PUBLIC_API_BASE_URL })).toThrow(); });
  it("does not invent an app association", () => { expect(GET().status).toBe(404); });
});
