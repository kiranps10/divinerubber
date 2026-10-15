# Divine Rubber Website

Static website for **Divine Rubber Products** built with **HTML + SCSS (Sass) + vanilla JavaScript** — no framework.
Design source: `Divinerubber.pdf` / `Divinerubber.fig` (approved homepage). Page structure: `Inner PAge Sections.docx`.
Standards: `cpanel commads and wp ai build rules.docx` (team checklist).

> The reference files (`.pdf`, `.fig`, `.docx`) and the original photos in this folder are **never modified**.

---

## 1. Quick start (first time)

You need **Node.js** (already installed on this PC: v24). Open a terminal in this folder, then:

```bash
npm install        # downloads the tools listed in package.json (one time only)
npm run dev        # builds everything, then starts the local website
```

Open **http://localhost:8080** in your browser. Press **Ctrl + C** in the terminal to stop the server.

### Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Build everything and start the local site |
| `npm run serve` | Start the local site only (no rebuild) |
| `npm run build` | Copy header/footer into every page + compile Sass to `css/main.css` and `css/main.min.css` |
| `npm run sass:watch` | Re-compile CSS automatically every time you save an `.scss` file (leave it running while styling) |
| `npm run partials` | Copy `partials/header.html` + `partials/footer.html` into every page |
| `npm run products` | Rebuild the product list and product detail pages from `tools/product-*.js` |
| `npm run images` | Re-create optimised images/videos in `assets/` from the originals |
| `npm run qa` | Run the full automated QA suite (needs `npm run serve` running in another terminal) |

> **Tip:** the pages load `css/main.min.css`. After editing SCSS, run `npm run build` (or keep `npm run sass:watch` running *and* run `npm run sass:min` before uploading).

---

## 2. Folder structure

```
Divinerubber/
├── index.html … contact.html      ← all pages (13 required pages + 6 extra product pages + privacy, terms, 404)
├── partials/                      ← SHARED header.html and footer.html (edit here, then `npm run partials`)
├── assets/
│   ├── images/                    ← optimised WebP images (brand/, home/, industries/, factory/, products/)
│   ├── videos/                    ← compressed MP4 + poster images
│   ├── icons/                     ← sprite.svg (all icons) + favicon
│   ├── fonts/                     ← self-hosted DM Sans + Playfair Display (OFL licence)
│   └── documents/                 ← put specification PDFs / catalogue here
├── css/
│   ├── main.css                   ← compiled, readable
│   └── main.min.css               ← compiled, minified (used by the pages)
├── scss/
│   ├── main.scss                  ← Sass entry point
│   ├── abstracts/                 ← _variables (colours, fonts, spacing), _breakpoints, _mixins, _functions
│   ├── base/                      ← fonts, reset, base, typography
│   ├── layout/                    ← container, grid, sections, header, footer
│   ├── components/                ← buttons, section-heading, cards, tabs, accordion, forms, slider, lightbox…
│   ├── pages/                     ← page-specific styles only (_home, _about, _products…)
│   └── vendors/                   ← third-party CSS (none used)
├── js/
│   ├── main.js                    ← entry point (loads the components below)
│   └── components/                ← navigation, hero, slider, filter, accordion, gallery, forms, finder, video
├── forms/send-enquiry.php         ← enquiry form mailer for cPanel (PHP)
├── tools/                         ← build + QA scripts (not uploaded to the server)
├── .htaccess                      ← security headers, caching, compression, 404 (Apache/cPanel)
├── robots.txt                     ← STAGING version (blocks search engines)
├── sitemap.xml                    ← for production
└── README.md
```

### Pages

| Page | File |
|---|---|
| Homepage | `index.html` |
| About Us | `about.html` |
| Product listing (6 category tabs, 46 products) | `products.html` |
| Product detail (template) | `product-detail.html` (DH 001) + `product-*.html` (6 more) |
| Manufacturing & Quality | `manufacturing-quality.html` |
| Industries We Serve | `industries.html` |
| Infrastructure | `infrastructure.html` |
| News & Events listing / detail | `news.html`, `news-detail.html` |
| Blog listing / detail | `blogs.html`, `blog-detail.html` |
| Contact / Enquiry | `contact.html` |
| Gallery (photos + videos) | `gallery.html` |
| Privacy, Terms, 404 | `privacy.html`, `terms.html`, `404.html` |

---

## 3. Design system (from the approved Figma file)

