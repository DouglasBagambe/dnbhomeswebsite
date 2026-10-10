import { test, expect } from "@playwright/test";
const property = "/properties/illustrative-home-1-507f1f77bcf86cd799439011";
const shots = process.env.HOMES_SCREENSHOTS || "test-results/v2-screenshots";
for (const [width,height] of [[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080]]) {
  for (const theme of ["light","dark"]) {
    test(`${width} ${theme}: responsive pages, images and controls`, async ({page}) => {
      await page.setViewportSize({width,height});
      await page.addInitScript(t=>localStorage.setItem("homes-theme",t),theme);
      for (const [name,path] of [["home","/"],["discover","/discover"],["property",property]]) {
        await page.goto(path,{waitUntil:"networkidle"});
        await expect(page.locator("html")).toHaveAttribute("data-resolved-theme",theme);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        await expect(page.locator("h1")).toBeVisible();
        if(name === "home") {
          const copy=await page.locator(".hero-copy").boundingBox(), search=await page.locator(".search-shell").boundingBox();
          expect(copy!.y+copy!.height+12).toBeLessThanOrEqual(search!.y);
          const contrast=await page.evaluate(()=>{
            const luminance=(color:string)=>{const rgb=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
            return [...document.querySelectorAll('.app-copy h2,.footer h3')].map(el=>{
              let parent:Element|null=el;while(parent&&getComputedStyle(parent).backgroundColor==='rgba(0, 0, 0, 0)')parent=parent.parentElement;
              const a=luminance(getComputedStyle(el).color),b=luminance(getComputedStyle(parent!).backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
            });
          });
          expect(contrast.every(ratio=>ratio>=4.5)).toBe(true);
        }
        for(const image of await page.locator("main img").all()){
          await image.scrollIntoViewIfNeeded();
          await expect.poll(()=>image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
        }
        await page.evaluate(()=>scrollTo(0,0));
        if([390,768,1440].includes(width))await page.screenshot({path:`${shots}/${name}-${width}-${theme}.png`,fullPage:true});
      }
    });
  }
}
test("search fields, recent search and shareable query survive", async ({page})=>{
 await page.setViewportSize({width:390,height:844}); await page.goto("/");
 await page.getByLabel("Location",{exact:true}).fill("Ntinda");
 await page.getByLabel("Purpose",{exact:true}).selectOption("rent");
 await page.getByLabel("Property type",{exact:true}).selectOption("house");
 await page.getByLabel("Budget",{exact:true}).fill("3000000");
 await page.getByLabel("Bedrooms",{exact:true}).selectOption("2");
 await page.getByRole("button",{name:"Search",exact:true}).click();
 await expect(page).toHaveURL(/purpose=rent.*area=Ntinda.*type=house.*maxPrice=3000000.*bedrooms=2/);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("homes:recent-searches:v1")||"[]"))).toContain("Ntinda");
 await page.getByRole("button",{name:"Filters",exact:true}).click();
 await expect(page.getByLabel("Area",{exact:true})).toHaveValue("Ntinda");
 await page.getByLabel("Sort by").selectOption("price_asc");await expect(page).toHaveURL(/sort=price_asc/);
 await page.getByRole("link",{name:"Remove Bedrooms filter"}).click();await expect(page).not.toHaveURL(/bedrooms=/);
});
test("saved homes and comparison remain browser-local",async({page})=>{
 await page.goto("/discover");
 await page.getByRole("button",{name:"Save property"}).first().click();
 await page.getByRole("button",{name:"Add to compare"}).nth(0).click();
 await page.getByRole("button",{name:"Add to compare"}).nth(0).click();
 await page.getByRole("button",{name:"Compare",exact:true}).click();
 await expect(page.getByRole("dialog",{name:"Compare properties"})).toBeVisible();
 await expect(page.getByRole("table")).toContainText("Price");
 await page.keyboard.press("Escape");await expect(page.getByRole("dialog",{name:"Compare properties"})).toBeHidden();
 await expect(page.getByRole("button",{name:"Compare",exact:true})).toBeFocused();
 await page.goto("/favorites");await expect(page.locator(".property-card")).toHaveCount(1);
 await page.reload();await expect(page.locator(".property-card")).toHaveCount(1);
});
test("viewing and contact flow use only isolated fixture API",async({page,request})=>{
 const date = new Date(); date.setDate(date.getDate()+7); const day = date.toISOString().slice(0,10);
 await page.goto(property);const form=page.locator("#request-viewing form");
 await form.getByLabel("Preferred date").fill(day);await form.getByLabel("Preferred time (Uganda)").fill("14:30");
 await form.getByLabel("Name",{exact:true}).fill("Local QA");await form.getByLabel("Email",{exact:true}).fill("qa@example.test");await form.getByLabel("Phone",{exact:true}).fill("+256700000001");
 await form.getByRole("button",{name:"Request a viewing",exact:true}).click();await expect(page.getByText("Viewing request received")).toBeVisible();
 await page.goto("/bookings");await expect(page.getByText("HOMES-QA-ONLY")).toBeVisible();
 await page.goto("/contact");await page.getByLabel("Name",{exact:true}).fill("Local QA");await page.getByLabel("Email",{exact:true}).fill("qa@example.test");await page.getByLabel("Subject").fill("Local test");await page.getByLabel("Message").fill("This is isolated browser QA.");
 await page.getByRole("button",{name:"Send message"}).click();await expect(page.getByRole("status")).toContainText("test message");
 const body=await(await request.get("http://127.0.0.1:3100/__qa/writes")).json();
 expect(body.writes.find((w:{path:string})=>w.path.endsWith('/bookings')).body.scheduledAt).toBe(`${day}T11:30:00.000Z`);
});
test("mobile menu, filters, keyboard focus and empty state",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");
 await page.getByRole("button",{name:"Open navigation"}).click();await page.keyboard.press("Escape");await expect(page.getByRole("button",{name:"Open navigation"})).toBeFocused();
 await page.goto("/discover?q=empty");await expect(page.getByRole("heading",{name:"No properties found"})).toBeVisible();
 await page.getByRole("button",{name:"Filters",exact:true}).click();await expect(page.getByLabel("Search",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Close filters"}).click();await expect(page.getByLabel("Search",{exact:true})).toBeHidden();
});
test("secondary routes retain the shared system without overflow",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/rent','/buy','/short-stay','/land','/commercial','/favorites','/bookings','/locations/uganda','/about','/contact','/help','/safety','/download','/privacy','/terms','/agents','/agencies']){
   await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
