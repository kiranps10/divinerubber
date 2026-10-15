/**
 * Product page gallery (markup: tools/build-product-pages.js).
 *   [data-pd-gallery data-pd-interval="4000"]
 *     .pd-gallery__stage > [data-pd-slide]… (stacked photos, the active one has .is-active)
 *                         + [data-pd-prev] / [data-pd-next]
 *     [data-pd-thumb]… (one per photo, aria-pressed on the active one)
 *
 * - Thumbnails, arrows, swipe (touch) and ←/→ keys change the photo; it loops.
 * - Autoplay: next photo every few seconds. Pauses while the pointer is over the gallery,
 *   while it has keyboard focus, after a touch, off-screen or in a hidden tab; resumes
 *   afterwards. Any manual change restarts the full interval.
 * - prefers-reduced-motion: no autoplay and no fade (manual controls still work).
 * - Only the gallery changes — the product cards elsewhere always show the main photo.
 * A product with one photo has no [data-pd-gallery], so none of this runs.
 */
export function initProductGallery() {
  document.querySelectorAll('[data-pd-gallery]').forEach(setup);
}

function setup(gallery) {
  const slides = [...gallery.querySelectorAll('[data-pd-slide]')];
  const thumbs = [...gallery.querySelectorAll('[data-pd-thumb]')];
  if (slides.length < 2) return;
  const stage = gallery.querySelector('.pd-gallery__stage');
  const strip = thumbs[0]?.closest('ul');
  const delay = Number(gallery.dataset.pdInterval) || 4000;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;
  let hovering = false;
  let focused = false;
  let touchHold = false;
  let visible = false;
  let touchResume = null;

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    thumbs.forEach((t, n) => t.setAttribute('aria-pressed', String(n === index)));
    // Keep the active thumbnail in view inside the strip (never scrolls the page)
    const t = thumbs[index];
    if (strip && t) {
      const left = t.offsetLeft - strip.offsetLeft;
      if (left < strip.scrollLeft || left + t.offsetWidth > strip.scrollLeft + strip.clientWidth) {
        strip.scrollTo({ left: left - 2, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  };

  // --- Autoplay ---
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (reduced || hovering || focused || touchHold || !visible || document.hidden) return;
    timer = setInterval(() => show(index + 1), delay);
  };
  // Manual change: show it and give the full interval before the next automatic step
  const go = (i) => {
    show(i);
    start();
  };

  // --- Controls ---
  gallery.querySelector('[data-pd-prev]')?.addEventListener('click', () => go(index - 1));
  gallery.querySelector('[data-pd-next]')?.addEventListener('click', () => go(index + 1));
  thumbs.forEach((t, n) => t.addEventListener('click', () => go(n)));
  gallery.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    go(index + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // Swipe on the image (touch). A swipe must not also open the lightbox.
  let x0 = null;
  let y0 = null;
  let swiped = false;
  stage.addEventListener('touchstart', (e) => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    swiped = false;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      go(index + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
  stage.addEventListener('click', (e) => {
    if (!swiped) return;
    e.preventDefault();
    e.stopPropagation();
    swiped = false;
  }, true);

  // --- Pausing ---
  gallery.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = true;
    stop();
  });
  gallery.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = false;
    start();
  });
  gallery.addEventListener('focusin', (e) => {
    // A mouse click also focuses — only real keyboard focus pauses
    if (!e.target.matches(':focus-visible')) return;
    focused = true;
    stop();
  });
  gallery.addEventListener('focusout', (e) => {
    if (gallery.contains(e.relatedTarget)) return;
    focused = false;
    start();
  });
  gallery.addEventListener('touchstart', () => {
    touchHold = true;
    stop();
    clearTimeout(touchResume);
    touchResume = setTimeout(() => {
      touchHold = false;
      start();
    }, Math.max(delay * 2, 6000));
  }, { passive: true });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.3 }).observe(gallery);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
