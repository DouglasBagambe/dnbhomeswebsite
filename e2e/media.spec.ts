import { test, expect } from '@playwright/test';
const heavy='/properties/media-heavy-qa-507f1f77bcf86cd799439080';
for(const viewport of [{width:390,height:844},{width:1440,height:900}]) {
  test(`25 media are accessible, lazy and keyboard navigable ${viewport.width}`,async({page})=>{
    await page.setViewportSize(viewport);const videos:string[]=[];page.on('request',r=>{if(r.url().includes('.webm'))videos.push(r.url())});
    await page.goto(heavy,{waitUntil:'networkidle'});await expect(page.getByRole('button',{name:'View all media · 20 images · 5 videos'})).toBeVisible();
    expect(videos).toHaveLength(0);await page.getByRole('button',{name:'View all media · 20 images · 5 videos'}).click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByLabel('Choose gallery media').getByRole('button')).toHaveCount(25);
    await dialog.getByRole('button',{name:'View image 20',exact:true}).click();await expect(dialog).toContainText('20 of 25');
    await page.keyboard.press('ArrowRight');await expect(dialog).toContainText('21 of 25 · Video');
    const video=dialog.locator('video');await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('preload','none');
    expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);expect(videos).toHaveLength(0);
    await video.evaluate((v:HTMLVideoElement)=>v.play());await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(0);
    await dialog.getByRole('button',{name:'Next media'}).click();await expect(dialog).toContainText('22 of 25');expect(await dialog.locator('video').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(page.getByRole('button',{name:'View all media · 20 images · 5 videos'})).toBeFocused();
  });
}
test('failed image fallback retains the frame and gallery survives',async({page})=>{
  await page.goto('/discover?q=failed-image');const frame=page.locator('.property-image').first();await expect(frame.getByRole('img',{name:/image unavailable/})).toBeVisible();const size=await frame.boundingBox();expect(size!.height).toBeGreaterThan(100);await expect(frame.locator('img')).toHaveCount(0);
  await page.goto('/properties/failed-image-qa-507f1f77bcf86cd799439081');await page.getByRole('button',{name:/View all media/}).click();const dialog=page.getByRole('dialog');await expect(dialog.getByRole('img',{name:/image unavailable/})).toBeVisible();await dialog.getByRole('button',{name:'Next media'}).click();await expect.poll(()=>dialog.locator('img').evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);await dialog.getByRole('button',{name:'Close gallery'}).click();await expect(dialog).not.toBeVisible();
});

test('viewing refresh fetches authorized status, persists it and keeps copies on failure',async({page})=>{
  const record={id:'507f1f77bcf86cd799439080',propertyId:'507f1f77bcf86cd799439080',propertyTitle:'QA viewing',reference:'HOM-20261010-ABCDEF',scheduledAt:'2027-01-01T12:00:00Z',status:'pending',createdAt:'2026-10-10T12:00:00Z',statusAccessToken:'x'.repeat(43)};
  await page.addInitScript(item=>localStorage.setItem('homes:bookings:v1',JSON.stringify([item,{...item,id:undefined,statusAccessToken:undefined,reference:'HOM-20261010-123456'}])),record);
  let fail=false;
  await page.route('**/api/bookings/*/status',async route=>{
    expect(route.request().headers()['x-viewing-token']).toBe('x'.repeat(43));
    expect(route.request().url()).not.toContain('xxxxx');
    await route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{error:{message:'QA offline'}}:{data:{reference:record.reference,status:'confirmed',scheduledAt:record.scheduledAt}})});
  });
  await page.goto('/bookings');await page.getByRole('button',{name:'Refresh statuses'}).click();
  await expect(page.locator('.booking-request').first().locator('.badge')).toHaveText('confirmed');
  await expect(page.getByRole('status')).toContainText('older requests');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('homes:bookings:v1')!)[0].status)).toBe('confirmed');
  fail=true;await page.getByRole('button',{name:'Refresh statuses'}).click();await expect(page.getByRole('status')).toContainText('Saved copies are kept');
  await expect(page.locator('.booking-request').first().locator('.badge')).toHaveText('confirmed');
});
