// Run against the local app: node scripts/check-after-hours.mjs
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.AFTER_HOURS_TEST_URL || 'http://localhost:3000';
const screenshots = '.impeccable/review/after-hours';
await mkdir(screenshots, {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const clues = {
 en: ['Before the skyline', 'I’m after the one', 'Imagine a desert ripple', 'One shape was a good start'],
 ar: ['قبل أن تعلو', 'أبحث عن المصباح', 'تخيّل تموّجاً', 'شكلٌ واحد'],
};
const lamps=['hamrah','nujaj','kasane','nasaq'];
async function advance(page, ms) { for(let remaining=ms;remaining>0;remaining-=1000) await page.clock.fastForward(Math.min(1000,remaining)); }
try {
 for(const [name,viewport,language] of [
  ['desktop',{width:1440,height:1000},'en'],
  ['mobile',{width:390,height:844},'en'],
  ['small-mobile',{width:320,height:568},'ar'],
  ['tablet',{width:834,height:1112},'ar'],
 ]) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${origin}/after-hours`,{waitUntil:'networkidle'});
  const cookiePreferences=page.getByRole('button',{name:'Preferences',exact:true});
  if(await cookiePreferences.count()){await cookiePreferences.click();for(const label of ['Analytics cookies','Marketing cookies'])await page.getByRole('checkbox',{name:label,exact:true}).uncheck();await page.getByRole('button',{name:'Save your cookie preferences',exact:true}).click();}
  await page.screenshot({path:`${screenshots}/${name}-start.png`,fullPage:true});
  await page.locator(`#choose-${language==='en'?'english':'arabic'}`).click();
  await page.locator('#enter-studio').focus();await page.keyboard.press('Enter');
  for(let i=0;i<4;i++)await page.locator('#main-action').click();
  await page.screenshot({path:`${screenshots}/${name}-play.png`,fullPage:true});
  for(let round=0;round<3;round++){
   const clue=await page.locator('#dialogue-title').innerText();
   const index=clues[language].findIndex(prefix=>clue.startsWith(prefix));assert.ok(index>=0,clue);
   if(round===0){
    const wrong=lamps.find(id=>id!==lamps[index]);await page.locator(`[data-lamp="${wrong}"]`).click();
    assert.ok((await page.locator('#feedback').innerText()).length>10);
    for(let hint=0;hint<3;hint++)await page.locator('#hint-action').click();
    assert.equal(await page.locator('#hint-action').isDisabled(),true);
   }
   await page.locator(`[data-lamp="${lamps[index]}"]`).focus();await page.keyboard.press('Enter');
   await page.locator('#main-action').click();
  }
  assert.equal(await page.locator('#reward').isVisible(),true);
  assert.equal(await page.locator('#reward-title').evaluate(el=>getComputedStyle(el).outlineColor),'rgb(255, 75, 31)');
  for(const img of await page.locator('.product-link img').all()){
   await img.scrollIntoViewIfNeeded();await img.evaluate(img=>img.decode());
  }
  assert.equal(await page.locator('.product-link').count(),4);
  for(const link of await page.locator('.product-link').all())assert.match(await link.getAttribute('href'),/https:\/\/www.fasthaus.ae\/product\//);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`${screenshots}/${name}-complete.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: no horizontal overflow`);
  await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
  await page.locator('#replay').click();assert.equal(await page.locator('#language-choice').isVisible(),true);
  await page.locator('#choose-english').click();await page.locator('#language-switch').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'ar');
  assert.deepEqual(errors,[]);await page.close();
  console.log(`${name}: full ${language} game, wrong guess, all hints, keyboard, completion images, sound, replay and language switch passed`);
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.clock.install({time:new Date('2026-11-16T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-11-16T12:01:00Z'));
 await page.goto(`${origin}/collection`,{waitUntil:'networkidle'});
 const invitation=page.getByRole('complementary',{name:'After Hours game invitation'});
 await advance(page, 125_000);
 assert.equal(await invitation.count(),0,'Consent blocks invitation');
 const accept=page.getByRole('button',{name:'Accept all cookies',exact:true});if(await accept.count())await accept.click();
 await advance(page, 60_000);assert.equal(await invitation.count(),0,'Wait for two minutes');
 await page.goto(`${origin}/faq`,{waitUntil:'networkidle'});
 await advance(page, 59_000);assert.equal(await invitation.count(),0,'Time follows navigation');
 await advance(page, 3_000);await invitation.waitFor();
 await page.screenshot({path:`${screenshots}/invitation-mobile.png`});
 assert.equal(await invitation.getByRole('link',{name:'Play After Hours'}).getAttribute('href'),'/after-hours?entry=invitation');
 await invitation.getByRole('button',{name:'Dismiss game invitation'}).click();
 await page.reload({waitUntil:'networkidle'});await advance(page, 130_000);
 assert.equal(await invitation.count(),0,'Dismissal survives reload');
 await page.goto(`${origin}/`,{waitUntil:'networkidle'});
 await page.keyboard.press('ArrowDown');await advance(page, 2000);
 await page.locator('#after-hours').scrollIntoViewIfNeeded();
 await page.locator('#after-hours img').evaluate(img=>img.decode());
 await page.locator('#after-hours').screenshot({path:`${screenshots}/home-mobile.png`});
 await page.locator('#after-hours').getByRole('link',{name:'Play After Hours',exact:true}).click();
 await page.waitForURL('**/after-hours');assert.equal(await page.locator('#choose-english').isVisible(),true);
 await page.locator('.studio-link').click();await page.waitForURL('**/collection');
 const redirect=await page.request.get(`${origin}/game-test`,{maxRedirects:0});assert.equal(redirect.status(),308);
 assert.equal(redirect.headers().location,'/after-hours');
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`${origin}/`,{waitUntil:'networkidle'});await page.keyboard.press('ArrowDown');await advance(page, 2000);
 await page.locator('#after-hours').scrollIntoViewIfNeeded();await page.locator('#after-hours img').evaluate(img=>img.decode());
 await page.locator('#after-hours').screenshot({path:`${screenshots}/home-desktop.png`});
 await page.close();
 console.log('Invitation timing, consent, cross-page time, dismissal, homepage CTA, return to shop and legacy redirect passed');
} finally {await browser.close();}
