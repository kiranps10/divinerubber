/**
 * Accordion — only one panel open at a time (team checklist rule).
 * Markup:
 * <div class="accordion" data-accordion>
 *   <div class="accordion__item">
 *     <h3><button class="accordion__trigger" aria-expanded="false" aria-controls="p1">…</button></h3>
 *     <section class="accordion__panel" id="p1" aria-labelledby="t1"><div class="accordion__inner">…</div></section>
 *   </div>
 * </div>
 * Add data-accordion-multiple to allow several open panels.
 */
export function initAccordions() {
  document.querySelectorAll('[data-accordion]').forEach((acc) => {
    const triggers = [...acc.querySelectorAll('.accordion__trigger')];
    const allowMultiple = acc.hasAttribute('data-accordion-multiple');

    const setOpen = (trigger, open) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(open));
      panel?.classList.toggle('is-open', open);
      panel?.toggleAttribute('inert', !open); // hidden content is not focusable
    };

    triggers.forEach((trigger) => {
      setOpen(trigger, trigger.getAttribute('aria-expanded') === 'true');

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';
        if (open && !allowMultiple) triggers.forEach((t) => t !== trigger && setOpen(t, false));
        setOpen(trigger, open);
      });

      // Arrow-key navigation between headers
      trigger.addEventListener('keydown', (e) => {
        const i = triggers.indexOf(trigger);
        const map = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: triggers.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        triggers[(map[e.key] + triggers.length) % triggers.length].focus();
      });
    });
  });
}
