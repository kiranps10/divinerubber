/**
 * Generates product detail pages from tools/product-details.js.
 *   node tools/build-product-pages.js   (then `npm run partials` adds header/footer)
 * One template → every product page stays consistent (maps to a WordPress single-product template).
 */
const fs = require('fs');
const path = require('path');
const { CATS, products, relatedSets } = require('./product-details');
// Related products use the site-wide flip card, with data from the product catalogue
const { flipCard, product } = require('./flip-card');
const catalogue = require('./product-catalogue');

const ROOT = path.resolve(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = (id) => `<svg aria-hidden="true"><use href="assets/icons/sprite.svg#${id}"></use></svg>`;
// Decorative feature icon in the approved gradient style (assets/icons/features/)
const featureIcon = (id, size = 48) => `<img src="assets/icons/features/${id.replace(/^i-/, '')}.svg" alt="" width="${size}" height="${size}" loading="lazy">`;
// Gradient CTA buttons use the client-supplied arrow-circle SVG (\"arrow 1.svg\")
const arrowCta = '<span class="btn__icon"><img src="assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>';
const todoAttr = (t) => (t ? ` data-todo="${esc(t)}"` : '');
const cell = (v) => (typeof v === 'object' ? `<span${todoAttr(v.todo)}>${esc(v.text)}</span>` : esc(v));

// Swatch classes shared with the product card (components/_flip-card.scss)
const SWATCHES = ['black', 'terracotta', 'green', 'grey', 'red', 'brown', 'natural'];
const swatch = (name) => `<span class="flip-card__dot${SWATCHES.includes(name.toLowerCase()) ? ` flip-card__dot--${name.toLowerCase()}` : ''}" aria-hidden="true"></span>`;
const text = (v) => (v && typeof v === 'object' ? null : v); // "To be confirmed" cells → null

// Key facts for the hero summary, read from the spec table (nothing invented)
function facts(p) {
  const rows = p.specHead[0] === 'Property' ? Object.fromEntries(p.specRows.map(([k, v]) => [k, text(v)])) : {};
  const extra = Object.fromEntries(p.specExtra || []);
  const thickness = p.specHead[0] === 'Property'
    ? (rows.Thickness ? [rows.Thickness] : [])
    : p.specHead.slice(1).map((h) => h.replace(/\s*thick$/i, ''));
  const colourText = extra.Colours || rows.Colour || '';
  const colourNote = (colourText.match(/\(([^)]+)\)/) || [])[1];
  const colours = colourText ? colourText.replace(/\s*\(.*\)/, '').split(/\s*,\s*/) : [];
  // Second fact: edge profile, edges or surface — whichever the data has
  const second = extra.Edge ? [extra.Edge, 'Profile']
    : rows.Edges ? [rows.Edges, 'Edges']
    : (rows.Surface || rows['Top surface']) ? [rows.Surface || rows['Top surface'], 'Surface'] : null;
  return { thickness, colours, colourNote, second, tableHasColour: Boolean(rows.Colour) };
}

// "16 mm" + "22 mm" → "16 & 22 mm"
function thicknessLabel(list) {
  if (!list.length) return null;
  if (list.every((t) => / mm$/.test(t))) return `${list.map((t) => parseFloat(t)).sort((a, b) => a - b).join(' & ')} mm`;
  return list.join(' / ');
}

