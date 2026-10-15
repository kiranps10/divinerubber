/**
 * Flip card "+ More sizes" / "+ More colors" buttons (markup: tools/flip-card.js).
 *   <button class="flip-card__more" aria-controls="LIST_ID" aria-expanded="false" data-more="sizes">
 * Reveals the hidden items of that list; pressing again hides them. The flip itself is CSS only.
 */
export function initFlipCards() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('button[data-more]');
    if (!btn) return;
    const list = document.getElementById(btn.getAttribute('aria-controls'));
    if (!list) return;
    const open = btn.getAttribute('aria-expanded') !== 'true';
    list.querySelectorAll('[data-extra]').forEach((item) => {
      item.hidden = !open;
    });
    // The list keeps its fixed height and scrolls, so the card never changes size
    list.classList.toggle('is-expanded', open);
    if (!open) list.scrollTop = 0;
    btn.setAttribute('aria-expanded', String(open));
    const count = btn.querySelector('.visually-hidden');
    btn.firstChild.textContent = open ? `− Fewer ${btn.dataset.more}` : `+ More ${btn.dataset.more}`;
    if (count) count.hidden = open;
  });
}
