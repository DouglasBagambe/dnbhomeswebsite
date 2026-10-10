import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
const folder=`/tmp/homes-consumer-browser-${os.userInfo().uid}`;
const email=process.env.HOMES_QA_EMAIL ?? 'consumer@homes-qa.example.invalid',password='Isolated Homes QA passphrase 2026!';
async function code(type:string){const items=await Promise.all((await fs.readdir(folder)).map(async file=>JSON.parse(await fs.readFile(`${folder}/${file}`,'utf8'))));return items.filter(item=>item.email===email&&item.type===type).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).at(-1)?.otp;}
test('real account ownership, HttpOnly sessions, cross-device Saved/Viewings and logout',async({page,browser})=>{
 await page.goto('/discover?mode=swipe');await page.getByRole('button',{name:'Save property',exact:true}).click();await expect(page.getByRole('button',{name:'Remove from saved properties',exact:true})).toBeVisible();
 await page.goto('/account');await page.getByRole('button',{name:'Create account',exact:true}).click();
 await page.getByLabel('Full name',{exact:true}).fill('Homes QA Consumer');await page.getByLabel('Phone (optional)').fill('+256700000000');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByRole('heading',{name:'Check your inbox'})).toBeVisible();
 const verification=await code('email-verification');expect(verification).toMatch(/^\d{6}$/);await page.getByLabel('Six-digit code').fill(verification);await page.getByRole('button',{name:'Verify email',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Welcome, Homes'})).toBeVisible();
 await expect.poll(async()=>{const response=await page.request.get('/api/account/state');return response.ok()?(await response.json()).data.saved.length:0;}).toBe(1);
 const cookies=await page.context().cookies();const session=cookies.find(item=>item.name==='homes-consumer-session');expect(session?.httpOnly).toBe(true);expect(session?.sameSite).toBe('Lax');
 expect(await page.evaluate(()=>document.cookie)).not.toContain('homes-consumer-session');expect(await page.evaluate(()=>Object.entries(localStorage).some(([key,value])=>/token|session/i.test(key)&&value.includes('.')))).toBe(false);
 const second=await browser.newContext({baseURL:'http://127.0.0.1:3101',viewport:{width:390,height:844}});const phone=await second.newPage();
 await phone.goto('/account');await phone.getByRole('button',{name:'Sign in',exact:true}).click();await phone.getByLabel('Email',{exact:true}).fill(email);await phone.getByLabel('Password',{exact:true}).fill(password);await phone.getByRole('button',{name:'Sign in',exact:true}).click();await expect(phone.getByRole('heading',{name:'Welcome, Homes'})).toBeVisible();
 await phone.goto('/favorites');await expect(phone.locator('.property-card')).toHaveCount(1);
 await phone.goto('/discover?mode=swipe');await phone.getByRole('button',{name:'Request viewing',exact:true}).click();
 const form=phone.locator('dialog[open]');await expect(form.getByLabel('Name',{exact:true})).toHaveCount(0);await expect(form.getByLabel('Email',{exact:true})).toHaveCount(0);await expect(form.getByLabel('Phone',{exact:true})).toHaveCount(0);
 const date=new Date(Date.now()+7*86400000).toISOString().slice(0,10);await form.getByLabel('Preferred date').fill(date);await form.getByLabel('Preferred time (Uganda)').fill('10:00');await form.getByRole('button',{name:'Request a viewing',exact:true}).click();await expect(form).toContainText('Viewing request received');
 await page.goto('/bookings');await expect(page.locator('.booking-request')).toHaveCount(1);await expect(page.locator('.booking-request')).toContainText('pending');await expect(page.locator('.booking-request')).toContainText('10:00');
 const rejected=await page.request.post('/api/account/preferences',{headers:{Origin:'https://attacker.invalid'},data:{viewingUpdates:false,searchAlerts:false}});expect(rejected.status()).toBe(403);
 await page.goto('/account');await page.getByRole('button',{name:'Sign out all devices',exact:true}).click();await expect(page.getByRole('heading',{name:'Welcome to Homes'})).toBeVisible();
 await phone.goto('/account');await expect(phone.getByRole('heading',{name:'Welcome to Homes'})).toBeVisible();
 await second.close();
});
