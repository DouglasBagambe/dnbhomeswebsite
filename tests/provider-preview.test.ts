import { describe, expect, it } from "vitest";
import { isPreviewProvider } from "../src/lib/provider-preview";
describe("isolated provider preview", () => {
  it("recognizes only known placeholders on preview/local hosts", () => {
    expect(isPreviewProvider("123456789012-previewhomes.apps.googleusercontent.com", "https://dnbhomeswebsite-psi.vercel.app")).toBe(true);
    expect(isPreviewProvider("com.nilebitlabs.dnbhomes.preview.web", "https://dnbhomeswebsite-psi.vercel.app")).toBe(true);
    expect(isPreviewProvider("homes-placeholder.apps.googleusercontent.com", "https://dnbhomeswebsite-psi.vercel.app")).toBe(false);
    expect(isPreviewProvider("com.nilebitlabs.dnbhomes.preview.web", "http://127.0.0.1:3101")).toBe(true);
    expect(isPreviewProvider("123-real.apps.googleusercontent.com", "https://dnbhomeswebsite-psi.vercel.app")).toBe(false);
    expect(isPreviewProvider("com.homes.real", "https://dnbhomeswebsite-psi.vercel.app")).toBe(false);
  });
  it("never suppresses provider failures on a real production origin", () => {
    expect(isPreviewProvider("123456789012-previewhomes.apps.googleusercontent.com", "https://dnbhomes.com")).toBe(false);
    expect(isPreviewProvider("com.nilebitlabs.dnbhomes.preview.web", "https://dnbhomes.com")).toBe(false);
  });
});
