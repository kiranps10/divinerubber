/**
 * Builds the blog and News & Events pages from tools/posts.js:
 *   - one detail page per post (blog-<slug>.html / news-<slug>.html, or the post's `file`)
 *   - the listing cards + filter buttons in blogs.html and news.html (between markers)
 *   - sitemap.xml entries for every detail page
 *   npm run posts   (runs this, then `npm run partials` to inject the shared header/footer)
 *
 * Detail pages reuse the head / header / footer of blog-detail.html, so they always
 * match the site template. Never edit generated pages by hand — edit tools/posts.js.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { blog, news } = require('./posts');

const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'images');
const SITE = 'https://www.divinerubber.com/';

const TYPES = {
  blog: {
    list: 'blogs.html', listLabel: 'Blogs', back: 'Back to Blogs', noun: 'Article', prefix: 'blog-', filter: 'blogs', bodyClass: 'page--blog-detail',
    titleSuffix: 'Divine Rubber Blog',
    filters: [['all', 'All'], ['rubber-products', 'Rubber Products'], ['manufacturing', 'Manufacturing &amp; Technology'],
      ['quality', 'Quality &amp; Standards'], ['applications', 'Industry Applications'], ['guides', 'Product Guides'],
      ['coir-jute', 'Coir &amp; Jute']],
    related: { eyebrow: 'Keep Reading', title: 'Related Articles', all: 'All Articles' },
  },
  news: {
    list: 'news.html', listLabel: 'News &amp; Events', back: 'Back to News &amp; Events', noun: 'Article', prefix: 'news-', filter: 'news', bodyClass: 'page--news-detail',
    titleSuffix: 'Divine Rubber News',
    filters: [['all', 'All'], ['company', 'Company News'], ['products', 'Product Spotlight'],
      ['manufacturing', 'Manufacturing'], ['events', 'Events']],
    related: { eyebrow: 'More Updates', title: 'Related News &amp; Events', all: 'All News &amp; Events' },
  },
};

const DRAFT_TODO = 'Draft for review — approve the text and set a publication date (add `date` in tools/posts.js)';
const ICON = (id) => `<svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-${id}"></use></svg>`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// --- images: every generated width for a base path, with real pixel sizes ---
const imgCache = new Map();
async function image(base) {
  if (imgCache.has(base)) return imgCache.get(base);
  const dir = path.join(IMG, path.dirname(base));
  const name = path.basename(base);
  const widths = fs.readdirSync(dir)
    .map((f) => f.match(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.webp$`)))
    .filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
  if (!widths.length) throw new Error(`No images for ${base}`);
  const files = await Promise.all(widths.map(async (w) => {
    const src = `assets/images/${base}-${w}.webp`;
    const meta = await sharp(path.join(ROOT, src)).metadata();
    return { src, w: meta.width, h: meta.height };
  }));
  const info = { files, small: files.find((f) => f.w >= 600) || files[files.length - 1], large: files[files.length - 1] };
  imgCache.set(base, info);
  return info;
}
const srcset = (info) => info.files.map((f) => `${f.src} ${f.w}w`).join(', ');

function fileOf(post, type) {
  return post.file || `${TYPES[type].prefix}${post.slug}.html`;
}

function dateLabel(post, long) {
  const [y, m, d] = post.date.split('-').map(Number);
  return `${d} ${long ? MONTHS[m - 1] : MONTHS[m - 1].slice(0, 3)} ${y}`;
}

// Card meta: publication date only (calendar icon). Dates are never invented —
// until a post has an approved `date`, the card says "Date to be confirmed".
function cardMeta(post) {
  const when = post.date
    ? `<time datetime="${post.date}">${dateLabel(post)}</time>`
    : 'Date to be confirmed';
  return `<p class="post-card__meta"><span>${ICON('calendar')}${when}</span></p>`;
}

function todoOf(post) {
  const parts = [];
  if (!post.date) parts.push(DRAFT_TODO);
  if (post.dummyDate) parts.push('Placeholder (dummy) date — replace with the real publication date and approve the text');
  if (post.todo) parts.push(post.todo);
  if (post.ai) parts.push('Photo is an AI-generated visual — replace with a real photo');
  return parts.length ? ` data-todo="${parts.join('; ')}"` : '';
}

async function card(post, type, { listing }) {
  const img = await image(post.image);
  const item = `<article class="post-card"${todoOf(post)}>
              <div class="post-card__media"><span class="post-card__badge">${post.catLabel}</span><img src="${img.small.src}" width="${img.small.w}" height="${img.small.h}" alt="" loading="lazy"></div>
              <div class="post-card__body">
                ${cardMeta(post)}
                <h3 class="post-card__title"><a class="post-card__link" href="${fileOf(post, type)}">${post.title}</a></h3>
                <p class="post-card__text">${post.summary}</p>
                <span class="link-arrow post-card__more" aria-hidden="true">Read More <svg><use href="assets/icons/sprite.svg#i-arrow-long"></use></svg></span>
              </div>
            </article>`;
  return listing
    ? `          <li data-filter-item data-category="${post.cat}">\n            ${item}\n          </li>`
    : `          <li>\n            ${item}\n          </li>`;
}

async function figureHtml(fig) {
  const img = await image(fig.image);
  return `<figure>
              <img src="${img.small.src}" srcset="${srcset(img)}" sizes="(max-width: 1199px) 100vw, 70vw" width="${img.small.w}" height="${img.small.h}" alt="${fig.alt}" loading="lazy">
              <figcaption>${fig.caption}</figcaption>
            </figure>`;
}

function aside(post, type) {
  if (post.aside === 'meeting') {
    return `<aside class="article-body__aside" aria-label="Meet our team">
            <h2 class="article-body__aside-title">Meet Our Team</h2>
            <p class="t-p1">Talk to us about the range, samples, quantities and delivery.</p>
            <a class="btn btn--primary btn--block" href="contact.html?type=meeting#enquiry">Book a Meeting
              <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
            </a>
          </aside>`;
  }
  if (type === 'news') {
    return `<aside class="article-body__aside" aria-label="Contact us">
            <h2 class="article-body__aside-title">Talk to Our Team</h2>
            <p class="t-p1">Questions about our products, sizes or an order? We're happy to help.</p>
            <a class="btn btn--primary btn--block" href="contact.html#enquiry">Contact Us
              <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
            </a>
            <a class="btn btn--primary btn--block" href="products.html">View Products
              <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
            </a>
          </aside>`;
  }
  return `<aside class="article-body__aside" aria-label="Find the right mat">
            <h2 class="article-body__aside-title">Find the Right Mat</h2>
            <p class="t-p1">Answer six quick questions and we'll match you to the right Divine Rubber flooring system.</p>
            <a class="btn btn--primary btn--block" href="index.html#product-finder">Product Finder
              <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
            </a>
            <a class="btn btn--primary btn--block" href="contact.html#enquiry">Ask an Expert
              <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
            </a>
          </aside>`;
}

// ← Previous Article / Next Article → (order of the listing page). A missing side keeps
// its empty slot so the other link stays on its own side.
function postNav(post, type, list) {
  const i = list.indexOf(post);
  const link = (p, dir) => {
    if (!p) return `<span class="post-nav__item post-nav__item--${dir} post-nav__item--empty" aria-hidden="true"></span>`;
    const label = dir === 'prev'
      ? `<span class="post-nav__label">${ICON('arrow-right')}Previous ${TYPES[type].noun}</span>`
      : `<span class="post-nav__label">Next ${TYPES[type].noun}${ICON('arrow-right')}</span>`;
    return `<a class="post-nav__item post-nav__item--${dir}" href="${fileOf(p, type)}" rel="${dir}">
            ${label}
            <span class="post-nav__title">${p.title}</span>
          </a>`;
  };
  return `<div class="section section--sm section--flush-top">
        <nav class="container post-nav" aria-label="More ${type === 'blog' ? 'articles' : 'news &amp; events'}">
          ${link(list[i - 1], 'prev')}
          ${link(list[i + 1], 'next')}
        </nav>
      </div>`;
}

function relatedPosts(post, list) {
  const others = list.filter((p) => p !== post);
  return [...others.filter((p) => p.cat === post.cat), ...others.filter((p) => p.cat !== post.cat)].slice(0, 3);
}

async function detailPage(post, type, list, tpl) {
  const T = TYPES[type];
  const img = await image(post.image);
  const file = fileOf(post, type);
  let body = post.body.trim();
  if (body.includes('FIGURE')) body = body.replace('FIGURE', post.figure ? await figureHtml(post.figure) : '');

  const metaDate = post.date
    ? `<span>${ICON('calendar')}<time datetime="${post.date}">${dateLabel(post, true)}</time></span>`
    : '<span class="post-status">Draft for review</span>';
  const draftNote = post.date && !post.dummyDate ? '' : `
            <p class="draft-note"${todoOf(post)}><span aria-hidden="true">ℹ</span>Draft for review — the Divine Rubber team will confirm this content and set a publication date before it goes live.</p>`;
  const related = await Promise.all(relatedPosts(post, list).map((p) => card(p, type, { listing: false })));

  const main = `  <main id="main">
    <article>
      <!-- 1. Header -->
      <header class="section section--sm article-header">
        <div class="container">
          <div class="article-header__top">
            <nav class="breadcrumb breadcrumb--dark" aria-label="Breadcrumb">
              <ol class="breadcrumb__list">
                <li class="breadcrumb__item"><a href="index.html">Home</a></li>
                <li class="breadcrumb__item"><a href="${T.list}">${T.listLabel}</a></li>
                <li class="breadcrumb__item"><span aria-current="page">${post.crumb}</span></li>
              </ol>
            </nav>
            <a class="article-back" href="${T.list}">${ICON('arrow-right')}${T.back}</a>
          </div>
          <a class="article-header__cat" href="${T.list}?category=${post.cat}">${post.catLabel}</a>
          <h1 class="article-header__title">${post.title}</h1>
          <p class="article-header__meta">
            ${metaDate}
            <span>${ICON('user')}Divine Rubber Team</span>
            <span>${ICON('clock')}${post.readMin} min read</span>
          </p>
          <img class="article-header__image" src="${img.large.src}" srcset="${srcset(img)}" sizes="(max-width: 1720px) 100vw, 1720px" width="${img.large.w}" height="${img.large.h}" alt="${post.alt}" fetchpriority="high"${post.ai ? ' data-todo="AI-generated visual — replace with a real photo"' : ''}>
        </div>
      </header>

      <!-- 2. Content -->
      <div class="section section--sm section--flush-top">
        <div class="container article-body">
          <div class="prose">${draftNote}
            ${body}
          </div>

          ${aside(post, type)}
        </div>
      </div>

      <!-- Previous / next in listing order (newest first); the first and last article show one link -->
      ${postNav(post, type, list)}
    </article>

    <!-- 3. Related -->
    <section class="section section--light" aria-labelledby="rel-title">
      <div class="container">
        <div class="heading-row">
          <div class="section-heading section-heading--sm">
            <span class="section-heading__eyebrow">${T.related.eyebrow}</span>
            <h2 class="section-heading__title" id="rel-title">${T.related.title}</h2>
          </div>
          <a class="btn btn--primary" href="${T.list}">${T.related.all}
            <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
          </a>
        </div>
        <ul class="grid grid--3">
${related.join('\n')}
        </ul>
      </div>
    </section>

    <!-- 4. Closing CTA -->
    <section class="cta-band" aria-labelledby="cta-title">
      <div class="cta-band__media" aria-hidden="true"><img src="assets/images/industries/retail-1200.webp" width="1200" height="1200" alt="" loading="lazy"></div>
      <div class="container cta-band__inner">
        <div>
          <span class="cta-band__eyebrow">Ready to Order?</span>
          <h2 class="cta-band__title" id="cta-title">Find the Right Mat for Your Space</h2>
          <p class="cta-band__text">Browse our range or tell us your requirements for sizes and pricing.</p>
        </div>
        <div class="btn-group">
          <a class="btn btn--primary" href="products.html">Explore Our Products
            <span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>
          </a>
          <a class="btn btn--outline-light" href="contact.html">Contact Us
            <span class="btn__icon"><svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-arrow-circle"></use></svg></span>
          </a>
        </div>
      </div>
    </section>
  </main>`;

  const plainTitle = post.title.replace(/&amp;/g, '&');
  let head = tpl.head
    .replace(/<title>[^<]*<\/title>/, `<title>${post.title} | ${T.titleSuffix}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${post.description.replace(/"/g, '&quot;')}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}${file}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${plainTitle.replace(/"/g, '&quot;').replace(/&/g, '&amp;')}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${SITE}${img.large.src}">`)
    .replace(/class="page page--solid-header page--[a-z-]+"/, `class="page page--solid-header ${T.bodyClass}"`);
  fs.writeFileSync(path.join(ROOT, file), `${head}${main}${tpl.tail}`);
  return file;
}

function replaceBetween(html, start, end, content, file) {
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0) throw new Error(`Markers ${start} … ${end} missing in ${file}`);
  return html.slice(0, a + start.length) + '\n' + content + '\n' + html.slice(b);
}

(async () => {
  // Template: everything around <main> in the (generated) blog detail page
  const src = fs.readFileSync(path.join(ROOT, 'blog-detail.html'), 'utf8');
  const tpl = {
    head: src.slice(0, src.indexOf('  <main id="main">')),
    tail: src.slice(src.indexOf('  </main>') + '  </main>'.length),
  };

  const written = [];
  for (const [type, list] of [['blog', blog], ['news', news]]) {
    const T = TYPES[type];
    for (const post of list) written.push(await detailPage(post, type, list, tpl));

    // Listing page: filter buttons + cards
    const listFile = path.join(ROOT, T.list);
    let html = fs.readFileSync(listFile, 'utf8');
    const used = new Set(list.map((p) => p.cat));
    const buttons = T.filters
      .filter(([v]) => v === 'all' || used.has(v))
      .map(([v, label]) => `          <button class="filter-tabs__btn" type="button" data-filter-value="${v}" aria-pressed="${v === 'all'}">${label}</button>`)
      .join('\n');
    html = replaceBetween(html, '<!-- filters:start -->', '          <!-- filters:end -->', buttons, T.list);
    const cards = await Promise.all(list.map((p) => card(p, type, { listing: true })));
    html = replaceBetween(html, '<!-- posts:start -->', '          <!-- posts:end -->', cards.join('\n'), T.list);
    fs.writeFileSync(listFile, html);
    console.log(`${T.list}: ${list.length} cards`);
  }

  // Sitemap: make sure every detail page is listed
  const smFile = path.join(ROOT, 'sitemap.xml');
  let sm = fs.readFileSync(smFile, 'utf8');
  for (const f of written) {
    if (!sm.includes(`${SITE}${f}<`)) sm = sm.replace('</urlset>', `  <url><loc>${SITE}${f}</loc></url>\n</urlset>`);
  }
  fs.writeFileSync(smFile, sm);
  console.log(`detail pages: ${written.join(', ')}`);
})();
