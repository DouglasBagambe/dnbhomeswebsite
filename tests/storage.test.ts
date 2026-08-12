import { describe, expect, it } from "vitest";
import { readIds, toggleId } from "@/lib/storage";

describe("guest storage", () => {
  it("reads valid ids and survives malformed data", () => { expect(readIds({ getItem: () => '["one",2,"two"]' }, "x")).toEqual(["one", "two"]); expect(readIds({ getItem: () => "{" }, "x")).toEqual([]); });
  it("toggles favorites and caps compare at two", () => { expect(toggleId(["a"], "b")).toEqual(["a", "b"]); expect(toggleId(["a", "b"], "c", 2)).toEqual(["a", "b"]); expect(toggleId(["a", "b"], "a", 2)).toEqual(["b"]); });
});
