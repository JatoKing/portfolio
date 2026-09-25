/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node browser check */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.argv[2]||'playwright');
const {getFramePosition,getActiveChapter}=require('./test-timeline.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const page=await context.newPage();
  await page.goto('http://localhost:3000/?timelineDebug=1');
  await page.waitForSelector('.cinematic.is-ready');
  assert.equal(await page.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot).source),'video','mobile uses the video scrub');
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y:740}]});
  for(const y of [690,640,590,540,490,440]) {
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:320,y}]});
   await page.waitForTimeout(25);
   const s=await page.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
   assert.ok(Math.abs(getFramePosition(s.currentProgress,s.source)-s.framePosition)<1e-9);
   assert.equal(s.section,getActiveChapter(s.currentProgress)?.id??null);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(700);
  assert.ok(await page.evaluate(()=>scrollY>100),'native touch scroll advanced');
  assert.equal(await page.locator('canvas').evaluate(c=>c.width),585,'mobile DPR capped at 1.5');
  const before=await page.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
  const after=await page.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
  assert.ok(Math.abs(before.currentProgress-after.currentProgress)<1e-9,'orientation keeps master');
  await page.screenshot({path:'/tmp/timeline-mobile-touch.png'});
  const failure=await browser.newPage();
  await failure.route('**/video/avatar-intra.mp4',r=>r.abort());
  await failure.route('**/frames-120/*.webp',r=>r.abort());
  await failure.goto('http://localhost:3000/');
  await failure.getByRole('button',{name:'Continue to portfolio'}).click();
  const color=await failure.locator('canvas').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,1,1).data));
  assert.deepEqual(color,[211,207,200,255],'total load failure retains neutral stage');
  console.log('PASS: native touch synchronization, mobile DPR cap, orientation preservation, all-frame-failure fallback.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