| Token | Value | Use |
|---|---|---|
| Primary blue | `#017CB1` | Accent bars, icons, links |
| CTA gradient | `#27B1C6 → #0A79AC` | Buttons — matches the approved button reference exactly (client decision). ⚠ White text on the bright left side is ≈ 2.5 : 1 contrast, below WCAG AA (4.5 : 1). axe cannot measure text on gradients, so it does not flag this — it is a known, accepted deviation. Accessible alternative: `#0A809F → #03659A` (see `_variables.scss`). |
| Buttons | 52 px tall, 24 px / 16 px padding, 18 px label, 21 px `arrow-right.svg` | Measured from the approved button reference |
| Dark | `#23262D` | Dark sections, footer |
| Light grey | `#F4F4F4` | Alternating sections |
| Highlight yellow | `#FFED00` | Only on dark backgrounds |
| Headings | **Playfair Display** 400 | Confirmed from the Figma file |
| Body | **DM Sans** 300–700 (variable) | Confirmed from the Figma file |

Breakpoints (`scss/abstracts/_breakpoints.scss`): 1600 · 1366 · 1200 · 1024 · 768 · 576 · 400.
Use `@include respond-to(md) { … }` — never write raw pixel media queries.

---

## 4. How to…

### Edit the shared header, menu or footer
Edit `partials/header.html` or `partials/footer.html`, then run `npm run partials`.
**Do not edit the header/footer inside individual pages** — they are overwritten (they sit between `<!-- partial:header -->` markers).

### Change colours, fonts or spacing
Edit `scss/abstracts/_variables.scss`, then `npm run build`.

### Add or replace an image
1. Put the original photo in the project folder (keep the original).
2. Add a line to `tools/asset-map.js`, e.g. `{ out: 'products/my-mat', source: 'My Mat.jpg', widths: [1600, 800, 480] }`.
3. Run `npm run images` → creates `assets/images/products/my-mat-1600.webp` etc.
4. Use it in HTML with `width`/`height`, `alt` text and `loading="lazy"` (except the first visible image).

### Add or edit a product
- Product cards: edit `tools/product-catalogue.js`.
- Product detail pages: edit/add an entry in `tools/product-details.js`.
- Run `npm run products`.

### Add a new page
1. Copy a similar page (e.g. `industries.html`) and rename it.
2. Update `<title>`, description, canonical URL, `data-section` on `<body>` and the content.
3. Keep the `<!-- partial:header -->` / `<!-- partial:footer -->` markers; run `npm run partials`.
4. Add a link in `partials/header.html` / `footer.html` and to `sitemap.xml`.
5. Page-only styles go in a new `scss/pages/_my-page.scss` (add `@use 'pages/my-page';` to `main.scss`).

### Icons (style: `icon1.svg`)
Two kinds of icons are used:

| Type | Where | Files |
|---|---|---|
| **Feature icons** — thin outline, gradient `#027DB2 → #21B8CD`, 48 × 48 (the approved `icon1.svg` style) | Feature cards, process steps, "Why Divine", certifications, contact details, focus cards | `assets/icons/features/<name>.svg`, used with `<img>` |
| **UI icons** — single colour | Arrows, chevrons, menu, close, play, social, small meta icons | `assets/icons/sprite.svg` (`<svg><use href="…#i-name">`) |

> ⚠ **Never copy another file over `assets/icons/sprite.svg`** — every UI icon on the site lives in it. If it is ever
> overwritten or broken, run `node tools/build-sprite.js` to rebuild it (source: `tools/sprite-source.svg`).
> `npm run qa:links` now reports any icon missing from the sprite.
>
> Sprite icons only display when the site is opened through a web server (`npm run serve` → http://localhost:8080).
> Opening an `.html` file directly from disk (`file://…`) blocks them — that is a browser security rule, not a bug.

**Button arrows:** every gradient button (`.btn--primary`) uses the client's exact **`arrow 1.svg`** (copied unchanged to
`assets/icons/arrow-1.svg`, loaded as an `<img>`), matching the "Find Your Solution" reference. White and outline
buttons keep the sprite arrow (`arrow-right.svg` shape) because the supplied SVG is a white circle. New gradient buttons:
copy the markup of an existing one, or run `node tools/apply-cta-arrow.js`. Check with `npm run qa:cta`.

`award.svg` **is your `icon1.svg`** (copied unchanged). The other 25 feature icons were redrawn in the same style by
`node tools/build-feature-icons.js` as stand-ins until the Freepik versions are downloaded.

**Replacing with Freepik / Flaticon (Magnific) icons — no code changes needed:**
1. On Freepik/Flaticon, pick one icon family in the same style as `icon1.svg` (thin "lineal" outline, ideally a
   "lineal gradient" pack by the same author, so all icons match). Check the licence: a free licence requires an
   attribution credit on the site; a Premium licence does not.
