/* eslint-disable @typescript-eslint/no-require-imports -- standalone browser verification */
const assert=require('node:assert/strict');
const sharp=require('sharp');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.argv[2]||'playwright');
const base=process.env.PORTFOLIO_URL||'http://localhost:3000';
(async()=>{
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 const errors=[]; page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE.WebGLProgram|VALIDATE_STATUS|ERROR: 0:/.test(message.text()))errors.push(message.text());});
 const response=await page.goto(`${base}/404`);assert.equal(response.status(),404);
 await page.waitForSelector('.waterfall-page.is-ready');
 await page.addStyleTag({content:'nextjs-portal{visibility:hidden!important}.waterfall-render{transition:none!important}'});
 await page.locator('video').evaluate(async v=>{if(v.readyState<2)await new Promise(resolve=>v.addEventListener('loadeddata',resolve,{once:true}));});
 assert.ok(await page.locator('video').evaluate(v=>v.paused&&v.muted&&v.loop&&v.playsInline&&v.currentSrc.endsWith('/video/waterfallanimation.mp4')),'provided video, muted inline loop, reduced motion respected');
 const capture=()=>page.locator('video').evaluate(v=>{v.dispatchEvent(new Event('seeked'));return document.querySelector('canvas').toDataURL('image/png').split(',')[1];});
 await page.screenshot({path:'/private/tmp/waterfall-desktop.png'});
 if(process.env.UPDATE_WATERFALL_POSTER==='1'){
   await sharp(Buffer.from(await capture(),'base64')).webp({quality:95,alphaQuality:100}).toFile('public/video/waterfall-lettering.webp');
 }
 const initial=Buffer.from(await capture(),'base64');
 await page.locator('video').evaluate(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=4;}));
 const later=Buffer.from(await capture(),'base64');
 assert.notDeepEqual(initial,later,'reflection responds to the original video timeline');
 await page.screenshot({path:'/private/tmp/waterfall-at-4s.png'});
 for(const viewport of [{width:390,height:844},{width:320,height:568},{width:768,height:1024},{width:844,height:390},{width:1920,height:1080}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(180);
   assert.deepEqual(await page.locator('main').evaluate(el=>({width:el.clientWidth,height:el.clientHeight})),viewport);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),'no page scrolling');
   const link=page.getByRole('link',{name:'Back to Portfolio'}); const box=await link.boundingBox();
   assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height&&box.height>=44,'CTA remains usable');
   if(viewport.width===390){
     await page.screenshot({path:'/private/tmp/waterfall-mobile.png'});
     if(process.env.UPDATE_WATERFALL_POSTER==='1')await sharp(Buffer.from(await capture(),'base64')).webp({quality:95,alphaQuality:100}).toFile('public/video/waterfall-lettering-portrait.webp');
   }
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.waitForFunction(()=>!document.querySelector('video').paused);
 const t=await page.locator('video').evaluate(v=>v.currentTime);await page.waitForTimeout(500);
 assert.ok(await page.locator('video').evaluate((v,t)=>v.currentTime>t,t),'background plays naturally');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('video').paused);
 assert.deepEqual(errors,[]);
 await page.getByRole('link',{name:'Back to Portfolio'}).click();await page.waitForURL(`${base}/`);
 const fallback=await browser.newPage({javaScriptEnabled:false});await fallback.goto(`${base}/missing`);
 await fallback.getByRole('link',{name:'Back to Portfolio'}).waitFor();
 for(const name of ['waterfall-poster','waterfall-lettering','waterfall-lettering-portrait'])assert.equal((await fallback.request.get(`${base}/video/${name}.webp`)).status(),200,'poster available without JavaScript');
 console.log('PASS: source video, true 404, timeline-driven reflection, full-screen layout at five sizes, autoplay, reduced motion, accessible CTA, navigation, static fallbacks, no runtime errors.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
