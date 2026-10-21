import * as THREE from "three";

type Basin = { x: number; z: number; w: number; d: number };

/** Continuous, gently graded ground with an opening for the inset basin. */
export function createTerrain(basin: Basin) {
  const extent = 24;
  const heightAt = (x: number, z: number) => {
    const outsideWorkArea = THREE.MathUtils.smoothstep(Math.hypot(x / 7, z / 5), 1, 2);
    return .335 + Math.sin(x * 2.3) * Math.sin(z * 2.7) * .006
      + outsideWorkArea * (.055 * Math.sin(x * .8 + z * .4) + .028 * Math.cos(z * 1.3));
  };
  const xs = Array.from({ length: 193 }, (_, i) => -extent + i * .25);
  const zs = [...xs];
  xs.push(basin.x - basin.w / 2, basin.x + basin.w / 2);
  zs.push(basin.z - basin.d / 2, basin.z + basin.d / 2);
  const unique = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);
  const gridX = unique(xs), gridZ = unique(zs);
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  for (const z of gridZ) for (const x of gridX) {
    positions.push(x, heightAt(x, z), z);
    uv.push(x / (extent * 2) + .5, .5 - z / (extent * 2));
  }
  for (let j = 0; j < gridZ.length - 1; j++) for (let i = 0; i < gridX.length - 1; i++) {
    const x = (gridX[i] + gridX[i + 1]) / 2, z = (gridZ[j] + gridZ[j + 1]) / 2;
    if (Math.abs(x - basin.x) < basin.w / 2 && Math.abs(z - basin.z) < basin.d / 2) continue;
    const a = j * gridX.length + i, b = a + 1, c = a + gridX.length, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();

  // Deterministic granular soil, broad compacted patches and subtle track impressions.
  let seed = 404;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const noise = Array.from({ length: 4096 }, random);
  const smoothNoise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const u = x - ix, v = y - iy, sx = u * u * (3 - 2 * u), sy = v * v * (3 - 2 * v);
    const sample = (dx: number, dy: number) => noise[((ix + dx) & 63) + (((iy + dy) & 63) * 64)];
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(sample(0, 0), sample(1, 0), sx), THREE.MathUtils.lerp(sample(0, 1), sample(1, 1), sx), sy);
  };
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;
  const pixels = ctx.createImageData(2048, 2048);
  for (let py = 0; py < 2048; py++) for (let px = 0; px < 2048; px++) {
    const x = (px / 2048 - .5) * 48, z = (py / 2048 - .5) * 48;
    const broad = smoothNoise(px / 105, py / 105);
    const fine = smoothNoise(px / 8, py / 8);
    const boundary = Math.hypot(x / 24, z / 23) + (broad - .5) * .15;
    const soil = 1 - THREE.MathUtils.smoothstep(boundary, 1.1, 1.85);
    const variation = (broad - .5) * 15 + (fine - .5) * 7 + (random() - .5) * 12;
    const offset = (py * 2048 + px) * 4;
    for (let channel = 0; channel < 3; channel++) {
      pixels.data[offset + channel] = THREE.MathUtils.lerp([246, 247, 247][channel], [188, 169, 144][channel] + variation, soil);
    }
    pixels.data[offset + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const scale = 2048 / 48;
  const point = (x: number, z: number) => [(x + 24) * scale, (z + 24) * scale];
  ctx.lineCap = "round";
  for (const side of [-1, 1]) for (const offset of [-.27, .27]) {
    ctx.strokeStyle = "rgba(123, 108, 86, .12)"; ctx.lineWidth = .1 * scale;
    ctx.beginPath();
    for (let n = 0; n <= 100; n++) {
      const z = -5.7 + n * .112;
      const x = side * (6.05 + Math.sin(z * .32) * .38) + offset;
      const [px, py] = point(x, z); if (!n) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (let n = 0; n < 70; n++) {
      const z = -5.7 + n * .16;
      const x = side * (6.05 + Math.sin(z * .32) * .38) + offset;
      const [px, py] = point(x, z);
      ctx.strokeStyle = "rgba(123, 108, 86, .14)"; ctx.lineWidth = .025 * scale;
      ctx.beginPath(); ctx.moveTo(px - .065 * scale, py - .035 * scale); ctx.lineTo(px + .065 * scale, py + .035 * scale); ctx.stroke();
    }
  }
  // Worn paths connect the secondary plots; keep the central basin approach clear.
  for (const route of [[[-8.5, -4.5], [-6.1, -5.3], [-3.1, -6]], [[5.8, 1.8], [7.1, 3.8], [6.1, 7.1]], [[-7.2, 2.2], [-6.3, 4.7], [-4.6, 7.5]]]) {
    ctx.strokeStyle = "rgba(218, 205, 183, .26)"; ctx.lineWidth = .42 * scale;
    ctx.beginPath();
    const [start, control, end] = route.map(([x, z]) => point(x, z));
    ctx.moveTo(...start as [number, number]); ctx.quadraticCurveTo(...control as [number, number], ...end as [number, number]); ctx.stroke();
    for (let i = 1; i < 27; i++) {
      const t = i / 28, inverse = 1 - t;
      const px = inverse * inverse * start[0] + 2 * inverse * t * control[0] + t * t * end[0];
      const py = inverse * inverse * start[1] + 2 * inverse * t * control[1] + t * t * end[1];
      ctx.fillStyle = "rgba(125, 109, 87, .12)";
      ctx.beginPath(); ctx.ellipse(px + (i % 2 ? 1 : -1) * .07 * scale, py, .026 * scale, .061 * scale, -.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Faint chalk setting-out marks identify the smaller building plots.
  ctx.strokeStyle = "rgba(244, 236, 220, .6)"; ctx.lineWidth = .026 * scale;
  for (const [x, z, w, d] of [[-7, -6, 3.1, 2.5], [8.5, 1.55, 2.7, 2.2], [3.55, -7.15, 3, 2.55]]) {
    const [px, py] = point(x - w / 2, z - d / 2);
    ctx.strokeRect(px, py, w * scale, d * scale);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, bumpScale: .075, roughness: 1, metalness: 0 });
  const terrain = new THREE.Mesh(geometry, material); terrain.receiveShadow = true;

  const gravelGeometry = new THREE.IcosahedronGeometry(1, 1);
  const gravelMaterial = new THREE.MeshStandardMaterial({ color: 0xb7ab98, roughness: 1 });
  const gravel = new THREE.InstancedMesh(gravelGeometry, gravelMaterial, 110);
  gravel.castShadow = true; gravel.receiveShadow = true;
  const transform = new THREE.Object3D();
  for (let i = 0; i < 110; i++) {
    let x = (random() - .5) * 15, z = (random() - .5) * 11.5;
    if (Math.abs(x - basin.x) < basin.w / 2 + .3 && Math.abs(z - basin.z) < basin.d / 2 + .3) { x = -6.8 + random(); z = 3 + random(); }
    const size = .018 + random() * .035;
    transform.position.set(x, heightAt(x, z) + size * .24, z);
    transform.scale.set(size * 1.5, size * .6, size);
    transform.rotation.set(random(), random() * Math.PI, random()); transform.updateMatrix(); gravel.setMatrixAt(i, transform.matrix);
  }
  gravel.instanceMatrix.needsUpdate = true;
  return { terrain, gravel, geometries: [geometry, gravelGeometry], materials: [material, gravelMaterial], texture };
}
