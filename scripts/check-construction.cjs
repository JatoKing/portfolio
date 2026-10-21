/* eslint-disable @typescript-eslint/no-require-imports -- standalone browser verification */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.argv[2] || 'playwright');
const base = process.env.PORTFOLIO_URL || 'http://localhost:3000';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      // Drive the real animation clock to exact loop boundaries, independent of GPU speed.
      const callbacks = new Map(); let id = 0;
      window.requestAnimationFrame = callback => { callbacks.set(++id, callback); return id; };
      window.cancelAnimationFrame = key => callbacks.delete(key);
      window.stepConstruction = time => { const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(fn => fn(time)); };
    });
    const response = await page.goto(`${base}/a-page-under-construction`);
    assert.equal(response.status(), 404);
    await page.waitForSelector('.is-ready');
    await page.addStyleTag({ content: '.construction-canvas { transition: none !important; } nextjs-portal { visibility: hidden !important; }' });
    await page.evaluate(() => window.stepConstruction(1000));
    const first = await page.locator('canvas').screenshot();
    await page.evaluate(() => window.stepConstruction(4000));
    const middle = await page.locator('canvas').screenshot();
    assert.notDeepEqual(first, middle, 'construction activity actually moves');
    await page.evaluate(() => window.stepConstruction(9000));
    const last = await page.locator('canvas').screenshot();
    assert.deepEqual(first, last, 'eight-second loop returns to the identical rendered frame');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    await page.evaluate(() => window.stepConstruction(11000));
    assert.deepEqual(last, await page.locator('canvas').screenshot(), 'pause freezes the complete scene');
    await page.screenshot({ path: '/private/tmp/construction-desktop.png', fullPage: true });
    if (process.env.UPDATE_404_POSTER === '1') {
      const sharp = require('sharp');
      for (const [width, height, filename] of [[2560, 1000, '404-construction'], [390, 1100, '404-construction-portrait']]) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(200);
        await page.locator('.construction-pool-link').evaluate(el => { el.style.visibility = 'hidden'; });
        const plate = await page.locator('canvas').screenshot();
        await sharp(plate).webp({ quality: 90 }).toFile(`public/${filename}.webp`);
        await page.locator('.construction-pool-link').evaluate(el => { el.style.visibility = ''; });
      }
    }
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), 'no page scrolling');
      assert.deepEqual(await page.locator('.construction-page').evaluate(el => ({ width: el.clientWidth, height: el.clientHeight })), viewport, 'scene fills the entire viewport');
      assert.equal(await page.locator('header, footer, main button').count(), 0, 'no header, footer or extra controls');
      assert.equal(await page.locator('main a').count(), 1, 'only the portfolio CTA remains');
      assert.equal(await page.locator('main').evaluate(el => el.innerText.replace(el.querySelector('.sr-only').textContent, '').trim()), 'Back to Portfolio', 'no visible editorial text');
      const link = page.getByRole('link', { name: 'Back to Portfolio', exact: true });
      const bounds = await link.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width && bounds.height >= 44 && bounds.y >= 0 && bounds.y + bounds.height <= viewport.height, 'pool link remains a usable touch target');
      if (viewport.width === 390) await page.screenshot({ path: '/private/tmp/construction-mobile.png', fullPage: true });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForSelector('.is-ready');

    const still = await page.locator('canvas').screenshot();
    await page.evaluate(() => window.stepConstruction(19000));
    assert.deepEqual(still, await page.locator('canvas').screenshot(), 'reduced motion starts with a static scene');
    assert.deepEqual(errors, []);
    await page.getByRole('link', { name: 'Back to Portfolio', exact: true }).click();
    await page.waitForURL(`${base}/`);
    const fallback = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await fallback.goto(`${base}/missing`);
    await fallback.getByRole('link', { name: 'Back to Portfolio', exact: true }).waitFor();
    const poster = await fallback.request.get(`${base}/404-construction.webp`);
    assert.equal(poster.status(), 200, 'static fallback is available without JavaScript or WebGL');
    assert.equal((await fallback.request.get(`${base}/404-construction-portrait.webp`)).status(), 200, 'portrait fallback is available');
    console.log('PASS: true 404 response, moving workers and water, pixel-identical 8-second seam, live reduced-motion toggle, four full-screen layouts without page UI or scrolling, reduced motion, home navigation, static fallback, no runtime errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
