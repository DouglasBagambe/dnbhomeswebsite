import { expect, test } from "@playwright/test";

test("home loads and marketplace navigation is accessible", async ({ page, isMobile }) => { await page.goto("/", { waitUntil: "domcontentloaded" }); await expect(page.getByRole("heading", { name: "Find your place in Uganda." })).toBeVisible(); if (isMobile) { await page.getByRole("button", { name: "Open navigation" }).click(); await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeHidden(); } else { await expect(page.getByRole("navigation", { name: "Find a home" }).getByRole("link", { name: "Buy" })).toBeVisible(); await expect(page.getByRole("navigation", { name: "Find a home" }).getByRole("link", { name: "Discover" })).toBeVisible(); } });
test("search state is reflected in URL", async ({ page }) => { await page.goto("/", { waitUntil: "domcontentloaded" }); await page.getByLabel("Location", { exact: true }).fill("Ntinda"); await page.getByRole("button", { name: "Search", exact: true }).click(); await expect(page).toHaveURL(/discover.*area=Ntinda/); });
test("discover filters are shareable", async ({ page }) => { await page.goto("/discover?purpose=rent&bedrooms=2", { waitUntil: "domcontentloaded" }); await expect(page.getByText("Purpose: rent")).toBeAttached(); await expect(page.getByText("Bedrooms: 2")).toBeAttached(); });
test("favorites empty state is honest", async ({ page }) => { await page.goto("/favorites", { waitUntil: "domcontentloaded" }); await expect(page.getByRole("heading", { name: "No saved homes" })).toBeVisible(); });
test("bookings empty state is local", async ({ page }) => { await page.goto("/bookings", { waitUntil: "domcontentloaded" }); await expect(page.getByText(/this browser/i).first()).toBeVisible(); });
test("agent directory uses public API profiles", async ({ page }) => { await page.goto("/agents", { waitUntil: "domcontentloaded" }); await expect(page.getByRole("heading", { name: "Property agents" })).toBeVisible(); if (process.env.HOMES_E2E === "1") await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible(); else await expect(page.getByText(/active listings/).first()).toBeVisible(); });
test("retired public listing route redirects to contact", async ({ page }) => { await page.goto("/list-property", { waitUntil: "domcontentloaded" }); await expect(page).toHaveURL(/\/contact$/); });

test("download stays disabled and app association absent until real inputs exist", async ({ page, request }) => {
  await page.goto("/download", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Android download link coming soon")).toBeVisible();
  expect((await request.get("/.well-known/assetlinks.json")).status()).toBe(404);
});

test("API outage shows a retryable property page instead of a missing listing", async ({ page }) => {
  test.skip(process.env.HOMES_E2E !== "1", "Requires the isolated offline API profile");
  await page.goto("/properties/offline-home-507f1f77bcf86cd799439011", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "We could not load this page" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
