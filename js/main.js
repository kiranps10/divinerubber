/**
 * Divine Rubber — main JavaScript entry.
 * Each feature lives in js/components/ and only runs when its markup exists on the page.
 */
import { initNavigation } from './components/navigation.js';
import { initSliders } from './components/slider.js';
import { initHero } from './components/hero.js';
import { initAccordions } from './components/accordion.js';
import { initFilters } from './components/filter.js';
import { initForms } from './components/forms.js';
import { initFinder } from './components/finder.js';
import { initVideos } from './components/video.js';
import { initGallery } from './components/gallery.js';
import { initCounters } from './components/counter.js';
import { initTimelineAutoplay } from './components/timeline.js';
import { initProductRange } from './components/range.js';
import { initProjects } from './components/projects.js';
import { initFlipCards } from './components/flip-card.js';
import { initProductDetail } from './components/product-detail.js';
import { initProductGallery } from './components/product-gallery.js';
import { initExpertise } from './components/expertise.js';
import { initMosaics } from './components/mosaic.js';

// Country-code phone picker + searchable Country field: loaded only on pages that have them
// (keeps the country list off other pages)
function initPhoneInputs() {
  if (document.querySelector('[data-phone-input]')) import('./components/phone-input.js').then((m) => m.initPhoneInputs());
  if (document.querySelector('[data-country-combobox]')) import('./components/country-combobox.js').then((m) => m.initCountryComboboxes());
}

// Review mode: add ?review to any URL to outline every placeholder / unverified item
if (new URLSearchParams(location.search).has('review')) {
  document.documentElement.classList.add('review-mode');
}

// Touch screens have no hover: show the industry-card overlay while a finger is down
document.addEventListener('touchstart', (e) => {
  e.target.closest?.('.industry-card')?.classList.add('is-pressed');
}, { passive: true });
['touchend', 'touchcancel'].forEach((type) => document.addEventListener(type, () => {
  setTimeout(() => document.querySelectorAll('.industry-card.is-pressed').forEach((c) => c.classList.remove('is-pressed')), 250);
}, { passive: true }));

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const features = [initNavigation, initSliders, initHero, initAccordions, initFilters, initMosaics, initPhoneInputs, initForms, initFinder, initVideos, initGallery, initCounters, initTimelineAutoplay, initProductRange, initProjects, initFlipCards, initProductDetail, initProductGallery, initExpertise];
features.forEach((init) => {
  try {
    init();
  } catch (error) {
    // One broken feature must never stop the rest of the page
    console.error(`[Divine] ${init.name} failed:`, error);
  }
});
