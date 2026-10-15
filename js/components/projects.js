/**
 * Projects carousel: one card is open (wide), the others are narrow.
 * Markup: [data-projects] … [data-project-card] (+ [data-projects-controls] with
 * [data-projects-prev] / [data-projects-next] / [data-projects-dots] right after it)
 * Autoplay: data-projects-autoplay="4500" (ms per project) on [data-projects].
 *
 * - The card with `is-active` in the HTML starts open, so the section works without JavaScript.
 * - Hover (mouse/pen) or keyboard focus on a card opens it; the last one stays open.
 * - Arrows step through the cards (looping), dots jump to one; the opened card is
 *   scrolled into view and the autoplay timer restarts.
 * - Autoplay opens the next project every few seconds (looping, dots follow).
 *   Pauses while hovered, keyboard-focused, dragged, touched, off-screen or in a
 *   hidden tab. prefers-reduced-motion: no autoplay.
 * - Tablets/phones (cards all the same width): swiping updates the dots to the card in view.
 * - "‹ DRAG ›" badge in the middle of the card under the pointer (hover) and while
 *   dragging/touching; it is pointer-events: none, so links underneath stay clickable.
 */
const PHONE = '(max-width: 1023.98px)'; // equal-width cards (matches the SCSS md breakpoint)

export function initProjects() {
  document.querySelectorAll('[data-projects]').forEach(setup);
}

function setup(slider) {
  const track = slider.querySelector('[data-slider-track]');
  const cards = [...slider.querySelectorAll('[data-project-card]')];
  const controls = slider.parentElement.querySelector('[data-projects-controls]');
  if (!track || cards.length < 2) return;

  const prev = controls?.querySelector('[data-projects-prev]');
  const next = controls?.querySelector('[data-projects-next]');
  const dotsWrap = controls?.querySelector('[data-projects-dots]');
  const phone = window.matchMedia(PHONE);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const delay = Number(slider.dataset.projectsAutoplay) || 0;
  let index = Math.max(0, cards.findIndex((c) => c.classList.contains('is-active')));
  let revealTimer = null;
  let timer = null;
  let touchResume = null;
  let hovering = false;
  let focused = false;
  let touching = false;
  let visible = false;

  const dots = cards.map((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider__dot';
    const title = card.querySelector('.project-card__title')?.textContent.trim();
    dot.setAttribute('aria-label', `Show project ${i + 1}${title ? `: ${title}` : ''}`);
    dot.addEventListener('click', () => {
      activate(i, true);
      start();
    });
    dotsWrap?.append(dot);
    return dot;
  });

  // Drag badge (decorative): one per card, centred over the photo
  cards.forEach((card) => {
    const badge = document.createElement('span');
    badge.className = 'drag-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML = '<svg><use href="assets/icons/sprite.svg#i-chevron-left"></use></svg>Drag<svg><use href="assets/icons/sprite.svg#i-chevron-right"></use></svg>';
    card.append(badge);
  });

  // Keep the badge in the middle of the visible photo (above the text panel), so it
  // never sits on the title; falls back to the card centre when that area is too small
  const placeBadges = () => cards.forEach((card) => {
    const panel = card.querySelector('.project-card__panel');
    const badge = card.querySelector('.drag-badge');
    if (!panel || !badge) return;
    const free = panel.offsetTop;
    card.style.setProperty('--badge-y', free >= badge.offsetHeight + 24 ? `${free / 2}px` : '50%');
  });
  new ResizeObserver(placeBadges).observe(track);
  cards.forEach((card) => card.querySelector('.project-card__panel') && new ResizeObserver(placeBadges).observe(card.querySelector('.project-card__panel')));

  const sync = () => {
    cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  };

  // Scroll the track (never the page) so the card is fully visible
  const reveal = (card) => {
    const t = track.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const r = card.getBoundingClientRect();
    if (r.left < t.left + pad - 1) {
      track.scrollTo({ left: track.scrollLeft + r.left - t.left - pad });
    } else if (r.right > t.right - pad + 1) {
      // Wider than the view → align its start, otherwise its end
      const shift = r.width > t.width - 2 * pad ? r.left - t.left - pad : r.right - t.right + pad;
      track.scrollTo({ left: track.scrollLeft + shift });
    }
  };

  function activate(i, scroll = false) {
    const target = (i + cards.length) % cards.length; // loops at both ends
    if (target !== index) {
      index = target;
      sync();
    }
    if (!scroll) return;
    // Wait for the open/close animation so the final widths are measured
    clearTimeout(revealTimer);
    const wait = phone.matches || reduced.matches ? 0 : 650;
    revealTimer = setTimeout(() => reveal(cards[index]), wait);
  }

  // --- Autoplay ---
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  function start() {
    stop();
    if (!delay || reduced.matches || hovering || focused || touching || !visible || document.hidden) return;
    timer = setInterval(() => {
      if (!track.classList.contains('is-dragging')) activate(index + 1, true);
    }, delay);
  }

  cards.forEach((card, i) => {
    card.addEventListener('pointerenter', (e) => {
      // Not while the track is being dragged, and never on touch
      if (e.pointerType === 'touch' || track.classList.contains('is-dragging') || phone.matches) return;
      activate(i);
    });
    card.addEventListener('focusin', () => activate(i, true));
  });

  prev?.addEventListener('click', () => {
    activate(index - 1, true);
    start(); // full interval before the next automatic step
  });
  next?.addEventListener('click', () => {
    activate(index + 1, true);
    start();
  });

  // Hover over the cards or the controls pauses autoplay
  [slider, controls].filter(Boolean).forEach((area) => {
    area.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      hovering = true;
      stop();
    });
    area.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      hovering = false;
      start();
    });
    // Only real keyboard focus pauses (a mouse click also focuses buttons/links)
    area.addEventListener('focusin', (e) => {
      if (!e.target.matches(':focus-visible')) return;
      focused = true;
      stop();
    });
    area.addEventListener('focusout', (e) => {
      if (slider.contains(e.relatedTarget) || controls?.contains(e.relatedTarget)) return;
      focused = false;
      start();
    });
  });

  // Touch: show the drag badge on the touched card, pause autoplay for a while
  track.addEventListener('touchstart', (e) => {
    const card = e.target.closest('[data-project-card]');
    cards.forEach((c) => c.classList.toggle('is-touching', c === card));
    touching = true;
    stop();
    clearTimeout(touchResume);
  }, { passive: true });
  track.addEventListener('touchend', () => {
    clearTimeout(touchResume);
    touchResume = setTimeout(() => {
      cards.forEach((c) => c.classList.remove('is-touching'));
      touching = false;
      start();
    }, Math.max(delay, 3000));
  }, { passive: true });

  // Tablets/phones: all cards are equal, so follow the swipe with the dots
  const followScroll = () => {
    const t = track.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let current = 0;
    cards.forEach((card, i) => {
      if (card.getBoundingClientRect().left - (t.left + pad) < card.offsetWidth / 2) current = i;
    });
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) current = cards.length - 1;
    index = current;
  };

  let ticking = false;
  track.addEventListener('scroll', () => {
    // Only a user swipe moves the dots (autoplay/arrows/dots already set the index)
    if (!phone.matches || !touching || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      followScroll();
      sync();
    });
  }, { passive: true });

  // Only run while on screen and the tab is visible
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.3 }).observe(slider);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  if (phone.matches) followScroll();
  sync();
  if (controls) controls.hidden = false;
}
