import { test, expect } from "@playwright/test";
for (const [width, height] of [[390, 844], [1440, 900]]) for (const theme of ["light", "dark"]) {
  test(`Tours ${width} ${theme}: video, photos, save, location and return`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(t => localStorage.setItem("homes-theme", t), theme);
    await page.goto("/tours");
    const viewer = page.getByRole("article", { name: "Tour viewer" });
    await expect(viewer.locator("video")).toHaveCount(1);
    await expect.poll(() => viewer.locator("video").evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2)).toBe(true);
    expect(await viewer.locator("video").evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Save property", exact: true }).click();
    await expect(page.getByRole("button", { name: "Remove from saved properties", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Everywhere in Uganda", exact: true }).click();
    await expect.poll(() => viewer.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    const picker = page.getByRole("dialog"); await expect(picker).toBeVisible();
    await page.keyboard.press("Escape"); await expect(picker).not.toBeVisible();
    // Move past any additional video to the first photo, and retain that exact property/media on return.
    for (let i = 0; i < 2 && await viewer.locator("video").count(); i++) await page.getByRole("button", { name: "Next property media", exact: true }).click();
    await expect(viewer.locator("video")).toHaveCount(0); await expect(viewer.locator(".tour-media-count")).toContainText("Photo");
    const title = await viewer.locator("h2").innerText(), media = await viewer.locator(".tour-media-count").innerText();
    await page.getByRole("link", { name: "Explore this home", exact: true }).click(); await expect(page).toHaveURL(/\/properties\//);
    await page.goBack(); await expect(viewer.locator("h2")).toHaveText(title); await expect(viewer.locator(".tour-media-count")).toHaveText(media);
    await page.getByRole("button", { name: "Everywhere in Uganda", exact: true }).click();
    await page.getByLabel("District", { exact: true }).fill("No such district"); await page.getByRole("button", { name: "Explore this location", exact: true }).click();
    await expect(viewer.getByRole("heading", { name: "A closer look is coming." })).toBeVisible(); await expect(viewer.locator("video")).toHaveCount(0);
    await page.screenshot({ path: `test-results/v2-screenshots/tours-empty-${width}-${theme}.png` });
    await page.getByRole("button", { name: "No such district", exact: true }).click(); await page.getByRole("button", { name: "Everywhere in Uganda", exact: true }).click();
    await expect(viewer.locator("video")).toHaveCount(1);
    await page.screenshot({ path: `test-results/v2-screenshots/tours-${width}-${theme}.png` });
  });
}
test("Tours: both keyboard axes, single player, background pause, video failure and retry", async ({ page }) => {
  await page.goto("/tours"); const viewer = page.getByRole("article", { name: "Tour viewer" });
  const first = await viewer.locator("h2").innerText();
  await page.keyboard.press("ArrowDown"); await expect(viewer.locator("h2")).not.toHaveText(first);
  await page.keyboard.press("ArrowUp"); await expect(viewer.locator("h2")).toHaveText(first);
  await page.keyboard.press("ArrowRight"); await expect(viewer.locator(".tour-media-count")).toContainText("2 /");
  await page.keyboard.press("ArrowLeft"); await expect(viewer.locator("video")).toHaveCount(1);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(() => viewer.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("button", { name: "Play video", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Play video", exact: true }).click();
  await viewer.locator("video").evaluate(v => v.dispatchEvent(new Event("error")));
  await expect(page.getByText("This video couldn’t load.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Retry video", exact: true }).click(); await expect(viewer.locator("video")).toHaveCount(1);
  await expect.poll(() => viewer.locator("video").evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
});
test("Tours respects reduced motion and keeps Discover Swipe as a separate mode", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/tours");
  await expect.poll(() => page.locator(".tour-stage video").evaluate((v: HTMLVideoElement) => v.readyState >= 1)).toBe(true);
  expect(await page.locator(".tour-stage video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole("button", { name: "Play video", exact: true }).click(); await expect.poll(() => page.locator(".tour-stage video").evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await page.getByRole("link", { name: "Close Tours and discover homes" }).click();
  await page.getByRole("button", { name: "Swipe", exact: true }).click(); await expect(page.locator(".swipe-stage")).toBeVisible();
  await expect(page.locator(".tour-stage")).toHaveCount(0);
});
test("Tours controls remain on screen at narrow and short viewport sizes", async ({ page }) => {
  for (const [width,height] of [[320,700],[844,390],[768,1024]]) {
    await page.setViewportSize({width,height}); await page.goto("/tours");
    await expect(page.locator(".tour-playback")).toBeVisible();
    const bounds = await page.locator(".tour-playback").boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const save = await page.locator(".tour-action-rail").boundingBox(), arrows = await page.locator(".tour-property-arrows").boundingBox();
    expect(save!.x + save!.width <= arrows!.x || arrows!.x + arrows!.width <= save!.x || save!.y + save!.height <= arrows!.y || arrows!.y + arrows!.height <= save!.y).toBe(true);
  }
});
test("Tours availability remains visible in compact landscape", async ({ page }) => {
  await page.setViewportSize({width:844,height:390}); await page.goto('/tours?district=Kampala&area=Bukoto');
  await expect(page.locator('.tour-availability')).toHaveText('Rented'); await expect(page.locator('.tour-availability')).toBeVisible();
  await page.getByRole('link',{name:'Explore this home',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Viewings unavailable'})).toBeVisible();
  await expect(page.locator('form.viewing-form')).toHaveCount(0);
});
test("Tours API failure is recoverable without a permanent loading screen", async ({ page, request }) => {
  const healthy = await (await request.get('/api/tours')).json();
  await page.goto('/tours?district=QA+outage');
  await expect(page.getByRole('heading',{name:'Let’s try that again.'})).toBeVisible();
  await page.route('**/api/tours?*', route => route.fulfill({json:healthy}));
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.locator('.tour-stage video')).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'Let’s try that again.'})).toHaveCount(0);
});
