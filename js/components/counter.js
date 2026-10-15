/**
 * Count-up animation for statistics when they scroll into view (runs once).
 *
 * Automatic: every statistic value (.stats__value, .why__stat) whose text is a number
 * — "50+", "15+", "5", "40+" — counts up from 0. Prefix/suffix text is kept
 * ("+", "%", units). Non-numeric values (e.g. "[—]") are left alone.
 *
 * Explicit markup (final value is already in the HTML, so it works without JavaScript):
 *   <span class="visually-hidden">40+</span>                         ← read by screen readers
 *   <span aria-hidden="true" data-counter="40" data-suffix="+">40+</span>  ← animated
 * Optional: data-prefix="~", data-suffix=" hrs", data-duration="1800" (ms)
 * Range:    data-counter="60" data-counter-end="80" data-suffix="%"  →  counts up to "60–80%"
 *
 * The number keeps the width of its final value while counting (no layout shift).
 * Respects "reduce motion": the final values are shown with no animation.
 */
const AUTO = '.stats__value, .why__stat';
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

// "1,200+" → { prefix: '', value: 1200, suffix: '+' }; null when there is no number
const parse = (text) => {
  const m = text.trim().match(/^(\D*?)(\d[\d,]*)(\D*)$/);
  return m ? { prefix: m[1], value: Number(m[2].replace(/,/g, '')), suffix: m[3] } : null;
};

// Turn a plain stat ("50+") into the explicit markup above, so screen readers
// hear the final value once instead of every intermediate number
const upgrade = (el) => {
  if (el.querySelector('[data-counter]') || el.hasAttribute('data-counter')) return null;
  const parts = parse(el.textContent);
  if (!parts) return null;
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = el.textContent.trim();
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  shown.dataset.counter = String(parts.value);
  if (parts.prefix) shown.dataset.prefix = parts.prefix;
  if (parts.suffix) shown.dataset.suffix = parts.suffix;
  shown.textContent = sr.textContent;
  el.replaceChildren(sr, shown);
  return shown;
};

export function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll(AUTO).forEach(upgrade);
  const counters = [...document.querySelectorAll('[data-counter]')];
  if (!counters.length) return;

  const hasEnd = (el) => el.dataset.counterEnd !== undefined;
  // progress 0 → 1: single number, or both ends of a range ("60–80") counting together
  const valueAt = (el, p) => {
    const a = Math.round((Number(el.dataset.counter) || 0) * p);
    return hasEnd(el) ? `${a}–${Math.round((Number(el.dataset.counterEnd) || 0) * p)}` : a;
  };
  const format = (el, p) => `${el.dataset.prefix || ''}${valueAt(el, p)}${el.dataset.suffix || ''}`;

  const run = (el) => {
    const duration = Number(el.dataset.duration) || 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = format(el, easeOutCubic(progress));
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = format(el, 1); // always end exactly on the final value
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => {
    // Hold the final value's width so the shorter intermediate numbers don't shift the layout
    el.style.display = 'inline-block';
    el.style.fontVariantNumeric = 'tabular-nums';
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    // Only reset to 0 while it is still off-screen and waiting to animate
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) el.textContent = format(el, 0);
    observer.observe(el);
  });
}
