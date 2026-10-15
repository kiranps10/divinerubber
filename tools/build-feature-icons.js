/**
 * Builds the decorative "feature" icons in the approved style (icon1.svg):
 * thin outline + vertical gradient #027DB2 → #21B8CD, 48 × 48.
 *   node tools/build-feature-icons.js
 *
 * Output: assets/icons/features/<name>.svg  (used with <img> in feature cards,
 * process steps, focus cards, certifications, contact details…)
 *
 * REPLACING WITH FREEPIK ICONS: download the Freepik/Flaticon SVG, save it as
 * assets/icons/features/<same-name>.svg and add <name> to KEEP below so this
 * script never overwrites it. No HTML changes are needed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'icons', 'features');
const sprite = fs.readFileSync(path.join(ROOT, 'assets', 'icons', 'sprite.svg'), 'utf8');

// Icons supplied by the client / downloaded from Freepik — never regenerated.
// Anything in source-images/icons/ (Magnific/Freepik downloads, see tools/import-icons.js)
// is kept automatically.
const IMPORTED_DIR = path.join(ROOT, 'source-images', 'icons');
const IMPORTED = fs.existsSync(IMPORTED_DIR)
  ? fs.readdirSync(IMPORTED_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''))
  : [];
const KEEP = ['award', ...IMPORTED];
const SUPPLIED = { award: 'icon1.svg' }; // name → source file in project root (copied unchanged)

const NAMES = ['gear', 'team', 'thumb', 'award', 'globe', 'grid', 'tag', 'truck', 'briefcase', 'leaf', 'handshake',
  'file-text', 'shield', 'sparkle', 'footprint', 'droplet', 'layers', 'tractor', 'ruler', 'search', 'box', 'home',
  'clipboard', 'map-pin', 'phone', 'mail', 'factory', 'warehouse', 'box-send', 'clock', 'utensils', 'building', 'store', 'hospital', 'door', 'spec-doc', 'partner-handshake', 'sales-tag'];

fs.mkdirSync(OUT, { recursive: true });

for (const name of NAMES) {
  const file = path.join(OUT, `${name}.svg`);
  if (SUPPLIED[name]) {
    fs.copyFileSync(path.join(ROOT, SUPPLIED[name]), file);
    console.log(`icon ${name}.svg  (copied from ${SUPPLIED[name]})`);
    continue;
  }
  if (KEEP.includes(name) && fs.existsSync(file)) {
    if (IMPORTED.includes(name)) console.log(`icon ${name}.svg  (kept — imported from source-images/icons/)`);
    continue;
  }

  const m = sprite.match(new RegExp(`<symbol id="i-${name}" viewBox="0 0 24 24">([\\s\\S]*?)</symbol>`));
  if (!m) throw new Error(`Icon i-${name} not found in sprite.svg`);
  const body = m[1]
    .replace(/stroke="currentColor"/g, 'stroke="url(#g)"')
    .replace(/fill="currentColor"/g, 'fill="url(#g)"')
    // thinner, finer line to match the detailed outline style of icon1.svg
    .replace(/stroke-width="[\d.]+"/g, 'stroke-width="1.1"');

  const svg = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stop-color="#027DB2"/><stop offset="1" stop-color="#21B8CD"/></linearGradient></defs>
${body}
</svg>
`;
  fs.writeFileSync(file, svg);
  console.log(`icon ${name}.svg`);
}
