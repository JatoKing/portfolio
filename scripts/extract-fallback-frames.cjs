/* eslint-disable @typescript-eslint/no-require-imports -- standalone asset script */
// Rebuilds public/frames-120 (every 2nd frame of the all-intra video) by decoding the
// video in Chromium itself, so the fallback frames match the browser's video colours.
// Requires the dev server running; optional argv[2] is an external Playwright install.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.argv[2] || 'playwright');
const url = process.env.PORTFOLIO_URL || 'http://localhost:3000';
const out = path.join(__dirname, '../public/frames-120');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${url}/cast-and-render.html`).catch(() => {});
    await page.evaluate(async () => {
      const video = document.createElement('video');
      video.muted = true;
      video.src = '/video/avatar-intra.mp4';
      await new Promise(resolve => video.addEventListener('loadeddata', resolve, { once: true }));
      const canvas = document.createElement('canvas');
      canvas.width = 1280; canvas.height = 720;
      Object.assign(window, { __video: video, __canvas: canvas });
    });
    let bytes = 0;
    for (let k = 0; k < 120; k++) {
      const png = await page.evaluate(async k => {
        const video = window.__video, canvas = window.__canvas;
        video.currentTime = (2 * k + .5) / 24; // middle of source frame 2k
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/png').split(',')[1];
      }, k);
      const webp = await sharp(Buffer.from(png, 'base64')).removeAlpha().webp({ quality: 92, effort: 6 }).toBuffer();
      bytes += webp.length;
      fs.writeFileSync(path.join(out, `frame-${String(k + 1).padStart(3, '0')}.webp`), webp);
    }
    console.log(`Wrote 120 frames (${(bytes / 1048576).toFixed(2)} MiB) to public/frames-120`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
