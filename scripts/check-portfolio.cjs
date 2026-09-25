/* Browser checks against the dev server; optional argv[2] is an external Playwright install. */
/* eslint-disable @typescript-eslint/no-require-imports -- standalone CommonJS browser check */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.argv[2] || 'playwright');
const { chapters, getFramePosition, getVideoTime, getActiveChapter, chapterStyle } = require('./test-timeline.cjs');
const url = process.env.PORTFOLIO_URL || 'http://localhost:3000';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${url}/?timelineDebug=1`);
    await page.waitForSelector('.cinematic.is-ready',{timeout:60000});
    const renderBudget=await page.locator('canvas').evaluate(c=>({source:c.dataset.frameSource,smoothing:c.getContext('2d').imageSmoothingQuality}));
    assert.equal(renderBudget.source,'/video/avatar-intra.mp4','all-intra video is the primary source');
    assert.equal(renderBudget.smoothing,'low','scroll draws avoid expensive high-quality resampling');
    const snapshot = () => page.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
    async function scroll(p, settle=true) {
      await page.evaluate(p=>window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),p);
      if(settle) await page.waitForFunction(p=>{const s=JSON.parse(document.querySelector('.timeline-debug').dataset.snapshot);return Math.abs(s.targetProgress-p)<=1/Math.max(1,s.maxScroll) && Math.abs(s.currentProgress-s.targetProgress)<.000001 && !s.seekPending;},p);
    }
    function validate(s) {
      const active=getActiveChapter(s.currentProgress);
      assert.equal(s.section,active?.id??null);
      assert.ok(Math.abs(s.videoTime-getVideoTime(s.currentProgress))<1e-9);
      assert.ok(Math.abs(s.framePosition-getFramePosition(s.currentProgress,s.source))<1e-9);
      // Video frames arrive asynchronously; once decoded, the canvas shows the exact frame.
      if(!s.seekPending) assert.equal(s.renderedFrame,Math.round(s.framePosition));
    }
    async function capture(count, drive) {
      const states=await page.evaluate(async ({count,drive})=>{
        const samples=[];
        for(let i=0;i<count;i++) {
          if(drive) window.scrollTo({top:(drive.start+(drive.end-drive.start)*i/(count-1))*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});
          await new Promise(requestAnimationFrame);
          const s=JSON.parse(document.querySelector('.timeline-debug').dataset.snapshot);
          s.opacities=[...document.querySelectorAll('[data-chapter]')].map(el=>Number(el.style.opacity));
          s.nav=[...document.querySelectorAll('.chapter-rail [aria-current]')].map(el=>el.dataset.nav);
          s.meter=Number(document.querySelector('.sequence-meter').style.transform.match(/scaleX\((.+)\)/)[1]);
          samples.push(s);
        }
        return samples;
      },{count,drive});
      for(const s of states) {
        validate(s);
        assert.ok(Math.abs(s.meter-s.currentProgress)<1e-6,'meter uses master');
        assert.deepEqual(s.nav,s.section?[s.section]:[],'nav follows the visible cue');
        chapters.forEach((c,i)=>assert.ok(Math.abs(s.opacities[i]-chapterStyle(s.currentProgress,c).opacity)<1e-6,'cue uses master'));
      }
      return states;
    }
    for(const p of [0,.25,.5,.75,1,.75,.5,.25,0]) {await scroll(p);validate(await snapshot());}
    await scroll(.05);
    await scroll(.95,false);
    const fast=await capture(28);
    assert.ok(fast.some(s=>s.currentProgress<s.targetProgress-.1),'fast input is interpolated');
    assert.ok(Math.abs(fast.at(-1).currentProgress-.95)<.0002,'quick bounded catch-up');
    await scroll(.12,false);
    const reverse=await capture(28);
    assert.ok(reverse.every((s,i)=>!i||s.currentProgress<=reverse[i-1].currentProgress),'no reverse overshoot');
    for(const [start,end] of [[.14,.16],[.29,.31],[.47,.49],[.69,.71],[.83,.85],...chapters.slice(1).map(c=>[c.start-.01,c.enterEnd+.01])]) {
      await scroll(start);await capture(24,{start,end});
    }
    await scroll(.38);
    const slow=await capture(90,{start:.38,end:.405});
    assert.ok(new Set(slow.map(s=>s.framePosition.toFixed(5))).size>60,'fractional positions stay continuous');
    for(let i=0;i<chapters.length-1;i++) {
      await scroll((chapters[i].exitEnd+chapters[i+1].start)/2);
      assert.equal((await snapshot()).section,null);
    }
    for(const id of ['about','experience','projects','skills','contact']) {
      await page.locator(`.desktop-nav [data-nav="${id}"]`).click();await sleep(350);
      await page.waitForFunction(()=>!JSON.parse(document.querySelector('.timeline-debug').dataset.snapshot).seekPending);
      assert.equal((await snapshot()).section,id);validate(await snapshot());
    }
    await page.locator('.desktop-nav [data-nav="projects"]').click();await sleep(350);
    for(let i=0;i<7;i++) {
      await page.locator('[data-projects-button]').nth(i).click();await sleep(350);
      assert.equal(await page.locator('[data-projects-item]').nth(i).getAttribute('hidden'),null);
    }
    await scroll(.58);
    for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:320,height:568},{width:1440,height:900}]) {
      const before=await snapshot();await page.setViewportSize(viewport);await sleep(350);
      const after=await snapshot();
      assert.ok(Math.abs(after.currentProgress-before.currentProgress)<1e-9,'resize preserves master');
      assert.equal(after.renderedFrame,before.renderedFrame);assert.equal(after.section,before.section);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.setViewportSize({width:390,height:844});await sleep(100);
    await page.getByRole('button',{name:'Open navigation'}).click();
    await page.locator('#mobile-chapters a[href="#contact"]').click();await sleep(350);
    assert.equal((await snapshot()).section,'contact');
    await page.emulateMedia({reducedMotion:'reduce'});await scroll(.4);await sleep(50);
    assert.equal(await page.locator('#experience').evaluate(el=>el.style.transform),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await scroll(1);await sleep(350);
    const last=await snapshot();assert.equal(last.framePosition,238);assert.equal(last.renderedFrame,238);
    await sleep(300);assert.equal((await snapshot()).drawCount,last.drawCount,'idle renderer sleeps');
    await scroll(0);assert.equal((await snapshot()).framePosition,0);
    await page.goto(`${url}/?timelineDebug=1&deep=1#contact`);await page.waitForSelector(".cinematic.is-ready");await sleep(350);
    assert.equal((await snapshot()).section,'contact');
    console.log('PASS: transient synchronization, all requested boundaries, slow/fast/reverse scrolling, navigation, 7 projects, 5 resize configurations, reduced motion, mobile menu, idle drawing, endpoints, hash navigation.');

    // Both sources at the same master progress must show the same moment of the film.
    const shots={};
    for(const source of ['video','frames']) {
      const comparison=await browser.newPage({viewport:{width:1280,height:720}});
      await comparison.goto(`${url}/?timelineDebug=1&source=${source}`);
      await comparison.waitForSelector('.cinematic.is-ready');
      assert.equal(await comparison.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot).source),source);
      shots[source]=[];
      for(const p of [.03,.2,.4,.6,.72,.8,.97]) {
        await comparison.evaluate(p=>window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),p);
        await sleep(350);
        await comparison.waitForFunction(()=>!JSON.parse(document.querySelector('.timeline-debug').dataset.snapshot).seekPending);
        const data=await comparison.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);
        fs.writeFileSync(`/tmp/portfolio-${source}-${p}.png`,Buffer.from(data,'base64'));
        shots[source].push(await comparison.locator('canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let sum=0;for(let i=0;i<d.length;i+=16)sum+=d[i];return sum/(d.length/16);}));
      }
      await comparison.close();
    }
    shots.video.forEach((v,i)=>assert.ok(Math.abs(v-shots.frames[i])<3,`video and fallback agree at sample ${i}`));
    // Same wheel gesture, same viewport and frame assets; compare physical pacing.
    const distances=[];
    for(const vh of [600,700,750,800]) {
      const trial=await browser.newPage({viewport:{width:1440,height:900}});
      await trial.goto(`${url}/?timelineDebug=1&scrollVh=${vh}`);await trial.waitForSelector('.cinematic.is-ready');
      await trial.evaluate(()=>window.scrollTo({top:.48*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}));
      await sleep(350);
      const initial=await trial.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
      await trial.mouse.move(1200,500);
      for(let i=0;i<12;i++){await trial.mouse.wheel(0,20);await sleep(16);}
      await sleep(350);
      const final=await trial.locator('.timeline-debug').evaluate(el=>JSON.parse(el.dataset.snapshot));
      distances.push({vh,scrollPixels:final.maxScroll,pixelsPerFrame:+(final.maxScroll/238).toFixed(1),framesPer240px:+(final.framePosition-initial.framePosition).toFixed(2)});
      await trial.close();
    }
    console.log('SCROLL DISTANCE COMPARISON:',JSON.stringify(distances));
    // Video unavailable: the page must fall back to the 120-frame sequence by itself.
    const noVideo=await browser.newPage({viewport:{width:1440,height:900}});
    await noVideo.route('**/video/avatar-intra.mp4',r=>r.abort());
    await noVideo.goto(`${url}/?timelineDebug=1`);await noVideo.waitForSelector('.cinematic.is-ready');
    assert.equal(await noVideo.locator('canvas').getAttribute('data-frame-source'),'/frames-120');
    const [decodeWidth,decodeHeight]=(await noVideo.locator('canvas').getAttribute('data-decode-size')).split('x').map(Number);
    assert.ok(decodeWidth<=1280,'fallback never decodes above the native source');
    assert.equal(decodeWidth*9,decodeHeight*16,'decoded frames preserve aspect ratio');
    await noVideo.close();
    // One missing fallback frame: accurate percentage, then hold the last valid frame.
    const progressFor=position=>{let lo=0,hi=1;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(getFramePosition(m,'frames')<position)lo=m;else hi=m;}return hi;};
    const failure=await browser.newPage();
    await failure.route('**/frames-120/frame-025.webp',r=>r.abort());
    await failure.goto(`${url}/?timelineDebug=1&source=frames`);await failure.getByRole('button',{name:'Retry loading'}).waitFor();
    assert.equal(await failure.getByRole('progressbar').getAttribute('aria-valuenow'),'99');
    await failure.getByRole('button',{name:'Continue with available frames'}).click();await failure.waitForSelector('.cinematic.is-ready');
    await failure.evaluate(p=>window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),progressFor(22));await sleep(350);
    const valid=await failure.locator('canvas').getAttribute('data-frame');
    await failure.evaluate(p=>window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),progressFor(24.2));await sleep(350);
    // A missing requested frame holds the previous valid source instead of clearing.
    const held=await failure.locator('canvas').getAttribute('data-frame');assert.ok(Number(held)>=Number(valid)&&Number(held)<25);
    await failure.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: video and fallback show the same moments, four scroll lengths, automatic video fallback, accurate failure percentage and last-valid-frame retention. Comparison PNGs: /tmp/portfolio-{video,frames}-*.png');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
