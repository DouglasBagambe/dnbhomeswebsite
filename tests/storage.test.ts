import { describe, expect, it } from "vitest";
import { readIds, toggleId, normalizeShowcaseImage, bypassImageOptimization } from "@/lib/storage";

describe("guest storage", () => {
  it("reads valid ids and survives malformed data", () => { expect(readIds({ getItem: () => '["one",2,"two"]' }, "x")).toEqual(["one", "two"]); expect(readIds({ getItem: () => "{" }, "x")).toEqual([]); });
  it("toggles favorites and caps compare at two", () => { expect(toggleId(["a"], "b")).toEqual(["a", "b"]); expect(toggleId(["a", "b"], "c", 2)).toEqual(["a", "b"]); expect(toggleId(["a", "b"], "a", 2)).toEqual(["b"]); });
});


describe("fixed showcase image delivery", () => {
  const path = "/images/uganda/showcase/optimized-single-room.jpg";
  const owned = `https://dnbhomeswebsite-psi.vercel.app${path}`;
  it("normalizes only a fixed known asset on the exact owned host", () => {
    expect(normalizeShowcaseImage(owned)).toBe(path);
    expect(bypassImageOptimization(owned)).toBe(true);
    expect(bypassImageOptimization(path)).toBe(true);
    for (const value of [owned + "?redirect=x", owned + "#fragment", owned.replace("https:", "http:"), owned.replace("https://", "https://user:password@"), owned.replace(".app/", ".app:8443/"), owned.replace(".app/", ".app.attacker.test/"), owned.replace("single-room", "unreviewed")]) {
      expect(normalizeShowcaseImage(value)).toBe(value);
      expect(bypassImageOptimization(value)).toBe(false);
    }
  });
});
