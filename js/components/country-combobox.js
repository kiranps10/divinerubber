/**
 * Searchable country dropdown (Contact enquiry form) — WAI-ARIA 1.2 combobox with a listbox popup.
 *
 * <div class="combobox" data-country-combobox>
 *   <img data-combobox-flag>
 *   <input class="field__input combobox__input" name="country" value="India" …>
 *   <ul class="combobox__list" id="…" hidden></ul>
 * </div>
 *
 * - Type to filter (names starting with the text first), ↑/↓ to move, Enter to choose,
 *   Esc to close, Alt+↓ / click / chevron to open. Mouse and touch pick from the list.
 * - Only a country from the list is accepted: the input gets data-valid="false" otherwise
 *   and forms.js shows "Please choose your country from the list."
 * - Choosing a country fires `country:change` on the form ({ iso, byUser }), which the phone
 *   code picker follows. It listens for `dial:change` and follows the phone code only while the
 *   visitor hasn't chosen a country themselves.
 * - Without JavaScript the field is a normal text input.
 */
import { COUNTRY_CODES } from '../data/country-codes.js';

const COUNTRIES = COUNTRY_CODES.map(([iso, name]) => ({ iso, name, key: name.toLowerCase() }));
const byName = new Map(COUNTRIES.map((c) => [c.key, c]));
const byIso = new Map(COUNTRIES.map((c) => [c.iso, c]));

export function initCountryComboboxes() {
  document.querySelectorAll('[data-country-combobox]').forEach(setup);
}

function setup(wrap) {
  const input = wrap.querySelector('input');
  const list = wrap.querySelector('.combobox__list');
  const flag = wrap.querySelector('[data-combobox-flag]');
  const form = wrap.closest('form');
  if (!input || !list) return;

  let current = byName.get(input.value.trim().toLowerCase()) || null; // country matching the text
  let committed = current; // last country announced to the phone picker
  let chosenByUser = false;
  let matches = [];
  let active = -1;

  // ARIA roles are added here (not in the HTML) so the no-JS fallback is a plain text field
  const label = form?.querySelector(`label[for="${input.id}"]`);
  list.setAttribute('role', 'listbox');
  if (label?.id) list.setAttribute('aria-labelledby', label.id);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('autocomplete', 'off'); // our list replaces the browser's suggestions
  input.dataset.invalidMessage = 'Please choose your country from the list.';
  wrap.classList.add('is-enhanced');

  const optionId = (c) => `${list.id}-${c.iso.toLowerCase()}`;

  function render() {
    list.replaceChildren(...matches.map((c, i) => {
      const li = document.createElement('li');
      li.id = optionId(c);
      li.className = 'combobox__option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(c === current));
      if (i === active) li.classList.add('is-active');
      const img = document.createElement('img');
      img.src = `assets/icons/flags/${c.iso.toLowerCase()}.svg`;
      img.alt = '';
      img.width = 20;
      img.height = 15;
      img.loading = 'lazy';
      li.append(img, document.createTextNode(c.name));
      return li;
    }));
    if (!matches.length) {
      const li = document.createElement('li');
      li.className = 'combobox__empty';
      li.textContent = 'No matching country';
      list.append(li);
    }
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', optionId(matches[active]));
      list.children[active]?.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function filter(text) {
    const q = text.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const starts = COUNTRIES.filter((c) => c.key.startsWith(q));
    const contains = COUNTRIES.filter((c) => !c.key.startsWith(q) && c.key.includes(q));
    return [...starts, ...contains];
  }

  function open(showAll) {
    matches = showAll ? COUNTRIES : filter(input.value);
    active = showAll && current ? matches.indexOf(current) : (matches.length ? 0 : -1);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    render();
  }

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function updateFlag() {
    if (!flag) return;
    flag.hidden = !current;
    if (current) flag.src = `assets/icons/flags/${current.iso.toLowerCase()}.svg`;
  }

  function validate() {
    const match = byName.get(input.value.trim().toLowerCase());
    input.dataset.valid = String(!input.value.trim() || Boolean(match));
    return match;
  }

  function choose(country, byUser) {
    current = country;
    committed = country;
    if (byUser) chosenByUser = true;
    input.value = country.name;
    validate();
    updateFlag();
    close();
    // Clear an error that was showing, the way forms.js does on input
    if (input.getAttribute('aria-invalid') === 'true') input.dispatchEvent(new Event('input', { bubbles: true }));
    form?.dispatchEvent(new CustomEvent('country:change', { detail: { iso: country.iso, byUser } }));
  }

  input.addEventListener('input', (e) => {
    if (!e.isTrusted) return; // our own re-validation event
    const match = validate();
    current = match || null;
    updateFlag();
    open(false);
  });

  input.addEventListener('keydown', (e) => {
    const isOpen = !list.hidden;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return open(true);
      if (!matches.length) return;
      active = e.key === 'ArrowDown' ? Math.min(active + 1, matches.length - 1) : Math.max(active - 1, 0);
      render();
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault(); // don't submit the form while choosing
      if (matches[active]) choose(matches[active], true);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close();
    } else if (e.key === 'Home' || e.key === 'End') {
      if (isOpen && matches.length) {
        e.preventDefault();
        active = e.key === 'Home' ? 0 : matches.length - 1;
        render();
      }
    }
  });

  input.addEventListener('click', () => (list.hidden ? open(true) : close()));
  // Entering the field with a country already in it selects the text, so typing starts a new search
  input.addEventListener('focus', () => {
    if (current) requestAnimationFrame(() => input.select());
  });
  wrap.querySelector('.combobox__chevron')?.addEventListener('click', () => {
    input.focus();
    open(true);
  });

  // mousedown keeps focus in the input; click picks the option (mouse and touch)
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[role="option"]');
    if (li) choose(COUNTRIES.find((c) => optionId(c) === li.id), true);
  });

  input.addEventListener('blur', () => {
    // Exact name typed (any letter case) → tidy it up to the list spelling
    const match = validate();
    if (match && match !== committed) choose(match, true);
    else if (match) input.value = match.name;
    close();
  });

  // Phone code changed → follow it, unless the visitor picked a country themselves
  form?.addEventListener('dial:change', (e) => {
    if (chosenByUser) return;
    const country = byIso.get(e.detail.iso);
    if (country && country !== current) {
      current = country;
      committed = country;
      input.value = country.name;
      validate();
      updateFlag();
    }
  });

  form?.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      current = byName.get(input.value.trim().toLowerCase()) || null;
      committed = current;
      chosenByUser = false;
      validate();
      updateFlag();
      close();
    });
  });

  validate();
  updateFlag();
}