2. Download as **SVG** and save with the exact file name from the table below into `assets/icons/features/`.
3. In `tools/build-feature-icons.js` add the name to `KEEP` (so it is never overwritten).
4. If the downloaded icon has different colours, ask a developer (or Claude) to recolour it to the `#027DB2 → #21B8CD` gradient.

| File name | Meaning / Freepik search term |
|---|---|
| `award.svg` | ✔ already supplied (`icon1.svg`) — quality assurance badge |
| `gear.svg` | advanced manufacturing / settings gear |
| `team.svg` | design team / users group |
| `thumb.svg` | R&D / thumbs up |
| `globe.svg` | export / worldwide |
| `grid.svg` | product range / drainage grid |
| `tag.svg` | competitive pricing / price tag |
| `truck.svg` | delivery / dispatch truck |
| `briefcase.svg` | trade buyers / business |
| `leaf.svg` | natural raw materials / eco |
| `handshake.svg` | partnership / membership |
| `file-text.svg` | specifications / document |
| `shield.svg` | durability / protection |
| `sparkle.svg` | easy to clean |
| `footprint.svg` | anti-fatigue comfort / foot |
| `droplet.svg` | weatherproof / water drainage |
| `layers.svg` | moulding / non-slip layers |
| `tractor.svg` | agriculture / livestock |
| `ruler.svg` | finishing / measurement |
| `search.svg` | inspection / magnifier |
| `box.svg` | packing / storage box |
| `home.svg` | floor protection / home |
| `clipboard.svg` | audit / checklist |
| `map-pin.svg` | address / location |
| `phone.svg` | phone |
| `mail.svg` | email |

### Review placeholder / unverified content
Open any page with **`?review`** at the end of the URL (e.g. `http://localhost:8080/index.html?review`).
Every item that needs client input is outlined in pink with a note. Visitors never see this.

---

## 5. Enquiry forms

Forms validate in the browser and POST to `forms/send-enquiry.php`.

- The local preview (`npm run serve`) **cannot run PHP**, so forms correctly show *"Your enquiry could not be sent… please email/call"*. They never show a fake success.
- On cPanel: open `forms/send-enquiry.php`, set `$TO_EMAIL` and `$FROM_EMAIL` (an address on your own domain), upload, and **send a real test enquiry**.
- Includes: server-side validation, a spam honeypot, header-injection protection, a 30-second rate limit and duplicate-click prevention.
- Consider SMTP (PHPMailer) for better deliverability.

---

## 6. Deploying to cPanel

Upload **only**: all `*.html`, `assets/`, `css/`, `js/`, `forms/`, `.htaccess`, `robots.txt`, `sitemap.xml`.
Do **not** upload: `node_modules/`, `tools/`, `partials/`, `scss/`, `source-images/` (stock-photo originals + credits), reference files (`.pdf`, `.fig`, `.docx`), original photos, `package*.json`.

> `404.html` uses root-relative paths (`/css/…`), so the site must live at the domain root (or a subdomain root).

### Staging (now)
- Every page has `<meta name="robots" content="noindex, nofollow, noarchive">`.
- `robots.txt` blocks all crawlers; `.htaccess` sends `X-Robots-Tag: noindex`.

### Before production launch
1. Remove the `noindex` meta tag from every page (search for `STAGING ONLY`).
2. Replace `robots.txt` with the production version shown in its comments.
3. Remove the `X-Robots-Tag` line from `.htaccess`.
4. Enable the HTTPS redirect in `.htaccess` once SSL is active.
5. Check the canonical URLs and `sitemap.xml` match the real domain; submit the sitemap in Google Search Console.

---

## 7. QA report (12 Oct 2026)

Run everything again with `npm run serve` + `npm run qa`.

### Passed (verified on this PC)

| Check | Result | Tool |
|---|---|---|
| HTML validation | **0 errors** on all 22 pages | html-validate (`npm run validate`) |
| JavaScript console errors | **0** across all pages | headless Chrome (`qa:pages`) |
| Broken internal links / assets / #anchors | **0** (91 URLs) | `qa:links` |
| Horizontal overflow | **0** — 22 pages × 1920, 1366, 1024, 768, 390 px | `qa:pages` |
| Browser zoom 75 / 80 / 90 / 100 / 110 / 125 / 150 % | **0 issues** (154 checks, at a 1440 px laptop) | `qa:zoom` |
| Interactions (menus, mobile drawer, Escape keys, hero, filters + URL, accordion one-open, lightbox + keyboard, video, Product Finder, form validation, honest form errors, prefill, skip link, 404) | **33 / 33** | `qa:interactions` |
| Accessibility (WCAG 2.1 A/AA + best practice) | **0 violations** — 22 pages × desktop + mobile. *Exception (accepted): gradient button text contrast ≈ 2.5 : 1, see Design system.* | axe-core (`qa:a11y`) |
| Microsoft Edge | **Pass** (page checks + 33/33 interactions) | headless Edge |
| Lighthouse best practices | **100** | Lighthouse (local) |
| Images | WebP, responsive `srcset`, lazy-loaded, width/height set (CLS **0**) | — |

