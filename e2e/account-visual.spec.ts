import {test,expect} from '@playwright/test';
const shots=process.env.HOMES_ACCOUNT_SCREENSHOTS || 'test-results/account-screenshots';
for(const [width,height] of [[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]]) for(const theme of ['light','dark']) {
 test(`account ${width} ${theme}: entry, aligned CTAs, preview, email and errors`,async({page})=>{
  await page.setViewportSize({width,height});await page.addInitScript(t=>localStorage.setItem('homes-theme',t),theme);
  await page.route('**/api/account/capabilities',route=>route.fulfill({json:{data:{accounts:true,providers:{google:true,apple:true},sync:{saved:true,compare:true,recent:true,viewings:true,profile:true}}}}));
  let providerRequests=0;page.on('request',r=>{if(/accounts.google.com\/gsi|appleauth\/static/.test(r.url()))providerRequests++;});
  await page.goto('/account',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:"Let's find you a home."})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const names=['Continue with Google','Continue with Apple','Create account','Sign in with email'];const boxes=[];
  for(const name of names.slice(2))boxes.push((await page.getByRole('button',{name,exact:true}).boundingBox())!);
  expect(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))).toBeLessThan(2);expect(Math.max(...boxes.map(b=>b.height))-Math.min(...boxes.map(b=>b.height))).toBeLessThan(2);
  for(const name of names.slice(0,2)){ const box=await page.getByRole('button',{name,exact:true}).boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.width).toBeLessThanOrEqual(64);expect(box!.height).toBe(box!.width); }
  await page.screenshot({path:`${shots}/entry-${width}-${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:names[0],exact:true}).click();await expect(page.getByRole('status')).toContainText('Google sign-in will be available at launch.');
  await page.getByRole('button',{name:names[1],exact:true}).click();await expect(page.getByRole('status')).toContainText('Apple sign-in will be available at launch.');await expect(page.locator('.account-panel').getByRole('alert')).toHaveCount(0);expect(providerRequests).toBe(0);
  await page.screenshot({path:`${shots}/preview-${width}-${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByLabel('Full name',{exact:true})).toBeVisible();await expect(page.getByLabel('Phone (optional)')).toHaveCount(0);await page.screenshot({path:`${shots}/signup-${width}-${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:'Back to sign in',exact:true}).click();
  await page.route('**/api/account/auth/sign-in/email',route=>route.fulfill({status:401,json:{error:{message:'Email or password is incorrect.'}}}));
  await page.getByLabel('Email',{exact:true}).fill('visual@example.invalid');await page.getByLabel('Password',{exact:true}).fill('Wrong isolated test password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.locator('.account-panel').getByRole('alert')).toHaveText('Email or password is incorrect.');await page.screenshot({path:`${shots}/error-${width}-${theme}.png`,fullPage:true});
  await page.route('**/api/account/auth/email-otp/request-password-reset',route=>route.fulfill({json:{data:{success:true}}}));
  await page.getByRole('button',{name:'Forgot password?',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('visual@example.invalid');await page.getByRole('button',{name:'Send reset code',exact:true}).click();await expect(page.getByRole('heading',{name:'Choose a new password.'})).toBeVisible();await page.screenshot({path:`${shots}/reset-${width}-${theme}.png`,fullPage:true});
 });
}
