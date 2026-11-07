/**
 * Cairn 2e Search Modal UX Enhancer.
 * Ensures the search input receives focus immediately upon opening,
 * activating the vibrant neon-violet blinking caret (|) without delay.
 */
(function () {
  function initSearchUX() {
    const dialog = document.querySelector('site-search dialog');
    if (!dialog || dialog.dataset.uxBound) return;
    dialog.dataset.uxBound = 'true';

    function focusInput() {
      let attempts = 0;
      const tryFocus = () => {
        const input = dialog.querySelector('.pagefind-ui__search-input');
        if (input) {
          input.focus();
        } else if (attempts < 15) {
          attempts++;
          setTimeout(tryFocus, 40);
        }
      };
      tryFocus();
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'open' && dialog.hasAttribute('open')) {
          setTimeout(focusInput, 30);
        }
      }
    });

    observer.observe(dialog, { attributes: true });

    // Also listen for clicks on any search open buttons
    const openBtns = document.querySelectorAll('button[data-open-modal]');
    openBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        setTimeout(focusInput, 50);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchUX);
  } else {
    initSearchUX();
  }
  document.addEventListener('astro:page-load', initSearchUX);
})();
