/**
 * Global Site UX & Tabletop Session Hardening for Starlight SRD:
 * 1. External Link Hardening (target="_blank" + rel="noopener noreferrer" + ↗ badge)
 * 2. Smart OSR Floating Back-to-Top Button
 */
(function () {
  function hardenExternalLinks() {
    const main = document.querySelector('.sl-markdown-content');
    if (!main) return;

    const links = main.querySelectorAll('a[href]');
    const currentHost = window.location.hostname;

    links.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        return;
      }

      try {
        const url = new URL(a.href, window.location.origin);
        if (url.hostname && url.hostname !== currentHost) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.setAttribute('data-external', 'true');
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });
  }

  function ensureBackToTopButton() {
    let btn = document.getElementById('cairn-back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'cairn-back-to-top';
      btn.type = 'button';
      btn.title = '返回顶部';
      btn.setAttribute('aria-label', '返回页面顶部');
      btn.innerHTML = '↑';
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(btn);
    }

    function checkScroll() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.removeEventListener('scroll', checkScroll);
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  function initSiteUX() {
    hardenExternalLinks();
    ensureBackToTopButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteUX);
  } else {
    initSiteUX();
  }
  document.addEventListener('astro:page-load', initSiteUX);
})();
