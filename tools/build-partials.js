/**
 * Copies the shared header/footer from /partials into every page.
 *   npm run partials
 *
 * In each page, the shared block sits between marker comments:
 *   <!-- partial:header --> … <!-- /partial:header -->
 * Everything between the markers is replaced, so edit partials/*.html, never the copies.
 * The current page's menu link gets aria-current="page" automatically.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIALS = path.join(ROOT, 'partials');

const partials = Object.fromEntries(
  fs.readdirSync(PARTIALS)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [path.basename(f, '.html'), fs.readFileSync(path.join(PARTIALS, f), 'utf8').trim()])
);

function markCurrent(html, page) {
  // Only exact links to this file (ignoring ?query / #hash variants)
  return html.replace(/<a ([^>]*?)href="([^"#?]+)"([^>]*)>/g, (tag, before, href, after) =>
    href === page && !/aria-current/.test(tag) ? `<a ${before}href="${href}" aria-current="page"${after}>` : tag
  );
}

const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let updated = 0;

for (const page of pages) {
  const file = path.join(ROOT, page);
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  for (const [name, content] of Object.entries(partials)) {
    const re = new RegExp(`([ \\t]*)<!-- partial:${name} -->[\\s\\S]*?<!-- /partial:${name} -->`, 'g');
    html = html.replace(re, (m, indent) => {
      const body = name === 'header' ? markCurrent(content, page) : content;
      const indented = body.split('\n').map((l) => (l ? indent + l : l)).join('\n');
      return `${indent}<!-- partial:${name} -->\n${indented}\n${indent}<!-- /partial:${name} -->`;
    });
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    updated++;
  }
}

console.log(`Partials: ${updated} of ${pages.length} page(s) updated.`);
