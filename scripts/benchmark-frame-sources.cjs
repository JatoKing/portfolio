/* eslint-disable @typescript-eslint/no-require-imports -- standalone browser benchmark */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.argv[2]||'playwright');
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'../reports/frame-upscale.json'),'utf8'));
const url=process.env.PORTFOLIO_URL||'http://localhost:3001';
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);return (sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.floor(sorted.length/2)])/2;};
async function residentBytes(browser){
 const session=await browser.newBrowserCDPSession();
 try{
  const {processInfo}=await session.send('SystemInfo.getProcessInfo');
  const rss=execFileSync('ps',['-o','rss=','-p',processInfo.map(p=>p.id).join(',')],{encoding:'utf8'});
  return rss.trim().split(/\s+/).reduce((sum,n)=>sum+Number(n)*1024,0);
 } finally {await session.detach();}
}
(async()=>{
 const results=[];
 for(const device of ['desktop','mobile'])for(const source of ['original','upscaled'])for(let trial=1;trial<=2;trial++){
  const browser=await chromium.launch({headless:true});
  try{
   const context=await browser.newContext(device==='desktop'?{viewport:{width:1440,height:900},deviceScaleFactor:2}:{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const page=await context.newPage();
   const baselineRSS=await residentBytes(browser);
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   // Redirect requests only in this isolated test browser. Production source
   // selection, asset filenames, frame indices, and timeline code are untouched.
   await page.route('**/ezgif-frame-*.png',route=>route.continue({url:route.request().url().replace(/\/frame-png(?:-upscaled)?\//,source==='upscaled'?'/frame-png-upscaled/':'/frame-png/')}));
   await page.addInitScript(()=>{
    window.__frameBench={started:null,finished:null,bitmaps:[],draws:[],readyAt:null};
    const bench=window.__frameBench;
    const originalFetch=window.fetch;
    window.fetch=function(input,...args){
     if(/\/frame-png(?:-upscaled)?\//.test(String(input))&&bench.started===null)bench.started=performance.now();
     return originalFetch.call(this,input,...args);
    };
    const decode=window.createImageBitmap;
    window.createImageBitmap=async function(blob,...args){
     const start=performance.now();const bitmap=await decode.call(this,blob,...args);
     bench.bitmaps.push({width:bitmap.width,height:bitmap.height,bytes:blob.size,decodeMs:performance.now()-start});
     bench.finished=performance.now();return bitmap;
    };
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(...args){
     const start=performance.now();const result=draw.apply(this,args);
     bench.draws.push(performance.now()-start);return result;
    };
   });
   await page.goto(url);await page.waitForSelector('.cinematic.is-ready',{timeout:90000});
   const ready=await page.evaluate(()=>{window.__frameBench.readyAt=performance.now();return window.__frameBench;});
   assert.equal(ready.bitmaps.length,report.summary.frameCount);
   const [decodedWidth,decodedHeight]=(await page.locator('canvas').getAttribute('data-decode-size')).split('x').map(Number);
   assert.ok(ready.bitmaps.every(b=>b.width===decodedWidth&&b.height===decodedHeight));
   const loadedRSS=await residentBytes(browser);
   // Normal requestAnimationFrame scroll input through the unmodified master engine.
   const motion=await page.evaluate(async()=>{
    window.__frameBench.draws=[];const times=[];let start,previous;
    for(let i=0;i<241;i++){
     const now=await new Promise(requestAnimationFrame);if(start===undefined)start=now;
     if(previous!==undefined)times.push(now-previous);previous=now;
     const p=i<=120?i/120:1-(i-120)/120;
     window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});
    }
    const sorted=[...times].sort((a,b)=>a-b),draws=[...window.__frameBench.draws].sort((a,b)=>a-b);
    return {fps:1000/(times.reduce((a,b)=>a+b,0)/times.length),frameIntervalP95Ms:sorted[Math.floor(sorted.length*.95)],framesOver25ms:times.filter(t=>t>25).length,samples:times.length,drawCount:draws.length,drawSubmissionP95Ms:draws[Math.floor(draws.length*.95)],drawSubmissionMeanMs:draws.reduce((a,b)=>a+b,0)/draws.length};
   });
   await page.waitForTimeout(350);
   assert.equal(await page.locator('canvas').getAttribute('data-frame'),'1');
   const endRSS=await residentBytes(browser);
   // Same exact timeline location for an original/upscaled quality comparison.
   await page.evaluate(()=>window.scrollTo({top:.48*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}));
   await page.waitForTimeout(350);
   assert.equal(await page.locator('canvas').getAttribute('data-frame'),'25');
   if(trial===1){
    const data=await page.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);
    fs.writeFileSync(`/tmp/frame-quality-${device}-${source}.png`,Buffer.from(data,'base64'));
   }
   assert.deepEqual(errors,[]);
   const item={device,source,trial,frameLoadAndDecodeMs:ready.finished-ready.started,sourceBytes:ready.bitmaps.reduce((s,b)=>s+b.bytes,0),decodedRGBABytesEstimate:ready.bitmaps.reduce((s,b)=>s+b.width*b.height*4,0),baselineBrowserRSSBytes:baselineRSS,loadedBrowserRSSBytes:loadedRSS,afterScrollBrowserRSSBytes:endRSS,...motion};
   results.push(item);console.log(JSON.stringify(item));
  }finally{await browser.close();}
 }
 const summaries=[];
 for(const device of ['desktop','mobile'])for(const source of ['original','upscaled']){
  const rows=results.filter(r=>r.device===device&&r.source===source);
  summaries.push({device,source,medianLoadDecodeMs:median(rows.map(r=>r.frameLoadAndDecodeMs)),medianFPS:median(rows.map(r=>r.fps)),medianFrameP95Ms:median(rows.map(r=>r.frameIntervalP95Ms)),medianDrawSubmissionP95Ms:median(rows.map(r=>r.drawSubmissionP95Ms)),medianLoadedRSSIncreaseMiB:median(rows.map(r=>(r.loadedBrowserRSSBytes-r.baselineBrowserRSSBytes)/1048576)),decodedMiB:rows[0].decodedRGBABytesEstimate/1048576,transferOnlySecondsAt20Mbps:rows[0].sourceBytes*8/20e6});
 }
 const result={environment:{platform:os.platform(),architecture:os.arch(),logicalCPUs:os.cpus().length,totalRAMGiB:os.totalmem()/1073741824,browser:'Headless Chromium, production Next.js server, fresh browser/cache per trial'},limitations:['Mobile results emulate viewport, DPR, and touch on this desktop; they are not measurements from a physical phone.','Loading uses localhost, not a real WAN. 20 Mbps figures are transfer-only estimates, excluding protocol, latency, and decoding.','Decoded RGBA memory is a dimensions-based estimate. Browser RSS is the measured aggregate process resident memory, includes unrelated allocations, and excludes some GPU/driver memory.','drawImage timing measures CPU submission, not complete GPU work. RAF frame intervals cover the actual scroll experience.'],results,summaries};
 fs.writeFileSync(path.join(__dirname,'../reports/frame-source-performance.json'),JSON.stringify(result,null,2)+'\n');
 console.log('SUMMARY',JSON.stringify(summaries,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
