/**
 * Header: solid background on scroll, mobile drawer, dropdown toggles,
 * Escape to close, click-outside to close.
 */
const DESKTOP = window.matchMedia('(min-width: 1200px)');

export function initNavigation() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  // --- Light, compact header after scrolling (removed again at the top) ---
  // rAF keeps it to one class change per frame, so the shrink animation stays smooth.
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  };
  update();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  // --- Dropdowns ---
  const items = [...header.querySelectorAll('[data-dropdown]')];
  const closeAll = (except) => {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      item.querySelector('.primary-nav__toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  items.forEach((item) => {
    const toggle = item.querySelector('.primary-nav__toggle');
    toggle?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeAll(item);
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Hover-opened menus can be dismissed with Escape; reset when the mouse leaves
    item.addEventListener('mouseleave', () => item.classList.remove('is-dismissed'));

    // Close a desktop dropdown when focus leaves it
    item.addEventListener('focusout', (e) => {
      if (DESKTOP.matches && !item.contains(e.relatedTarget)) {
        item.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // --- Mobile drawer ---
  const navToggle = header.querySelector('[data-nav-toggle]');
  const backdrop = document.querySelector('[data-nav-backdrop]');
  const nav = header.querySelector('.primary-nav');

  const setDrawer = (open) => {
    document.body.classList.toggle('nav-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    if (navToggle) navToggle.querySelector('.visually-hidden').textContent = open ? 'Close menu' : 'Menu';
    if (open) nav?.querySelector('a, button')?.focus();
  };

  navToggle?.addEventListener('click', () => setDrawer(!document.body.classList.contains('nav-open')));
  backdrop?.addEventListener('click', () => setDrawer(false));

  // Close drawer when a link inside it is chosen (e.g. same-page #anchors)
  nav?.addEventListener('click', (e) => {
    if (e.target.closest('a') && !DESKTOP.matches) setDrawer(false);
  });

  // Reset when resizing up to desktop
  DESKTOP.addEventListener('change', () => {
    setDrawer(false);
    closeAll();
  });

  // --- Escape + click outside ---
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    items.filter((i) => i.matches(':hover')).forEach((i) => i.classList.add('is-dismissed'));
    const openItem = items.find((i) => i.classList.contains('is-open'));
    if (openItem) {
      closeAll();
      openItem.querySelector('.primary-nav__toggle')?.focus();
    } else if (document.body.classList.contains('nav-open')) {
      setDrawer(false);
      navToggle?.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (DESKTOP.matches && !e.target.closest('[data-dropdown]')) closeAll();
  });
}
