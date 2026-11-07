/**
 * Zero-dependency Hardware-accelerated Image Lightbox with Zoom & Pan for Starlight TTRPG SRD.
 * Supports smooth wheel zoom (0.8x - 4.0x), drag-to-pan, click-to-zoom (2.5x), touch pinch, and floating toolbar.
 */
(function () {
  let overlay = null;
  let overlayImg = null;
  let toolbar = null;
  let zoomResetBtn = null;

  // Zoom & Pan State
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let isPointerDown = false;
  let dragMoved = false;
  let startX = 0;
  let startY = 0;
  let downX = 0;
  let downY = 0;

  // Touch Pinch State
  let touchStartDist = 0;
  let touchStartScale = 1.0;

  function updateTransform(animate = false) {
    if (!overlayImg) return;
    if (animate) {
      overlayImg.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      overlayImg.style.transition = 'none';
    }
    overlayImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;

    if (zoomResetBtn) {
      zoomResetBtn.textContent = `${Math.round(scale * 100)}% 重置`;
    }

    if (scale > 1.05) {
      overlayImg.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
      overlayImg.style.cursor = 'zoom-in';
    }
  }

  function clampTranslation() {
    if (!overlayImg) return;
    const maxDragX = Math.max(0, (overlayImg.offsetWidth * scale - window.innerWidth) / 2) + 120;
    const maxDragY = Math.max(0, (overlayImg.offsetHeight * scale - window.innerHeight) / 2) + 120;
    translateX = Math.max(-maxDragX, Math.min(maxDragX, translateX));
    translateY = Math.max(-maxDragY, Math.min(maxDragY, translateY));
  }

  function setZoom(newScale, animate = true) {
    newScale = Math.min(4.0, Math.max(0.8, Math.round(newScale * 100) / 100));
    scale = newScale;
    if (scale <= 1.02) {
      translateX = 0;
      translateY = 0;
    } else {
      clampTranslation();
    }
    updateTransform(animate);
  }

  function resetZoom(animate = true) {
    scale = 1.0;
    translateX = 0;
    translateY = 0;
    updateTransform(animate);
  }

  function initLightbox() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'ttrpg-lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'background:rgba(18, 17, 21, 0.94)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'display:none',
      'align-items:center',
      'justify-content:center',
      'overflow:hidden',
      'opacity:0',
      'transition:opacity 0.2s ease',
      'user-select:none',
      '-webkit-user-select:none'
    ].join(';');

    overlayImg = document.createElement('img');
    overlayImg.alt = 'Enlarged TTRPG Map / Illustration';
    overlayImg.setAttribute('draggable', 'false');
    overlayImg.style.cssText = [
      'max-width:92vw',
      'max-height:88vh',
      'width:auto',
      'height:auto',
      'object-fit:contain',
      'border-radius:4px',
      'box-shadow:0 16px 54px rgba(0,0,0,0.9)',
      'border:1px solid rgba(255,255,255,0.12)',
      'transform:translate3d(0, 0, 0) scale(1)',
      'transform-origin:center center',
      'touch-action:none',
      'cursor:zoom-in',
      'will-change:transform'
    ].join(';');

    // Top-right close button
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '关闭图片 (ESC 或点击外侧黑框)');
    closeBtn.title = '关闭 (ESC)';
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.style.cssText = [
      'position:fixed',
      'top:1.25rem',
      'right:1.5rem',
      'width:42px',
      'height:42px',
      'border-radius:50%',
      'background:rgba(39, 38, 43, 0.92)',
      'border:1px solid rgba(255, 255, 255, 0.22)',
      'color:#ffffff',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'cursor:pointer',
      'box-shadow:0 4px 16px rgba(0,0,0,0.6)',
      'z-index:100001',
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

    // Floating Toolbar
    toolbar = document.createElement('div');
    toolbar.id = 'ttrpg-lightbox-toolbar';
    toolbar.style.cssText = [
      'position:fixed',
      'bottom:1.5rem',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(26, 25, 30, 0.92)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'border:1px solid rgba(255, 255, 255, 0.18)',
      'border-radius:28px',
      'padding:0.3rem 0.6rem',
      'display:flex',
      'align-items:center',
      'gap:0.4rem',
      'box-shadow:0 8px 32px rgba(0, 0, 0, 0.7)',
      'z-index:100001',
      'user-select:none'
    ].join(';');

    function createToolBtn(html, title, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = title;
      btn.setAttribute('aria-label', title);
      btn.innerHTML = html;
      btn.style.cssText = [
        'background:transparent',
        'border:none',
        'color:#ded9e2',
        'padding:0.35rem 0.65rem',
        'border-radius:18px',
        'font-size:0.82rem',
        'font-weight:500',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'gap:0.3rem',
        'transition:all 0.15s ease',
        'line-height:1'
      ].join(';');
      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = 'rgba(114, 83, 237, 0.35)';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = '#ded9e2';
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
      return btn;
    }

    const zoomOutBtn = createToolBtn(
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      '缩小 (滚轮向下)',
      () => setZoom(scale - 0.25, true)
    );

    zoomResetBtn = createToolBtn('100% 重置', '点击重置原始大小与居中', () => resetZoom(true));
    zoomResetBtn.style.minWidth = '78px';

    const zoomInBtn = createToolBtn(
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      '放大 (滚轮向上)',
      () => setZoom(scale + 0.25, true)
    );

    const divider = document.createElement('span');
    divider.style.cssText = 'width:1px;height:16px;background:rgba(255,255,255,0.18);margin:0 0.15rem;';

    const closeToolBtn = createToolBtn(
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span>关闭</span>',
      '关闭 (ESC)',
      () => close()
    );

    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(zoomResetBtn);
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(divider);
    toolbar.appendChild(closeToolBtn);

    overlay.appendChild(overlayImg);
    overlay.appendChild(closeBtn);
    overlay.appendChild(toolbar);
    document.body.appendChild(overlay);

    // Pointer Events for Drag-to-Pan and Click-to-Zoom
    overlayImg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isPointerDown = true;
      dragMoved = false;
      downX = e.clientX;
      downY = e.clientY;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      try {
        overlayImg.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    overlayImg.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) {
        dragMoved = true;
        if (scale > 1.0) {
          isDragging = true;
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          clampTranslation();
          updateTransform(false);
        }
      }
    });

    overlayImg.addEventListener('pointerup', (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      isDragging = false;
      try {
        overlayImg.releasePointerCapture(e.pointerId);
      } catch (_) {}

      if (!dragMoved) {
        // Click action: toggle 1.0x <-> 2.5x
        if (scale <= 1.05) {
          scale = 2.5;
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          translateX = (cx - e.clientX) * 1.3;
          translateY = (cy - e.clientY) * 1.3;
          clampTranslation();
          updateTransform(true);
        } else {
          resetZoom(true);
        }
      } else {
        updateTransform(false);
      }
    });

    overlayImg.addEventListener('pointercancel', () => {
      isPointerDown = false;
      isDragging = false;
      updateTransform(false);
    });

    // Mouse Wheel Zoom
    overlay.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.22 : -0.22;
      setZoom(scale + delta, false);
    }, { passive: false });

    // Touch Pinch-to-zoom
    overlay.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartScale = scale;
      }
    }, { passive: true });

    overlay.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = dist / touchStartDist;
        setZoom(touchStartScale * ratio, false);
      }
    }, { passive: true });

    overlay.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        touchStartDist = 0;
      }
    }, { passive: true });

    // Backdrop Click to Close (only when clicking background outside image and toolbar)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Keyboard ESC to Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        close();
      }
    });
  }

  function close() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    if (overlayImg) {
      overlayImg.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      overlayImg.style.transform = 'translate3d(0, 0, 0) scale(0.95)';
    }
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      if (overlayImg) overlayImg.src = '';
      resetZoom(false);
    }, 200);
    document.body.style.overflow = '';
  }

  function open(src, alt) {
    initLightbox();
    resetZoom(false);
    overlayImg.src = src;
    if (alt) overlayImg.alt = alt;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      updateTransform(false);
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
