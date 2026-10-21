/* eslint-disable @typescript-eslint/no-require-imports -- standalone rig checks */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve('components/not-found/construction-workers.ts');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(path.dirname(filename));
compiled._compile(source, filename);
const crew = compiled.exports.createConstructionWorkers();
const workers = crew.group.children;
assert.equal(workers.length, 16);
assert.equal(new Set(workers.map(worker => worker.name)).size, 16, 'individual identities');
assert.equal(new Set(workers.map(worker => worker.userData.task)).size, 16, 'distinct task choreography');
assert.equal(new Set(workers.map(worker => worker.scale.toArray().join(','))).size, 16, 'distinct builds and heights');
const poses = [];
const feet = new Map();
for (let sample = 0; sample <= 160; sample++) {
  crew.update(sample / 160 * Math.PI * 2);
  crew.group.updateMatrixWorld(true);
  const pose = [];
  for (const worker of workers) {
    worker.traverse(part => { pose.push(...part.matrixWorld.elements); });
    for (const side of ['left', 'right']) {
      const foot = worker.getObjectByName(`${side}-boot`);
      const key = `${worker.name}-${side}`;
      if (!sample) feet.set(key, foot.position.clone());
      if (!['plank-walk', 'site-walk'].includes(worker.userData.task)) {
        assert.ok(foot.position.distanceTo(feet.get(key)) < 1e-10, 'stationary feet remain planted while the upper body works');
      }
      assert.ok(foot.position.y >= .024 - 1e-10, 'walking feet do not penetrate the ground');
    }
    if (worker.userData.task === 'plank-walk') {
      const plank = worker.getObjectByName('held-material');
      for (const side of ['left', 'right']) {
        const hand = worker.getObjectByName(`${side}-hand`);
        assert.ok(Math.abs(hand.position.y - plank.position.y) < .02, 'carrier hands remain at plank height');
        assert.ok(Math.abs(hand.position.z - plank.position.z) < .02, 'carrier hands stay in contact with plank');
      }
    }
  }
  assert.ok(pose.every(Number.isFinite), 'stable finite transforms at every sample');
  poses.push(pose);
}
assert.ok(poses[0].every((value, i) => Math.abs(value - poses[160][i]) < 1e-9), 'every body part and tool returns seamlessly after eight seconds');
assert.ok(poses[0].some((value, i) => Math.abs(value - poses[60][i]) > .02), 'animation actually changes the poses');
crew.geometries.forEach(g => g.dispose()); crew.materials.forEach(m => m.dispose());
console.log('PASS: 16 unique identities, builds and tasks; 161 sampled poses; planted feet; plank contact; finite transforms; seamless eight-second cycle.');
