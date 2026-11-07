/**
 * Zero-dependency Lightweight Image Lightbox for Starlight TTRPG SRD.
 * Enables full-screen zoom and inspection for maps and illustrations.
 */
(function () {
  let overlay = null;
  let overlayImg = null;

  function initLightbox() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'ttrpg-lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'background:rgba(18, 17, 21, 0.93)',
      'backdrop-filter:blur(6px)',
      '-webkit-backdrop-filter:blur(6px)',
      'display:none',
      'align-items:center',
      'justify-content:center',
      'cursor:zoom-out',
      'padding:1rem',
      'opacity:0',
      'transition:opacity 0.2s ease'
    ].join(';');

    overlayImg = document.createElement('img');
    overlayImg.alt = 'Enlarged TTRPG Map / Illustration';
    overlayImg.style.cssText = [
      'max-width:95vw',
      'max-height:95vh',
      'width:auto',
      'height:auto',
      'object-fit:contain',
      'border-radius:4px',
      'box-shadow:0 12px 48px rgba(0,0,0,0.85)',
      'border:1px solid rgba(255,255,255,0.1)',
      'transform:scale(0.96)',
      'transition:transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    ].join(';');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close image');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = [
      'position:absolute',
      'top:1.25rem',
      'right:1.5rem',
      'background:transparent',
      'border:none',
      'color:#e6e1e8',
      'font-size:2.25rem',
      'line-height:1',
      'cursor:pointer',
      'padding:0.25rem 0.5rem',
      'opacity:0.8',
      'transition:opacity 0.15s ease'
    ].join(';');
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.opacity = '1'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.opacity = '0.8'; });

    overlay.appendChild(overlayImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    function close() {
      overlay.style.opacity = '0';
      overlayImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        overlayImg.src = '';
      }, 200);
      document.body.style.overflow = '';
    }

    overlay.addEventListener('click', (e) => {
      if (e.target !== overlayImg) close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        close();
      }
    });
  }

  function open(src, alt) {
    initLightbox();
    overlayImg.src = src;
    if (alt) overlayImg.alt = alt;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlayImg.style.transform = 'scale(1)';
    });
  }

  function bindImages() {
    const content = document.querySelector('.sl-markdown-content');
    if (!content) return;

    const images = content.querySelectorAll('img');
    images.forEach((img) => {
      if (img.dataset.lightboxBound) return;
      img.dataset.lightboxBound = 'true';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        // 若图片被 <a> 链接包裹且目标为外部外链，不拦截
        const parentLink = img.closest('a');
        if (parentLink && parentLink.getAttribute('href') && !parentLink.getAttribute('href').startsWith('#')) {
          return;
        }
        e.preventDefault();
        open(img.currentSrc || img.src, img.alt);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindImages);
  } else {
    bindImages();
  }

  // 监听 Starlight / Astro 页面客户端切换 (View Transitions / DOM hydration)
  document.addEventListener('astro:page-load', bindImages);
})();