// Product gallery (js/components/product-gallery.js). The first photo is `image` — the same
// source as the product card — then any `gallery` photos (angles, close-ups, in use).
// Every photo is shown whole (object-fit: contain) and opens in the lightbox.
// One photo: no thumbnails, arrows or autoplay.
function gallery(p) {
  const images = [p.image, ...(p.gallery || [])];
  const many = images.length > 1;
  const srcset = (img) => (img.srcset
    ? ` srcset="${img.srcset.map((w) => `assets/images/${img.base}-${w}.webp ${w}w`).join(', ')}" sizes="(max-width: 1023px) 92vw, 46vw"`
    : '');
  const slides = images.map((img, i) => `<button class="pd-media pd-gallery__slide${i === 0 ? ' is-active' : ''}" type="button" data-lightbox="product" data-src="assets/images/${img.src}.webp" data-title="${esc(img.alt)}" data-pd-slide${many ? ` aria-label="Photo ${i + 1} of ${images.length}: ${esc(img.alt)} — open larger"` : ''}${todoAttr(img.todo)}>
              <img src="assets/images/${img.src}.webp"${srcset(img)} width="${img.w}" height="${img.h}" alt="${esc(img.alt)}"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>
              <span class="gallery-item__zoom" aria-hidden="true"><svg><use href="assets/icons/sprite.svg#i-zoom"></use></svg></span>
            </button>`).join('\n            ');
  const nav = many
    ? `
            <button class="pd-gallery__nav pd-gallery__nav--prev" type="button" data-pd-prev aria-label="Previous photo"><svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-chevron-left"></use></svg></button>
            <button class="pd-gallery__nav pd-gallery__nav--next" type="button" data-pd-next aria-label="Next photo"><svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-chevron-right"></use></svg></button>`
    : '';
  const thumbs = many
    ? `
          <ul class="pd-thumbs" aria-label="Choose a photo">
            ${images.map((img, i) => `<li><button class="pd-thumbs__btn" type="button" aria-pressed="${i === 0}" data-pd-thumb aria-label="Show photo ${i + 1} of ${images.length}: ${esc(img.alt)}"><img src="assets/images/${img.src}.webp" width="${img.w}" height="${img.h}" alt="" loading="lazy"></button></li>`).join('\n            ')}
          </ul>`
    : '';
  return `<div class="pd-gallery"${many ? ' data-pd-gallery data-pd-interval="4000" role="group" aria-roledescription="carousel" aria-label="Product photos"' : ''}>
          <div class="pd-gallery__stage">
            ${slides}${nav}
          </div>${thumbs}
        </div>`;
}

