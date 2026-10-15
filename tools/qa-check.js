/**
 * Automated browser QA using your installed Chrome (headless).
 *   npm run serve            (in one terminal)
 *   node tools/qa-check.js [outDir] [page1.html,page2.html] [widths] [--zoom]
 *
 * For every page × width it reports:
 *  - console errors / page exceptions
 *  - failed network requests (404s, broken images, fonts…)
 *  - horizontal overflow (and which elements cause it)
 *  - images without alt or that failed to load
 * and saves a full-page screenshot to outDir.
 * --zoom simulates browser zoom 75–150% at 1440px by scaling the device pixel ratio + viewport.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = path.resolve(process.argv[2] || 'qa-screens');
const ROOT = path.resolve(__dirname, '..');
const pages = process.argv[3] && process.argv[3] !== 'all'
  ? process.argv[3].split(',')
  : fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const widths = (process.argv[4] || '1920,1366,1024,768,390').split(',').map(Number);
const zoomMode = process.argv.includes('--zoom');
const shots = !process.argv.includes('--no-shots');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
  const report = [];

  const runs = zoomMode
    ? [0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5].map((z) => ({ label: `zoom${Math.round(z * 100)}`, width: Math.round(1440 / z), height: Math.round(900 / z), dpr: z }))
    : widths.map((w) => ({ label: `${w}`, width: w, height: w < 800 ? 844 : 900, dpr: 1 }));

  for (const page of pages) {
    for (const run of runs) {
      const tab = await browser.newPage();
      const issues = [];
      tab.on('console', (m) => m.type() === 'error' && issues.push(`console: ${m.text()}`));
      tab.on('pageerror', (e) => issues.push(`exception: ${e.message}`));
      tab.on('requestfailed', (r) => issues.push(`failed: ${r.url()} (${r.failure()?.errorText})`));
      tab.on('response', (r) => r.status() >= 400 && !r.url().endsWith('send-enquiry.php') && issues.push(`HTTP ${r.status()}: ${r.url()}`));

      await tab.setViewport({ width: run.width, height: run.height, deviceScaleFactor: run.dpr });
      await tab.goto(BASE + page, { waitUntil: 'networkidle0', timeout: 60000 });
      // Scroll through the page, then force-load lazy images (incl. ones in
      // horizontal sliders) so screenshots are complete and failures are caught
      await tab.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
        await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
      });
      await new Promise((r) => setTimeout(r, 600));

      const result = await tab.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth > vw + 1;
        const culprits = [];
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > vw + 1 || r.left < -1)) {
            // ignore children of horizontally scrollable containers & visually hidden
            let p = el.parentElement;
            let inScroller = false;
            while (p) {
              const s = getComputedStyle(p);
              if (['auto', 'scroll', 'hidden', 'clip'].includes(s.overflowX) && p !== document.body && p !== document.documentElement) { inScroller = true; break; }
              p = p.parentElement;
            }
            if (!inScroller && getComputedStyle(el).position !== 'fixed') culprits.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(r.left)}→${Math.round(r.right)})`);
          }
        });
        const badImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map((i) => i.currentSrc || i.src);
        const noAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src);
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
        const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
        // Broken template / replace artefacts visible to visitors
        const junk = (document.body.innerText.match(/\$\d|\bundefined\b|\bNaN\b|\[object Object\]/g) || []);
        return { overflow, culprits: culprits.slice(0, 8), badImgs, noAlt, dupIds, junk, height: document.body.scrollHeight };
      });

      if (result.overflow) issues.push(`HORIZONTAL OVERFLOW: ${result.culprits.join(', ')}`);
      result.badImgs.forEach((s) => issues.push(`image not loaded: ${s}`));
      result.noAlt.forEach((s) => issues.push(`image missing alt: ${s}`));
      result.dupIds.forEach((s) => issues.push(`duplicate id: ${s}`));
      result.junk.forEach((s) => issues.push(`suspicious text on page: "${s}"`));

      if (shots) {
        const file = path.join(outDir, `${page.replace('.html', '')}-${run.label}.png`);
        await tab.screenshot({ path: file, fullPage: true });
      }
      report.push({ page, run: run.label, issues: [...new Set(issues)] });
      await tab.close();
    }
  }
  await browser.close();

  let problems = 0;
  for (const r of report) {
    const status = r.issues.length ? 'ISSUES' : 'ok';
    console.log(`${status.padEnd(6)} ${r.page} @ ${r.run}`);
    r.issues.forEach((i) => console.log(`        - ${i}`));
    problems += r.issues.length;
  }
  console.log(`\n${report.length} checks, ${problems} issue(s). Screenshots: ${outDir}`);
  process.exitCode = problems ? 1 : 0;
})();
