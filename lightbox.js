// Image viewer used on every page.
// Click an image to view it large on top of the page.
// Close with Esc, a click outside the image, the × button, or the browser's Back button.
(function () {
  const IMAGE_LINK = /\.(jpe?g|png|gif|svg|webp|avif)(\?.*)?$/i;

  const style = document.createElement('style');
  style.textContent = `
    .lb {
      position: fixed; inset: 0; z-index: 5000;
      display: flex; align-items: center; justify-content: center;
      padding: 4vh 4vw;
      background: rgba(5, 8, 16, 0.88);
      -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
      cursor: zoom-out;
    }
    .lb[hidden] { display: none; }
    .lb-fig {
      margin: 0; max-width: 100%; max-height: 100%;
      display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
    }
    .lb-img {
      max-width: 92vw; max-height: 82vh; object-fit: contain;
      border-radius: 6px; background: #fff;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      cursor: default;
    }
    .lb-cap {
      max-width: 80ch; text-align: center;
      color: rgba(255, 255, 255, 0.88);
      font: 500 0.92rem/1.4 "Inter", system-ui, sans-serif;
    }
    .lb-hint {
      color: rgba(255, 255, 255, 0.5);
      font: 500 0.75rem/1.4 "Inter", system-ui, sans-serif;
    }
    .lb-close {
      position: fixed; top: 1rem; right: 1rem;
      width: 2.5rem; height: 2.5rem; border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(16, 22, 42, 0.9); color: #fff;
      font-size: 1.5rem; line-height: 1; cursor: pointer;
    }
    .lb-close:hover, .lb-close:focus-visible { border-color: #fdb515; color: #fdb515; outline: none; }
    html.lb-open { overflow: hidden; }
    img.lb-zoom { cursor: zoom-in; }
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.className = 'lb';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close image (Esc)">×</button>' +
    '<figure class="lb-fig"><img class="lb-img" alt="">' +
    '<figcaption class="lb-cap"></figcaption>' +
    '<div class="lb-hint">Press Esc or click outside the image to close</div></figure>';
  document.body.appendChild(box);

  const view = box.querySelector('.lb-img');
  const cap = box.querySelector('.lb-cap');
  const closeBtn = box.querySelector('.lb-close');
  let lastFocus = null;
  let pushed = false;

  function captionFor(img) {
    const fig = img.closest('figure');
    const fc = fig && fig.querySelector('figcaption');
    return (fc && fc.textContent.trim()) || img.getAttribute('alt') || '';
  }

  function isBroken(img) {
    return img.complete && img.naturalWidth === 0;
  }

  // Plain images (not inside a link) that are worth enlarging
  function zoomable(img) {
    if (img.closest('a, button, header, nav, .page-bg, .lb, .media.empty')) return false;
    return !isBroken(img);
  }

  function open(src, alt, caption) {
    view.src = src;
    view.alt = alt || '';
    cap.textContent = caption || '';
    cap.hidden = !caption;
    box.hidden = false;
    document.documentElement.classList.add('lb-open');
    lastFocus = document.activeElement;
    closeBtn.focus();
    try { history.pushState({ lightbox: true }, ''); pushed = true; } catch (e) { pushed = false; }
  }

  function hide() {
    box.hidden = true;
    view.removeAttribute('src');
    document.documentElement.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function close() {
    if (box.hidden) return;
    if (pushed) { pushed = false; history.back(); } // popstate below hides it
    else hide();
  }

  window.addEventListener('popstate', () => {
    if (!box.hidden) { pushed = false; hide(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.hidden) { e.preventDefault(); close(); }
  });

  // Anything except the image itself closes the viewer
  box.addEventListener('click', (e) => {
    if (e.target !== view) close();
  });

  // Open: links to image files, or plain images
  document.addEventListener('click', (e) => {
    if (!box.hidden || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a');
    if (link) {
      if (!IMAGE_LINK.test(link.getAttribute('href') || '')) return;
      const inner = link.querySelector('img');
      if (inner && isBroken(inner)) return;
      e.preventDefault();
      open(link.href, inner ? inner.alt : '', inner ? captionFor(inner) : '');
      return;
    }
    const img = e.target.closest('img');
    if (img && zoomable(img)) {
      e.preventDefault();
      open(img.currentSrc || img.src, img.alt, captionFor(img));
    }
  });

  // Show a zoom cursor on images that open the viewer
  function markZoomable() {
    document.querySelectorAll('img').forEach((img) => {
      const link = img.closest('a');
      const linked = link && IMAGE_LINK.test(link.getAttribute('href') || '');
      img.classList.toggle('lb-zoom', linked ? !isBroken(img) : zoomable(img));
    });
  }
  markZoomable();
  window.addEventListener('load', markZoomable);
})();
