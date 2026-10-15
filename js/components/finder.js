/**
 * Smart Product Finder (homepage) — six-step questionnaire that suggests product ranges.
 *
 * TODO (client): the matching rules below are a sensible starting point based on the
 * product descriptions on divinerubber.com. Please have the sales team confirm them.
 */
const CATEGORIES = {
  'hollow-mats': 'Rubber Hollow Mats',
  'stud-mats': 'Rubber Stud Mats',
  'stable-cow-mats': 'Stable & Cow Mats',
  'coir-jute': 'Coir & Jute Products',
  'rag-rugs-pp': 'Rag Rugs & Polypropylene Mats'
};

// Scores added per answer — highest scoring ranges are suggested
const RULES = {
  industry: {
    industrial: { 'hollow-mats': 3, 'stud-mats': 2 },
    hospitality: { 'hollow-mats': 3, 'coir-jute': 1 },
    commercial: { 'coir-jute': 2, 'rag-rugs-pp': 2, 'stud-mats': 1 },
    gym: { 'stable-cow-mats': 2, 'stud-mats': 2 },
    playground: { 'hollow-mats': 3 },
    retail: { 'coir-jute': 2, 'rag-rugs-pp': 2 },
    residential: { 'coir-jute': 3, 'rag-rugs-pp': 2 },
    marine: { 'hollow-mats': 2, 'rag-rugs-pp': 2 },
    agriculture: { 'stable-cow-mats': 5 },
    other: {}
  },
  location: {
    indoor: { 'rag-rugs-pp': 1, 'stud-mats': 1 },
    outdoor: { 'hollow-mats': 2, 'rag-rugs-pp': 1 },
    entrance: { 'coir-jute': 2, 'stud-mats': 1, 'hollow-mats': 1 },
    mixed: { 'hollow-mats': 1, 'rag-rugs-pp': 1 }
  },
  wet: {
    dry: { 'coir-jute': 1 },
    sometimes: { 'stud-mats': 1 },
    wet: { 'hollow-mats': 3 }
  },
  traffic: {
    light: { 'rag-rugs-pp': 1, 'coir-jute': 1 },
    medium: { 'stud-mats': 1, 'coir-jute': 1 },
    heavy: { 'hollow-mats': 2, 'stud-mats': 1 },
    vehicles: { 'hollow-mats': 2, 'stable-cow-mats': 2 }
  },
  safety: {
    slip: { 'hollow-mats': 2 },
    fatigue: { 'stud-mats': 3 },
    impact: { 'stable-cow-mats': 2 },
    dirt: { 'coir-jute': 2, 'stud-mats': 1 }
  },
  budget: {}
};

export function initFinder() {
  const form = document.querySelector('[data-finder]');
  if (!form) return;

  const steps = [...form.querySelectorAll('[data-finder-step]')];
  const tabs = [...form.querySelectorAll('[data-finder-tab]')];
  const backBtn = form.querySelector('[data-finder-back]');
  const nextBtn = form.querySelector('[data-finder-next]');
  const nav = form.querySelector('[data-finder-nav]');
  const result = form.querySelector('[data-finder-result]');
  const resultList = form.querySelector('[data-finder-result-list]');
  const contactLink = form.querySelector('[data-finder-contact]');
  const error = form.querySelector('[data-finder-error]');
  const progress = form.querySelector('[data-finder-progress]');
  let current = 0;

  const render = () => {
    steps.forEach((s, i) => (s.hidden = i !== current));
    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === current);
      t.classList.toggle('is-done', i < current);
    });
    backBtn.disabled = current === 0;
    nextBtn.firstChild.textContent = current === steps.length - 1 ? 'See Results ' : 'Next ';
    progress.textContent = `Step ${current + 1} of ${steps.length}: ${steps[current].querySelector('legend').textContent}`;
    error.textContent = '';
  };

  // Only the step's radio options count as an answer (not the consent checkbox)
  const answered = (step) => step.querySelector('input[type="radio"]:checked');
  const consent = form.querySelector('#finder-consent');

  // "Next" is the form's submit button, so Enter also moves forward
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!result.hidden) return;
    const step = steps[current];
    if (!answered(step)) {
      error.textContent = 'Please choose an option to continue.';
      step.querySelector('input[type="radio"]')?.focus();
      return;
    }
    // Last step: Terms & Privacy consent is required before results are shown
    if (current === steps.length - 1 && consent && !consent.checked) {
      error.textContent = 'Please agree to the Terms & Conditions and Privacy Policy to see your results.';
      consent.setAttribute('aria-invalid', 'true');
      consent.focus();
      return;
    }
    if (current < steps.length - 1) {
      current++;
      render();
      steps[current].querySelector('input[type="radio"]')?.focus();
    } else {
      showResult();
    }
  });

  backBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      render();
      steps[current].querySelector('input:checked, input')?.focus();
    }
  });

  // Choosing an option moves straight on (keyboard users still use Next)
  form.addEventListener('change', () => {
    error.textContent = '';
    if (consent?.checked) consent.removeAttribute('aria-invalid');
  });

  form.querySelector('[data-finder-restart]')?.addEventListener('click', () => {
    form.reset();
    consent?.removeAttribute('aria-invalid');
    current = 0;
    result.hidden = true;
    nav.hidden = false;
    tabs.forEach((t) => t.classList.remove('is-done'));
    render();
    steps[0].querySelector('input')?.focus();
  });

  function showResult() {
    const data = new FormData(form);
    const scores = Object.fromEntries(Object.keys(CATEGORIES).map((k) => [k, 0]));
    for (const [question, answer] of data.entries()) {
      const add = RULES[question]?.[answer] || {};
      Object.entries(add).forEach(([cat, pts]) => (scores[cat] += pts));
    }
    const ranked = Object.entries(scores).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
    const picks = (ranked.length ? ranked : [['hollow-mats', 1], ['coir-jute', 1]]).slice(0, 2);

    resultList.innerHTML = '';
    picks.forEach(([cat]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `products.html?category=${cat}`;
      a.innerHTML = `<span>${CATEGORIES[cat]}</span><svg aria-hidden="true"><use href="assets/icons/sprite.svg#i-arrow-right"></use></svg>`;
      li.append(a);
      resultList.append(li);
    });

    // Summary of answers for the enquiry form
    const summary = steps.map((s) => `${s.querySelector('legend').textContent} ${answered(s)?.nextElementSibling.textContent || '-'}`).join('\n');
    contactLink.href = `contact.html?finder=${encodeURIComponent(summary)}#enquiry`;

    steps.forEach((s) => (s.hidden = true));
    tabs.forEach((t) => {
      t.classList.remove('is-active');
      t.classList.add('is-done');
    });
    nav.hidden = true;
    result.hidden = false;
    progress.textContent = 'Results ready.';
    result.focus();
  }

  render();
}
