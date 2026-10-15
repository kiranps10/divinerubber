/**
 * Enquiry forms: validation, accessible error messages, honest submit feedback,
 * duplicate-submission prevention and URL pre-filling.
 *
 * The form POSTs to its `action` (forms/send-enquiry.php on cPanel hosting).
 * A success message is shown ONLY when the server replies {"ok": true}.
 * Anything else (no PHP on the local preview, server error, network failure)
 * shows an error with direct contact details — we never pretend it was sent.
 */
const CONTACT_FALLBACK = 'Please email <a href="mailto:info@divinerubber.com">info@divinerubber.com</a> or call <a href="tel:+918047697537">0804 769 7537</a>.';

const MESSAGES = {
  valueMissing: 'This field is required.',
  typeMismatch: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number (at least 7 digits).',
  tooShort: 'Please add a little more detail.'
};

export function initForms() {
  document.querySelectorAll('[data-enquiry-form]').forEach(setupForm);
}

function fieldError(field) {
  const value = field.value.trim();
  if (field.required && !value) return MESSAGES.valueMissing;
  if (!value) return '';
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return MESSAGES.typeMismatch;
  if (field.type === 'tel' && ((value.match(/\d/g) || []).length < 7 || !/^[+()\d\s.-]+$/.test(value))) return MESSAGES.phone;
  if (field.minLength > 0 && value.length < field.minLength) return MESSAGES.tooShort;
  // Pick-from-list fields (e.g. the Country dropdown) mark free text that matches nothing
  if (field.dataset.valid === 'false') return field.dataset.invalidMessage || 'Please choose an option from the list.';
  return '';
}

function showError(field, message) {
  const errorEl = document.getElementById(field.getAttribute('aria-describedby')?.split(' ')[0]);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (errorEl) errorEl.textContent = message;
}

function setStatus(form, type, html) {
  const status = form.querySelector('[data-form-status]');
  if (!status) return;
  status.className = `form-status form-status--${type}`;
  status.innerHTML = html;
}

function prefill(form) {
  const params = new URLSearchParams(location.search);
  const set = (name, value) => {
    const el = form.elements[name];
    if (el && value && !el.value) el.value = value;
  };
  set('product_name', params.get('product'));
  if (params.get('product') && form.elements.enquiry_type?.tagName === 'SELECT') {
    form.elements.enquiry_type.value = 'Product & Specification Enquiry';
  }
  const types = { catalogue: 'Catalogue Request', meeting: 'Meeting Request' };
  const type = types[params.get('type')];
  if (type && form.elements.enquiry_type?.tagName === 'SELECT') form.elements.enquiry_type.value = type;
  if (params.get('type') === 'catalogue') set('message', 'Please send me the Divine Rubber product catalogue.');
  if (params.get('finder')) set('message', `Product Finder answers:\n${params.get('finder')}\n\nMy requirement: `);
}

function setupForm(form) {
  const fields = [...form.querySelectorAll('.field__input')];
  const submit = form.querySelector('[type="submit"]');
  let sending = false;

  prefill(form);

  // Validate on leaving a field, then live once it has been flagged
  fields.forEach((field) => {
    field.addEventListener('blur', () => field.value && showError(field, fieldError(field)));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldError(field));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return; // duplicate-submission guard

    let firstInvalid = null;
    fields.forEach((field) => {
      const msg = fieldError(field);
      showError(field, msg);
      if (msg && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      setStatus(form, 'error', 'Please correct the highlighted fields.');
      firstInvalid.focus();
      return;
    }

    sending = true;
    submit.classList.add('is-loading');
    submit.setAttribute('aria-disabled', 'true');
    setStatus(form, 'info', 'Sending your enquiry…');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;

      if (response.ok && data?.ok) {
        setStatus(form, 'success', 'Thank you — your enquiry has been sent. Our team will get back to you shortly.');
        form.reset();
        fields.forEach((f) => f.removeAttribute('aria-invalid'));
      } else {
        const reason = data?.message ? `${escapeHtml(data.message)} ` : 'Your enquiry could not be sent right now. ';
        setStatus(form, 'error', reason + CONTACT_FALLBACK);
      }
    } catch {
      setStatus(form, 'error', `Your enquiry could not be sent (connection problem). ${CONTACT_FALLBACK}`);
    } finally {
      sending = false;
      submit.classList.remove('is-loading');
      submit.removeAttribute('aria-disabled');
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
