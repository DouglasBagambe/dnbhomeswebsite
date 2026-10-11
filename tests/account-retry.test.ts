import { describe, expect, it } from "vitest";
import { accountRetry } from "../src/lib/account-retry";
describe("account rate-limit feedback", () => {
  it("preserves the real wait duration without removing throttling", () => {
    expect(accountRetry("900")).toEqual({ message: "Please wait 15 minutes before trying again.", retryAfter: "900" });
    expect(accountRetry("30").message).toBe("Please wait a minute before trying again.");
  });
  it("does not reflect invalid upstream headers", () => {
    for (const value of [null, "0", "-1", "99999", "invalid", "30\r\nInjected: true"]) {
      expect(accountRetry(value)).toEqual({ message: "Please wait a little before trying again.", retryAfter: undefined });
    }
  });
});
