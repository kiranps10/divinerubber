/**
 * Measures the vertical centring of the header logo (visible oval, not just the image box)
 * against the header bar and the navigation text, in default and scrolled states.
 *   npm run serve (other terminal) → node tools/qa-logo-align.js [screenshotDir]
 */
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// Visible (non-transparent) area of assets/images/brand/divine-logo-424.webp (424×172)
const VISIBLE = { top: 11, bottom: 156, height: 172 };
const TOLERANCE = 1; // px
const shots = process.argv[2];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const measure = (page) => page.evaluate((V) => {
  const inner = document.querySelector('.site-header__inner').getBoundingClientRect();
  const img = document.querySelector('.site-header__logo img').getBoundingClientRect();
  const scale = img.height / V.height;
  const ovalTop = img.top + V.top * scale;
  const ovalBottom = img.top + (V.bottom + 1) * scale;
  const link = document.querySelector('.primary-nav__link');
  let navCenter = null;
  if (link && link.getBoundingClientRect().width && getComputedStyle(document.querySelector('.primary-nav')).visibility !== 'hidden') {
    const range = document.createRange();
    range.selectNodeContents(link);
    const r = range.getBoundingClientRect();
    navCenter = (r.top + r.bottom) / 2;
  }
  const actions = document.querySelector('.site-header__actions').getBoundingClientRect();
  return {
    headerH: Math.round(inner.height * 10) / 10,
    headerCenter: (inner.top + inner.bottom) / 2,
    imgW: Math.round(img.width * 10) / 10,
    imgH: Math.round(img.height * 10) / 10,
    ovalCenter: (ovalTop + ovalBottom) / 2,
    ovalTop, ovalBottom, innerTop: inner.top, innerBottom: inner.bottom,
    navCenter,
    actionsCenter: (actions.top + actions.bottom) / 2
  };
}, VISIBLE);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const problems = [];
  for (const [file, width] of [['index.html', 1920], ['index.html', 1440], ['product-detail.html', 1440], ['index.html', 1024], ['index.html', 390]]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
    await page.goto(BASE + file, { waitUntil: 'networkidle0' });
    for (const state of ['default', 'scrolled']) {
      await page.evaluate((s) => window.scrollTo(0, s === 'scrolled' ? 900 : 0), state);
      await wait(600);
      const m = await measure(page);
      const offHeader = m.ovalCenter - m.headerCenter;
      const offNav = m.navCenter === null ? null : m.ovalCenter - m.navCenter;
      const clipped = m.ovalTop < m.innerTop - 0.5 || m.ovalBottom > m.innerBottom + 0.5;
      console.log(`${file.padEnd(20)} @${String(width).padEnd(5)} ${state.padEnd(9)} header ${m.headerH}px  logo ${m.imgW}×${m.imgH}  oval-vs-header ${offHeader.toFixed(1)}px  oval-vs-nav ${offNav === null ? 'n/a (menu collapsed)' : offNav.toFixed(1) + 'px'}${clipped ? '  CLIPPED' : ''}`);
      if (Math.abs(offHeader) > TOLERANCE) problems.push(`${file} @${width} ${state}: logo ${offHeader.toFixed(1)}px off header centre`);
      if (offNav !== null && Math.abs(offNav) > TOLERANCE) problems.push(`${file} @${width} ${state}: logo ${offNav.toFixed(1)}px off nav text`);
      if (clipped) problems.push(`${file} @${width} ${state}: logo clipped`);
      if (shots && file === 'index.html' && (width === 1440 || width === 390)) {
        await (await page.$('.site-header__inner')).screenshot({ path: `${shots}/logo-${width}-${state}.png` });
      }
    }
    await page.close();
  }
  await browser.close();
  console.log(problems.length ? `\nPROBLEMS:\n  ${problems.join('\n  ')}` : '\nLogo centred (±1px) in both header states at all sizes.');
  process.exitCode = problems.length ? 1 : 0;
})();
