/**
 * Regenerates the product listings that use the shared flip card (tools/flip-card.js):
 *   - products.html  — every product in tools/product-catalogue.js   (<!-- products:start/end -->)
 *   - index.html     — Home › Product Range carousel                 (<!-- range:start/end -->)
 *   - about.html     — About › Our Core Expertise (image cards, not flip cards) (<!-- expertise:start/end -->)
 * Related Products on the product pages: tools/build-product-pages.js (same card).
 *   node tools/build-product-list.js   (or: npm run products)
 */
const fs = require('fs');
const path = require('path');
const products = require('./product-catalogue');
const { flipCard, product, esc, CATEGORY } = require('./flip-card');

const ROOT = path.resolve(__dirname, '..');

// Every card on the Products page has an id, so other pages can link to one product:
// its own page if it has one, else its card in the (pre-filtered) Products page list.
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productId = (p) => `product-${slug(p.name)}`;
const productHref = (p) => p.page || `products.html?category=${p.cat}#${productId(p)}`;
const ids = products.map(productId);
if (new Set(ids).size !== ids.length) throw new Error('Two catalogue products give the same id — rename one');

function write(file, marker, cards, extra = (html) => html) {
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, 'utf8');
  const re = new RegExp(`(<!-- ${marker}:start -->)[\\s\\S]*?(\\s*<!-- ${marker}:end -->)`);
  if (!re.test(html)) throw new Error(`${file}: <!-- ${marker}:start/end --> markers not found`);
  fs.writeFileSync(full, extra(html.replace(re, `$1\n${cards.join('\n')}$2`)));
  console.log(`${file}: ${cards.length} cards (${marker})`);
}

// --- Products page: the whole catalogue, filterable by category ---
write(
  'products.html',
  'products',
  products.map((p) => flipCard(p, { indent: '          ', attrs: `id="${productId(p)}" data-filter-item data-category="${p.cat}"` })),
  (html) => html.replace(/<ul class="[^"]*product-grid[^"]*"[^>]*>/, '<ul class="grid grid--4 flip-grid" data-filter-list="products">')
);

// --- Home › Product Range (carousel) ---
const HOME_RANGE = ['Diamond Top Runner', 'Texture Mat', 'Urinal Mat', 'Pin Mat Diamond', 'Anti-Fatigue Bubble Mat', 'Interlocking Coin Mat'];
write('index.html', 'range', HOME_RANGE.map((name) => flipCard(product(name), { tag: 'div', indent: '            ' })));

// --- About › Our Core Expertise: product-family image cards (scss/pages/_about.scss,
// js/components/expertise.js). Hover (desktop) or "Related products" (touch) shows the
// description and links to real catalogue products: their page, or their card on the
// Products page. Product names come from the catalogue (product() throws on a typo).
const ARROW = '<svg class="expertise-card__arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const EXPERTISE = [
  { name: 'Octagonal Pattern', slug: 'octagonal-pattern', h: 479, cat: 'hollow-mats', alt: 'Octagonal pattern hollow rubber mat, partly rolled', text: "Hollow mats with a textured surface finish that doesn't slip, even on highly polished floors.", related: ['Octagonal Pattern Square Edged', 'Connector'] },
  { name: 'Universal Pattern', slug: 'universal-pattern', h: 476, cat: 'hollow-mats', alt: 'Universal pattern hollow rubber mat on grass', text: 'Open-hole design wipes off dirt while the studded bottom adds comfort, drainage and cleanliness.', related: ['Universal Pattern Square Edged', 'Universal Pattern Taper Edged'] },
  { name: 'Stud Mat', slug: 'stud-mat', h: 480, cat: 'stud-mats', alt: 'Rubber stud mat, partly rolled, showing its raised studs', text: 'Hundreds of flexible rubber studs give a cushioning effect and are better at removing mud.', related: ['Pin Mat Diamond', 'Anti-Fatigue Bubble Mat', 'Taper Edged Stud Mat', 'Welcome Stud Mat'] },
  { name: 'Stable Mat', slug: 'stable-mat', h: 503, cat: 'stable-cow-mats', alt: 'Stable mat with a ribbed top folded back over its textured base', text: 'Rubber mats for cows and horses that keep stables hygienic and cushion knees, hocks and udders.', related: ['Diamond Top Stable Mat', 'Interlocking Coin Mat', 'Interlocking Tile Mat', 'Interlocking Stable Mat'] },
  { name: 'Coir Products', slug: 'coir-products', h: 499, cat: 'coir-jute', alt: 'Coir door mat in a rubber frame at a front door', text: 'Hard, flexible and bio-degradable coir mats that provide excellent scrubbing action.', related: ['Brush Mat', 'Coco Rubber Mat', 'Coir Matting Boucle', 'Hollander Mat'] },
  { name: 'Jute Products', slug: 'jute-products', h: 503, cat: 'coir-jute', alt: 'Woven jute rug, partly rolled', text: 'Eco-friendly jute mats, rugs and mattings, including short-term erosion-control mats.', related: ['Jute Loop Mat', 'Jute Rugs & Carpets', 'Hand-spun Jute', 'Jute Dot Mattings'] }
];
const expertiseCard = (f) => {
  const I = '          ';
  const id = `expertise-${f.slug}`;
  const links = f.related.map((name) => {
    const p = product(name);
    return `${I}            <li><a class="expertise-card__link" href="${esc(productHref(p))}"><span class="expertise-card__link-name">${esc(p.name)}</span>${ARROW}</a></li>`;
  });
  const total = products.filter((p) => p.cat === f.cat).length;
  return [
    `${I}<li>`,
    `${I}  <article class="expertise-card" data-expertise aria-labelledby="${id}-title">`,
    `${I}    <img class="expertise-card__img" src="assets/images/about/expertise-${f.slug}-490.webp" width="490" height="${f.h}" alt="${esc(f.alt)}" loading="lazy">`,
    `${I}    <div class="expertise-card__content">`,
    `${I}      <h3 class="expertise-card__title" id="${id}-title">${esc(f.name)}</h3>`,
    `${I}      <div class="expertise-card__details">`,
    `${I}        <div class="expertise-card__details-inner">`,
    `${I}          <p class="expertise-card__text">${esc(f.text)}</p>`,
    `${I}          <button class="expertise-card__toggle" type="button" aria-expanded="false" aria-controls="${id}-related" hidden>Related products<span class="expertise-card__toggle-icon" aria-hidden="true"></span></button>`,
    `${I}          <div class="expertise-card__related" id="${id}-related">`,
    `${I}            <p class="expertise-card__label" id="${id}-label">Related Products</p>`,
    // Two products (long names): one column; four: two columns on desktop
    `${I}            <ul class="expertise-card__links${f.related.length <= 2 ? ' expertise-card__links--single' : ''}" aria-labelledby="${id}-label">`,
    ...links.map((l) => `  ${l}`),
    `${I}            </ul>`,
    `${I}            <a class="expertise-card__all" href="products.html?category=${f.cat}">View all ${esc(CATEGORY[f.cat])} (${total})${ARROW}</a>`,
    `${I}          </div>`,
    `${I}        </div>`,
    `${I}      </div>`,
    `${I}    </div>`,
    `${I}  </article>`,
    `${I}</li>`
  ].join('\n');
};
write('about.html', 'expertise', EXPERTISE.map(expertiseCard), (html) => html.replace(
  /<ul class="grid grid--3 flip-grid">(\s*<!-- expertise:start -->)/,
  '<ul class="expertise-grid">$1'
));