function page(p) {
  // One image per product: the page must show the same source photo as the product's card
  const card = catalogue.find((c) => c.page === p.file);
  const base = (src) => src.replace(/-\d+$/, '');
  if (card && card.img && base(card.img) !== base(p.image.src)) {
    throw new Error(`${p.file}: page image (${p.image.src}) is not the card image (${card.img}) — use the same photo`);
  }
  const label = p.code === 'TBC' ? p.name : `${p.code} ${p.name}`;
  const enquire = `contact.html?product=${encodeURIComponent(label)}#enquiry`;
  // Four related products: the chosen ones first, then the catalogue fills any gap —
  // same category first (products with their own page, then with a photo), then other product pages
  const picked = (Array.isArray(p.related) ? p.related : relatedSets[p.related]).filter((r) => r.href !== p.file).map((r) => product(r.name));
  const others = catalogue.filter((c) => c.page !== p.file && c.img && !picked.includes(c));
  const fill = [
    ...others.filter((c) => c.cat === p.cat && c.page),
    ...others.filter((c) => c.cat === p.cat && !c.page),
    ...others.filter((c) => c.cat !== p.cat && c.page)
  ];
  const related = [...new Set([...picked, ...fill])].slice(0, 4);
  const f = facts(p);
  const codeHtml = p.code === 'TBC'
    ? `<p class="pd-code" data-todo="Product code not supplied">Product code: on request</p>`
    : `<p class="pd-code">Product code: <strong>${esc(p.code)}</strong></p>`;
  const crumb = p.code === 'TBC' ? p.name : p.code;

  // Hero summary: thickness · edge/surface · colours ("On request" when not supplied)
  const fact = (value, labelText) => `<li class="pd-facts__item"><strong>${esc(value || 'On request')}</strong><span>${labelText}</span></li>`;
  const factsHtml = [
    fact(thicknessLabel(f.thickness), 'Thickness'),
    f.second ? fact(f.second[0], f.second[1]) : fact(null, 'Profile'),
    fact(f.colours.length ? `${f.colours.length} colour${f.colours.length > 1 ? 's' : ''}` : null, 'Available')
  ].join('\n              ');
  const coloursHtml = f.colours.length
    ? `<div class="pd-colours">
              <span class="pd-colours__label">Colours:</span>
              <ul class="pd-colours__list">
                ${f.colours.map((c) => `<li>${swatch(c)}${esc(c)}</li>`).join('\n                ')}
              </ul>${f.colourNote ? `
              <p class="pd-colours__note">${esc(f.colourNote[0].toUpperCase() + f.colourNote.slice(1))}</p>` : ''}
            </div>`
    : '';

  // Line under the size table: colours (when the table doesn't list them) + other extras
  const metaItems = (p.specExtra || []).map(([k, v]) => (/colour/i.test(k)
    ? `<div class="pd-meta__item"><dt>${esc(k)}:</dt><dd><ul class="pd-colours__list">${v.split(/\s*,\s*/).map((c) => `<li>${swatch(c)}${esc(c)}</li>`).join('')}</ul></dd></div>`
    : `<div class="pd-meta__item"><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`));
  const multiThickness = p.specHead[0] !== 'Property';
  const specIntro = multiThickness
    ? `Choose from ${p.specHead.length - 1} thickness options and a range of sizes.`
    : `Sizes, finish and other details for the ${p.name}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.name)} | ${esc(CATS[p.cat])} – Divine Rubber</title>
  <meta name="description" content="${esc(p.short)}">
  <!-- STAGING ONLY: remove this robots tag before the production launch -->
  <meta name="robots" content="noindex, nofollow, noarchive">
  <link rel="canonical" href="https://www.divinerubber.com/${p.file}">
  <meta property="og:title" content="${esc(p.name)} – Divine Rubber">
  <meta property="og:image" content="https://www.divinerubber.com/assets/images/${p.image.src}.webp">
  <meta name="theme-color" content="#23262d">
  <link rel="icon" href="assets/icons/favicon-192.png" type="image/png">
  <link rel="preload" href="assets/fonts/dm-sans-variable-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/playfair-display-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/main.min.css">
  <script type="module" src="js/main.js"></script>
</head>
<body class="page page--solid-header page--product" data-section="products">
  <!-- Generated by tools/build-product-pages.js — edit tools/product-details.js, not this file. -->
  <!-- partial:header -->
  <!-- /partial:header -->

  <main id="main">
    <!-- 1. Product hero -->
    <section class="pd-hero" aria-labelledby="pd-title">
      <div class="container">
        <nav class="breadcrumb breadcrumb--dark pd-hero__crumbs" aria-label="Breadcrumb">
          <ol class="breadcrumb__list">
            <li class="breadcrumb__item"><a href="index.html">Home</a></li>
            <li class="breadcrumb__item"><a href="products.html">Products</a></li>
            <li class="breadcrumb__item"><a href="products.html?category=${p.cat}">${esc(CATS[p.cat])}</a></li>
            <li class="breadcrumb__item"><span aria-current="page">${esc(crumb)}</span></li>
          </ol>
        </nav>
        <div class="pd-hero__grid">
          ${gallery(p)}
          <div class="pd-hero__body">
            <p class="pd-cat"${todoAttr(p.catTodo)}>${esc(CATS[p.cat])}</p>
            <h1 class="pd-title" id="pd-title">${esc(p.name)}</h1>
            ${codeHtml}
            <p class="pd-short">${esc(p.intro || p.short)}</p>
            <ul class="pd-facts">
              ${factsHtml}
            </ul>
            ${coloursHtml}
            <div class="btn-group pd-hero__actions">
              <a class="btn btn--primary" href="${enquire}">Enquire Now ${arrowCta}</a>
              ${p.specPdf
                ? `<a class="btn btn--outline" href="${p.specPdf}" download>Download Specifications <span class="btn__icon">${icon('i-download')}</span></a>`
                : `<a class="btn btn--outline" href="${enquire}">Request Specifications <span class="btn__icon">${icon('i-file-text')}</span></a>`}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- In-page navigation (stays under the header while scrolling) -->
    <nav class="pd-tabs" aria-label="Product sections" data-pd-tabs>
      <div class="container">
        <ul class="pd-tabs__list">
          <li><a class="pd-tabs__link" href="#overview" aria-current="true">Overview</a></li>
          <li><a class="pd-tabs__link" href="#specifications">Specifications</a></li>
          <li><a class="pd-tabs__link" href="#applications">Applications</a></li>
          <li><a class="pd-tabs__link" href="#related">Related Products</a></li>
        </ul>
      </div>
    </nav>

    <!-- 2. Overview: description + key features -->
    <section class="section section--light pd-section" id="overview" aria-labelledby="pd-desc-title">
      <div class="container pd-overview">
        <div class="pd-overview__text"${todoAttr(p.descriptionTodo)}>
          <div class="section-heading">
            <span class="section-heading__eyebrow">Built for Everyday Use</span>
            <h2 class="section-heading__title" id="pd-desc-title">Practical design.<br> Reliable performance.</h2>
          </div>
          ${p.description.map((d) => `<p class="section-heading__intro">${esc(d)}</p>`).join('\n          ')}
        </div>
        <div>
          <h3 class="visually-hidden">Key features</h3>
          <ul class="pd-features">
            ${p.features.map((ft) => `<li class="feature-card pd-feature">
              <span class="feature-card__icon">${featureIcon(ft.icon)}</span>
              <h4 class="feature-card__title">${esc(ft.title)}</h4>
              <p class="feature-card__text">${esc(ft.text)}</p>
            </li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </section>

    <!-- 3. Sizes & specifications -->
    <section class="section pd-section" id="specifications" aria-labelledby="pd-spec-title">
      <div class="container">
        <div class="section-heading section__header pd-section__head">
          <span class="section-heading__eyebrow">Product Details</span>
          <h2 class="section-heading__title" id="pd-spec-title">Find your fit.</h2>
          <p class="section-heading__intro">${esc(specIntro)}</p>
        </div>
        <div class="table-wrap pd-table" tabindex="0" role="group" aria-labelledby="pd-spec-title">
          <table class="spec-table">
            <caption class="visually-hidden">${esc(p.name)} – ${esc(p.specTitle)}</caption>
            <thead><tr>${p.specHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>
              ${p.specRows.map((r) => `<tr><th scope="row">${multiThickness && /^\d+$/.test(r[0]) ? String(r[0]).padStart(2, '0') : cell(r[0])}</th>${r.slice(1).map((c) => `<td>${cell(c)}</td>`).join('')}</tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>
        <div class="pd-meta">
          ${metaItems.length ? `<dl class="pd-meta__list">${metaItems.join('')}</dl>` : '<span></span>'}
          <p class="pd-meta__help">Need help choosing a size? <a class="link-arrow" href="${enquire}">Enquire now <svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-arrow-right"></use></svg></a></p>
        </div>
      </div>
    </section>

    <!-- 4. Applications -->
    <section class="section section--light pd-section" id="applications" aria-labelledby="pd-apps-title">
      <div class="container">
        <div class="section-heading section__header pd-section__head">
          <span class="section-heading__eyebrow">Applications</span>
          <h2 class="section-heading__title" id="pd-apps-title">Made for everyday spaces.</h2>
          <p class="section-heading__intro">Explore possible uses. Ask our team to confirm suitability for your setting.</p>
        </div>
        <ul class="pd-apps pd-apps--${p.apps.length}"${todoAttr(p.appsTodo)}>
          ${p.apps.map((a) => `<li class="pd-app"><img src="assets/images/${a.img}.webp" width="${a.w}" height="${a.h}" alt="" loading="lazy"><p class="pd-app__label">${esc(a.label)}</p></li>`).join('\n          ')}
        </ul>
      </div>
    </section>

    <!-- 5. Related products (the site-wide product card) -->
    <section class="section pd-section" id="related" aria-labelledby="pd-related-title">
      <div class="container">
        <div class="heading-row">
          <div class="section-heading">
            <span class="section-heading__eyebrow">Explore the Range</span>
            <h2 class="section-heading__title" id="pd-related-title">You may also like.</h2>
          </div>
          <a class="link-arrow" href="products.html">View all products <svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-arrow-right"></use></svg></a>
        </div>
        <ul class="grid grid--4 flip-grid">
${related.map((r) => flipCard(r, { indent: '          ' })).join('\n')}
        </ul>
      </div>
    </section>

    <!-- 6. Enquiry -->
    <section class="pd-cta" aria-labelledby="cta-title">
      <div class="container pd-cta__inner">
        <h2 class="pd-cta__title" id="cta-title">Let’s find the right mat for your space.</h2>
        <p class="pd-cta__text">Share your preferred size, quantity and delivery destination. Our team will help with product options and pricing.</p>
        <div class="pd-cta__actions">
          <a class="btn btn--primary" href="${enquire}">Enquire Now ${arrowCta}</a>
          <a class="btn btn--outline" href="contact.html">Contact Us <span class="btn__icon">${icon('i-mail')}</span></a>
        </div>
      </div>
    </section>
  </main>

  <!-- partial:footer -->
  <!-- /partial:footer -->
</body>
</html>
`;
}

products.forEach((p) => {
  fs.writeFileSync(path.join(ROOT, p.file), page(p));
  console.log(`Product page: ${p.file}`);
});
