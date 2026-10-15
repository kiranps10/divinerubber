/**
 * Rebuilds assets/icons/sprite.svg (all UI icons) from tools/sprite-source.svg.
 *   node tools/build-sprite.js
 *
 * - Converts the readable `class="s"` / `class="f"` shorthand into plain SVG
 *   attributes (external <use> references ignore <style> blocks in some browsers).
 * - Adds the button arrow from the client-supplied arrow-right.svg (#i-arrow-circle).
 *
 * If assets/icons/sprite.svg is ever overwritten or broken, just run this again.
 * NEVER copy another SVG over assets/icons/sprite.svg — every icon on the site lives in it.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let svg = fs.readFileSync(path.join(__dirname, 'sprite-source.svg'), 'utf8');

const STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
svg = svg
  .replace(/\s*<defs>[\s\S]*?<\/defs>/, '')
  .replace(/class="s" stroke-width="([\d.]+)"/g, `${STROKE} stroke-width="$1"`)
  .replace(/class="s"/g, `${STROKE} stroke-width="1.6"`)
  .replace(/class="f"/g, 'fill="currentColor"');

// Button arrow: client-supplied arrow-right.svg (solid circle, cut-out chevron).
const arrow = fs.readFileSync(path.join(ROOT, 'arrow-right.svg'), 'utf8');
const d = arrow.match(/<path[^>]*\sd="([^"]+)"/)[1];
const viewBox = arrow.match(/viewBox="([^"]+)"/)[1];
svg = svg.replace(
  '  <symbol id="i-arrow-right"',
  `  <!-- Button arrow — supplied arrow-right.svg (circle with cut-out chevron). Circle takes the button's text colour. -->\n  <symbol id="i-arrow-circle" viewBox="${viewBox}"><path fill="currentColor" d="${d}"/></symbol>\n  <symbol id="i-arrow-right"`
);

const out = path.join(ROOT, 'assets', 'icons', 'sprite.svg');
fs.writeFileSync(out, svg);
const count = (svg.match(/<symbol /g) || []).length;
console.log(`Sprite: ${count} icons written to ${path.relative(ROOT, out)}`);