### Local Lighthouse performance (indication only — NOT PageSpeed Insights)

| Page | Desktop | Mobile (simulated slow 4G) |
|---|---|---|
| Home | 100 | 88 (LCP 3.9 s) |
| About | — | 89 |
| Products | 99 | 97 |
| Product detail | — | 99 |
| Contact | — | 98 |
| Gallery | 100 | 91 |

CLS is 0 and TBT ≈ 0 everywhere. The remaining mobile cost is the single render-blocking CSS file (~16 KB gzipped) and banner image size.
**To reach the 100 target** once on staging: run PageSpeed, then consider inlining critical above-the-fold CSS, adding ~960 px banner image variants, and confirming server compression/caching from `.htaccess` is active.

### Not yet verified (needs staging server or other devices)

| Item | Why |
|---|---|
| PageSpeed Insights mobile/desktop score | Needs a public URL |
| Security headers (CSP, HSTS, nosniff, X-Frame-Options) | Configured in `.htaccess`; must be checked on the real server (`curl -I` or securityheaders.com) |
| HTTPS / mixed content | Needs the live SSL site |
| Enquiry email delivery | Needs PHP hosting + a real test |
| Firefox and Safari | Not installed on this PC — test manually |
| Real phones/tablets, screen readers | Automated tests cover a lot, but a person should check |

---

## 8. Missing content & assets (client to supply)

Search pages with `?review` to see each item in place.

**Must have before launch**
- [x] **InterSmart footer logo** — supplied as `intersmart.svg`; copied unchanged to `assets/icons/intersmart-logo.svg` and used in the footer credit "Designed and Developed by InterSmart".
- [ ] **Phone numbers** — design shows 0804 769 7537 / 7535; old website lists +91 477 2710302, 8281542499, 9847543021. Confirm which to show.
- [ ] **Social media URLs** — the social links are ready as a commented-out snippet in `partials/footer.html`.
- [ ] **Privacy Policy / Terms** — drafts only; need legal approval.
- [ ] **Form recipient** — set in `forms/send-enquiry.php`.

**Claims from the design that need confirming** (kept as designed, marked TODO)
- [ ] "50+ years" / "53+ years of export experience" — conflicts with the 2002 founding year.
- [ ] 15+ countries, 100+ product variations, 200+ workers, 5 manufacturing units.
- [ ] "Veritas, Sedex & quality-audited factory" (shown on Manufacturing & Quality as Bureau Veritas / Sedex). Certificates/logos needed.
- [ ] Timeline milestones 2010, 2015, 2018, 2020 (only 2002 is verified).
- [ ] Projects "Vertex Business Tower, Bengaluru" and "PowerFlex Fitness Club, Dubai".
- [ ] Diamond Top Runner performance bars (99 %, 98 %, 85 %, 45 %) and star ratings.
- [ ] Product Finder matching rules (`js/components/finder.js`).

**Content not yet supplied**
- [ ] Vision statement; business hours (optional).
- [ ] Machine names/photos, testing procedures and parameters, production capacity, facility details, warehouse description.
- [ ] Product photos for ~38 catalogue items (shown as "Photo coming soon"), product codes for 9 newer products, sizes/thickness for pin mat, bubble mat and runner, specification PDFs, product catalogue PDF.
- [ ] Real news & events (current items are clearly marked **[Sample]**); blog articles are drafts — review text and dates.
- [ ] Genuine factory, warehouse and machinery photos. Many design images (factory, people, "SURGOR" store) look AI-generated; they are fine as mood images but should be replaced where they represent *your* facility. The rubber-mill video is genuine.
- [ ] Company & event photos for the Gallery's "Company & Events" tab.
- [ ] Divine logo as **SVG** (currently a 424 px PNG/WebP).

---

## 9. Notes for WordPress conversion

- `partials/header.html` → `header.php`, `partials/footer.html` → `footer.php`.
- Each page section is a self-contained block with BEM classes → ACF flexible-content layouts or Gutenberg blocks.
- `tools/product-catalogue.js` / `product-details.js` map to a **Product** post type + **Category** taxonomy; `product-detail.html` → `single-product.php`.
- `blogs.html` / `blog-detail.html` → `archive.php` / `single.php`; news → a *News & Events* post type with *News / Events* categories.
- `?category=` filters already work from URLs, matching WordPress taxonomy archives.
- Enqueue `css/main.min.css` and `js/main.js` (as `type="module"`).
