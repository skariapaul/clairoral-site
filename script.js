// Product image carousels + shared zoom lightbox (B2B homepage)
(function () {
  // ---- Shared lightbox ----
  var lightbox = (function () {
    var ov = document.createElement('div');
    ov.className = 'lb';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close">✕</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Previous image">‹</button>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Next image">›</button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<div class="lb-hint">Click image to zoom · use ‹ › to browse</div>';
    document.body.appendChild(ov);
    var img = ov.querySelector('.lb-img');
    var prev = ov.querySelector('.lb-prev');
    var next = ov.querySelector('.lb-next');
    var srcs = [], alts = [], i = 0;

    function render() {
      unzoom();
      img.src = srcs[i];
      img.alt = alts[i] || '';
      var multi = srcs.length > 1;
      prev.style.display = multi ? '' : 'none';
      next.style.display = multi ? '' : 'none';
    }
    function open(s, a, start) {
      srcs = s; alts = a; i = start || 0;
      ov.classList.add('is-open');
      ov.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      render();
    }
    function close() {
      ov.classList.remove('is-open');
      ov.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      unzoom();
    }
    function go(d) { i = (i + d + srcs.length) % srcs.length; render(); }
    function unzoom() { img.classList.remove('zoomed'); img.style.transformOrigin = 'center center'; }

    ov.querySelector('.lb-close').addEventListener('click', close);
    prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      img.classList.toggle('zoomed');
    });
    img.addEventListener('mousemove', function (e) {
      if (!img.classList.contains('zoomed')) return;
      var r = img.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
    });
    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.classList.contains('lb-stage')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
    return { open: open };
  })();

  // ---- Per-card carousels ----
  document.querySelectorAll('.pcar').forEach(function (pc) {
    var imgs = Array.prototype.slice.call(pc.querySelectorAll('.pcar-img'));
    if (!imgs.length) return;
    var idx = 0;
    imgs[0].classList.add('is-active');

    // Cards that cover several models label each shot with its model number
    var caps = imgs.map(function (im) { return im.getAttribute('data-label') || ''; });
    var cap = null;
    if (caps.some(Boolean)) {
      cap = document.createElement('div');
      cap.className = 'pcar-cap';
      pc.appendChild(cap);
    }

    var prev = ctrl('button', 'pcar-btn pcar-prev', '‹', 'Previous image');
    var next = ctrl('button', 'pcar-btn pcar-next', '›', 'Next image');
    var zoom = ctrl('button', 'pcar-zoom', '', 'Zoom in');
    var dots = document.createElement('div');
    dots.className = 'pcar-dots';
    imgs.forEach(function (_, i) {
      var d = document.createElement('span');
      d.className = 'pcar-dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', function (e) { e.stopPropagation(); show(i); });
      dots.appendChild(d);
    });
    pc.appendChild(prev); pc.appendChild(next); pc.appendChild(zoom); pc.appendChild(dots);

    if (imgs.length < 2) {
      prev.style.display = next.style.display = dots.style.display = 'none';
    }

    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', j === idx); });
      dots.querySelectorAll('.pcar-dot').forEach(function (d, j) { d.classList.toggle('is-active', j === idx); });
      if (cap) {
        cap.textContent = caps[idx];
        cap.style.display = caps[idx] ? '' : 'none';
      }
    }
    show(0); // sync the caption with the shot that starts active
    function openLB(e) {
      e.stopPropagation();
      lightbox.open(imgs.map(function (im) { return im.src; }),
                    imgs.map(function (im) { return im.alt; }), idx);
    }
    prev.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    zoom.addEventListener('click', openLB);
    imgs.forEach(function (im) { im.addEventListener('click', openLB); });
  });

  function ctrl(tag, cls, html, label) {
    var el = document.createElement(tag);
    el.className = cls;
    el.type = 'button';
    if (html) el.innerHTML = html;
    el.setAttribute('aria-label', label);
    return el;
  }
})();
