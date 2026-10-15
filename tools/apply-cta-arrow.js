/**
 * Gives every gradient CTA button (.btn--primary) the client-supplied arrow-circle
 * SVG ("arrow 1.svg" → assets/icons/arrow-1.svg), exactly like "Find Your Solution".
 *   node tools/apply-cta-arrow.js
 *
 * Other button styles (white, outline) keep their sprite arrow, because the supplied
 * SVG is a WHITE circle and would be invisible on light buttons.
 * Safe to run repeatedly. Page/product generators already output the same markup.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  'partials/header.html',
  'partials/footer.html'
];

const imgTag = (prefix) => `<span class="btn__icon"><img src="${prefix}assets/icons/arrow-1.svg" alt="" width="21" height="21"></span>`;
const spriteSpan = /<span class="btn__icon"><svg aria-hidden="true"><use href="assets\/icons\/sprite\.svg#i-arrow-circle"><\/use><\/svg><\/span>/;
let changed = 0;

for (const file of files) {
  const full = path.join(ROOT, file);
  const original = fs.readFileSync(full, 'utf8');
  const prefix = file === '404.html' ? '/' : ''; // 404 uses root-relative paths
  const html = original.replace(/(<(a|button)\s+class="btn btn--primary[^"]*"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, inner, close) => {
    if (inner.includes('arrow-1.svg')) return m; // already done
    if (spriteSpan.test(inner)) { changed++; return open + inner.replace(spriteSpan, imgTag(prefix)) + close; }
    if (!inner.includes('btn__icon')) { // primary button without an icon (e.g. 404 "Go to Homepage")
      changed++;
      return `${open}${inner.trimEnd()}\n          ${imgTag(prefix)}\n        ${close}`;
    }
    return m;
  });
  if (html !== original) fs.writeFileSync(full, html);
}
console.log(`CTA arrow: ${changed} gradient button(s) updated.`);
