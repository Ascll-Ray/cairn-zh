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
    closeBtn.setAttribute('aria-label', '关闭图片 (ESC 或点击外侧黑框)');
    closeBtn.title = '关闭 (ESC)';
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.style.cssText = [
      'position:fixed',
      'top:1.25rem',
      'right:1.5rem',
      'width:44px',
      'height:44px',
      'border-radius:50%',
      'background:rgba(39, 38, 43, 0.92)',
      'border:1px solid rgba(255, 255, 255, 0.25)',
      'color:#ffffff',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'cursor:pointer',
      'box-shadow:0 4px 16px rgba(0,0,0,0.6)',
      'z-index:100000',
      'transition:all 0.15s ease'
    ].join(';');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.backgroundColor = '#7253ed';
      closeBtn.style.transform = 'scale(1.08)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.backgroundColor = 'rgba(39, 38, 43, 0.92)';
      closeBtn.style.transform = 'scale(1)';
    });
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    const hint = document.createElement('div');
    hint.textContent = '点击外侧黑框或按 ESC 退出';
    hint.style.cssText = [
      'position:fixed',
      'bottom:1.25rem',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(31, 30, 36, 0.85)',
      'border:1px solid rgba(255, 255, 255, 0.15)',
      'color:#ded9e2',
      'font-size:0.8rem',
      'padding:0.35rem 0.85rem',
      'border-radius:20px',
      'pointer-events:none',
      'letter-spacing:0.02em',
      'box-shadow:0 2px 8px rgba(0,0,0,0.4)'
    ].join(';');

    overlay.appendChild(overlayImg);
    overlay.appendChild(closeBtn);
    overlay.appendChild(hint);
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
        const parentLink = img.closest('a');
        const href = parentLink ? parentLink.getAttribute('href') : null;
        const isImageLink = href && /\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i.test(href);
        const isHashLink = href && href.startsWith('#');
        // 若没有父链接，或父链接指向图片自身，或父链接仅为锚点，一律拦截并调起灯箱，杜绝浏览器跳页
        if (!parentLink || isImageLink || isHashLink || href === img.getAttribute('src')) {
          e.preventDefault();
          e.stopPropagation();
          open(img.currentSrc || img.src, img.alt);
        }
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
