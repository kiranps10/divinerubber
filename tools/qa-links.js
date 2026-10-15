/**
 * Internal link + asset checker.
 *   npm run serve   (in another terminal)
 *   node tools/qa-links.js
 * Checks every href/src/srcset in every page returns 200, and that #anchors exist.
 * External links (Google Maps etc.) are listed but not fetched.
 */
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://localhost:8080/';
const ROOT = path.resolve(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
// HTML comments (e.g. snippets waiting for client assets) are ignored
const html = Object.fromEntries(pages.map((p) => [p, fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/<!--[\s\S]*?-->/g, '')]));
const ids = Object.fromEntries(pages.map((p) => [p, new Set([...html[p].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

(async () => {
  const targets = new Map(); // url -> [pages]
  const anchors = [];
  const external = new Set();

  for (const page of pages) {
    const refs = [
      ...[...html[page].matchAll(/\s(?:href|src|poster|data-src|data-poster)="([^"]+)"/g)].map((m) => m[1]),
      ...[...html[page].matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))
    ];
    for (let ref of refs) {
      ref = ref.replace(/&amp;/g, '&');
      if (/^(mailto:|tel:|data:)/.test(ref)) continue;
      if (/^https?:/.test(ref)) { external.add(ref); continue; }
      if (ref.startsWith('#')) {
        if (ref.length > 1 && !ids[page].has(ref.slice(1))) anchors.push(`${page}: missing #${ref.slice(1)}`);
        continue;
      }
      const [pathPart, hash] = ref.split('#');
      const file = pathPart.split('?')[0].replace(/^\//, '');
      if (hash && pages.includes(file) && !ids[file].has(hash)) anchors.push(`${page}: ${ref} → #${hash} not found in ${file}`);
      if (!targets.has(file)) targets.set(file, new Set());
      targets.get(file).add(page);
    }
  }

  const broken = [];
  await Promise.all([...targets.keys()].map(async (file) => {
    const res = await fetch(BASE + file, { method: 'HEAD' }).catch(() => ({ status: 0 }));
    if (res.status !== 200) broken.push(`${res.status} ${file}  (used on ${[...targets.get(file)].join(', ')})`);
  }));

  // Every <use href="…sprite.svg#id"> must exist in the sprite (catches an overwritten/broken sprite)
  const spriteFile = path.join(ROOT, 'assets', 'icons', 'sprite.svg');
  const symbols = new Set([...fs.readFileSync(spriteFile, 'utf8').matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  const usedIcons = new Set(pages.flatMap((p) => [...html[p].matchAll(/sprite\.svg#([\w-]+)/g)].map((m) => m[1])));
  ['js/components/gallery.js', 'js/components/finder.js'].forEach((f) => {
    [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/(?:sprite\.svg#|icon\(')([\w-]+)/g)].forEach((m) => usedIcons.add(m[1]));
  });
  const missingIcons = [...usedIcons].filter((id) => !symbols.has(id));
  if (missingIcons.length) broken.push(`Icons missing from sprite.svg (${symbols.size} symbols found): ${missingIcons.join(', ')} — run: node tools/build-sprite.js`);
  console.log(`Sprite: ${symbols.size} icons, ${usedIcons.size} used, ${missingIcons.length} missing.`);

  console.log(`Checked ${targets.size} unique internal URLs across ${pages.length} pages.`);
  console.log(broken.length ? `BROKEN:\n  ${broken.join('\n  ')}` : 'Broken internal links/assets: 0');
  console.log(anchors.length ? `MISSING ANCHORS:\n  ${anchors.join('\n  ')}` : 'Missing #anchors: 0');
  console.log(`External links (not fetched): ${[...external].join(' | ')}`);
  process.exitCode = broken.length || anchors.length ? 1 : 0;
})();
