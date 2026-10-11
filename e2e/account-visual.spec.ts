import {test,expect} from '@playwright/test';
const shots=process.env.HOMES_ACCOUNT_SCREENSHOTS || 'test-results/account-screenshots';
async function capture(page: import('@playwright/test').Page, path: string) {
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);});
 await page.screenshot({path,fullPage:true});
}
async function checkFormSpacing(page: import('@playwright/test').Page) {
 const gaps=await page.locator('.account-panel form').evaluateAll(forms=>forms.flatMap(form=>{
  const boxes=Array.from(form.children).map(child=>child.getBoundingClientRect()).filter(box=>box.height>0);
  return boxes.slice(1).map((box,index)=>box.top-boxes[index].bottom);
 }));
 for(const gap of gaps)expect(gap).toBeGreaterThanOrEqual(16);
}
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
  await capture(page,`${shots}/entry-${width}-${theme}.png`);
  await page.getByRole('button',{name:names[0],exact:true}).click();await expect(page.getByRole('status')).toContainText('Google sign-in will be available at launch.');
  await page.getByRole('button',{name:names[1],exact:true}).click();await expect(page.getByRole('status')).toContainText('Apple sign-in will be available at launch.');await expect(page.locator('.account-panel').getByRole('alert')).toHaveCount(0);expect(providerRequests).toBe(0);
  await capture(page,`${shots}/preview-${width}-${theme}.png`);
  await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByLabel('Full name',{exact:true})).toBeVisible();await expect(page.getByLabel('Phone (optional)')).toHaveCount(0);await capture(page,`${shots}/signup-${width}-${theme}.png`);
  await checkFormSpacing(page);
  await page.route('**/api/account/auth/sign-up/email',route=>route.fulfill({status:429,headers:{'Retry-After':'900'},json:{error:{code:'RATE_LIMITED',message:'Please wait 15 minutes before trying again.'}}}));
  await page.getByLabel('Full name',{exact:true}).fill('Visual QA');await page.getByLabel('Email',{exact:true}).fill('visual@example.invalid');await page.getByLabel('Password',{exact:true}).fill('Isolated visual test passphrase');await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page.locator('.account-panel').getByRole('alert')).toHaveText('Please wait 15 minutes before trying again.');
  await expect(page.getByLabel('Full name',{exact:true})).toHaveValue('Visual QA');await expect(page.getByLabel('Email',{exact:true})).toHaveValue('visual@example.invalid');await expect(page.getByLabel('Password',{exact:true})).toHaveValue('Isolated visual test passphrase');await checkFormSpacing(page);await capture(page,`${shots}/rate-limit-${width}-${theme}.png`);
  await page.getByRole('button',{name:'Back to sign in',exact:true}).click();await checkFormSpacing(page);await capture(page,`${shots}/signin-${width}-${theme}.png`);
  await page.route('**/api/account/auth/sign-in/email',route=>route.fulfill({status:401,json:{error:{message:'Email or password is incorrect.'}}}));
  await page.getByLabel('Email',{exact:true}).fill('visual@example.invalid');await page.getByLabel('Password',{exact:true}).fill('Wrong isolated test password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.locator('.account-panel').getByRole('alert')).toHaveText('Email or password is incorrect.');await capture(page,`${shots}/error-${width}-${theme}.png`);
  await page.getByRole('button',{name:'Verify your email',exact:true}).click();await checkFormSpacing(page);await capture(page,`${shots}/verify-${width}-${theme}.png`);await page.getByRole('button',{name:'Back to sign in',exact:true}).click();
  await page.route('**/api/account/auth/email-otp/request-password-reset',route=>route.fulfill({json:{data:{success:true}}}));
  await page.getByRole('button',{name:'Forgot password?',exact:true}).click();await checkFormSpacing(page);await page.getByLabel('Email',{exact:true}).fill('visual@example.invalid');await page.getByRole('button',{name:'Send reset code',exact:true}).click();await expect(page.getByRole('heading',{name:'Choose a new password.'})).toBeVisible();await checkFormSpacing(page);await capture(page,`${shots}/reset-${width}-${theme}.png`);
 });
}
