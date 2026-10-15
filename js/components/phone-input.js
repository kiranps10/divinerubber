/**
 * Phone number with country code (Contact enquiry form).
 *
 * <div class="phone-input" data-phone-input>
 *   <div class="phone-input__country">
 *     <img data-phone-flag> <span data-phone-code>+91</span> …
 *     <select name="phone_code" data-phone-select><option value="+91" data-iso="IN" selected>India (+91)</option></select>
 *   </div>
 *   <input type="tel" name="phone" class="field__input">
 * </div>
 *
 * - Fills the <select> with every country (js/data/country-codes.js), India stays the default.
 * - Shows the chosen country's flag (assets/icons/flags/<iso>.svg — served locally, CSP 'self')
 *   and dialling code; the native select keeps keyboard, touch and screen-reader support.
 * - Kept in step with the Country dropdown via `dial:change` / `country:change` events on the form.
 * - Validation and submission stay in forms.js; send-enquiry.php joins phone_code + phone.
 */
import { COUNTRY_CODES } from '../data/country-codes.js';

const DEFAULT_ISO = 'IN';

export function initPhoneInputs() {
  document.querySelectorAll('[data-phone-input]').forEach(setup);
}

function setup(wrap) {
  const select = wrap.querySelector('[data-phone-select]');
  const flag = wrap.querySelector('[data-phone-flag]');
  const code = wrap.querySelector('[data-phone-code]');
  const form = wrap.closest('form');
  if (!select || !flag || !code) return;

  // Full list (the HTML only ships India, so the field still works without this script)
  const options = COUNTRY_CODES.map(([iso, name, dial]) => {
    const option = new Option(`${name} (+${dial})`, `+${dial}`, iso === DEFAULT_ISO, iso === DEFAULT_ISO);
    option.dataset.iso = iso;
    option.dataset.name = name;
    return option;
  });
  select.replaceChildren(...options);

  const sync = () => {
    const option = select.selectedOptions[0];
    if (!option) return;
    flag.src = `assets/icons/flags/${option.dataset.iso.toLowerCase()}.svg`;
    code.textContent = option.value;
    select.title = option.textContent;
  };

  // Tell the Country dropdown (country-combobox.js) — it follows unless the visitor chose a country
  select.addEventListener('change', () => {
    sync();
    form?.dispatchEvent(new CustomEvent('dial:change', { detail: { iso: select.selectedOptions[0].dataset.iso } }));
  });

  // Country chosen → matching dialling code (e.g. United Kingdom → +44 with the UK flag)
  form?.addEventListener('country:change', (e) => {
    const option = [...select.options].find((o) => o.dataset.iso === e.detail.iso);
    if (option && !option.selected) {
      option.selected = true;
      sync();
    }
  });

  // form.reset() (after a successful send) returns the select to India — refresh the display
  form?.addEventListener('reset', () => requestAnimationFrame(sync));

  sync();
}
