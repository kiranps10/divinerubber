/**
 * About › Our Core Expertise cards (markup: tools/build-product-list.js).
 * Desktop (mouse): the details appear on hover / keyboard focus — CSS only.
 * Touch screens: the description shows under the photo and a "Related products"
 * button opens / closes the product links. Without JavaScript everything stays visible.
 */
export function initExpertise() {
  document.querySelectorAll('[data-expertise]').forEach((card) => {
    const button = card.querySelector('.expertise-card__toggle');
    if (!button) return;
    button.hidden = false;
    card.classList.add('is-collapsible');
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      card.classList.toggle('is-open', open);
    });
  });
}
