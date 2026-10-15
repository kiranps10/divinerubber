/**
 * Automated interaction tests in headless Chrome.
 *   npm run serve   (in another terminal)
 *   node tools/qa-interactions.js
 * Prints PASS/FAIL for each behaviour.
 */
const puppeteer = require('puppeteer-core');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: Boolean(ok), info });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/send-enquiry\.php/.test(m.text()) && !m.text().includes('404') && errors.push(m.text()));

  // ---------- Desktop navigation ----------
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle0' });
  await page.click('[aria-controls="submenu-products"]');
  await wait(400); // let the fade-in transition finish
  check('Desktop dropdown opens on click', await page.$eval('#submenu-products', (el) => getComputedStyle(el).visibility === 'visible'));
  check('Dropdown toggle sets aria-expanded', await page.$eval('[aria-controls="submenu-products"]', (b) => b.getAttribute('aria-expanded') === 'true'));
  await page.keyboard.press('Escape');
  await wait(400);
  check('Escape closes dropdown', await page.$eval('#submenu-products', (el) => getComputedStyle(el).visibility === 'hidden'));

  await page.evaluate(() => window.scrollTo(0, 800));
  await wait(300);
  check('Header turns solid on scroll', await page.$eval('[data-header]', (h) => h.classList.contains('is-scrolled')));

  // ---------- Hero slider ----------
  await page.evaluate(() => window.scrollTo(0, 0));
  const before = await page.$eval('[data-hero-next-name]', (e) => e.textContent);
  await page.click('[data-hero-next]');
  await wait(300);
  const after = await page.$eval('[data-hero-next-name]', (e) => e.textContent);
  check('Hero "Next Product" advances slide', before !== after, `${before} → ${after}`);
  await page.click('[data-hero-pause]');
  check('Hero pause button pauses', await page.$eval('[data-hero]', (h) => h.classList.contains('is-paused')));

  // ---------- Product Finder ----------
  const finderNext = '[data-finder-next]';
  await page.click(finderNext);
  check('Finder blocks Next without an answer', (await page.$eval('[data-finder-error]', (e) => e.textContent)).length > 0);
  for (const name of ['industry', 'location', 'wet', 'traffic', 'safety', 'budget']) {
    await page.evaluate((n) => document.querySelector(`input[name="${n}"]`).click(), name);
    await page.click(finderNext);
    await wait(80);
  }
  // Last step: results stay hidden until the Terms & Privacy box is ticked
  check('Finder requires Terms & Privacy consent',
    await page.$eval('[data-finder-result]', (r) => r.hidden) && (await page.$eval('[data-finder-error]', (e) => e.textContent)).includes('Terms'));
  await page.click('#finder-consent');
  await page.click(finderNext);
  await wait(80);
  const resultLinks = await page.$$eval('[data-finder-result-list] a', (as) => as.map((a) => a.getAttribute('href')));
  check('Finder shows suggested categories after 6 steps', resultLinks.length > 0, resultLinks.join(', '));
  check('Finder passes answers to the contact form', (await page.$eval('[data-finder-contact]', (a) => a.href)).includes('finder='));

  // ---------- Homepage form validation + honest submit ----------
  await page.click('[data-enquiry-form] [type="submit"]');
  await wait(200);
  const invalid = await page.$$eval('[data-enquiry-form] [aria-invalid="true"]', (els) => els.length);
  check('Empty form shows field errors', invalid >= 4, `${invalid} invalid fields`);
  await page.type('#p-name', 'QA Test');
  await page.type('#p-phone', '12');
  await page.type('#p-country', 'India');
  await page.type('#p-email', 'not-an-email');
  await page.type('#p-message', 'Test message');
  await page.click('[data-enquiry-form] [type="submit"]');
  await wait(200);
  check('Invalid email + phone are rejected', await page.$eval('#p-email', (e) => e.getAttribute('aria-invalid') === 'true') && await page.$eval('#p-phone', (e) => e.getAttribute('aria-invalid') === 'true'));
  await page.$eval('#p-email', (e) => { e.value = 'qa@example.com'; e.dispatchEvent(new Event('input')); });
  await page.$eval('#p-phone', (e) => { e.value = '+91 98765 43210'; e.dispatchEvent(new Event('input')); });
  await page.$eval('[data-enquiry-form]', (f) => f.requestSubmit());
  await wait(1500);
  const stillInvalid = await page.$$eval('[data-enquiry-form] [aria-invalid="true"]', (els) => els.map((e) => `${e.id}=${e.value}`));
  if (stillInvalid.length) console.log('DEBUG invalid after fix:', stillInvalid);
  const status = await page.$eval('[data-form-status]', (e) => ({ cls: e.className, text: e.textContent }));
  check('Without a backend the form reports failure honestly (no fake success)', status.cls.includes('error') && !/thank you/i.test(status.text), status.text.slice(0, 80));

  // ---------- Video ----------
  await page.click('[data-video-play]');
  await wait(800);
  check('Factory video starts on play', await page.$eval('[data-video-el]', (v) => !v.hidden && (v.currentTime > 0 || !v.paused)));

  // ---------- Products filter + URL param ----------
  await page.goto(BASE + 'products.html?category=stud-mats', { waitUntil: 'networkidle0' });
  const visible = await page.$$eval('[data-filter-list="products"] [data-filter-item]', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.category));
  check('?category=stud-mats pre-filters products', visible.length > 0 && visible.every((c) => c.includes('stud-mats')), `${visible.length} shown`);
  await page.click('[data-filter-value="coir-jute"]');
  const coir = await page.$$eval('[data-filter-list="products"] [data-filter-item]:not([hidden])', (els) => els.length);
  check('Category tab filters products', coir === 17, `${coir} coir & jute items`);
  check('Filter tab updates the URL', page.url().includes('category=coir-jute'));

  // ---------- Gallery filter + lightbox + empty state ----------
  await page.goto(BASE + 'gallery.html', { waitUntil: 'networkidle0' });
  await page.click('[data-filter="gallery"] [data-filter-value="company"]');
  check('Empty category shows a friendly message', await page.$eval('[data-filter-empty="gallery"]', (e) => !e.hidden));
  await page.click('[data-filter="gallery"] [data-filter-value="all"]');
  await page.click('[data-lightbox="gallery"]');
  await wait(300);
  check('Lightbox opens', await page.$eval('dialog.lightbox', (d) => d.open));
  await page.keyboard.press('ArrowRight');
  await wait(200);
  check('Lightbox arrow-key navigation', (await page.$eval('.lightbox__caption strong', (e) => e.textContent)) !== 'Diamond Top Stable Mat');
  await page.keyboard.press('Escape');
  await wait(300);
  check('Escape closes lightbox', await page.$eval('dialog.lightbox', (d) => !d.open));
  await page.click('[data-lightbox="videos"]');
  await wait(1200);
  check('Video lightbox plays video', await page.$eval('.lightbox video', (v) => v && v.readyState > 0));
  await page.keyboard.press('Escape');

  // ---------- Accordion: only one open ----------
  await page.goto(BASE + 'manufacturing-quality.html', { waitUntil: 'networkidle0' });
  const triggers = await page.$$('.accordion__trigger');
  await triggers[1].click();
  await triggers[2].click();
  const open = await page.$$eval('.accordion__trigger[aria-expanded="true"]', (els) => els.length);
  check('Accordion keeps only one panel open', open === 1, `${open} open`);
  await triggers[2].click();
  check('Accordion panel closes when clicked again', (await page.$$eval('.accordion__trigger[aria-expanded="true"]', (e) => e.length)) === 0);

  // ---------- About › What sets us apart: counters ----------
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + 'about.html', { waitUntil: 'networkidle0' });
  const counterText = () => page.$$eval('.about-overview__stats [data-counter]', (els) => els.map((e) => e.textContent));
  const statsHeight = () => page.$eval('.about-overview__stats', (e) => e.getBoundingClientRect().height);
  check('Counters wait at 0 until visible', (await counterText()).join('|') === '0|0|0+|0–0%');
  const h0 = await statsHeight();
  await page.$eval('.about-overview__stats', (e) => e.scrollIntoView({ block: 'center' }));
  await wait(500);
  const mid = await counterText();
  const h1 = await statsHeight();
  await wait(2200);
  const end = await counterText();
  check('Counters animate when scrolled into view', mid[0] !== '0' && mid[0] !== '2002', `mid-way: ${mid.join(' / ')}`);
  check('Counters end on the exact values', end.join('|') === '2002|5|40+|60–80%', end.join(' / '));
  check('Counting causes no layout shift', Math.abs(h0 - h1) < 1, `${h0} → ${h1}`);
  check('Screen readers get final values', (await page.$$eval('.about-overview__stats .visually-hidden', (els) => els.map((e) => e.textContent))).join('|') === '2002|5|40+|60 to 80 percent');

  // ---------- About › Our Journey: auto-playing timeline ----------
  await page.goto(BASE + 'about.html', { waitUntil: 'networkidle0' });
  await page.mouse.move(2, 2);
  // Interval comes from the markup (data-timeline-autoplay, currently 4.5 s)
  const STEP = Number(await page.$eval('[data-timeline-autoplay]', (e) => e.dataset.timelineAutoplay));
  const darkCards = () => page.$$eval('.journey .timeline__item', (items) => items
    .map((it) => (getComputedStyle(it.querySelector('.timeline__bg')).opacity === '1' ? it.querySelector('.timeline__year').textContent : null))
    .filter(Boolean));
  await page.$eval('.journey .timeline', (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(1500); // sample after each 0.9 s fade has settled
  const seq = [];
  for (let i = 0; i < 6; i++) {
    seq.push((await darkCards()).join('+'));
    await wait(STEP);
  }
  check(`Timeline loops 2002→2010→2015→2018→2020→2002, ${STEP / 1000} s each, one dark card`, seq.join(',') === '2002,2010,2015,2018,2020,2002', seq.join(' → '));
  const cards = await page.$$('.journey .timeline__item');
  await cards[2].hover();
  await wait(1100);
  const hoverA = (await darkCards()).join('+');
  await wait(STEP + 700);
  const hoverB = (await darkCards()).join('+');
  check('Hover pauses the loop on the hovered card only', hoverA === '2015' && hoverB === '2015', `${hoverA} … ${hoverB}`);
  await page.mouse.move(2, 2);
  await wait(STEP + 1300); // a full interval restarts when the pointer leaves, then the 0.9 s fade settles
  const resumed = (await darkCards()).join('+');
  check('Loop resumes after the pointer leaves', resumed === '2018', resumed);

  // Reduced motion: first card active, no looping
  const rm = await browser.newPage();
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rm.setViewport({ width: 1440, height: 900 });
  await rm.goto(BASE + 'about.html', { waitUntil: 'networkidle0' });
  await rm.$eval('.journey .timeline', (e) => e.scrollIntoView({ block: 'center' }));
  await wait(STEP + 500);
  check('Reduced motion: 2002 stays active, no looping', (await rm.$$eval('.journey .timeline__item.is-active .timeline__year', (els) => els.map((e) => e.textContent))).join('+') === '2002');
  await rm.close();

  // Homepage timeline: same autoplay loop
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle0' });
  await page.mouse.move(2, 2);
  await page.$eval('.journey .timeline', (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(1500);
  const homeSeq = [];
  for (let i = 0; i < 6; i++) {
    homeSeq.push((await darkCards()).join('+'));
    await wait(STEP);
  }
  check('Homepage timeline loops 2002→…→2020→2002, one dark card', homeSeq.join(',') === '2002,2010,2015,2018,2020,2002', homeSeq.join(' → '));

  // Smooth transition: shortly after a change both cards are mid-fade (not an abrupt switch)
  const yearBefore = await page.$eval('.journey .timeline__item.is-active .timeline__year', (e) => e.textContent);
  await page.waitForFunction((y) => document.querySelector('.journey .timeline__item.is-active .timeline__year').textContent !== y, { timeout: STEP + 1000 }, yearBefore);
  await wait(350);
  const fade = await page.$$eval('.journey .timeline__item', (items) => items.map((it) => ({
    year: it.querySelector('.timeline__year').textContent,
    op: Number(getComputedStyle(it.querySelector('.timeline__bg')).opacity),
    color: getComputedStyle(it.querySelector('.timeline__year')).color
  })).filter((x) => x.op > 0.02));
  const midFade = fade.length === 2 && fade.every((x) => x.op > 0.05 && x.op < 0.95);
  const midColour = fade.some((x) => !['rgb(0, 0, 0)', 'rgb(255, 237, 0)'].includes(x.color));
  check('Year change is a gradual cross-fade (background + text colour)', midFade && midColour, fade.map((x) => `${x.year} bg ${x.op.toFixed(2)} ${x.color}`).join(' | '));
  await wait(1200);
  check('After the fade only one card is dark', (await darkCards()).length === 1);

  // ---------- Contact prefill ----------
  await page.goto(BASE + 'contact.html?product=DH%20003%20Octagonal#enquiry', { waitUntil: 'networkidle0' });
  check('Product enquiry link pre-fills product name', (await page.$eval('#c-product', (e) => e.value)) === 'DH 003 Octagonal');
  check('Product enquiry sets enquiry type', (await page.$eval('#c-type', (e) => e.value)) === 'Product & Specification Enquiry');

  // ---------- Mobile navigation ----------
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + 'about.html', { waitUntil: 'networkidle0' });
  await page.click('[data-nav-toggle]');
  await wait(400);
  check('Mobile menu opens', await page.evaluate(() => document.body.classList.contains('nav-open')));
  check('Page scroll locked while menu open', await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden'));
  await page.click('[aria-controls="submenu-about"]');
  await wait(200);
  check('Mobile submenu expands', await page.$eval('#submenu-about', (e) => getComputedStyle(e).display === 'block'));
  check('Current page marked in menu', await page.$$eval('#submenu-about a[aria-current="page"]', (a) => a.length === 1));
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await wait(400);
  check('Escape closes mobile menu', await page.evaluate(() => !document.body.classList.contains('nav-open')));

  // ---------- Keyboard: skip link ----------
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + 'contact.html', { waitUntil: 'networkidle0' });
  await page.keyboard.press('Tab');
  check('First Tab focuses the skip link', await page.evaluate(() => document.activeElement.classList.contains('skip-link')));

  // ---------- 404 ----------
  const res = await page.goto(BASE + 'missing-page.html');
  check('Missing pages return a 404 page', res.status() === 404 && (await page.title()).includes('Not Found'));

  check('No JavaScript errors during tests', errors.length === 0, errors.join(' | '));
  await browser.close();

  let failed = 0;
  results.forEach((r) => {
    if (!r.ok) failed++;
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? `  (${r.info})` : ''}`);
  });
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exitCode = failed ? 1 : 0;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
