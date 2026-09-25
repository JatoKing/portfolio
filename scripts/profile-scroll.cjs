/* eslint-disable @typescript-eslint/no-require-imports -- standalone Chromium profiler */
// Run against a production server. Variants isolate canvas, UI, DPR, and source costs.
const fs=require('fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.argv[2]||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});const results=[];
 try{
 for(const variant of (process.env.VARIANTS||'normal').split(',')){
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:variant==='dpr1'?1:2});
  const page=await context.newPage();
  if(variant==='original')await page.route('**/frame-png-upscaled/**',r=>r.continue({url:r.request().url().replace('/frame-png-upscaled/','/frame-png/')}));
  if(variant==='sized')await page.addInitScript(()=>{const decode=window.createImageBitmap;window.createImageBitmap=(blob)=>decode(blob,{resizeWidth:1920,resizeHeight:1080,resizeQuality:'high'});});
  await page.addInitScript(()=>{window.__profile={long:[],decodes:0};new PerformanceObserver(l=>window.__profile.long.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});const decode=window.createImageBitmap;window.createImageBitmap=async(...args)=>{const b=await decode(...args);window.__profile.decodes++;return b;};});
  await page.goto(process.env.PORTFOLIO_URL||'http://localhost:3001');await page.waitForSelector('.cinematic.is-ready',{timeout:90000});await page.waitForTimeout(800);
  if(variant==='noCanvas')await page.evaluate(()=>{CanvasRenderingContext2D.prototype.drawImage=()=>{};CanvasRenderingContext2D.prototype.fillRect=()=>{};});
  if(variant==='low'||variant==='medium'||variant==='sized')await page.evaluate(quality=>{const ctx=document.querySelector('canvas').getContext('2d');const set=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'imageSmoothingQuality').set;Object.defineProperty(ctx,'imageSmoothingQuality',{get:()=>quality,set(){set.call(ctx,quality);}});},variant==='sized'?'low':variant);
  if(variant==='noPanels')await page.addStyleTag({content:'.portfolio-panels,.portfolio-nav,.scene-footer,.chapter-rail{display:none!important}'});
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  const before=await cdp.send('Performance.getMetrics');
  const trace=[];cdp.on('Tracing.dataCollected',e=>trace.push(...e.value));
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8',options:'record-as-much-as-possible'});
  const result=await page.evaluate(async()=>{
   const times=[],mutations={};let previous;
   const observer=new MutationObserver(records=>records.forEach(r=>{const key=r.type==='attributes'?r.attributeName:r.type;mutations[key]=(mutations[key]||0)+1;}));observer.observe(document.querySelector('.cinematic'),{subtree:true,attributes:true,childList:true,characterData:true});
   const start=performance.now(),decodes=window.__profile.decodes;window.__profile.long=[];
   for(let i=0;i<181;i++){const now=await new Promise(requestAnimationFrame);if(previous!==undefined)times.push(now-previous);previous=now;window.scrollTo({top:(i<=90?i/90:1-(i-90)/90)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});}
   observer.disconnect();const sorted=[...times].sort((a,b)=>a-b);
   return {start,elapsed:performance.now()-start,fps:1000/(times.reduce((a,b)=>a+b)/times.length),p95:sorted[Math.floor(sorted.length*.95)],over25:times.filter(t=>t>25).length,mutations,longTasks:window.__profile.long,decodesDuringScroll:window.__profile.decodes-decodes,canvas:document.querySelector('canvas').width+'x'+document.querySelector('canvas').height};
  });
  const after=await cdp.send('Performance.getMetrics');const end=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await end;
  result.metrics={};for(const name of ['LayoutCount','RecalcStyleCount','LayoutDuration','RecalcStyleDuration','ScriptDuration','TaskDuration','JSHeapUsedSize'])result.metrics[name]=after.metrics.find(m=>m.name===name).value-before.metrics.find(m=>m.name===name).value;
  result.trace={};for(const e of trace)if(e.ph==='X'&&(/Layout|Paint|Raster|GC|Decode|UpdateLayer/.test(e.name))){const s=result.trace[e.name]||{count:0,totalMs:0,maxMs:0};s.count++;s.totalMs+=(e.dur||0)/1000;s.maxMs=Math.max(s.maxMs,(e.dur||0)/1000);result.trace[e.name]=s;}
  await page.evaluate(()=>window.scrollTo({top:.48*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}));await page.waitForTimeout(400);const png=await page.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);fs.writeFileSync('/tmp/scroll-quality-'+variant+'.png',Buffer.from(png,'base64'));
  results.push({variant,...result});console.log(JSON.stringify({...results.at(-1),longTasks:result.longTasks.length}));await context.close();
 }
 }finally{await browser.close();}
 fs.writeFileSync(process.env.REPORT||'reports/scroll-profile-latest.json',JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
