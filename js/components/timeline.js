/**
 * Auto-playing timeline (Home › Milestones, About › Our Journey): the dark "active"
 * style moves card by card in a loop, and a blue handle on the line below follows it.
 *
 * Enable on a timeline with:  <div class="slider timeline" data-timeline-autoplay="4500">
 *   (value = milliseconds per card)
 * Handle: [data-timeline-scrubber] > [data-timeline-handle] (role="slider").
 *
 * - Exactly one card is active (dark) at a time; the first card starts active.
 * - Hover / keyboard focus pauses the loop and activates the card under the
 *   pointer, so two cards are never dark together. Leaving resumes from there.
 * - Handle: drag it (mouse, pen or touch) or click/tap the line to move through the
 *   milestones; it snaps to the nearest one on release. Keyboard: ←/→, Home/End.
 *   Any manual move restarts the timer.
 * - Cards running off the screen edges fade out; each fade shows only when there is
 *   more to see on that side.
 * - Pauses while off-screen or when the browser tab is hidden.
 * - Touch: a tap pauses for a few seconds, then the loop resumes.
 * - prefers-reduced-motion: the first card stays active, no looping (handle still works).
 */
export function initTimelineAutoplay() {
  document.querySelectorAll('[data-timeline-autoplay]').forEach(setup);
}

function setup(timeline) {
  const items = [...timeline.querySelectorAll('.timeline__item')];
  if (items.length < 2) return;

  const delay = Number(timeline.dataset.timelineAutoplay) || 4500;
  const track = timeline.querySelector('[data-slider-track]');
  const scrubber = timeline.querySelector('[data-timeline-scrubber]');
  const handle = timeline.querySelector('[data-timeline-handle]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const last = items.length - 1;
  let index = 0;
  let timer = null;
  let hovering = false;
  let focused = false;
  let dragging = false;
  let visible = false;
  let touchResume = null;

  // While autoplay is on, the active class alone decides which card is dark
  timeline.classList.add('timeline--autoplay');

  const pad = () => (track ? parseFloat(getComputedStyle(track).paddingLeft) || 0 : 0);
  const fadeExtra = () => parseFloat(getComputedStyle(timeline).getPropertyValue('--fade-extra')) || 0;

  // Scroll the track (never the page) so the active card is clear of the edge fades
  const keepInView = (item, force = false) => {
    if (!track || (!force && (hovering || focused))) return;
    const i = items.indexOf(item);
    const max = track.scrollWidth - track.clientWidth;
    let target = track.scrollLeft;
    if (i === 0) target = 0;
    else if (i === last) target = max;
    else {
      const t = track.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      const margin = pad() + fadeExtra();
      // Not clear of the fades → line its start up with the page edge, which is also
      // the track's scroll-snap position (so snapping never pulls it back off-screen)
      if (r.left < t.left + margin || r.right > t.right - margin) target += r.left - (t.left + pad());
    }
    target = Math.max(0, Math.min(max, target));
    if (Math.abs(target - track.scrollLeft) > 1) track.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  };

  // --- Handle on the line: position = progress through the milestones ---
  // Handle travels between the page edges, but never less than its own radius from the screen edge
  const inset = () => Math.max(pad(), (handle?.offsetWidth || 0) / 2 + 4);
  const placeHandle = (ratio) => {
    if (!scrubber) return;
    const p = inset();
    const x = p + ratio * Math.max(0, scrubber.clientWidth - 2 * p);
    scrubber.style.setProperty('--pos', `${x}px`);
  };
  const ratioAt = (clientX) => {
    const r = scrubber.getBoundingClientRect();
    const p = inset();
    return Math.min(1, Math.max(0, (clientX - r.left - p) / Math.max(1, r.width - 2 * p)));
  };
  const describe = () => {
    if (!handle) return;
    const year = items[index].querySelector('.timeline__year')?.textContent.trim() || '';
    const title = items[index].querySelector('.timeline__title')?.textContent.trim() || '';
    handle.setAttribute('aria-valuemin', '1');
    handle.setAttribute('aria-valuemax', String(items.length));
    handle.setAttribute('aria-valuenow', String(index + 1));
    handle.setAttribute('aria-valuetext', `${year}: ${title}`);
  };

  const activate = (i, force = false) => {
    index = (i + items.length) % items.length;
    items.forEach((item, n) => item.classList.toggle('is-active', n === index));
    keepInView(items[index], force);
    if (!dragging) placeHandle(index / last);
    describe();
  };

  // --- Edge fades: only where more cards are hidden ---
  const updateFades = () => {
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    timeline.classList.toggle('has-prev', track.scrollLeft > 2);
    timeline.classList.toggle('has-next', track.scrollLeft < max - 2);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (reduced || hovering || focused || dragging || !visible || document.hidden) return;
    timer = setInterval(() => activate(index + 1), delay);
  };

  activate(0);
  updateFades();
  let ticking = false;
  track?.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateFades();
    });
  }, { passive: true });
  if (scrubber) {
    new ResizeObserver(() => {
      placeHandle(index / last);
      updateFades();
    }).observe(scrubber);
  }

  // --- Dragging the handle / clicking the line (works under reduced motion too) ---
  if (scrubber) {
    const follow = (e) => {
      const ratio = ratioAt(e.clientX);
      placeHandle(ratio); // handle follows the pointer smoothly…
      const i = Math.round(ratio * last);
      if (i !== index) activate(i, true); // …and the nearest milestone becomes active
    };
    scrubber.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      stop();
      scrubber.classList.add('is-dragging');
      scrubber.setPointerCapture(e.pointerId);
      handle?.focus({ preventScroll: true });
      follow(e);
    });
    scrubber.addEventListener('pointermove', (e) => {
      if (dragging) follow(e);
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      scrubber.classList.remove('is-dragging');
      placeHandle(index / last); // snap onto the chosen milestone
      start();
    };
    scrubber.addEventListener('pointerup', release);
    scrubber.addEventListener('pointercancel', release);
  }

  handle?.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    let target = null;
    if (step) target = Math.min(last, Math.max(0, index + step));
    if (e.key === 'Home') target = 0;
    if (e.key === 'End') target = last;
    if (target === null) return;
    e.preventDefault();
    activate(target, true);
  });

  if (reduced) return;

  // Hover (mouse/pen): pause and follow the pointer
  items.forEach((item, i) => {
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch' || dragging) return;
      hovering = true;
      stop();
      activate(i);
    });
  });
  timeline.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = false;
    start();
  });

  // Touch: tap a card to show it, resume after a short pause
  timeline.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.timeline__item');
    if (item) activate(items.indexOf(item));
    stop();
    clearTimeout(touchResume);
    touchResume = setTimeout(start, delay * 2);
  }, { passive: true });

  // Keyboard: focusing inside a card (or the handle) pauses; a card also activates
  // (a mouse click also focuses — only real keyboard focus pauses the loop)
  timeline.addEventListener('focusin', (e) => {
    if (!e.target.matches(':focus-visible')) return;
    const item = e.target.closest('.timeline__item');
    focused = true;
    stop();
    if (item) activate(items.indexOf(item));
  });
  timeline.addEventListener('focusout', (e) => {
    if (timeline.contains(e.relatedTarget)) return;
    focused = false;
    start();
  });

  // Only run while the timeline is on screen and the tab is visible
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.25 }).observe(timeline);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
