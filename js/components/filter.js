/**
 * Category filter tabs (products, blogs, news, gallery).
 * Markup:
 * <div class="filter-tabs" data-filter="products" role="group" aria-label="Filter by category">
 *   <button class="filter-tabs__btn" data-filter-value="all" aria-pressed="true">All</button> …
 * </div>
 * <ul data-filter-list="products"> <li data-filter-item data-category="hollow-mats stud-mats">…</li> </ul>
 * <p data-filter-empty="products" hidden>No items</p>
 *
 * Supports ?category=<value> in the URL so menu links open a pre-filtered list.
 */
export function initFilters() {
  document.querySelectorAll('[data-filter]').forEach((group) => {
    const name = group.dataset.filter;
    const list = document.querySelector(`[data-filter-list="${name}"]`);
    if (!list) return;
    const buttons = [...group.querySelectorAll('[data-filter-value]')];
    const items = [...list.querySelectorAll('[data-filter-item]')];
    const empty = document.querySelector(`[data-filter-empty="${name}"]`);
    const status = document.querySelector(`[data-filter-status="${name}"]`);

    const apply = (value, updateUrl) => {
      let shown = 0;
      items.forEach((item) => {
        const cats = (item.dataset.category || '').split(/\s+/);
        const match = value === 'all' || cats.includes(value);
        item.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterValue === value)));
      if (empty) empty.hidden = shown > 0;
      list.dispatchEvent(new CustomEvent('filter:change', { detail: { value, shown } }));
      if (status) {
        const label = buttons.find((b) => b.dataset.filterValue === value)?.textContent.trim();
        status.textContent = `Showing ${shown} item${shown === 1 ? '' : 's'}${value === 'all' ? '' : ` in ${label}`}.`;
      }
      if (updateUrl && group.hasAttribute('data-filter-url')) {
        const url = new URL(location.href);
        if (value === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', value);
        history.replaceState(null, '', url);
      }
    };

    buttons.forEach((btn) => btn.addEventListener('click', () => apply(btn.dataset.filterValue, true)));

    const fromUrl = new URLSearchParams(location.search).get('category');
    const initial = buttons.some((b) => b.dataset.filterValue === fromUrl) ? fromUrl : 'all';
    apply(initial, false);
    // Bring a pre-filtered list into view when arriving from a menu link — or, when the
    // link names one item (#product-…, e.g. from About › Core Expertise), that item.
    // Filtering moves the items, so the browser's own jump to the #id has to be redone.
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target && list.contains(target) && !target.hidden) {
      requestAnimationFrame(() => target.scrollIntoView({ block: 'center' }));
    } else if (initial !== 'all' && group.hasAttribute('data-filter-url')) {
      requestAnimationFrame(() => group.scrollIntoView({ block: 'start' }));
    }
  });
}
