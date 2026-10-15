/**
 * Homepage hero slideshow: cross-fades product slides every 5 s.
 *
 * - The progress bar under "Next Product" fills during each slide; when the fill
 *   finishes (CSS animation end) the next slide starts and the bar resets.
 *   The animation is the clock, so pausing freezes the bar exactly where it is.
 * - Pauses on hover / keyboard focus / hidden tab, has a pause button (WCAG 2.2.2).
 * - prefers-reduced-motion: no autoplay, no zoom (slides change only via "Next").
 */
const INTERVAL = 5000;

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const nextBtn = hero.querySelector('[data-hero-next]');
  const nextName = hero.querySelector('[data-hero-next-name]');
  const nextThumb = hero.querySelector('[data-hero-next-thumb]');
  const pauseBtn = hero.querySelector('[data-hero-pause]');
  const bars = [...hero.querySelectorAll('.hero__progress span')];
  if (slides.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let userPaused = reduced;
  let hovering = false;
  let focused = false;

  hero.style.setProperty('--hero-interval', `${INTERVAL}ms`);

  const thumbOf = (slide) => slide.querySelector('img');

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle('is-active', n === index);
      s.setAttribute('aria-hidden', String(n !== index));
    });
    // Restart the fill on the current bar (others reset to empty)
    bars.forEach((b) => b.classList.remove('is-active'));
    if (bars[index]) {
      void bars[index].offsetWidth; // reflow so the animation starts again from 0
      bars[index].classList.add('is-active');
    }
    const upcoming = slides[(index + 1) % slides.length];
    if (nextName) nextName.textContent = upcoming.dataset.name;
    const img = thumbOf(upcoming);
    if (nextThumb && img) {
      nextThumb.src = img.currentSrc || img.src;
    }
    nextBtn?.setAttribute('aria-label', `Show next product: ${upcoming.dataset.name}`);
  };

  // Holding = temporarily paused (hover, focus, hidden tab); the CSS pauses the fill
  const sync = () => {
    hero.classList.toggle('is-holding', hovering || focused || document.hidden);
    hero.classList.toggle('is-paused', userPaused);
  };

  // Bar filled → next slide
  bars.forEach((bar) => {
    bar.addEventListener('animationend', () => {
      if (bar.classList.contains('is-active') && !userPaused) show(index + 1);
    });
  });

  nextBtn?.addEventListener('click', () => show(index + 1));

  pauseBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    sync();
  });

  // Mouse/pen hover pauses; a touch tap must not leave it stuck paused
  hero.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = true;
    sync();
  });
  hero.addEventListener('pointerleave', () => {
    hovering = false;
    sync();
  });
  hero.addEventListener('focusin', () => {
    focused = true;
    sync();
  });
  hero.addEventListener('focusout', (e) => {
    if (hero.contains(e.relatedTarget)) return;
    focused = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);

  if (userPaused) pauseBtn?.setAttribute('aria-label', 'Play slideshow');
  sync();
  show(0);
}
