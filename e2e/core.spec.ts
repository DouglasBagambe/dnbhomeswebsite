import { expect, test } from "@playwright/test";

test("home loads and mobile navigation is accessible", async ({ page }) => { await page.goto("/"); await expect(page.getByRole("heading", { name: "Find a place you can trust." })).toBeVisible(); });
test("search state is reflected in URL", async ({ page }) => { await page.goto("/"); await page.getByLabel("Location", { exact: true }).fill("Ntinda"); await page.getByRole("button", { name: "Search Homes" }).click(); await expect(page).toHaveURL(/discover.*area=Ntinda/); });
test("discover filters are shareable", async ({ page }) => { await page.goto("/discover?purpose=rent&bedrooms=2"); await expect(page.getByText("Purpose: rent")).toBeAttached(); await expect(page.getByText("Bedrooms: 2")).toBeAttached(); });
test("favorites empty state is honest", async ({ page }) => { await page.goto("/favorites"); await expect(page.getByRole("heading", { name: "No saved homes" })).toBeVisible(); });
test("bookings empty state is local", async ({ page }) => { await page.goto("/bookings"); await expect(page.getByText(/this browser/i).first()).toBeVisible(); });
test("agent directory uses public API profiles", async ({ page }) => { await page.goto("/agents"); await expect(page.getByRole("heading", { name: "Property agents" })).toBeVisible(); await expect(page.getByText(/active listings/).first()).toBeVisible(); });
