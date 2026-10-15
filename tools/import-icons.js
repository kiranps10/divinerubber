/**
 * Imports icons downloaded from Magnific / Freepik into the site's feature-icon style.
 *   1. Download the SVG from magnific.com (needs the team's account; check the licence —
 *      free icons usually require attribution, premium ones don't).
 *   2. Save it as  source-images/icons/<name>.svg  using the name the page already uses, e.g.
 *        sales-chat.svg     Contact › Sales Enquiries (speech bubble with dots)
 *        spec-messages.svg  Contact › Product & Specification Enquiries (two message bubbles)
 *        partner-mail.svg   Contact › Business & Distribution Enquiries (envelope with question mark)
 *   3. Run  node tools/import-icons.js
 *
 * Each file is written to assets/icons/features/<name>.svg at 48 × 48 with every colour
 * replaced by the Divine Rubber gradient (#027DB2 → #21B8CD), so it matches the other icons.
 * tools/build-feature-icons.js skips any name found in source-images/icons/, so imported
 * icons are never overwritten. The original downloads are left unchanged.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'source-images', 'icons');
const OUT = path.join(ROOT, 'assets', 'icons', 'features');
const GRADIENT_ID = 'dr-g';

if (!fs.existsSync(SRC)) {
  console.log('No source-images/icons/ folder yet — nothing to import.');
  process.exit(0);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg'));
if (!files.length) console.log('source-images/icons/ is empty — nothing to import.');

for (const file of files) {
  let svg = fs.readFileSync(path.join(SRC, file), 'utf8');
  svg = svg
    .replace(/<\?xml[^>]*>\s*/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/gi, '');

  const open = svg.match(/<svg\b[^>]*>/i);
  if (!open) {
    console.warn(`skip ${file}: not an SVG`);
    continue;
  }
  // Keep the original drawing area; derive one from width/height if there is no viewBox
  let viewBox = open[0].match(/viewBox="([^"]+)"/i)?.[1];
  if (!viewBox) {
    const w = parseFloat(open[0].match(/\swidth="([\d.]+)/i)?.[1] || '24');
    const h = parseFloat(open[0].match(/\sheight="([\d.]+)/i)?.[1] || '24');
    viewBox = `0 0 ${w} ${h}`;
  }

  let body = svg.slice(svg.indexOf(open[0]) + open[0].length, svg.lastIndexOf('</svg>'));
  // Every real colour → brand gradient (keep none / transparent / white cut-outs)
  const recolour = (value) => (/^(none|transparent|#fff(fff)?|white|url\()/i.test(value.trim()) ? value : `url(#${GRADIENT_ID})`);
  body = body
    .replace(/\b(fill|stroke)="([^"]+)"/gi, (m, attr, value) => `${attr}="${recolour(value)}"`)
    .replace(/\b(fill|stroke)\s*:\s*([^;"']+)/gi, (m, attr, value) => `${attr}:${recolour(value)}`)
    .replace(/<style[\s\S]*?<\/style>/gi, (style) => style.replace(/(fill|stroke)\s*:\s*([^;}]+)/gi, (m, attr, value) => `${attr}:${recolour(value)}`));
  // Shapes without their own colour inherit from the root: gradient fill, unless the original
  // is an outline icon (root fill="none") — then keep that and colour its strokes instead
  const rootIsOutline = /\sfill="none"/i.test(open[0]);
  const rootStroke = open[0].match(/\sstroke="([^"]+)"/i);
  const rootFill = rootIsOutline ? ' fill="none"' : ` fill="url(#${GRADIENT_ID})"`;
  const rootStrokeAttrs = rootStroke && !/^none$/i.test(rootStroke[1])
    ? ` stroke="url(#${GRADIENT_ID})"${(open[0].match(/\sstroke-(width|linecap|linejoin)="[^"]+"/gi) || []).join('')}`
    : '';

  const out = `<svg width="48" height="48" viewBox="${viewBox}"${rootFill}${rootStrokeAttrs} xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${GRADIENT_ID}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#027DB2"/><stop offset="1" stop-color="#21B8CD"/></linearGradient></defs>
${body.trim()}
</svg>
`;
  fs.writeFileSync(path.join(OUT, file), out);
  console.log(`icon ${file}  (imported from source-images/icons/)`);
}
