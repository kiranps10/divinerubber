/**
 * Verifies the client arrow SVG on every gradient (.btn--primary) button.
 *   npm run serve  (other terminal)  →  node tools/qa-cta-arrow.js
 * Checks per button: SVG loaded, 21×21, inside the button (no clipping),
 * no overlap with the label, label on one line, no horizontal page overflow.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  let total = 0;
  const problems = [];
  for (const width of [1440, 768, 390]) {
    for (const file of pages) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.goto(BASE + file, { waitUntil: 'networkidle0' });
      // Flip cards (desktop): buttons are on the back face, which is mirrored until the
      // card turns — show every back face so the measurements are the real layout
      await page.addStyleTag({ content: '.flip-card__inner{transform:rotateY(180deg)!important;transition:none!important}' });
      // Show hidden containers (mobile drawer, finder steps) only for measuring is unnecessary:
      // we measure buttons that are rendered; hidden ones are checked for load state only.
      const res = await page.evaluate(() => [...document.querySelectorAll('.btn--primary')].map((btn) => {
        const img = btn.querySelector('.btn__icon img');
        const label = [...btn.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
        if (!img) return { label, error: 'no arrow-1.svg image' };
        const visible = btn.offsetParent !== null;
        const b = btn.getBoundingClientRect();
        const i = img.getBoundingClientRect();
        const range = document.createRange();
        const textNode = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        let textRight = 0, lines = 1;
        if (textNode) {
          range.selectNodeContents(textNode);
          const rects = [...range.getClientRects()].filter((r) => r.width > 0);
          textRight = Math.max(...rects.map((r) => r.right));
          lines = new Set(rects.map((r) => Math.round(r.top))).size;
        }
        return {
          label, visible,
          src: img.getAttribute('src'),
          loaded: img.complete && img.naturalWidth > 0,
          size: `${Math.round(i.width)}x${Math.round(i.height)}`,
          inside: !visible || (i.left >= b.left - 0.5 && i.right <= b.right + 0.5 && i.top >= b.top - 0.5 && i.bottom <= b.bottom + 0.5),
          noOverlap: !visible || i.left >= textRight + 4,
          lines
        };
      }));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) problems.push(`${file} @${width}: horizontal page overflow`);
      for (const r of res) {
        total++;
        const issues = [];
        if (r.error) issues.push(r.error);
        else {
          if (!r.loaded) issues.push(`SVG not loaded (${r.src})`);
          if (r.visible && r.size !== '21x21') issues.push(`size ${r.size}`);
          if (!r.inside) issues.push('arrow clipped / outside button');
          if (!r.noOverlap) issues.push('arrow overlaps label');
          if (r.visible && r.lines > 1) issues.push(`label wraps to ${r.lines} lines`);
        }
        if (issues.length) problems.push(`${file} @${width} "${r.label}": ${issues.join(', ')}`);
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(`Checked ${total} gradient buttons (22 pages × 1440 / 768 / 390 px).`);
  console.log(problems.length ? `PROBLEMS:\n  ${problems.join('\n  ')}` : 'All arrows loaded, 21×21, inside the button, no overlap, no wrapping.');
  process.exitCode = problems.length ? 1 : 0;
})();
