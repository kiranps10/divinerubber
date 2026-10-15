/**
 * Product detail page (markup: tools/build-product-pages.js).
 * Section tabs [data-pd-tabs]: the tab of the section being read is marked
 * aria-current="true" while scrolling (links themselves are plain anchors).
 */
export function initProductDetail() {
  const tabs = document.querySelector('[data-pd-tabs]');
  if (!tabs) return;
  const links = [...tabs.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const mark = (id) => links.forEach((a) => {
    if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  // The section crossing a line just below the tabs is the current one
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) mark(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach((s) => observer.observe(s));
}
