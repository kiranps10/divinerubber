/**
 * Verifies the client typography spec via computed styles (what DevTools shows).
 *   npm run serve (other terminal) → node tools/qa-typography.js
 *
 * P1 paragraphs + bullet points: DM Sans Light (300), 18px, line-height 26px, letter-spacing 0.18px (1%)
 * Eyebrows:      DM Sans, 400, 20px, line-height 21px (105%), letter-spacing 6px (0.3em)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== '404.html');

const P1 = [
  '.section-heading__intro', '.t-lead', '.t-p1', '.prose p:not([class])', '.split__body > p', '.page-banner__text',
  '.cta-band__text', '.hero__lead', '.flip-card__text', '.post-card__text', '.feature-card__text',
  '.focus-card__text', '.cert-card__text', '.video-card__text', '.process__text', '.timeline__text',
  '.project-card__text', '.site-footer__about', '.finder__result-note', '.pd-note', '.filter-empty',
  '.accordion__content p', '.industry-detail__body > p:not([class])', '.machine-card__body > p:not([class])',
  '.facility-feature__text',
  // bullet points
  '.check-list li', '.prose li'
].join(',');
const EYEBROW = '.section-heading__eyebrow, .heading-row__tag, .cta-band__eyebrow, .t-eyebrow, .pd-cat';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const problems = [];
  const counts = { p1: 0, eyebrow: 0 };
  const sample = {};
  for (const width of [1440, 390]) {
    for (const file of pages) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.goto(BASE + file, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const res = await page.evaluate((P1, EYEBROW) => {
        const read = (el) => {
          const cs = getComputedStyle(el);
          return {
            cls: el.className || el.tagName.toLowerCase(),
            family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
            size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing,
            loaded: document.fonts.check(`${cs.fontWeight} ${cs.fontSize} "DM Sans"`)
          };
        };
        const has = (sel) => [...document.querySelectorAll(sel)].filter((el) => !el.closest('.visually-hidden'));
        return { p1: has(P1).map(read), eyebrow: has(EYEBROW).map(read) };
      }, P1, EYEBROW);
      const expect = {
        p1: { family: 'DM Sans', size: '18px', weight: '300', lh: '26px', ls: ['0.18px'] },
        eyebrow: { family: 'DM Sans', size: '20px', weight: '400', lh: '21px', ls: ['6px'] }
      };
      for (const kind of ['p1', 'eyebrow']) {
        for (const r of res[kind]) {
          counts[kind]++;
          const e = expect[kind];
          const bad = [];
          if (r.family !== e.family) bad.push(`family ${r.family}`);
          if (r.size !== e.size) bad.push(`size ${r.size}`);
          if (r.weight !== e.weight) bad.push(`weight ${r.weight}`);
          if (r.lh !== e.lh) bad.push(`line-height ${r.lh}`);
          if (!e.ls.includes(r.ls)) bad.push(`letter-spacing ${r.ls}`);
          if (!r.loaded) bad.push('DM Sans not loaded');
          if (bad.length) problems.push(`${file} @${width} ${kind} .${String(r.cls).split(' ')[0]}: ${bad.join(', ')}`);
          sample[`${kind} @${width}`] = sample[`${kind} @${width}`] || r;
        }
      }
      // Smart Product Finder intro: DM Sans Light 18px, line-height 26px, letter-spacing 1% (0.18px)
      if (file === 'index.html') {
        const f = await page.$eval('#product-finder .section-heading__intro', (el) => {
          const cs = getComputedStyle(el);
          return { family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing };
        });
        console.log(`finder intro @${width}  font-family: ${f.family}; font-size: ${f.size}; font-weight: ${f.weight}; line-height: ${f.lh}; letter-spacing: ${f.ls}`);
        if (f.family !== 'DM Sans' || f.size !== '18px' || f.weight !== '300' || f.lh !== '26px' || f.ls !== '0.18px') problems.push(`index.html @${width} finder intro: ${JSON.stringify(f)}`);
      }
      await page.close();
    }
  }
  await browser.close();
  for (const [k, r] of Object.entries(sample)) {
    console.log(`${k.padEnd(14)} font-family: ${r.family}; font-size: ${r.size}; font-weight: ${r.weight}; line-height: ${r.lh}; letter-spacing: ${r.ls}`);
  }
  console.log(`\nChecked ${counts.p1} P1 paragraphs/bullets and ${counts.eyebrow} eyebrows (${pages.length} pages × 1440 + 390 px).`);
  console.log(problems.length ? `PROBLEMS (${problems.length}):\n  ${[...new Set(problems)].slice(0, 40).join('\n  ')}` : 'All match the typography spec.');
  process.exitCode = problems.length ? 1 : 0;
})();
