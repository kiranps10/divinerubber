/**
 * Homepage hero slideshow: cross-fades product slides every 5 s.
 *
 * - The progress bar under "Next Product" fills during each slide; when the fill
 *   finishes (CSS animation end) the next slide starts and the bar resets.
 *   The animation is the clock, so pausing freezes the bar exactly where it is.
 * - Pauses on hover / keyboard focus / hidden tab, has a pause button (WCAG 2.2.2).
 * - prefers-reduced-motion: no autoplay, no zoom (slides change only via "Next").
 * - A slide with a background video ([data-hero-video]) stays up for the whole clip,
 *   restarts it each time it becomes active, and only plays while it is the active
 *   slide and the slideshow isn't paused (Pause button, hidden tab, reduced motion
 *   → the poster frame stays). If autoplay is blocked, the poster simply remains.
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

  const videos = slides.map((s) => s.querySelector('[data-hero-video]'));
  // Video slides last as long as the clip (known once its metadata has loaded)
  videos.forEach((video, n) => {
    if (!video || !bars[n]) return;
    const fit = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        bars[n].style.setProperty('--hero-interval', `${Math.round(video.duration * 1000)}ms`);
      }
    };
    if (video.readyState >= 1) fit();
    else video.addEventListener('loadedmetadata', fit, { once: true });
  });

  const syncVideos = () => {
    videos.forEach((video, n) => {
      if (!video) return;
      if (n === index && !userPaused && !document.hidden) video.play().catch(() => {});
      else video.pause();
    });
  };

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
    // The active video starts from the beginning of the clip
    const video = videos[index];
    if (video && video.readyState >= 1) video.currentTime = 0;
    syncVideos();

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
    syncVideos();
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
