/**
 * Automated accessibility audit (WCAG 2.1 A + AA) with axe-core in headless Chrome.
 *   npm run serve   (in another terminal)
 *   node tools/qa-a11y.js [page1.html,page2.html]
 * Automated tools catch roughly a third to a half of accessibility issues —
 * keyboard and screen-reader checks by a person are still needed.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const pages = process.argv[2] ? process.argv[2].split(',') : fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  let total = 0;
  for (const file of pages) {
    for (const width of [1440, 390]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.goto(BASE + file, { waitUntil: 'networkidle0' });
      await page.evaluate(AXE);
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) , count: v.nodes.length }));
      });
      total += res.length;
      console.log(`${res.length ? 'ISSUES' : 'ok    '} ${file} @ ${width}`);
      res.forEach((v) => console.log(`        - [${v.impact}] ${v.id}: ${v.help} (${v.count}) ${v.nodes.join(' | ')}`));
      await page.close();
    }
  }
  await browser.close();
  console.log(`\n${total} accessibility rule violation(s).`);
  process.exitCode = total ? 1 : 0;
})();
