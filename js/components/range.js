/**
 * Product range carousel (Home): flip cards that scroll by one card on their own.
 * Markup: [data-range] > [data-slider-track] (flip cards) + [data-range-prev] / [data-range-next],
 *         data-range-autoplay="4000" (ms per card) on [data-range] to autoplay.
 * Dragging/swiping comes from js/components/slider.js; the cards flip with CSS only.
 *
 * - Arrows move one card back/forward and loop at the ends.
 * - Autoplay: one card every few seconds, looping. Pauses while hovered (a card is
 *   being read), keyboard-focused, dragged, off-screen or in a hidden tab; a touch
 *   pauses it for a while. Any arrow click restarts the full interval.
 *   prefers-reduced-motion: no autoplay.
 */
export function initProductRange() {
  document.querySelectorAll('[data-range]').forEach(setup);
}

function setup(range) {
  const track = range.querySelector('[data-slider-track]');
  if (!track || track.children.length < 2) return;
  const prev = range.querySelector('[data-range-prev]');
  const next = range.querySelector('[data-range-next]');
  const delay = Number(range.dataset.rangeAutoplay) || 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduced ? 'auto' : 'smooth';

  let timer = null;
  let touchResume = null;
  let hovering = false;
  let focused = false;
  let visible = false;
  let touchHold = false;

  const step = () => track.children[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  const max = () => track.scrollWidth - track.clientWidth;

  // Scroll the track (never the page) by one card, wrapping round at the ends
  const go = (dir) => {
    if (dir > 0 && track.scrollLeft >= max() - 2) track.scrollTo({ left: 0, behavior });
    else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max(), behavior });
    else track.scrollTo({ left: Math.round(track.scrollLeft / step() + dir) * step(), behavior });
  };

  // --- Autoplay ---
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (!delay || reduced || hovering || focused || touchHold || !visible || document.hidden) return;
    if (max() <= 2) return; // everything already fits
    timer = setInterval(() => {
      if (!track.classList.contains('is-dragging')) go(1);
    }, delay);
  };

  // --- Manual controls ---
  prev?.addEventListener('click', () => {
    go(-1);
    start(); // full interval before the next automatic step
  });
  next?.addEventListener('click', () => {
    go(1);
    start();
  });

  // Hover anywhere on the carousel (cards or arrows) pauses autoplay
  range.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = true;
    stop();
  });
  range.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = false;
    start();
  });

  // Keyboard focus inside pauses until focus leaves
  range.addEventListener('focusin', (e) => {
    // A mouse click on an arrow also focuses it — only real keyboard focus pauses
    if (!e.target.matches(':focus-visible')) return;
    focused = true;
    stop();
  });
  range.addEventListener('focusout', (e) => {
    if (range.contains(e.relatedTarget)) return;
    focused = false;
    start();
  });

  // Touch: a tap/swipe pauses, autoplay resumes after a few seconds
  range.addEventListener('touchstart', () => {
    touchHold = true;
    stop();
    clearTimeout(touchResume);
    touchResume = setTimeout(() => {
      touchHold = false;
      start();
    }, Math.max(delay * 2, 6000));
  }, { passive: true });

  // Only run while on screen and the tab is visible
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.3 }).observe(range);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
