/**
 * Scroll-snap slider: prev/next buttons, mouse drag, optional dots.
 * Markup: [data-slider] > [data-slider-track] (+ [data-slider-prev] / [data-slider-next])
 * Add data-slider-dots to [data-slider] to generate dot navigation.
 */
export function initSliders() {
  document.querySelectorAll('[data-slider]').forEach(setupSlider);
}

function setupSlider(slider) {
  const track = slider.querySelector('[data-slider-track]');
  if (!track) return;
  const prev = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  const slides = () => [...track.children];

  const step = () => {
    const first = slides()[0];
    return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  // --- Dots ---
  let dots = [];
  if (slider.hasAttribute('data-slider-dots')) {
    const nav = document.createElement('div');
    nav.className = 'slider__dots';
    nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', 'Choose slide');
    dots = slides().map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' });
      });
      nav.append(dot);
      return dot;
    });
    slider.append(nav);
  }

  // --- State: disable arrows at the ends, highlight current dot ---
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
    if (dots.length) {
      const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
      let current = 0;
      slides().forEach((s, i) => {
        if (s.getBoundingClientRect().left - left < s.offsetWidth / 2) current = i;
      });
      if (track.scrollLeft >= max) current = slides().length - 1;
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === current)));
    }
    // Hide dots/arrows when everything already fits
    slider.classList.toggle('is-static', track.scrollWidth <= track.clientWidth + 2);
  };

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });
  new ResizeObserver(update).observe(track);
  update();

  // --- Mouse drag (touch already scrolls natively) ---
  let startX = 0;
  let startScroll = 0;
  let dragging = false;
  let moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5 && !moved) {
      moved = true;
      track.classList.add('is-dragging');
    }
    if (moved) track.scrollLeft = startScroll - dx;
  });

  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      track.classList.remove('is-dragging');
      // Snap to nearest slide after the drag
      const s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
    }
  });

  // A drag must not trigger the link underneath
  track.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());
}
