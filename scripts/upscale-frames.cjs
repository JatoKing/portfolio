#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- reproducible offline Node image pipeline */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const inputDirectory = path.join(root, 'public/frame-png');
const outputDirectory = path.join(root, 'public/frame-png-upscaled');
const reportPath = path.join(root, 'reports/frame-upscale.json');
const numeric = new Intl.Collator('en', {numeric:true});
const pipeline = Object.freeze({
  scale: 2,
  // Sharp's lanczos3 upsampling also maps to cubic. Name the actual interpolator.
  resize: {kernel:'cubic', fit:'inside', withoutEnlargement:false},
  sharpen: {sigma:1, m1:.25, m2:.75, x1:2, y2:2, y3:2},
  denoise: false,
  colourAdjustments: false,
  png: {compressionLevel:9, palette:false, adaptiveFiltering:true},
  jpeg: {quality:95, chromaSubsampling:'4:4:4', mozjpeg:true, progressive:true},
});
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const sum = values => values.reduce((a,b)=>a+b,0);
const mean = values => sum(values)/values.length;
const difference = (a,b) => {
  let total=0;for(let i=0;i<a.length;i++)total+=Math.abs(a[i]-b[i]);
  return total/a.length;
};
const fingerprint = hash(Buffer.from(JSON.stringify({pipeline,versions:sharp.versions})));
const imageFiles = async directory => (await fs.readdir(directory)).filter(name=>/\.(jpe?g|png)$/i.test(name)).sort(numeric.compare);
const thumbnail = async input => sharp(input).resize(320,180,{kernel:'lanczos3',fit:'inside'}).removeAlpha().raw().toBuffer();

