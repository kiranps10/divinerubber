/**
 * The ONE product card used in every product listing on the site (flip card).
 * Styles: scss/components/_flip-card.scss · "+ More" buttons: js/components/flip-card.js
 *
 *   Front: image, name, short description, available colours.
 *   Back:  dark details panel — name, thickness chips, sizes (first 3 + "More sizes"),
 *          colours (+ "More colors"), Explore Product + Enquire Now.
 *
 * Every card has the same structure and size: missing details read "on request".
 * Desktop (mouse/trackpad): the card flips to the back on hover or keyboard focus.
 * Touch devices: no flip — image, name, description and colours, then the details below.
 *
 * Used by tools/build-product-list.js (Home › Product Range, Products page) and
 * tools/build-product-pages.js (Related Products).
 * Data: tools/product-catalogue.js (+ tools/product-details.js for products with a page),
 * so every listing shows the same facts. Missing details read "on request" — never guessed.
 */
const catalogue = require('./product-catalogue');
const details = require('./product-details').products;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// How many items show before a '+ More' button (each list has a fixed height)
const COLORS = 3;
const SIZES = 3;

// Category names (same as the Products page filter tabs)
const CATEGORY = {
  'hollow-mats': 'Hollow Mats',
  'stud-mats': 'Stud Mats',
  'stable-cow-mats': 'Stable & Cow Mats',
  'coir-jute': 'Coir & Jute',
  'rag-rugs-pp': 'Rag Rugs & PP Mats'
};

// Colour names with a swatch style (.flip-card__dot--<name> in _flip-card.scss); others get a neutral dot
const SWATCH = ['black', 'terracotta', 'green', 'grey', 'red', 'brown', 'natural'];

/** Catalogue entry by product name (throws if missing, so listings can't drift from the data). */
function product(name) {
  const p = catalogue.find((x) => x.name === name);
  if (!p) throw new Error(`flip-card: "${name}" is not in tools/product-catalogue.js`);
  return p;
}

const text = (v) => (v && typeof v === 'object' ? null : v); // "To be confirmed" cells → null
const unique = (list) => [...new Set(list.filter(Boolean))];

/** Thickness / sizes / colours / applications from the product page data (tools/product-details.js). */
function fromProductPage(file) {
  const d = details.find((x) => x.file === file);
  if (!d) return {};
  const out = {};
  let colours = null;
  if (d.specHead[0] === 'Property') {
    for (const [key, value] of d.specRows) {
      const v = text(value);
      if (!v) continue;
      if (/size/i.test(key)) out.sizes = [v.replace(/\s*\(.*\)$/, '')];
      else if (/thickness/i.test(key)) out.thickness = [v];
      else if (/colour/i.test(key)) colours = v;
    }
  } else {
    // Size table: one column per thickness ("22 mm thick")
    out.thickness = d.specHead.slice(1).map((h) => h.replace(/\s*thick$/i, ''));
    out.sizes = unique(d.specRows.flatMap((row) => row.slice(1).map(text)));
  }
  colours = colours || text((d.specExtra || []).find(([k]) => /colour/i.test(k))?.[1]);
  if (colours) {
    // "Black (custom colours on request)" → Black + a note
    const note = colours.match(/\(([^)]+)\)/);
    out.colors = colours.replace(/\s*\(.*\)/, '').split(/\s*,\s*/);
    if (note) out.colorNote = note[1][0].toUpperCase() + note[1].slice(1);
  }
  return out;
}

const enquiryHref = (p) => `contact.html?product=${encodeURIComponent(p.code && p.code !== 'TBC' ? `${p.code} ${p.name}` : p.name)}#enquiry`;

let uid = 0;

/**
 * @param {object} p  catalogue entry, or a product-family card:
 *   { name, cat, text, img, w, h, alt, code?, page?, explore?, todo?,
 *     thickness?, sizes?, colors? }
 *   - page: product page; explore: other "Explore" target (default: the category listing)
 * @param {object} o  { tag: 'li' | 'div', indent: string, attrs: extra attributes on the card }
 */
