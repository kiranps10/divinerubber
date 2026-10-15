/**
 * Inline video with poster + play button. The video file only downloads when the
 * visitor presses play (preload="none"), keeping the page fast.
 */
export function initVideos() {
  document.querySelectorAll('[data-video]').forEach((wrap) => {
    const btn = wrap.querySelector('[data-video-play]');
    const video = wrap.querySelector('[data-video-el]');
    if (!btn || !video) return;

    btn.addEventListener('click', async () => {
      video.hidden = false;
      btn.closest('.video-feature__media, .media-video')?.classList.add('is-playing');
      try {
        await video.play();
      } catch (err) {
        console.warn('[Divine] Video could not autoplay; controls are available.', err);
      }
      video.focus();
    });
  });
}