async function inspect() {
  const names=await imageFiles(inputDirectory);
  if(!names.length)throw new Error('No PNG/JPG frames found in public/frame-png.');
  const frames=[];
  for(const name of names){
    const source=await fs.readFile(path.join(inputDirectory,name));
    const metadata=await sharp(source,{failOn:'warning'}).metadata();
    if(!['png','jpeg'].includes(metadata.format))throw new Error(`${name}: unsupported actual format ${metadata.format}`);
    if(metadata.orientation && metadata.orientation!==1)throw new Error(`${name}: normalize EXIF orientation before using as an animation frame.`);
    if(metadata.space!=='srgb')throw new Error(`${name}: expected consistent sRGB source, received ${metadata.space}.`);
    const expectedFormat=/\.png$/i.test(name)?'png':'jpeg';
    if(metadata.format!==expectedFormat)throw new Error(`${name}: filename extension does not match actual image format.`);
    frames.push({name,width:metadata.width,height:metadata.height,format:metadata.format,bytes:source.length,sha256:hash(source)});
  }
  const dimensions=new Set(frames.map(f=>`${f.width}x${f.height}`));
  if(new Set(frames.map(f=>f.format)).size!==1)throw new Error('Mixed source formats would require different encoders; refusing an inconsistent sequence.');
  if(dimensions.size!==1)throw new Error(`Mixed sequence dimensions: ${[...dimensions].join(', ')}. Refusing inconsistent outputs.`);
  return frames;
}
async function upscale(frame) {
  let image=sharp(path.join(inputDirectory,frame.name),{failOn:'warning'})
    .resize({width:frame.width*pipeline.scale,height:frame.height*pipeline.scale,...pipeline.resize})
    .sharpen(pipeline.sharpen);
  image=frame.format==='png'?image.png(pipeline.png):image.jpeg(pipeline.jpeg);
  const output=await image.toBuffer();
  const temporary=path.join(outputDirectory,`.${frame.name}.${process.pid}.tmp`);
  await fs.writeFile(temporary,output);
  await fs.rename(temporary,path.join(outputDirectory,frame.name));
}
async function verify(frames, previousReport) {
  const names=await imageFiles(outputDirectory);
  if(JSON.stringify(names)!==JSON.stringify(frames.map(f=>f.name)))throw new Error('Output filenames/count/order do not exactly match the source sequence.');
  const results=[], temporal=[];
  let previousSource,previousOutput,previousResidual;
  for(const frame of frames){
    const source=await fs.readFile(path.join(inputDirectory,frame.name));
    if(hash(source)!==frame.sha256)throw new Error(`ORIGINAL CHANGED during processing: ${frame.name}`);
    if(previousReport){
      const expected=previousReport.frames.find(f=>f.name===frame.name);
      if(!expected||expected.sha256!==frame.sha256)throw new Error(`Source no longer matches generation manifest: ${frame.name}`);
    }
    const output=await fs.readFile(path.join(outputDirectory,frame.name));
    const image=sharp(output,{failOn:'warning'});
    const m=await image.metadata();
    if(m.width!==frame.width*2||m.height!==frame.height*2||m.format!==frame.format)throw new Error(`Invalid output dimensions/format: ${frame.name}`);
    if(m.width*frame.height!==m.height*frame.width)throw new Error(`Aspect ratio changed: ${frame.name}`);
    // Full decode (metadata alone does not detect truncated/corrupt pixel data).
    await sharp(source,{failOn:'warning'}).raw().toBuffer();
    await image.raw().toBuffer();
    const sourceSmall=await thumbnail(source),outputSmall=await thumbnail(output);
    const residual=Int16Array.from(outputSmall,(value,index)=>value-sourceSmall[index]);
    const channelShift=[0,1,2].map(channel=>{
      let total=0;for(let p=channel;p<residual.length;p+=3)total+=residual[p];return total/(residual.length/3);
    });
    const outputHash=hash(output);
    if(previousReport&&previousReport.frames.find(f=>f.name===frame.name)?.outputSha256!==outputHash)throw new Error(`Output changed since generation: ${frame.name}`);
    results.push({...frame,outputWidth:m.width,outputHeight:m.height,outputBytes:output.length,outputSha256:outputHash,channelMeanShift:channelShift,thumbnailMAE:difference(sourceSmall,outputSmall)});
    if(previousSource){
      temporal.push({from:results.at(-2).name,to:frame.name,originalMAD:difference(previousSource,sourceSmall),upscaledMAD:difference(previousOutput,outputSmall),processingResidualMAD:difference(previousResidual,residual)});
    }
    previousSource=sourceSmall;previousOutput=outputSmall;previousResidual=residual;
  }
  const worstColourShift=Math.max(...results.flatMap(f=>f.channelMeanShift.map(Math.abs)));
  const worstTemporalResidual=Math.max(0,...temporal.map(p=>p.processingResidualMAD));
  // These are regression guards, not a claim that numeric tests prove no flicker.
  if(worstColourShift>.5||worstTemporalResidual>1)throw new Error(`Unexpected colour/temporal drift: ${worstColourShift}, ${worstTemporalResidual}`);
  return {frames:results,temporal,summary:{
    frameCount:frames.length,sourceDimensions:[frames[0].width,frames[0].height],outputDimensions:[frames[0].width*2,frames[0].height*2],aspectRatio:frames[0].width/frames[0].height,
    originalBytes:sum(results.map(f=>f.bytes)),upscaledBytes:sum(results.map(f=>f.outputBytes)),
    sourceDecodedRGBABytes:sum(results.map(f=>f.width*f.height*4)),upscaledDecodedRGBABytes:sum(results.map(f=>f.outputWidth*f.outputHeight*4)),
    meanThumbnailMAE:mean(results.map(f=>f.thumbnailMAE)),worstChannelMeanShift:worstColourShift,worstTemporalResidualMAD:worstTemporalResidual,
    sourceHashesUnchanged:true,allOutputsFullyDecoded:true,filenamesAndOrderingPreserved:true,
  }};
}
async function main(){
  if(process.argv.slice(2).some(arg=>arg!=='--verify-only'))throw new Error('Usage: node scripts/upscale-frames.cjs [--verify-only]');
  sharp.cache({memory:64,files:0,items:32});
  sharp.concurrency(2);
  const frames=await inspect();
  const verifyOnly=process.argv.includes('--verify-only');
  const timelinePath=path.join(root,'lib/portfolio-timeline.ts');
  const timelineHash=hash(await fs.readFile(timelinePath));
  console.log(`${frames.length} ${frames[0].format.toUpperCase()} frames; ${frames[0].width} × ${frames[0].height}; ${(sum(frames.map(f=>f.bytes))/1e6).toFixed(2)} MB.`);
  let previousReport;
  if(verifyOnly){
    previousReport=JSON.parse(await fs.readFile(reportPath,'utf8'));
    if(previousReport.pipelineFingerprint!==fingerprint)throw new Error('Pipeline or Sharp/libvips version changed since generation; regenerate before verifying.');
  } else {
    await fs.mkdir(outputDirectory,{recursive:true});
    if((await fs.lstat(outputDirectory)).isSymbolicLink() || await fs.realpath(outputDirectory)===await fs.realpath(inputDirectory))throw new Error('Output must be a separate real directory, never an alias of the originals.');
    const failures=[];
    console.log('Upscaling every frame with the same 2× cubic + mild luminance-sharpen pipeline...');
    for(let i=0;i<frames.length;i++){
      const label=`[${String(i+1).padStart(2,'0')}/${frames.length}] ${frames[i].name}`;
      try{await upscale(frames[i]);console.log(`${label} ✓`);}
      catch(error){failures.push(`${frames[i].name}: ${error.message}`);console.error(`${label} FAILED: ${error.message}`);}
    }
    if(failures.length)throw new Error(`${failures.length} processing failures:\n${failures.join('\n')}`);
  }
  const result=await verify(frames,previousReport);
  if(hash(await fs.readFile(timelinePath))!==timelineHash)throw new Error('Timeline changed during the run.');
  if(!verifyOnly){
    await fs.mkdir(path.dirname(reportPath),{recursive:true});
    await fs.writeFile(reportPath,JSON.stringify({pipeline,pipelineFingerprint:fingerprint,versions:sharp.versions,timelineSha256:timelineHash,...result},null,2)+'\n');
  }
  console.log('Verified: every frame fully decodes; exact filenames/order, 2× dimensions, aspect ratio, and original hashes preserved.');
  console.log(JSON.stringify(result.summary,null,2));
}
main().catch(error=>{console.error(`Upscaling failed: ${error.message}`);process.exitCode=1;});
