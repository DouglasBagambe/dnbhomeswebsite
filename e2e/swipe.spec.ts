import { test, expect } from '@playwright/test';
const sizes = [[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]];
for(const [width,height] of sizes) for(const theme of ['light','dark']) {
 test(`Swipe ${width} ${theme}: filters, both axes, actions and return context`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.addInitScript(value=>localStorage.setItem('homes-theme',value),theme);
  await page.goto('/discover?purpose=rent&type=house&maxPrice=9000000&bedrooms=2');
  await page.getByRole('button',{name:'Swipe',exact:true}).click();
  await expect(page).toHaveURL(/purpose=rent&type=house&maxPrice=9000000&bedrooms=2.*mode=swipe/);
  const stage=page.getByRole('article',{name:'Swipe property discovery'});
  await expect(stage).toBeVisible();
  if (width <= 1023) {
   const bounds=(await stage.boundingBox())!;expect(bounds.width).toBeGreaterThan(width*.9);expect(bounds.y+bounds.height).toBeLessThanOrEqual(height);
   await page.getByRole('button',{name:'Refine Swipe filters',exact:true}).click();
   const filters=page.locator('#property-filters');await expect(filters).toBeVisible();
   const filterBounds=(await filters.boundingBox())!;expect(filterBounds.y).toBeGreaterThanOrEqual(64);expect(filterBounds.y+filterBounds.height).toBeLessThanOrEqual(height);
   await expect(filters.getByLabel('Purpose',{exact:true})).toHaveValue('rent');
   await page.getByRole('button',{name:'Close filters',exact:true}).click();await expect(filters).toBeHidden();
  }
  if (width >= 1024) {
   await expect.poll(async()=>{const bounds=await stage.boundingBox();return bounds!.y;}).toBeLessThan(260);
   const bounds=(await stage.boundingBox())!;expect(bounds.y+bounds.height).toBeLessThanOrEqual(height+24);
  }
  const box=await stage.boundingBox(); expect(box!.width).toBeLessThanOrEqual(width); expect(box!.height).toBeGreaterThan(350);
  if ([390,768,1440].includes(width)) {
   await expect.poll(()=>stage.locator('img').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
   await page.screenshot({path:`test-results/v2-screenshots/swipe-${width}-${theme}.png`});
  }
  const title=await stage.locator('h2').textContent();
  await stage.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(stage.locator('.swipe-media-heading')).toContainText('2 / 5');
  await stage.getByRole('button',{name:'Next property',exact:true}).click();
  await expect(stage.locator('h2')).not.toHaveText(title!);
  await stage.getByRole('button',{name:'Previous property',exact:true}).click();
  await expect(stage.locator('h2')).toHaveText(title!);
  await expect(stage.locator('.swipe-media-heading')).toContainText('2 / 5');
  await stage.getByRole('button',{name:'Save property',exact:true}).click();
  await expect(stage.getByRole('button',{name:'Remove from saved properties'})).toHaveCount(1);
  await stage.getByRole('button',{name:'Add to compare'}).click();
  await stage.getByRole('button',{name:'Next property',exact:true}).click();
  await stage.getByRole('button',{name:'Add to compare'}).click();
  await stage.getByRole('button',{name:'Open comparison'}).click();
  await expect(page.getByRole('dialog',{name:'Compare properties'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Compare properties'})).toBeHidden();
  await expect(page.getByRole('button',{name:'Swipe',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.swipe-counter')).toContainText('2 /');
  await stage.getByRole('link',{name:'View details'}).click();
  await expect(page).toHaveURL(/properties/); await page.goBack();
  await expect(page.locator('.swipe-counter')).toContainText('2 /');
  await stage.getByRole('button',{name:'Request viewing',exact:true}).click();
  await expect(page.locator('dialog[open]').getByLabel('Name',{exact:true})).toBeVisible();
  await page.locator('dialog[open]').getByRole('button',{name:'Close viewing request'}).click();
  await page.getByRole('button',{name:'Grid',exact:true}).click();
  await expect(page).not.toHaveURL(/mode=swipe/); await expect(page).toHaveURL(/bedrooms=2/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('Comparison owns Escape even before its focus transfer and pauses Swipe video',async({page})=>{
 await page.goto('/discover?q=media-heavy&mode=swipe');const stage=page.getByRole('article',{name:'Swipe property discovery'});
 await stage.getByRole('button',{name:'Add to compare'}).click();await stage.getByRole('button',{name:'Next property',exact:true}).click();await stage.getByRole('button',{name:'Add to compare'}).click();await stage.getByRole('button',{name:'Previous property',exact:true}).click();
 for(let i=0;i<20;i++)await stage.getByRole('button',{name:'Next media',exact:true}).click();const video=stage.locator('video');await video.evaluate((element:HTMLVideoElement)=>element.play());await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused)).toBe(false);
 await stage.getByRole('button',{name:'Open comparison'}).click();await expect(page.getByRole('dialog',{name:'Compare properties'})).toBeVisible();await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused)).toBe(true);
 await stage.focus();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Compare properties'})).toBeHidden();await expect(page).toHaveURL(/mode=swipe/);await expect(page.locator('.swipe-counter')).toContainText('1 /');await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused)).toBe(true);
});
test('Swipe mixed media allocates one player; failure and hidden tabs pause safely',async({page})=>{
 await page.goto('/discover?q=media-heavy&mode=swipe');
 const stage=page.locator('.swipe-stage');
 for(let i=0;i<20;i++) await stage.getByRole('button',{name:'Next media',exact:true}).click();
 const video=stage.locator('video'); await expect(video).toHaveCount(1); await expect(video).toHaveAttribute('preload','none');
 await video.evaluate((element:HTMLVideoElement)=>element.play());
 await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.currentTime)).toBeGreaterThan(0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused)).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused)).toBe(true);
 await video.evaluate(element=>element.dispatchEvent(new Event('error'))); await expect(stage).toContainText('Video unavailable');
 await stage.getByRole('button',{name:'Next media',exact:true}).click(); await expect(stage.locator('video')).toHaveCount(1);
 await stage.getByRole('button',{name:'Next property',exact:true}).click(); await expect(stage.locator('video')).toHaveCount(0);
 await page.goto('/discover?q=failed-image&mode=swipe'); await expect(stage.getByRole('img',{name:/image unavailable/})).toBeVisible();
 await stage.getByRole('button',{name:'Next media',exact:true}).click(); await expect(stage.locator('img')).toBeVisible();
});
test('Swipe pointer axes and desktop wheel do not change the query',async({page})=>{
 await page.goto('/discover?mode=swipe&purpose=rent');const stage=page.getByRole('article',{name:'Swipe property discovery'});const media=stage.locator('.swipe-media');await expect(stage).toBeVisible();
 await media.scrollIntoViewIfNeeded();const box=(await media.boundingBox())!;const x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-130,y+5,{steps:6});await page.mouse.up();
 await expect(stage.locator('.swipe-media-heading')).toContainText('2 / 5');
 const old=await stage.locator('h2').textContent();await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+5,y-140,{steps:6});await page.mouse.up();
 await expect(stage.locator('h2')).not.toHaveText(old!); await expect(page).toHaveURL(/purpose=rent/);
 await stage.focus();await page.keyboard.press('ArrowUp');await expect(stage.locator('h2')).toHaveText(old!);await page.mouse.move(x,y);await page.mouse.wheel(0,120);await expect(stage.locator('h2')).not.toHaveText(old!);await page.keyboard.press('ArrowUp');await page.keyboard.press('Escape');await expect(page).not.toHaveURL(/mode=swipe/);
});
for (const [width,height] of [[390,844],[430,932],[768,1024]]) {
 test(`Swipe trusted mobile touch axes ${width}`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,baseURL:'http://127.0.0.1:3101'});
  const page=await context.newPage();await page.goto('/discover?mode=swipe&purpose=rent');
  const stage=page.getByRole('article',{name:'Swipe property discovery'}),media=stage.locator('.swipe-media');await expect(stage).toBeVisible();await media.scrollIntoViewIfNeeded();
  const box=(await media.boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2;
  const cdp=await context.newCDPSession(page);
  async function drag(dx:number,dy:number){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await drag(-100,5);await expect(stage.locator('.swipe-media-heading')).toContainText('2 / 5');
  const title=await stage.locator('h2').textContent();await drag(5,-90);await expect(stage.locator('h2')).not.toHaveText(title!);
  await drag(5,90);await expect(stage.locator('h2')).toHaveText(title!);await expect(stage.locator('.swipe-media-heading')).toContainText('2 / 5');
  await expect(page).toHaveURL(/purpose=rent/);await context.close();
 });
}
test('Swipe video-only, slow images, sharing and loaded-feed return context',async({page})=>{
 await page.goto('/discover?q=video-only&mode=swipe');await expect(page.locator('.swipe-stage video')).toHaveCount(1);await expect(page.getByRole('article',{name:'Swipe property discovery'}).locator('.swipe-media-heading')).toContainText('1 / 5');
 await page.locator('.swipe-stage').getByRole('button',{name:'Next media',exact:true}).click();await expect(page.locator('.swipe-stage video')).toHaveCount(1);
 await page.route('**/images/**',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
 await page.goto('/discover?mode=swipe&limit=2');const stage=page.getByRole('article',{name:'Swipe property discovery'});await expect(stage).toBeVisible();const before=(await stage.locator('.swipe-media').boundingBox())!;
 await expect(stage.getByRole('img')).toBeVisible();const after=(await page.locator('.swipe-media').boundingBox())!;expect(after.height).toBe(before.height);
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async(data:ShareData)=>{(window as unknown as {shared:ShareData}).shared=data;}}));
 await stage.getByRole('button',{name:'Share',exact:true}).click();expect(await page.evaluate(()=>(window as unknown as {shared:ShareData}).shared.url)).toContain('/properties/');
 await stage.getByRole('button',{name:'Next property',exact:true}).click();await stage.getByRole('button',{name:'Next property',exact:true}).click();
 await expect(page.locator('.swipe-counter')).toContainText('3 /');const title=await stage.locator('h2').textContent();
 await stage.getByRole('link',{name:'View details'}).click();await expect(page).toHaveURL(/\/properties\//);await page.goBack();await expect(stage.locator('h2')).toHaveText(title!);await expect(page.locator('.swipe-counter')).toContainText('3 /');
});
test('Swipe gestures work across video surfaces without starting another player',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,baseURL:'http://127.0.0.1:3101'});const page=await context.newPage();
 await page.goto('/discover?q=media-heavy&mode=swipe');const stage=page.getByRole('article',{name:'Swipe property discovery'});
 for(let i=0;i<20;i++)await stage.getByRole('button',{name:'Next media',exact:true}).click();await expect(stage.locator('video')).toBeVisible();
 const box=(await stage.locator('video').boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/3;const cdp=await context.newCDPSession(page);
 async function drag(dx:number,dy:number){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await drag(-90,5);await expect(stage.locator('.swipe-media-heading')).toContainText('22 / 25');await expect(stage.locator('video')).toHaveCount(1);
 const title=await stage.locator('h2').textContent();await drag(5,-80);await expect(stage.locator('h2')).not.toHaveText(title!);await expect(stage.locator('video')).toHaveCount(0);await context.close();
});
