/**
 * Verifies the header scroll behaviour on every page.
 *   npm run serve (other terminal) → node tools/qa-header-scroll.js [screenshotDir]
 * Top: original style. Scrolled: background #F6F6F6 + navigation text #000000.
 * Back to top: original style restored. Also checks the logo and layout don't change.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const shots = process.argv[2];
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== '404.html');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const read = (page) => page.evaluate(() => {
  const h = document.querySelector('[data-header]');
  const cs = getComputedStyle(h);
  const link = document.querySelector('.primary-nav__link');
  const phone = document.querySelector('.site-header__phone');
  const logo = document.querySelector('.site-header__logo img');
  const visibleLink = link && getComputedStyle(document.querySelector('.primary-nav')).visibility !== 'hidden' && link.getBoundingClientRect().width > 0;
  return {
    bg: cs.backgroundColor,
    nav: visibleLink ? getComputedStyle(link).color : null,
    phone: getComputedStyle(phone).color,
    toggle: getComputedStyle(document.querySelector('.nav-toggle')).color,
    logoSrc: logo.getAttribute('src'),
    logoW: Math.round(logo.getBoundingClientRect().width),
    navLeft: link ? Math.round(link.getBoundingClientRect().left) : null
  };
});

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const problems = [];
  let checks = 0;
  for (const width of [1440, 390]) {
    for (const file of pages) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.goto(BASE + file, { waitUntil: 'networkidle0' });
      await wait(350);
      const top = await read(page);
      await page.evaluate(() => window.scrollTo(0, 900));
      await wait(500);
      const down = await read(page);
      if (shots && ['index.html', 'product-detail.html'].includes(file)) {
        await (await page.$('[data-header]')).screenshot({ path: `${shots}/header-${file.replace('.html', '')}-${width}-scrolled.png` });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await wait(500);
      const back = await read(page);
      if (shots && ['index.html', 'product-detail.html'].includes(file)) {
        await (await page.$('[data-header]')).screenshot({ path: `${shots}/header-${file.replace('.html', '')}-${width}-top.png` });
      }
      checks++;
      const issues = [];
      if (down.bg !== 'rgb(246, 246, 246)') issues.push(`scrolled bg ${down.bg}`);
      if (down.nav && down.nav !== 'rgb(0, 0, 0)') issues.push(`scrolled nav text ${down.nav}`);
      if (down.phone !== 'rgb(0, 0, 0)') issues.push(`scrolled phone ${down.phone}`);
      if (width < 1200 && down.toggle !== 'rgb(0, 0, 0)') issues.push(`scrolled menu icon ${down.toggle}`);
      if (back.bg !== top.bg || back.nav !== top.nav || back.phone !== top.phone) issues.push(`not restored at top (${back.bg} / ${back.nav})`);
      // Same logo file; when scrolled it is capped (158px desktop / 124px below 1200px) to fit the bar
      const cap = width >= 1200 ? 158 : 124;
      if (top.logoSrc !== down.logoSrc || Math.abs(down.logoW - Math.min(top.logoW, cap)) > 1) issues.push(`logo changed (${top.logoW}→${down.logoW})`);
      if (back.logoW !== top.logoW) issues.push('logo size not restored at top');
      if (top.navLeft !== down.navLeft) issues.push(`nav moved ${top.navLeft}→${down.navLeft}`);
      if (issues.length) problems.push(`${file} @${width}: ${issues.join(', ')}`);
      if (file === 'index.html' && width === 1440) console.log(`index @1440  top: bg ${top.bg}, nav ${top.nav}   scrolled: bg ${down.bg}, nav ${down.nav}   back: bg ${back.bg}, nav ${back.nav}`);
      if (file === 'product-detail.html' && width === 1440) console.log(`product-detail @1440  top: bg ${top.bg}   scrolled: bg ${down.bg}   back: bg ${back.bg}`);

      // Mobile: open menu while scrolled → header must be dark with white text
      if (width === 390 && file === 'index.html') {
        await page.evaluate(() => window.scrollTo(0, 900));
        await wait(400);
        await page.click('[data-nav-toggle]');
        await wait(400);
        const open = await read(page);
        if (open.bg !== 'rgb(35, 38, 45)' || open.toggle !== 'rgb(255, 255, 255)') problems.push(`menu open while scrolled: bg ${open.bg}, icon ${open.toggle} (expected dark/white)`);
        if (shots) await page.screenshot({ path: `${shots}/header-index-390-menu-open.png`, clip: { x: 0, y: await page.evaluate(() => window.scrollY), width, height: 420 } });
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(`\nChecked ${checks} page loads (${pages.length} pages × desktop + mobile).`);
  console.log(problems.length ? `PROBLEMS:\n  ${problems.join('\n  ')}` : 'Header scroll behaviour correct on every page.');
  process.exitCode = problems.length ? 1 : 0;
})();