function flipCard(p, o = {}) {
  const d = { ...(p.page ? fromProductPage(p.page) : {}), ...p };
  const tag = o.tag || 'li';
  const I = o.indent || '';
  const id = `fc${++uid}`;
  const attrs = (o.attrs ? ` ${o.attrs}` : '') + (p.todo ? ` data-todo="${esc(p.todo)}"` : '');
  const thickness = d.thickness || [];
  const sizes = d.sizes || [];
  const colors = d.colors || [];
  // Every card has both buttons: the product page, or else the product's category listing
  const explore = d.page || d.explore || `products.html?category=${d.cat}`;
  const exploreLabel = d.page || d.explore ? d.name : `${CATEGORY[d.cat]} range`;

  const media = d.img
    ? `<img src="assets/images/${d.img}.webp" width="${d.w}" height="${d.h}" alt="${esc(d.alt)}" loading="lazy">`
    : `<div class="media-placeholder media-placeholder--light"><span class="media-placeholder__code">${esc(d.code)}</span><span class="media-placeholder__note">Photo coming soon</span></div>`;

  // Lists keep a fixed height: the first `limit` items show, "+ More …" reveals the rest
  // inside the same space (it scrolls), so the card never changes size.
  const more = (listId, label, count) => `<div class="flip-card__more-row">${count
    ? `<button class="flip-card__more" type="button" aria-controls="${listId}" aria-expanded="false" data-more="${label}">+ More ${label}<span class="visually-hidden"> (${count})</span></button>`
    : ''}</div>`;
  const chips = (listId, items, limit) => `<ul class="flip-card__chips" id="${listId}">${items
    .map((v, i) => `<li class="flip-card__chip"${i >= limit ? ' hidden data-extra' : ''}>${esc(v)}</li>`).join('')}</ul>`;
  const swatches = (listId) => `<ul class="flip-card__swatches" id="${listId}">${colors
    .map((c, i) => `<li class="flip-card__swatch"${i >= COLORS ? ' hidden data-extra' : ''}><span class="flip-card__dot${SWATCH.includes(c.toLowerCase()) ? ` flip-card__dot--${c.toLowerCase()}` : ''}" aria-hidden="true"></span>${esc(c)}</li>`).join('')}</ul>`;
  const onRequest = (what) => `<p class="flip-card__note">${what} on request</p>`;

  const section = (mod, title, body) => [
    `${I}      <div class="flip-card__section flip-card__section--${mod}">`,
    `${I}        <p class="flip-card__label">${title}</p>`,
    `${I}        ${body}`,
    `${I}      </div>`
  ];

  return [
    `${I}<${tag} class="flip-card"${attrs}>`,
    `${I}  <article class="flip-card__inner">`,
    `${I}    <div class="flip-card__front">`,
    `${I}      <div class="flip-card__media">${media}</div>`,
    `${I}      <div class="flip-card__body">`,
    `${I}        <h3 class="flip-card__title">${esc(d.name)}</h3>`,
    `${I}        <p class="flip-card__text">${esc(d.text)}</p>`,
    `${I}        <div class="flip-card__colors">`,
    colors.length
      ? `${I}          ${swatches(`${id}-front-colors`)}${more(`${id}-front-colors`, 'colors', Math.max(0, colors.length - COLORS))}`
      : `${I}          ${onRequest('Colors')}`,
    // Desktop: the front can't be clicked (it turns over), so its "More" is a plain hint
    colors.length > COLORS ? `${I}          <span class="flip-card__more flip-card__more--hint" aria-hidden="true">+ More colors</span>` : null,
    `${I}        </div>`,
    `${I}      </div>`,
    `${I}    </div>`,
    `${I}    <div class="flip-card__back">`,
    // Name again for the flipped side (screen readers already heard the heading)
    `${I}      <p class="flip-card__back-title" aria-hidden="true">${esc(d.name)}</p>`,
    ...section('thickness', 'Thickness Available', thickness.length ? chips(`${id}-thickness`, thickness, Infinity) : onRequest('Thickness')),
    ...section('sizes', 'Available Sizes', sizes.length ? chips(`${id}-sizes`, sizes, SIZES) + more(`${id}-sizes`, 'sizes', Math.max(0, sizes.length - SIZES)) : onRequest('Sizes')),
    // Colours sit on the front on touch screens, so this copy is desktop-only
    ...section('colors', 'Colors Available', colors.length
      ? swatches(`${id}-back-colors`) + (colors.length > COLORS || !d.colorNote
        ? more(`${id}-back-colors`, 'colors', Math.max(0, colors.length - COLORS))
        : `<div class="flip-card__more-row"><p class="flip-card__note">${esc(d.colorNote)}</p></div>`)
      : onRequest('Colors')),
    `${I}      <div class="flip-card__actions">`,
    `${I}        <a class="btn btn--sm flip-card__btn" href="${esc(explore)}">Explore Product<span class="visually-hidden">: ${esc(exploreLabel)}</span></a>`,
    `${I}        <a class="btn btn--sm flip-card__btn flip-card__btn--solid" href="${esc(enquiryHref(d))}">Enquire Now<span class="visually-hidden">: ${esc(d.name)}</span></a>`,
    `${I}      </div>`,
    `${I}    </div>`,
    `${I}  </article>`,
    `${I}</${tag}>`
  ].filter((line) => line !== null).join('\n');
}

module.exports = { flipCard, product, esc, CATEGORY };
