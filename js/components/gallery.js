/**
 * Lightbox for images and videos, built on the native <dialog> element
 * (focus trapping, Escape to close and the backdrop come for free).
 *
 * Trigger markup:
 * <button class="gallery-item" data-lightbox="gallery-name"
 *         data-src="big.webp" data-type="image|video" data-title="…" data-caption="…">
 * Items sharing the same data-lightbox value form a set (prev/next + arrow keys).
 * Hidden items (filtered out) are skipped.
 */
export function initGallery() {
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  if (!triggers.length) return;

  const dialog = buildDialog();
  const stage = dialog.querySelector('.lightbox__stage');
  const caption = dialog.querySelector('.lightbox__caption');
  const prevBtn = dialog.querySelector('.lightbox__prev');
  const nextBtn = dialog.querySelector('.lightbox__next');
  let set = [];
  let index = 0;
  let opener = null;

  const visibleSet = (name) => triggers.filter((t) => t.dataset.lightbox === name && !t.closest('[hidden]'));

  const render = () => {
    const item = set[index];
    stage.innerHTML = '';
    if (item.dataset.type === 'video') {
      const video = document.createElement('video');
      video.src = item.dataset.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      if (item.dataset.poster) video.poster = item.dataset.poster;
      video.setAttribute('aria-label', item.dataset.title || 'Video');
      stage.append(video);
    } else {
      const img = document.createElement('img');
      img.src = item.dataset.src;
      img.alt = item.querySelector('img')?.alt || item.dataset.title || '';
      stage.append(img);
    }
    caption.innerHTML = '';
    if (item.dataset.title) {
      const strong = document.createElement('strong');
      strong.textContent = item.dataset.title;
      caption.append(strong);
    }
    if (item.dataset.caption) caption.append(document.createTextNode(item.dataset.caption));
    const multiple = set.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  };

  const open = (trigger) => {
    set = visibleSet(trigger.dataset.lightbox);
    index = set.indexOf(trigger);
    opener = trigger;
    render();
    dialog.showModal();
    document.body.classList.add('lightbox-open');
  };

  const go = (step) => {
    index = (index + step + set.length) % set.length;
    render();
  };

  triggers.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    open(t);
  }));

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === stage) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && set.length > 1) go(-1);
    if (e.key === 'ArrowRight' && set.length > 1) go(1);
  });
  dialog.addEventListener('close', () => {
    stage.innerHTML = ''; // stops any playing video
    document.body.classList.remove('lightbox-open');
    opener?.focus();
  });
}

function buildDialog() {
  const icon = (id) => `<svg aria-hidden="true"><use href="assets/icons/sprite.svg#${id}"></use></svg>`;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Media viewer');
  dialog.innerHTML = `
    <div class="lightbox__stage"></div>
    <p class="lightbox__caption" aria-live="polite"></p>
    <button class="lightbox__close" type="button" aria-label="Close viewer">${icon('i-close')}</button>
    <button class="lightbox__prev" type="button" aria-label="Previous item">${icon('i-chevron-left')}</button>
    <button class="lightbox__next" type="button" aria-label="Next item">${icon('i-chevron-right')}</button>`;
  document.body.append(dialog);
  return dialog;
}
