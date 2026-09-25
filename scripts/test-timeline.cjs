/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node test */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const code = ts.transpileModule(fs.readFileSync('lib/portfolio-timeline.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const scope = {exports:{}};
vm.runInNewContext(code, scope);
const timeline = scope.exports;
module.exports = timeline;
if (require.main === module) {
  const {chapters, getVideoTime, getFramePosition, chapterStyle, getActiveChapter, getChapterDestination, advanceMaster, frameConfig, sequenceEnd, sourceCut} = timeline;
  assert.equal(getVideoTime(0), 0);
  assert.equal(getVideoTime(1), sequenceEnd);
  // Both sources end on the same source frame: video frame 238 = fallback frame 119.
  assert.equal(getFramePosition(1, 'video'), 238);
  assert.equal(getFramePosition(1, 'frames'), frameConfig.count - 1);
  let previous = -1, cutProgress = null;
  for (let i=0;i<=20000;i++) {
    const p=i/20000, time=getVideoTime(p);
    assert.ok(time>=previous && time>=0 && time<=sequenceEnd, `monotone time at ${p}`);
    assert.ok(time-previous<.004 || i===0, `no boundary jump at ${p}`);
    // Same visual moment for every frame density.
    assert.ok(Math.abs(getFramePosition(p,'video')/24 - getFramePosition(p,'frames')/12) < 1e-9);
    if (cutProgress===null && time>=sourceCut) cutProgress=p;
    const visible=chapters.filter(c=>chapterStyle(p,c).opacity>.001);
    assert.ok(visible.length<=1, `overlapping cues at ${p}`);
    assert.equal(getActiveChapter(p)?.id, visible[0]?.id);
    previous=time;
  }
  // The source's one hard cut must play while no text panel is visible.
  for (let d=-.004; d<=.004; d+=.001) assert.equal(getActiveChapter(cutProgress+d), null, `cut at ${cutProgress} is hidden`);
  for (let i=0;i<chapters.length;i++) {
    const cue=chapters[i];
    assert.equal(chapterStyle(getChapterDestination(cue.id),cue).opacity,1);
    if(i) {
      assert.equal(cue.timeStart, chapters[i-1].timeEnd);
      assert.equal(cue.progressStart,chapters[i-1].progressEnd);
      const middle=(chapters[i-1].exitEnd+cue.start)/2;
      assert.equal(getActiveChapter(middle),null);
    }
  }
  const results=[];
  for (const hz of [30,60,90,120,144]) {
    const dt=1000/hz;
    const state={currentProgress:0,targetProgress:1,lastInputTime:0};
    let t=0,prev=0,reached90;
    while(t<500) {
      t+=dt;state.currentProgress=advanceMaster(state,dt,t,false);
      assert.ok(state.currentProgress>=prev && state.currentProgress<=1);
      if(!reached90 && state.currentProgress>=.9) reached90=t;
      prev=state.currentProgress;
    }
    assert.equal(state.currentProgress,1);
    assert.ok(reached90<=180);
    state.targetProgress=0;state.lastInputTime=t;
    for(let i=0;i<Math.ceil(frameConfig.maxSettleMs/dt)+2;i++) {
      t+=dt;state.currentProgress=advanceMaster(state,dt,t,false);
      assert.ok(state.currentProgress<=prev);prev=state.currentProgress;
    }
    assert.equal(state.currentProgress,0);
    results.push({hz,reach90Ms:Math.round(reached90)});
  }
  assert.equal(advanceMaster({targetProgress:.72,currentProgress:.1,lastInputTime:0},16,16,true),.72);
  console.log(`PASS: 20,001 timeline samples, identical moment for 240/120 frames, source cut hidden at progress ${cutProgress.toFixed(4)}, continuous boundaries, no overlapping sections, all navigation destinations, endpoints, reduced motion, reversal, bounded settling at 30/60/90/120/144 Hz.`, results);
}
