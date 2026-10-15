/**
 * Editorial photo mosaic (Gallery page) — wide, tall and standard tiles in a repeating pattern.
 *
 * <ul class="photo-mosaic" data-mosaic data-filter-list="gallery">
 *   <li class="photo-mosaic__item" data-filter-item data-span="w">…</li>
 * </ul>
 *
 * data-span: w = two columns wide, tl / tr = two rows tall (left / right), f = full width,
 * s (or none) = one tile. The HTML ships the pattern for "All" on desktop; this script
 * re-applies it to the photos that are visible after filtering and when the grid switches
 * between 3 and 2 columns, so every row stays complete.
 */

// Each block fills whole rows. 3 columns: wide + single, tall-left + 4, single + wide, 3 singles, 4 + tall-right
const PATTERNS = {
  3: [['w', 's'], ['tl', 's', 's', 's', 's'], ['s', 'w'], ['s', 's', 's'], ['s', 's', 'tr', 's', 's']],
  2: [['f'], ['tl', 's', 's'], ['s', 's'], ['s', 'tr', 's']],
};

// What fits when fewer photos are left than the next block needs
const REMAINDER = {
  3: { 1: ['f'], 2: ['w', 's'], 3: ['s', 's', 's'], 4: ['w', 's', 's', 'w'] },
  2: { 1: ['f'], 2: ['s', 's'] },
};

export function mosaicSpans(count, columns) {
  const blocks = PATTERNS[columns] || PATTERNS[3];
  const spans = [];
  let b = 0;
  while (spans.length < count) {
    const left = count - spans.length;
    const block = blocks[b % blocks.length];
    if (block.length <= left) {
      spans.push(...block);
      b++;
    } else {
      spans.push(...(REMAINDER[columns]?.[left] || block.slice(0, left)));
    }
  }
  return spans.slice(0, count);
}

export function initMosaics() {
  document.querySelectorAll('[data-mosaic]').forEach((list) => {
    const columns = () => getComputedStyle(list).gridTemplateColumns.split(' ').length;
    let cols = 0;

    const layout = () => {
      cols = columns();
      const visible = [...list.children].filter((li) => !li.hidden);
      mosaicSpans(visible.length, cols).forEach((span, i) => {
        visible[i].dataset.span = span;
      });
    };

    layout();
    // filter.js announces a new category; the column count changes at the mobile breakpoint
    list.addEventListener('filter:change', layout);
    let frame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (columns() !== cols) layout();
      });
    });
  });
}
