/* =========================================================
   رواق — التطبيق (التوجيه، العرض، التفاعل)
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => `${Number(n).toLocaleString('en-US')} ج.م`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const cat = id => CATEGORIES.find(c => c.id === id) || { label: '', short: '' };
  const isAbaya = p => p.lengths.length > 0;
  const stars = r => Array.from({ length: 5 }, (_, i) => icon('star', i < Math.round(r) ? '' : 'off')).join('');
  const dateAr = d => d.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' });
  const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const firstName = n => String(n || '').trim().split(/\s+/)[0] || '';
  const PHONE_RE = /^01[0125]\d{8}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const toLatinDigits = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

  /* تطبيع النص العربي للبحث */
  const norm = s => String(s || '').toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  /* عائلات الألوان للفلترة */
  function colorFamilies(name) {
    const map = { 'أسود': ['أسود', 'فحمي'], 'بيج': ['بيج'], 'رمادي': ['رمادي', 'لافندر'], 'كحلي': ['كحلي'], 'موكا': ['موكا', 'كراميل'], 'أخضر': ['أخضر', 'نعناعي', 'زيتي'], 'أبيض': ['أبيض'], 'وردي': ['خوخي', 'نحاسي', 'وردي', 'برتقالي'], 'بنفسجي': ['بنفسجي', 'لافندر'] };
    return Object.keys(map).filter(f => map[f].some(k => name.includes(k)));
  }

  /* ---------- Toasts ---------- */
  function toast(msg, { ic = 'check', action } = {}) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
    if (action) {
      const b = document.createElement('button');
      b.textContent = action.label;
      b.addEventListener('click', () => { action.fn(); el.remove(); });
      el.appendChild(b);
    }
    $('#toasts').appendChild(el);
    while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
    setTimeout(() => el.classList.add('out'), 3400);
    setTimeout(() => el.remove(), 3800);
  }

  /* =========================================================
     Layers: drawers / modals / overlays
     ========================================================= */
  const Layers = {
    stack: [],
    open(el, focusSel) {
      if (!el || this.stack.some(s => s.el === el)) return;
      this.stack.push({ el, last: document.activeElement });
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      Motion.lock();
      setTimeout(() => {
        const f = (focusSel && $(focusSel, el)) || $('[autofocus], input:not([type=hidden]), button, a[href]', el);
        if (f) f.focus({ preventScroll: true });
      }, 80);
    },
    close(el) {
      const i = this.stack.findIndex(s => s.el === el);
      if (i < 0) return;
      const [{ last }] = this.stack.splice(i, 1);
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      if (!this.stack.length) {
        document.body.classList.remove('is-locked');
        Motion.unlock();
      }
      if (last && document.contains(last)) last.focus({ preventScroll: true });
      if (el.id === 'mobileMenu') $('#menuBtn').setAttribute('aria-expanded', 'false');
    },
    top() { return this.stack[this.stack.length - 1]?.el; },
    closeTop() { const t = this.top(); if (t) this.close(t); },
    closeAll() { [...this.stack].reverse().forEach(s => this.close(s.el)); },
    isOpen(el) { return this.stack.some(s => s.el === el); }
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && Layers.top()) { e.preventDefault(); Layers.closeTop(); return; }
    if (e.key === 'Tab' && Layers.top()) {
      const items = $$('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', Layers.top())
        .filter(x => x.offsetParent !== null || x === document.activeElement);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'ArrowLeft' && Layers.isOpen($('#lightbox'))) lightboxStep(1);
    if (e.key === 'ArrowRight' && Layers.isOpen($('#lightbox'))) lightboxStep(-1);
  });

  /* =========================================================
     Reveal animations
     ========================================================= */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', i++);
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  }

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); if (en.target.dataset.count !== undefined) countUp(en.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -5% 0px' })
    : null;

  function initReveals(root) {
    $$('[data-split]', root).forEach(splitWords);
    const groups = new Map();
    $$('[data-fade]', root).forEach(el => {
      const p = el.parentElement;
      const n = groups.get(p) || 0;
      el.style.setProperty('--d', `${n * 0.09}s`);
      groups.set(p, n + 1);
    });
    const targets = $$('[data-split]:not(.is-in), [data-fade]:not(.is-in), [data-count]', root);
    const go = () => targets.forEach(el => io ? io.observe(el) : el.classList.add('is-in'));
    if (document.body.classList.contains('is-loading')) document.addEventListener('rawaq:ready', go, { once: true });
    else go();
  }

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (Motion.reduced) { el.textContent = target; return; }
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / 1600);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     Product card
     ========================================================= */
  function card(p, { i = 0, arch = false } = {}) {
    const c = p.colors[0];
    const alt = c.images[1] || c.images[0];
    const wished = Store.isWished(p.id);
    const badges = [];
    if (p.oldPrice) badges.push(`<span class="tag rose">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`);
    if (p.tags.includes('new')) badges.push('<span class="tag">جديد</span>');
    if (p.stock <= 3) badges.push('<span class="tag gold">آخر القطع</span>');
    return `
    <article class="card${arch ? ' arch-card' : ''}" style="--i:${i}">
      <div class="card-frame">
        <a class="card-media" href="#/product/${p.id}" data-cursor="view" aria-label="${esc(p.name)}">
          <img class="img-main" src="${img(c.images[0], 700)}" alt="${esc(p.name)}" loading="lazy">
          <img class="img-alt" src="${img(alt, 700)}" alt="" loading="lazy">
        </a>
        <div class="card-badges">${badges.join('')}</div>
        <button class="card-wish${wished ? ' is-on' : ''}" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">${icon('heart')}</button>
        <div class="card-quick">
          <button data-quick="${p.id}">${icon('eye')}عرض سريع</button>
          <button data-quick-add="${p.id}">${icon('bag')}أضيفي للسلة</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-meta"><span>${esc(cat(p.cat).short)} · ${esc(FABRICS[p.fabric].label)}</span><span class="stars">${icon('star')}${p.rating}</span></div>
        <a class="card-name" href="#/product/${p.id}">${esc(p.name)}</a>
        <div class="price-row"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ''}</div>
        <div class="card-colors">${p.colors.map(c => `<i style="background:${c.hex}" title="${esc(c.name)}"></i>`).join('')}</div>
      </div>
    </article>`;
  }

  const emptyState = (ic, title, text, cta = '<a class="btn btn-gold" href="#/shop"><span>تسوقي العبايات</span></a>') =>
    `<div class="empty"><div class="empty-icon">${icon(ic)}</div><h2>${title}</h2><p>${text}</p>${cta}</div>`;

  /* =========================================================
     Router
     ========================================================= */
  const routes = {
    home: renderHome, shop: renderShop, product: renderProduct, wishlist: renderWishlist,
    account: renderAccount, track: renderTrack, order: renderOrder,
    about: null, contact: null, faq: null, shipping: renderShipping, returns: null
  };
  const titles = {
    home: 'رواق | عبايات بروح معاصرة', shop: 'المتجر | رواق', wishlist: 'المفضلة | رواق', account: 'حسابي | رواق',
    track: 'تتبع الطلب | رواق', order: 'تم تأكيد طلبكِ | رواق', about: 'حكايتنا | رواق', contact: 'تواصلي معنا | رواق',
    faq: 'الأسئلة الشائعة | رواق', shipping: 'الشحن والتوصيل | رواق', returns: 'الاستبدال والاسترجاع | رواق', notfound: 'الصفحة غير موجودة | رواق'
  };
  let current = { route: null, param: null };

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { route: parts[0] || 'home', param: parts[1] || null, params: new URLSearchParams(query) };
  }

  function onRoute(first = false) {
    const r = parseHash();
    const route = r.route in routes ? r.route : 'notfound';
    const sameView = current.route === route;
    const swap = () => {
      Layers.closeAll();
      $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === route));
      current = { route, param: r.param };
      const fn = routes[route];
      if (fn) fn(r.param, r.params);
      document.title = route === 'product' && Store.product(r.param) ? `${Store.product(r.param).name} | رواق` : titles[route];
      $$('.main-nav a').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#/' + (route === 'home' ? '' : route) && !a.href.includes('?')));
      Motion.scrollTop();
      updateHeader();
      const view = $(`.view[data-view="${route}"]`);
      initReveals(view);
      Motion.onRoute(view);
    };
    if (first || sameView) swap();
    else Motion.curtain(swap);
  }
  window.addEventListener('hashchange', () => onRoute(false));
  const go = hash => { if (location.hash === hash) onRoute(); else location.hash = hash; };

  /* =========================================================
     Header
     ========================================================= */
  let lastY = 0;
  function updateHeader() {
    const y = window.scrollY;
    const h = $('#siteHeader');
    h.classList.toggle('is-solid', y > 30 || current.route !== 'home');
    h.classList.toggle('is-hidden', y > 500 && y > lastY && !Layers.top());
    lastY = y;
  }
  window.addEventListener('scroll', updateHeader, { passive: true });

  function renderMega() {
    $('#megaMenu').innerHTML = CATEGORIES.map(c => `
      <a href="#/shop?cat=${c.id}"><figure><img src="${img(c.image, 400)}" alt="" loading="lazy"></figure>
      <strong>${c.label}</strong><small>${PRODUCTS.filter(p => p.cat === c.id).length} قطعة</small></a>`).join('');
  }

  function updateBadges() {
    const cc = Store.cartCount(), wc = Store.wishlist.length;
    const cb = $('#cartCount'), wb = $('#wishCount');
    if (cb.textContent !== String(cc)) { cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
    cb.textContent = cc; cb.hidden = !cc;
    wb.textContent = wc; wb.hidden = !wc;
  }

  /* =========================================================
     HOME
     ========================================================= */
  let homeBuilt = false;
  function renderHome() {
    if (!homeBuilt) {
      homeBuilt = true;
      // Collections
      $('#collectionList').innerHTML = CATEGORIES.map((c, i) => `
        <a class="collection-row" href="#/shop?cat=${c.id}" data-img="${img(c.image, 600)}" data-fade>
          <span class="num">0${i + 1}</span>
          <h3>${c.label}</h3>
          <div class="collection-meta"><p>${c.desc}</p><span class="count">${PRODUCTS.filter(p => p.cat === c.id).length} PIECES</span></div>
          <span class="thumb"><img src="${img(c.image, 300)}" alt="" loading="lazy"></span>
          <span class="go">${icon('arrow-ul')}</span>
        </a>`).join('');
      initCollectionFloat();
      initHeroSlider();
      initFabrics();
      initCountdown();
      initTestimonials();
      $('#lookbookGrid').innerHTML = ['floralDuo', 'goldTrim', 'floralChador', 'blueKhimar', 'greenKhimar', 'khimarBench']
        .slice(0, 6).map(k => `<a class="look" href="#/shop" aria-label="تسوقي الإطلالة"><img src="${img(k, 600)}" alt="إطلالة من رواق" loading="lazy"><span>${icon('instagram')}</span></a>`).join('');
    }
    $('#signatureTrack').innerHTML = PRODUCTS.filter(p => p.tags.includes('signature')).map((p, i) => card(p, { i, arch: true })).join('');
    $('#newGrid').innerHTML = PRODUCTS.filter(p => p.tags.includes('new')).slice(0, 4).map((p, i) => card(p, { i })).join('');
  }

  function initCollectionFloat() {
    const float = $('#collectionFloat'), fimg = $('img', float);
    let tx = 0, ty = 0, x = 0, y = 0, raf = null;
    const loop = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      float.style.left = x + 'px'; float.style.top = y + 'px';
      raf = requestAnimationFrame(loop);
    };
    $('#collectionList').addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      const row = e.target.closest('.collection-row');
      if (row && fimg.getAttribute('src') !== row.dataset.img) fimg.src = row.dataset.img;
      if (!raf) { x = tx; y = ty; loop(); }
      float.classList.add('is-on');
    });
    $('#collectionList').addEventListener('mouseleave', () => { float.classList.remove('is-on'); cancelAnimationFrame(raf); raf = null; });
  }

  function initHeroSlider() {
    const imgs = $$('#heroSlides img'), bars = $$('#heroBars button');
    const names = ['عباية ذهب الليل', 'عباية وَقار', 'عباية سُكون'];
    let i = 0, timer;
    const show = n => {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
      bars.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.classList.toggle('is-done', k < i); });
      // restart bar animation
      const bar = bars[i].querySelector('i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      $('#heroNum').textContent = '0' + (i + 1);
      $('#heroName').textContent = names[i];
      clearTimeout(timer);
      timer = setTimeout(() => show(i + 1), 6000);
    };
    bars.forEach((b, k) => b.addEventListener('click', () => show(k)));
    show(0);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else show(i); });
  }

  function initFabrics() {
    const keys = Object.keys(FABRICS);
    $('#fabricTabs').innerHTML = keys.map((k, i) => `
      <button class="fabric-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-fabric="${k}">
        <strong>${FABRICS[k].label}</strong><span>${PRODUCTS.filter(p => p.fabric === k).length} قطعة</span>
      </button>`).join('');
    const vis = $('#fabricVisual'), vimg = $('img', vis);
    const set = k => {
      const f = FABRICS[k];
      $$('.fabric-tab').forEach(b => { const on = b.dataset.fabric === k; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
      vis.classList.add('is-swapping');
      setTimeout(() => {
        vimg.src = img(f.image, 900); vimg.alt = `خامة ${f.label}`;
        const reveal = () => vis.classList.remove('is-swapping');
        if (vimg.complete) setTimeout(reveal, 30); else vimg.onload = reveal;
      }, 350);
      $('#fabricInfo').innerHTML = `<strong>${f.label}</strong><p>${f.note}</p><a class="text-link" href="#/shop?fabric=${k}">تسوقي قطع ال${f.label} ←</a>`;
    };
    $('#fabricTabs').addEventListener('click', e => { const b = e.target.closest('[data-fabric]'); if (b) set(b.dataset.fabric); });
    vimg.src = img(FABRICS[keys[0]].image, 900);
    set(keys[0]);
  }

  function initCountdown() {
    let end = Storage.get('promoEnd', 0);
    if (!end || end < Date.now()) { end = Date.now() + (3 * 24 + 7) * 3600 * 1000; Storage.set('promoEnd', end); }
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      const vals = { d, h, m, s };
      $$('[data-cd]').forEach(el => { el.textContent = pad(vals[el.dataset.cd]); });
    };
    tick();
    setInterval(tick, 1000);
  }

  function initTestimonials() {
    $('#testiTrack').innerHTML = TESTIMONIALS.map(t => `
      <figure class="testi">
        <div class="quote-mark" aria-hidden="true">“</div>
        <div class="stars">${stars(5)}</div>
        <blockquote>${esc(t.text)}</blockquote>
        <cite><strong>${esc(t.name)}</strong><span>${esc(t.role)} · ${esc(t.product)}</span></cite>
      </figure>`).join('');
    $('#testiDots').innerHTML = TESTIMONIALS.map((_, i) => `<button aria-label="رأي ${i + 1}"><i></i></button>`).join('');
    let i = 0, timer;
    const show = n => {
      i = (n + TESTIMONIALS.length) % TESTIMONIALS.length;
      $('#testiTrack').style.transform = `translateX(${i * 100}%)`;
      $$('#testiDots button').forEach((b, k) => b.classList.toggle('is-active', k === i));
      clearTimeout(timer); timer = setTimeout(() => show(i + 1), 7000);
    };
    $('#testiNext').addEventListener('click', () => show(i + 1));
    $('#testiPrev').addEventListener('click', () => show(i - 1));
    $$('#testiDots button').forEach((b, k) => b.addEventListener('click', () => show(k)));
    // swipe
    let sx = null;
    $('#testiSlider').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    $('#testiSlider').addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(i + (dx > 0 ? 1 : -1));
      sx = null;
    });
    show(0);
  }

  /* =========================================================
     SHOP
     ========================================================= */
  const PAGE = 9;
  const shop = { f: {}, shown: PAGE };
  const defaultFilters = () => ({ cat: '', tag: '', q: '', size: '', len: '', color: '', fabric: [], occ: [], max: 5000, sort: 'featured' });

  function readFilters(params) {
    const f = defaultFilters();
    f.cat = params.get('cat') || '';
    f.tag = params.get('tag') || '';
    f.q = params.get('q') || '';
    f.size = params.get('size') || '';
    f.len = params.get('len') || '';
    f.color = params.get('color') || '';
    f.fabric = (params.get('fabric') || '').split(',').filter(Boolean);
    f.occ = (params.get('occ') || '').split(',').filter(Boolean);
    f.max = Number(params.get('max')) || 5000;
    f.sort = params.get('sort') || 'featured';
    return f;
  }
  function writeFilters() {
    const f = shop.f, q = new URLSearchParams();
    ['cat', 'tag', 'q', 'size', 'len', 'color'].forEach(k => f[k] && q.set(k, f[k]));
    if (f.fabric.length) q.set('fabric', f.fabric.join(','));
    if (f.occ.length) q.set('occ', f.occ.join(','));
    if (f.max < 5000) q.set('max', f.max);
    if (f.sort !== 'featured') q.set('sort', f.sort);
    const qs = q.toString();
    history.replaceState(null, '', '#/shop' + (qs ? '?' + qs : ''));
  }

  function matchQuery(p, q) {
    const hay = norm([p.name, cat(p.cat).label, FABRICS[p.fabric].label, OCCASIONS[p.occasion], p.desc,
      p.colors.map(c => c.name).join(' '), p.tags.includes('new') ? 'جديد' : '', p.oldPrice ? 'عرض خصم' : '', isAbaya(p) ? 'عباية' : 'طرحة شال'].join(' '));
    return norm(q).split(/\s+/).filter(Boolean).every(t => hay.includes(t));
  }

  function filtered(f = shop.f) {
    let list = PRODUCTS.filter(p =>
      (!f.cat || p.cat === f.cat) &&
      (!f.tag || (f.tag === 'sale' ? !!p.oldPrice : p.tags.includes(f.tag))) &&
      (!f.q || matchQuery(p, f.q)) &&
      (!f.size || p.sizes.includes(f.size)) &&
      (!f.len || p.lengths.includes(Number(f.len))) &&
      (!f.color || p.colors.some(c => colorFamilies(c.name).includes(f.color))) &&
      (!f.fabric.length || f.fabric.includes(p.fabric)) &&
      (!f.occ.length || f.occ.includes(p.occasion)) &&
      p.price <= f.max);
    const s = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      new: (a, b) => b.tags.includes('new') - a.tags.includes('new') || b.id - a.id,
      featured: (a, b) => (b.tags.includes('featured') + b.tags.includes('signature')) - (a.tags.includes('featured') + a.tags.includes('signature'))
    }[f.sort];
    return s ? [...list].sort(s) : list;
  }

  let shopFiltersBuilt = false;
  function buildShopFilters() {
    if (shopFiltersBuilt) return;
    shopFiltersBuilt = true;
    $('#fSize').innerHTML = SIZES.map(s => `<button class="pill" data-f="size" data-v="${s}">${s}</button>`).join('');
    $('#fLength').innerHTML = LENGTHS.map(l => `<button class="pill" data-f="len" data-v="${l}">${l}</button>`).join('');
    $('#fColor').innerHTML = COLOR_SWATCHES.map(c => `<button class="swatch" data-f="color" data-v="${c.name}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    $('#fFabric').innerHTML = Object.entries(FABRICS).map(([k, f]) => `<label class="check"><input type="checkbox" data-f="fabric" value="${k}"><span>${f.label}</span><small>${PRODUCTS.filter(p => p.fabric === k).length}</small></label>`).join('');
    $('#fOccasion').innerHTML = Object.entries(OCCASIONS).map(([k, l]) => `<label class="check"><input type="checkbox" data-f="occ" value="${k}"><span>${l}</span><small>${PRODUCTS.filter(p => p.occasion === k).length}</small></label>`).join('');

    $('#filters').addEventListener('click', e => {
      const b = e.target.closest('button[data-f]');
      if (!b) return;
      const k = b.dataset.f;
      shop.f[k] = shop.f[k] === b.dataset.v ? '' : b.dataset.v;
      applyShop();
    });
    $('#filters').addEventListener('change', e => {
      const c = e.target.closest('input[type=checkbox][data-f]');
      if (!c) return;
      const k = c.dataset.f;
      shop.f[k] = c.checked ? [...shop.f[k], c.value] : shop.f[k].filter(x => x !== c.value);
      applyShop();
    });
    $('#fPrice').addEventListener('input', e => { shop.f.max = Number(e.target.value); $('#fPriceLabel').textContent = `حتى ${money(shop.f.max)}`; });
    $('#fPrice').addEventListener('change', applyShop);
    $('#clearFilters').addEventListener('click', () => { const keep = { cat: shop.f.cat, tag: shop.f.tag }; shop.f = { ...defaultFilters(), ...keep }; applyShop(); });
    $('#sortSelect').addEventListener('change', e => { shop.f.sort = e.target.value; applyShop(); });
    $('#loadMore').addEventListener('click', () => { shop.shown += PAGE; drawShopGrid(false); });
    $('#filterToggle').addEventListener('click', () => Layers.open($('#filters')));
    $$('[data-close-filters]').forEach(b => b.addEventListener('click', () => Layers.close($('#filters'))));
    $$('[data-density]').forEach(b => b.addEventListener('click', () => setDensity(b.dataset.density)));
    $('#catPills').addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      shop.f.cat = b.dataset.cat; shop.f.tag = '';
      applyShop();
    });
    $('#activeChips').addEventListener('click', e => {
      const b = e.target.closest('[data-chip]');
      if (!b) return;
      const [k, v] = b.dataset.chip.split(':');
      if (Array.isArray(shop.f[k])) shop.f[k] = shop.f[k].filter(x => x !== v);
      else shop.f[k] = k === 'max' ? 5000 : '';
      applyShop();
    });
    setDensity(Storage.get('density', '3'));
  }

  function setDensity(d) {
    Storage.set('density', d);
    $$('[data-density]').forEach(b => b.classList.toggle('is-active', b.dataset.density === d));
    $('#shopGrid').classList.toggle('cols-2', d === '2');
    $('#shopGrid').classList.toggle('cols-3', d !== '2');
  }

  function renderShop(_, params) {
    buildShopFilters();
    shop.f = readFilters(params);
    shop.shown = PAGE;
    drawShop();
  }
  function applyShop() { shop.shown = PAGE; writeFilters(); drawShop(); }

  function drawShop() {
    const f = shop.f;
    // header copy
    let title = 'كل العبايات', sub = 'اكتشفي مجموعة رواق الكاملة: من اليومي إلى السهرة.';
    if (f.cat) { title = cat(f.cat).label; sub = cat(f.cat).desc; }
    if (f.tag === 'new') { title = 'وصل حديثًا'; sub = 'أحدث القطع التي انضمت إلى رواق هذا الموسم.'; }
    if (f.tag === 'sale') { title = 'العروض'; sub = 'قطع مختارة بأسعار خاصة ولفترة محدودة.'; }
    if (f.tag === 'signature') { title = 'القطع المميزة'; sub = 'إصدارات محدودة بتطريز يدوي.'; }
    if (f.q) { title = `نتائج «${f.q}»`; sub = 'نتائج البحث في كل مجموعات رواق.'; }
    $('#shopTitle').textContent = title;
    $('#shopSubtitle').textContent = sub;
    $('#shopCrumb').textContent = title;
    $('#catPills').innerHTML = [{ id: '', label: 'الكل' }, ...CATEGORIES].map(c =>
      `<button class="chip${f.cat === c.id && !f.tag ? ' is-active' : ''}" data-cat="${c.id}">${c.label}</button>`).join('');

    // filter UI sync
    $$('#filters button[data-f]').forEach(b => b.classList.toggle('is-active', f[b.dataset.f] === b.dataset.v));
    $$('#filters input[data-f]').forEach(c => { c.checked = f[c.dataset.f].includes(c.value); });
    $('#fPrice').value = f.max;
    $('#fPriceLabel').textContent = `حتى ${money(f.max)}`;
    $('#sortSelect').value = f.sort;

    // chips
    const chips = [];
    if (f.size) chips.push(['size:' + f.size, 'المقاس ' + f.size]);
    if (f.len) chips.push(['len:' + f.len, 'الطول ' + f.len]);
    if (f.color) chips.push(['color:' + f.color, f.color]);
    f.fabric.forEach(x => chips.push(['fabric:' + x, FABRICS[x].label]));
    f.occ.forEach(x => chips.push(['occ:' + x, OCCASIONS[x]]));
    if (f.max < 5000) chips.push(['max:' + f.max, 'حتى ' + money(f.max)]);
    if (f.q) chips.push(['q:' + f.q, '«' + f.q + '»']);
    if (f.tag) chips.push(['tag:' + f.tag, { new: 'جديد', sale: 'عروض', signature: 'مميزة' }[f.tag] || f.tag]);
    $('#activeChips').innerHTML = chips.map(([k, l]) => `<button class="chip is-active" data-chip="${esc(k)}">${esc(l)} ${icon('close')}</button>`).join('');
    drawShopGrid(true);
  }

  function drawShopGrid(reset) {
    const list = filtered();
    const shown = Math.min(shop.shown, list.length);
    $('#resultCount').textContent = list.length.toLocaleString('en-US');
    if (!list.length) {
      $('#shopGrid').innerHTML = emptyState('search', 'لم نجد قطعًا بهذه التصفية', 'جرّبي إزالة بعض الفلاتر أو البحث بكلمة أخرى.', '<button class="btn btn-gold" id="resetShop"><span>مسح الفلاتر</span></button>');
      $('#resetShop').onclick = () => { shop.f = defaultFilters(); applyShop(); };
    } else {
      const start = reset ? 0 : $$('#shopGrid .card').length;
      const html = list.slice(start, shown).map((p, i) => card(p, { i })).join('');
      if (reset) $('#shopGrid').innerHTML = html; else $('#shopGrid').insertAdjacentHTML('beforeend', html);
    }
    $('#loadMoreWrap').hidden = list.length <= PAGE;
    $('#loadMoreText').textContent = `عرضتِ ${shown.toLocaleString('en-US')} من ${list.length.toLocaleString('en-US')} قطعة`;
    $('#loadMoreBar').style.width = (list.length ? shown / list.length * 100 : 0) + '%';
    $('#loadMore').hidden = shown >= list.length;
    Motion.refresh();
  }

  /* =========================================================
     PRODUCT PAGE
     ========================================================= */
  const pd = { p: null, color: null, size: '', length: '', qty: 1, images: [], index: 0 };

  function renderProduct(id) {
    const p = Store.product(id);
    const root = $('#productRoot');
    if (!p) { root.innerHTML = `<div class="empty big"><span class="empty-num">404</span><h1>القطعة غير متاحة</h1><p>ربما نفدت الكمية أو تغيّر الرابط.</p><a class="btn btn-gold" href="#/shop"><span>تصفحي المتجر</span></a></div>`; return; }
    Object.assign(pd, { p, color: p.colors[0].name, size: p.sizes.length === 1 ? p.sizes[0] : '', length: '', qty: 1, index: 0 });
    Store.pushRecent(p.id);
    const c = cat(p.cat);
    const eta1 = dateAr(addDays(2)), eta2 = dateAr(addDays(4));
    const lowStock = p.stock <= 5;
    root.innerHTML = `
    <div class="pd">
      <nav class="crumbs" aria-label="مسار التصفح"><a href="#/">الرئيسية</a><span>/</span><a href="#/shop?cat=${p.cat}">${c.label}</a><span>/</span><span>${esc(p.name)}</span></nav>
      <div class="pd-grid">
        <div class="pd-gallery">
          <div class="pd-thumbs" id="pdThumbs"></div>
          <div class="pd-main" id="pdMain" role="button" tabindex="0" aria-label="عرض الصورة بالحجم الكامل">
            <img id="pdImg" alt="${esc(p.name)}">
            <span class="zoom-hint">${icon('zoom')}مرّري للتكبير · اضغطي للعرض الكامل</span>
          </div>
        </div>
        <div class="pd-info">
          <p class="eyebrow ar"><span class="line"></span>${c.label}</p>
          <h1>${esc(p.name)}</h1>
          <div class="pd-rating"><span class="stars-row">${stars(p.rating)}</span><span>${p.rating}</span><a href="#reviews" data-scroll="#reviews">${p.reviews + (Store.reviews[p.id] || []).length} تقييم</a></div>
          <div class="pd-price"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="tag rose">وفّري ${money(p.oldPrice - p.price)}</span>` : ''}</div>
          <p class="pd-desc">${esc(p.desc)}</p>
          <div class="stock${lowStock ? ' low' : ''}">
            <span>${lowStock ? `متبقي ${p.stock.toLocaleString('en-US')} قطع فقط — اطلبيها قبل نفادها` : 'متوفرة · تُشحن خلال 24 ساعة'}</span>
            <div class="stock-bar"><i style="width:${Math.min(100, Math.max(8, p.stock / 25 * 100))}%"></i></div>
          </div>
          <div class="opt">
            <div class="opt-head"><strong>اللون</strong><span id="pdColorName">${esc(pd.color)}</span></div>
            <div class="swatch-row" id="pdColors">${p.colors.map(col => `<button class="swatch${col.name === pd.color ? ' is-active' : ''}" data-pd-color="${esc(col.name)}" style="background:${col.hex}" aria-label="${esc(col.name)}" title="${esc(col.name)}"></button>`).join('')}</div>
          </div>
          ${p.sizes.length > 1 ? `
          <div class="opt" id="optSize">
            <div class="opt-head"><strong>المقاس</strong><button class="text-link" data-open="sizeGuide">${icon('ruler')}دليل المقاسات</button></div>
            <div class="pill-row">${SIZES.map(s => `<button class="pill${p.sizes.includes(s) ? '' : ' is-out'}" data-pd-size="${s}" ${p.sizes.includes(s) ? '' : 'disabled aria-disabled="true"'}>${s}</button>`).join('')}</div>
            <small class="err" id="sizeErr"></small>
          </div>` : ''}
          ${isAbaya(p) ? `
          <div class="opt" id="optLength">
            <div class="opt-head"><strong>الطول</strong><span>بالبوصة · لا تعرفين طولكِ؟ <button class="text-link" data-open="sizeGuide">احسبيه</button></span></div>
            <div class="pill-row">${p.lengths.map(l => `<button class="pill" data-pd-length="${l}">${l}</button>`).join('')}</div>
            <small class="err" id="lengthErr"></small>
          </div>` : ''}
          <div class="pd-buy">
            <div class="qty" aria-label="الكمية"><button data-pd-qty="1" aria-label="زيادة">${icon('plus')}</button><span id="pdQty">1</span><button data-pd-qty="-1" aria-label="نقص">${icon('minus')}</button></div>
            <button class="btn btn-gold" id="pdAdd"><span>أضيفي إلى السلة</span>${icon('bag')}</button>
            <button class="wish-btn${Store.isWished(p.id) ? ' is-on' : ''}" data-wish="${p.id}" aria-label="المفضلة">${icon('heart')}</button>
          </div>
          <a class="btn btn-wa full" id="pdWa" target="_blank" rel="noopener">${icon('whatsapp')}<span>اطلبي عبر واتساب</span></a>
          <p class="muted small">${icon('truck')} اطلبي الآن واستلمي بين <b>${eta1}</b> و<b>${eta2}</b></p>
          <div class="pd-perks"><div>${icon('truck')}شحن مجاني فوق 2000</div><div>${icon('return')}استبدال 14 يوم</div><div>${icon('gift')}تغليف هدية</div></div>
          <div class="accordion">
            <details open><summary>تفاصيل القطعة${icon('plus')}</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
            <details><summary>الخامة والعناية${icon('plus')}</summary><p><b>${FABRICS[p.fabric].label}:</b> ${FABRICS[p.fabric].note}. يُفضّل الغسيل اليدوي بماء بارد أو التنظيف الجاف للقطع المطرزة، والكي على درجة منخفضة من الخلف.</p></details>
            <details><summary>الشحن والاستبدال${icon('plus')}</summary><p>توصيل لكل المحافظات خلال 1–6 أيام حسب المنطقة، مع إمكانية المعاينة قبل الدفع. الاستبدال والاسترجاع خلال 14 يومًا. <a class="text-link" href="#/shipping">التفاصيل</a></p></details>
          </div>
          <button class="text-link" id="pdShare">${icon('share')} مشاركة القطعة</button>
        </div>
      </div>
    </div>
    <section class="pd-section" id="completeLook"></section>
    <section class="pd-section" id="reviews"></section>
    <section class="pd-section"><div class="section-head"><div><p class="eyebrow"><span class="line"></span>YOU MAY ALSO LOVE</p><h2>قد يعجبكِ <em>أيضًا</em></h2></div></div><div class="scroll-row" id="related"></div></section>
    <section class="pd-section" id="recentWrap" style="padding-bottom:110px"></section>`;

    updatePdImages();
    renderCompleteLook(p);
    renderReviews(p);
    const related = [...PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat), ...PRODUCTS.filter(x => x.id !== p.id && x.cat !== p.cat && x.tags.includes('featured'))].slice(0, 8);
    $('#related').innerHTML = related.map((x, i) => card(x, { i })).join('');
    const recent = Store.recent.filter(x => x !== p.id).map(x => Store.product(x)).filter(Boolean);
    $('#recentWrap').innerHTML = recent.length ? `<div class="section-head"><div><p class="eyebrow"><span class="line"></span>RECENTLY VIEWED</p><h2>شاهدتِها <em>مؤخرًا</em></h2></div></div><div class="scroll-row">${recent.map((x, i) => card(x, { i })).join('')}</div>` : '';
    updateWaLink();
    bindPdMain();
  }

  function updatePdImages() {
    const col = pd.p.colors.find(c => c.name === pd.color) || pd.p.colors[0];
    pd.images = col.images;
    pd.index = 0;
    $('#pdThumbs').innerHTML = pd.images.map((k, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-pd-thumb="${i}" aria-label="صورة ${i + 1}"><img src="${img(k, 200)}" alt=""></button>`).join('');
    setPdImage(0);
  }
  function setPdImage(i) {
    pd.index = i;
    const im = $('#pdImg');
    im.style.opacity = 0;
    setTimeout(() => { im.src = img(pd.images[i], 1300); im.onload = () => { im.style.opacity = 1; }; if (im.complete) im.style.opacity = 1; }, 150);
    $$('[data-pd-thumb]').forEach((b, k) => b.classList.toggle('is-active', k === i));
  }
  function bindPdMain() {
    const main = $('#pdMain'), im = $('#pdImg');
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) {
      main.addEventListener('mouseenter', () => main.classList.add('is-zoom'));
      main.addEventListener('mouseleave', () => main.classList.remove('is-zoom'));
      main.addEventListener('mousemove', e => {
        const r = main.getBoundingClientRect();
        im.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
      });
    }
    const open = () => openLightbox(pd.images.map(k => img(k, 1600)), pd.index, pd.p.name);
    main.addEventListener('click', open);
    main.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  }
  function updateWaLink() {
    const p = pd.p;
    const text = `مرحبًا رواق، أود طلب: ${p.name}\nاللون: ${pd.color}${pd.size ? `\nالمقاس: ${pd.size}` : ''}${pd.length ? `\nالطول: ${pd.length}` : ''}\nالكمية: ${pd.qty}\nالسعر: ${money(p.price)}`;
    $('#pdWa').href = `https://wa.me/${STORE_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  function pdAdd() {
    const p = pd.p;
    let ok = true;
    if (p.sizes.length > 1 && !pd.size) { $('#sizeErr').textContent = 'اختاري المقاس أولًا'; ok = false; }
    if (isAbaya(p) && !pd.length) { $('#lengthErr').textContent = 'اختاري الطول المناسب لكِ'; ok = false; }
    if (!ok) {
      const first = $('#sizeErr:not(:empty), #lengthErr:not(:empty)');
      if (first) first.closest('.opt').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    Store.addToCart(p.id, { size: pd.size, length: pd.length, color: pd.color, qty: pd.qty });
    toast(`أُضيفت «${p.name}» إلى سلتكِ`, { ic: 'bag', action: { label: 'عرض السلة', fn: openCart } });
    openCart();
  }

  function renderCompleteLook(p) {
    const pool = isAbaya(p) ? PRODUCTS.filter(x => x.cat === 'scarves') : PRODUCTS.filter(x => isAbaya(x) && x.tags.includes('featured'));
    const match = pool[p.id % pool.length];
    if (!match) { $('#completeLook').innerHTML = ''; return; }
    const total = p.price + match.price;
    $('#completeLook').innerHTML = `
      <div class="section-head"><div><p class="eyebrow"><span class="line"></span>COMPLETE THE LOOK</p><h2>أكملي <em>الإطلالة</em></h2></div></div>
      <div class="look-set">
        <div class="look-set-items">${card(p, { i: 0 })}${card(match, { i: 1 })}</div>
        <div class="look-set-total">
          <p class="muted">نسّقتها لكِ مصممتنا: ${esc(p.name)} مع ${esc(match.name)}.</p>
          <strong>الإطلالة كاملة</strong>
          <span class="price">${money(total)}</span>
          <button class="btn btn-gold" data-add-look="${p.id},${match.id}"><span>أضيفي القطعتين للسلة</span>${icon('bag')}</button>
          <p class="muted small">سيتم اختيار المقاس M والطول 56 تلقائيًا، ويمكنكِ تعديلهما من السلة أو صفحة كل قطعة.</p>
        </div>
      </div>`;
  }

  function renderReviews(p) {
    const list = Store.productReviews(p.id);
    const total = p.reviews + (Store.reviews[p.id] || []).length;
    const dist = p.rating >= 4.85 ? [86, 10, 3, 1, 0] : p.rating >= 4.7 ? [76, 17, 5, 1, 1] : [68, 21, 7, 2, 2];
    $('#reviews').innerHTML = `
      <div class="section-head"><div><p class="eyebrow"><span class="line"></span>REVIEWS</p><h2>آراء <em>العميلات</em></h2></div></div>
      <div class="reviews">
        <div class="rv-summary">
          <div class="rv-score">${p.rating}</div>
          <div class="stars-row">${stars(p.rating)}</div>
          <p class="muted">بناءً على ${total.toLocaleString('en-US')} تقييم</p>
          <div class="rv-bars">${dist.map((v, i) => `<div class="rv-bar"><span>${5 - i}★</span><i><b style="width:${v}%"></b></i><span>${v}%</span></div>`).join('')}</div>
          <button class="btn btn-ghost sm" id="rvToggle">${icon('edit')}<span>اكتبي تقييمكِ</span></button>
        </div>
        <div>
          <form class="rv-form" id="rvForm" hidden novalidate>
            <h3>شاركينا رأيكِ</h3>
            <div class="star-input" id="starInput" role="radiogroup" aria-label="التقييم">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-star="${n}" aria-label="${n} نجوم" class="${n <= 5 ? 'is-on' : ''}">${icon('star')}</button>`).join('')}</div>
            <label class="field"><span>الاسم</span><input name="name" required value="${esc(Store.user?.name || '')}"><small class="err"></small></label>
            <label class="field"><span>تقييمكِ</span><textarea name="text" rows="3" required placeholder="كيف وجدتِ الخامة والمقاس؟"></textarea><small class="err"></small></label>
            <button class="btn btn-gold" type="submit"><span>نشر التقييم</span></button>
          </form>
          <div class="rv-list">${list.map(r => `
            <article class="rv">
              <div class="rv-head"><strong>${esc(r.name)} <span>· ${esc(r.city || 'عميلة رواق')}</span></strong><span class="stars-row">${stars(r.rating)}</span></div>
              <p>${esc(r.text)}</p>
              <span class="verified">${icon('check')}${r.mine ? 'تقييمكِ' : 'عملية شراء مؤكدة'}</span>
            </article>`).join('')}</div>
        </div>
      </div>`;
    let rating = 5;
    $('#rvToggle').onclick = () => { $('#rvForm').hidden = !$('#rvForm').hidden; if (!$('#rvForm').hidden) $('#rvForm input').focus(); };
    $('#starInput').onclick = e => {
      const b = e.target.closest('[data-star]'); if (!b) return;
      rating = Number(b.dataset.star);
      $$('[data-star]').forEach(s => s.classList.toggle('is-on', Number(s.dataset.star) <= rating));
    };
    $('#rvForm').onsubmit = e => {
      e.preventDefault();
      const f = e.target;
      const ok = validate(f, { name: v => v.trim().length >= 2 || 'اكتبي اسمكِ', text: v => v.trim().length >= 8 || 'اكتبي تقييمًا من 8 أحرف على الأقل' });
      if (!ok) return;
      Store.addReview(p.id, { name: f.name.value.trim(), text: f.text.value.trim(), rating, city: 'تقييمكِ' });
      renderReviews(p);
      toast('شكرًا لكِ! تم نشر تقييمكِ');
    };
  }

  /* =========================================================
     Quick view
     ========================================================= */
  const qv = { p: null, color: '', size: '', length: '' };
  function openQuick(id) {
    const p = Store.product(id);
    if (!p) return;
    Object.assign(qv, { p, color: p.colors[0].name, size: p.sizes.length === 1 ? p.sizes[0] : '', length: '' });
    drawQuick();
    Layers.open($('#quickView'), '.modal-x');
  }
  function drawQuick() {
    const p = qv.p;
    const col = p.colors.find(c => c.name === qv.color) || p.colors[0];
    $('#quickRoot').innerHTML = `
      <div class="quick-grid">
        <div class="quick-media"><img src="${img(col.images[0], 900)}" alt="${esc(p.name)}"></div>
        <div class="quick-body">
          <p class="eyebrow ar"><span class="line"></span>${cat(p.cat).label}</p>
          <h2>${esc(p.name)}</h2>
          <div class="pd-price"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ''}</div>
          <p class="pd-desc">${esc(p.desc)}</p>
          <div class="opt"><div class="opt-head"><strong>اللون</strong><span>${esc(qv.color)}</span></div>
            <div class="swatch-row">${p.colors.map(c => `<button class="swatch${c.name === qv.color ? ' is-active' : ''}" data-qv-color="${esc(c.name)}" style="background:${c.hex}" aria-label="${esc(c.name)}"></button>`).join('')}</div></div>
          ${p.sizes.length > 1 ? `<div class="opt"><div class="opt-head"><strong>المقاس</strong><button class="text-link" data-open="sizeGuide">دليل المقاسات</button></div>
            <div class="pill-row">${p.sizes.map(s => `<button class="pill${s === qv.size ? ' is-active' : ''}" data-qv-size="${s}">${s}</button>`).join('')}</div></div>` : ''}
          ${isAbaya(p) ? `<div class="opt"><div class="opt-head"><strong>الطول</strong><span>بالبوصة</span></div>
            <div class="pill-row">${p.lengths.map(l => `<button class="pill${String(l) === String(qv.length) ? ' is-active' : ''}" data-qv-length="${l}">${l}</button>`).join('')}</div></div>` : ''}
          <p class="form-error" id="qvErr"></p>
          <button class="btn btn-gold full" id="qvAdd"><span>أضيفي إلى السلة</span>${icon('bag')}</button>
          <a class="btn-line btn" href="#/product/${p.id}"><span>عرض التفاصيل الكاملة</span>${icon('arrow')}</a>
        </div>
      </div>`;
    $('#qvAdd').onclick = () => {
      if (p.sizes.length > 1 && !qv.size) { $('#qvErr').textContent = 'اختاري المقاس أولًا'; return; }
      if (isAbaya(p) && !qv.length) { $('#qvErr').textContent = 'اختاري الطول المناسب لكِ'; return; }
      Store.addToCart(p.id, { size: qv.size, length: qv.length, color: qv.color });
      Layers.close($('#quickView'));
      toast(`أُضيفت «${p.name}» إلى سلتكِ`, { ic: 'bag' });
      openCart();
    };
  }

  function quickAdd(id) {
    const p = Store.product(id);
    if (p.sizes.length === 1 && !isAbaya(p) && p.colors.length === 1) {
      Store.addToCart(p.id);
      toast(`أُضيفت «${p.name}» إلى سلتكِ`, { ic: 'bag', action: { label: 'عرض السلة', fn: openCart } });
    } else openQuick(id);
  }

  /* =========================================================
     Lightbox
     ========================================================= */
  const lb = { list: [], i: 0 };
  function openLightbox(list, i = 0, alt = '') {
    lb.list = list; lb.i = i;
    $('#lbImg').alt = alt;
    drawLightbox();
    Layers.open($('#lightbox'), '.lb-close');
  }
  function drawLightbox() {
    $('#lbImg').src = lb.list[lb.i];
    $('#lbCount').textContent = `${lb.i + 1} / ${lb.list.length}`;
    $('#lbPrev').hidden = $('#lbNext').hidden = lb.list.length < 2;
  }
  function lightboxStep(d) { lb.i = (lb.i + d + lb.list.length) % lb.list.length; drawLightbox(); }

  /* =========================================================
     CART
     ========================================================= */
  function openCart() { renderCart(); Layers.open($('#cartDrawer'), '.drawer-head .icon-btn'); }

  function renderCart() {
    const sub = Store.subtotal();
    const count = Store.cartCount();
    $('#cartTitleCount').textContent = `(${count.toLocaleString('en-US')})`;
    const left = FREE_SHIPPING_MIN - sub;
    $('#shipProgress').innerHTML = !count ? '' : left > 0
      ? `<span>أضيفي <b>${money(left)}</b> لتحصلي على شحن مجاني</span><div class="bar"><i style="width:${sub / FREE_SHIPPING_MIN * 100}%"></i></div>`
      : `<span>${icon('check')} رائع! طلبكِ مؤهل <b>للشحن المجاني</b></span><div class="bar"><i style="width:100%"></i></div>`;
    if (!count) {
      $('#cartLines').innerHTML = emptyState('bag', 'سلتكِ فارغة', 'ابدئي بإضافة القطع التي أحببتِها، وستجدينها هنا.', '<a class="btn btn-gold" href="#/shop"><span>ابدئي التسوق</span></a>') +
        `<div class="cart-upsell"><h4>الأكثر طلبًا الآن</h4>${PRODUCTS.filter(p => p.tags.includes('signature')).slice(0, 3).map(miniCard).join('')}</div>`;
      $('#cartFoot').hidden = true;
      return;
    }
    $('#cartFoot').hidden = false;
    $('#cartLines').innerHTML = Store.cart.map(l => {
      const p = Store.product(l.id);
      const variant = [`اللون: ${l.color}`, l.size && l.size !== 'ONE' ? `المقاس: ${l.size}` : '', l.length ? `الطول: ${l.length}` : ''].filter(Boolean).join(' · ');
      return `
      <div class="cart-line">
        <a class="thumb" href="#/product/${p.id}"><img src="${img(Store.lineImage(l), 240)}" alt="${esc(p.name)}"></a>
        <div>
          <h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
          <p class="variant">${esc(variant)}</p>
          <div class="cart-line-bottom">
            <div class="qty sm"><button data-line-inc="${esc(l.key)}" aria-label="زيادة">${icon('plus')}</button><span>${l.qty}</span><button data-line-dec="${esc(l.key)}" aria-label="نقص">${icon('minus')}</button></div>
            <span class="price">${money(p.price * l.qty)}</span>
            <button class="remove" data-line-remove="${esc(l.key)}" aria-label="حذف ${esc(p.name)}">${icon('trash')}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const inCart = new Set(Store.cart.map(l => l.id));
    const ups = PRODUCTS.filter(p => p.cat === 'scarves' && !inCart.has(p.id)).slice(0, 2);
    if (ups.length) $('#cartLines').insertAdjacentHTML('beforeend', `<div class="cart-upsell"><h4>أكملي إطلالتكِ بطرحة</h4>${ups.map(miniCard).join('')}</div>`);

    const disc = Store.discount(sub);
    if (Store.coupon && !disc) Store.removeCoupon();
    $('#couponMsg').className = 'coupon-msg';
    $('#couponMsg').innerHTML = Store.coupon ? `${icon('check')} ${COUPONS[Store.coupon].label} <button data-remove-coupon>إزالة</button>` : '';
    $('#cartSubtotal').textContent = money(sub);
    $('#cartDiscountRow').hidden = !disc;
    $('#cartDiscount').textContent = '− ' + money(disc);
    $('#cartShipping').textContent = sub >= FREE_SHIPPING_MIN ? 'مجاني' : 'من 60 ج.م حسب المحافظة';
    $('#cartTotal').textContent = money(sub - disc);
  }
  const miniCard = p => `<div class="mini-card"><img src="${img(p.colors[0].images[0], 160)}" alt=""><div><strong>${esc(p.name)}</strong><span>${money(p.price)}</span></div><button class="icon-btn round" data-quick-add="${p.id}" aria-label="إضافة ${esc(p.name)}">${icon('plus')}</button></div>`;

  /* =========================================================
     SEARCH
     ========================================================= */
  function openSearch() {
    renderSearch('');
    Layers.open($('#searchLayer'), '#searchInput');
  }
  function highlight(text, q) {
    if (!q) return esc(text);
    const nq = norm(q).trim();
    const nt = norm(text);
    const i = nt.indexOf(nq);
    if (i < 0 || !nq) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + nq.length)) + '</mark>' + esc(text.slice(i + nq.length));
  }
  function renderSearch(q) {
    q = q.trim();
    const results = q ? PRODUCTS.filter(p => matchQuery(p, q)) : PRODUCTS.filter(p => p.tags.includes('featured')).slice(0, 4);
    $('#searchLabel').textContent = q ? `${results.length.toLocaleString('en-US')} نتيجة لـ «${q}»` : 'مقترحات لكِ';
    $('#searchResults').innerHTML = results.length
      ? results.slice(0, 8).map((p, i) => `<a class="s-item" href="#/product/${p.id}" style="--i:${i}"><div class="thumb"><img src="${img(p.colors[0].images[0], 400)}" alt="" loading="lazy"></div><strong>${highlight(p.name, q)}</strong><span>${money(p.price)}</span></a>`).join('')
      : `<p class="muted" style="grid-column:1/-1">لم نجد نتائج. جرّبي «عباية سوداء» أو «مطرزة» أو «طرحة».</p>`;
    $('#searchAll').hidden = !q || !results.length;
    $('#searchAll').href = '#/shop?q=' + encodeURIComponent(q);
    $('#searchAll span').textContent = `عرض كل النتائج (${results.length.toLocaleString('en-US')})`;
    $('#recentSearches').innerHTML = Store.searches.length
      ? `<h3>عمليات بحث سابقة</h3><div class="recent-list">${Store.searches.map(s => `<button data-q="${esc(s)}">${icon('clock')}${esc(s)}</button>`).join('')}</div>` : '';
  }

  /* =========================================================
     SIZE GUIDE
     ========================================================= */
  function calcSize(h, w) {
    const size = w < 48 ? 'XS' : w < 56 ? 'S' : w < 65 ? 'M' : w < 75 ? 'L' : w < 88 ? 'XL' : 'XXL';
    const length = h < 157 ? 52 : h < 163 ? 54 : h < 170 ? 56 : h < 177 ? 58 : 60;
    return { size, length };
  }

  /* =========================================================
     Forms
     ========================================================= */
  function setErr(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.toggle('has-error', !!msg);
    const e = $('.err', field);
    if (e) e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate(form, rules) {
    let firstBad = null;
    Object.entries(rules).forEach(([name, rule]) => {
      const input = form.elements[name];
      if (!input) return;
      const res = rule(input.value, input);
      const msg = res === true ? '' : res;
      setErr(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  const R = {
    name: v => v.trim().length >= 3 || 'اكتبي اسمكِ بالكامل',
    phone: v => PHONE_RE.test(toLatinDigits(v).replace(/\s|-/g, '')) || 'رقم موبايل مصري صحيح من 11 رقم يبدأ بـ 01',
    email: v => EMAIL_RE.test(v.trim()) || 'بريد إلكتروني غير صحيح',
    emailOpt: v => !v.trim() || EMAIL_RE.test(v.trim()) || 'بريد إلكتروني غير صحيح',
    password: v => v.length >= 6 || 'كلمة المرور 6 أحرف على الأقل'
  };
  // clear error as the user types
  document.addEventListener('input', e => { if (e.target.closest('.field.has-error')) setErr(e.target, ''); });

  /* =========================================================
     AUTH
     ========================================================= */
  function openAuth(tab = 'loginPane') {
    switchTab($('#authModal'), tab);
    $$('#authModal .form-error').forEach(x => { x.textContent = ''; });
    Layers.open($('#authModal'), `#${tab} input`);
  }
  function switchTab(scope, id) {
    $$('[data-tab]', scope).forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $$('.tab-panel', scope).forEach(p => p.classList.toggle('is-active', p.id === id));
  }
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f, { email: R.email, password: R.password })) return;
    const res = Store.login({ email: f.email.value, password: f.password.value });
    if (!res.ok) { $('.form-error', f).textContent = res.msg; return; }
    afterAuth(`أهلًا بعودتكِ يا ${firstName(Store.user.name)}`);
    f.reset();
  });
  $('#registerForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f, { name: R.name, phone: R.phone, email: R.email, password: R.password })) return;
    const res = Store.register({ name: f.name.value, phone: toLatinDigits(f.phone.value), email: f.email.value, password: f.password.value });
    if (!res.ok) { $('.form-error', f).textContent = res.msg; return; }
    afterAuth(`مرحبًا بكِ في رواق يا ${firstName(Store.user.name)}! استخدمي WELCOME15 لخصم أول طلب`);
    f.reset();
  });
  function afterAuth(msg) {
    Layers.close($('#authModal'));
    toast(msg, { ic: 'sparkle' });
    if (current.route === 'account') renderAccount(current.param);
  }

  /* =========================================================
     ACCOUNT
     ========================================================= */
  function orderStatus(o) { return ORDER_STEPS[Store.orderStep(o)].label; }
  function orderCard(o) {
    return `<article class="order-card">
      <div class="order-card-head"><strong>${o.id}</strong><span>${new Date(o.createdAt).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span class="status-pill">${orderStatus(o)}</span></div>
      <div class="order-thumbs">${o.items.map(i => `<img src="${img(i.image, 120)}" alt="${esc(i.name)}">`).join('')}</div>
      <div class="order-card-head"><span>${o.items.reduce((s, i) => s + i.qty, 0).toLocaleString('en-US')} قطعة · ${money(o.total)}</span><a class="btn btn-line" href="#/track/${o.id}"><span>تتبع الطلب</span>${icon('arrow')}</a></div>
    </article>`;
  }

  function renderAccount(tab) {
    const root = $('#accountRoot');
    if (!Store.user) {
      root.innerHTML = `
        <div class="section-tight" style="padding-top:60px">
          <div class="guest-card">
            <div class="guest-media"><img src="${img('goldTrim', 900)}" alt="" loading="lazy"></div>
            <div class="guest-body">
              <p class="eyebrow"><span class="line"></span>MY RAWAQ</p>
              <h2>حسابكِ في <em>رواق</em></h2>
              <ul>
                <li>${icon('package')}تتبعي طلباتكِ لحظة بلحظة</li>
                <li>${icon('heart')}احفظي قطعكِ المفضلة على كل أجهزتكِ</li>
                <li>${icon('pin')}عناوين محفوظة لدفع أسرع</li>
                <li>${icon('gift')}عروض خاصة وخصم 15% على أول طلب</li>
              </ul>
              <div class="hero-cta" style="margin:0">
                <button class="btn btn-gold" data-auth="loginPane"><span>تسجيل الدخول</span></button>
                <button class="btn btn-ghost" data-auth="registerPane"><span>إنشاء حساب</span></button>
              </div>
              ${Store.orders.length ? `<a class="text-link" href="#/track">لديكِ ${Store.orders.length.toLocaleString('en-US')} طلب على هذا الجهاز · تتبعي الآن</a>` : ''}
            </div>
          </div>
        </div>`;
      return;
    }
    const tabs = [['overview', 'نظرة عامة', 'user'], ['orders', 'طلباتي', 'package'], ['addresses', 'عناويني', 'pin'], ['profile', 'بياناتي', 'edit']];
    tab = tabs.some(t => t[0] === tab) ? tab : 'overview';
    const u = Store.user;
    let panel = '';
    if (tab === 'overview') {
      panel = `<h2>أهلًا يا <em>${esc(firstName(u.name))}</em></h2>
        <div class="stat-row"><div><strong>${Store.orders.length}</strong><span>طلبات</span></div><div><strong>${Store.wishlist.length}</strong><span>في المفضلة</span></div><div><strong>${Store.addresses.length}</strong><span>عناوين محفوظة</span></div></div>
        ${Store.orders.length ? `<h3 class="display" style="font-size:1.6rem">آخر طلب</h3>${orderCard(Store.orders[0])}` : emptyState('package', 'لا توجد طلبات بعد', 'حين تطلبين أول قطعة ستظهر هنا مع حالة الشحن.')}`;
    } else if (tab === 'orders') {
      panel = `<h2>طلباتي</h2>${Store.orders.length ? Store.orders.map(orderCard).join('') : emptyState('package', 'لا توجد طلبات بعد', 'تصفحي المجموعة واطلبي قطعتكِ الأولى.')}`;
    } else if (tab === 'addresses') {
      panel = `<h2>عناويني</h2>${Store.addresses.length ? Store.addresses.map((a, i) => `<div class="addr-card"><div><strong>${esc(a.governorate)} · ${esc(a.city)}</strong><p>${esc(a.address)}</p></div><button class="icon-btn" data-remove-addr="${i}" aria-label="حذف العنوان">${icon('trash')}</button></div>`).join('') : '<p class="muted">ستُحفظ عناوينكِ تلقائيًا عند إتمام أول طلب.</p>'}`;
    } else {
      panel = `<h2>بياناتي</h2>
        <form class="profile-form" id="profileForm" novalidate>
          <label class="field"><span>الاسم</span><input name="name" value="${esc(u.name)}" required><small class="err"></small></label>
          <label class="field"><span>رقم الموبايل</span><input name="phone" value="${esc(u.phone)}" dir="ltr" inputmode="tel" required><small class="err"></small></label>
          <label class="field"><span>البريد الإلكتروني</span><input value="${esc(u.email)}" dir="ltr" disabled></label>
          <button class="btn btn-gold" type="submit"><span>حفظ التغييرات</span></button>
        </form>`;
    }
    root.innerHTML = `
      <header class="page-hero"><nav class="crumbs"><a href="#/">الرئيسية</a><span>/</span><span>حسابي</span></nav><h1>حسابي</h1></header>
      <div class="acct" style="padding-top:0">
        <nav class="acct-nav" aria-label="أقسام الحساب">
          <div class="acct-hello"><strong>${esc(u.name)}</strong><span>${esc(u.email)}</span></div>
          ${tabs.map(([id, l, ic]) => `<button class="${tab === id ? 'is-active' : ''}" data-acct="${id}">${icon(ic)}${l}</button>`).join('')}
          <a class="acct-link" href="#/wishlist" style="display:flex;gap:12px;align-items:center;min-height:50px;padding:0 16px;color:var(--pearl-2)">${icon('heart')}المفضلة</a>
          <button data-logout>${icon('logout')}تسجيل الخروج</button>
        </nav>
        <div class="acct-panel">${panel}</div>
      </div>`;
    const pf = $('#profileForm');
    if (pf) pf.onsubmit = e => {
      e.preventDefault();
      if (!validate(pf, { name: R.name, phone: R.phone })) return;
      Store.updateProfile({ name: pf.name.value.trim(), phone: toLatinDigits(pf.phone.value.trim()) });
      toast('تم حفظ بياناتكِ');
      renderAccount('profile');
    };
  }

  /* =========================================================
     WISHLIST
     ========================================================= */
  function renderWishlist() {
    const list = Store.wishlist.map(id => Store.product(id)).filter(Boolean);
    $('#wishGrid').innerHTML = list.length
      ? list.map((p, i) => card(p, { i })).join('')
      : emptyState('heart', 'لم تضيفي قطعًا بعد', 'اضغطي على القلب في أي قطعة لتحفظيها هنا وتعودي إليها لاحقًا.');
  }

  /* =========================================================
     TRACK / ORDER SUCCESS / SHIPPING
     ========================================================= */
  function trackHtml(o) {
    const step = Store.orderStep(o);
    return `<div class="track-card">
      <div class="order-card-head"><div><p class="muted small">رقم الطلب</p><strong>${o.id}</strong></div><span class="status-pill">${ORDER_STEPS[step].label}</span></div>
      <ol class="timeline">${ORDER_STEPS.map((s, i) => `<li class="${i < step ? 'is-done' : i === step ? (step === ORDER_STEPS.length - 1 ? 'is-done' : 'is-current') : ''}"><span class="dot">${i <= step ? icon('check') : ''}</span><div><strong>${s.label}</strong><span>${i <= step ? s.note : 'لاحقًا'}</span></div></li>`).join('')}</ol>
      <div class="order-thumbs">${o.items.map(i => `<img src="${img(i.image, 120)}" alt="${esc(i.name)}">`).join('')}</div>
      <p class="muted small">التوصيل إلى ${esc(o.governorate)} · ${esc(o.city)} — الإجمالي ${money(o.total)}. (عرض تجريبي: تتقدم الحالة خطوة كل دقيقتين.)</p>
    </div>`;
  }
  function renderTrack(param) {
    $('#trackInput').value = param || '';
    const res = $('#trackResult');
    if (param) {
      const o = Store.findOrder(param);
      res.innerHTML = o ? trackHtml(o) : `<p class="form-error">لم نجد طلبًا بالرقم ${esc(param)}. تأكدي من الرقم أو تواصلي معنا.</p>`;
    } else {
      res.innerHTML = Store.orders.length ? `<h3 class="display" style="font-size:1.5rem;margin-bottom:14px">طلباتكِ الأخيرة</h3><div class="chip-row">${Store.orders.slice(0, 4).map(o => `<a class="chip" href="#/track/${o.id}" dir="ltr">${o.id}</a>`).join('')}</div>` : '';
    }
  }
  $('#trackForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#trackInput').value.trim().toUpperCase();
    if (!v) { $('#trackResult').innerHTML = '<p class="form-error">اكتبي رقم الطلب أولًا</p>'; return; }
    go('#/track/' + encodeURIComponent(v));
  });

  const payLabels = { cod: 'الدفع عند الاستلام', card: 'بطاقة بنكية', vodafone: 'فودافون كاش', instapay: 'إنستاباي' };
  function renderOrder(id) {
    const o = Store.findOrder(id);
    const root = $('#orderRoot');
    if (!o) { root.innerHTML = `<div class="empty big"><h1>لم نجد هذا الطلب</h1><a class="btn btn-gold" href="#/track"><span>تتبع طلب</span></a></div>`; return; }
    const zone = SHIPPING_ZONES[o.zone];
    root.innerHTML = `
      <div class="success">
        <div class="success-mark">${icon('check')}</div>
        <p class="eyebrow"><span class="line"></span>ORDER CONFIRMED<span class="line"></span></p>
        <h1 data-split>شكرًا لكِ يا <em>${esc(firstName(o.name))}</em></h1>
        <p>تم تأكيد طلبكِ رقم <b dir="ltr">${o.id}</b>. ستصلكِ رسالة على ${esc(o.phone)} عند شحن الطلب، ونتوقع وصوله خلال ${zone.days} أيام عمل.</p>
        <div class="success-grid">
          <div class="success-box"><h3>القطع</h3>${o.items.map(i => `<div class="co-item"><div class="thumb"><img src="${img(i.image, 140)}" alt=""><b>${i.qty}</b></div><div>${esc(i.name)}<small>${esc([i.color, i.size !== 'ONE' ? i.size : '', i.length || ''].filter(Boolean).join(' · '))}</small></div><span>${money(i.price * i.qty)}</span></div>`).join('')}</div>
          <div class="success-box"><h3>التفاصيل</h3>
            <dl class="totals">
              <div><dt>التوصيل إلى</dt><dd>${esc(o.governorate)} · ${esc(o.city)}</dd></div>
              <div><dt>طريقة الدفع</dt><dd>${payLabels[o.payment]}</dd></div>
              <div><dt>المجموع الفرعي</dt><dd>${money(o.subtotal)}</dd></div>
              ${o.discount ? `<div class="discount-row"><dt>الخصم (${o.coupon})</dt><dd>− ${money(o.discount)}</dd></div>` : ''}
              <div><dt>الشحن</dt><dd>${o.shipping ? money(o.shipping) : 'مجاني'}</dd></div>
              <div class="grand"><dt>الإجمالي</dt><dd>${money(o.total)}</dd></div>
            </dl>
          </div>
        </div>
        <div class="success-actions"><a class="btn btn-gold" href="#/track/${o.id}"><span>تتبعي الطلب</span>${icon('arrow')}</a><a class="btn btn-ghost" href="#/shop"><span>متابعة التسوق</span></a></div>
      </div>`;
  }

  function renderShipping() {
    const byZone = k => GOVERNORATES.filter(g => g[1] === k).map(g => g[0]).join('، ');
    $('#zoneTable').innerHTML = `<div class="zone-row head"><span>المنطقة</span><span>المحافظات</span><span>المدة</span><span>التكلفة</span></div>` +
      Object.entries(SHIPPING_ZONES).map(([k, z]) => `<div class="zone-row"><strong>${z.label}</strong><small>${byZone(k)}</small><span>${z.days} أيام</span><span class="price">${money(z.fee)}</span></div>`).join('');
  }

  /* =========================================================
     CHECKOUT
     ========================================================= */
  const co = { step: 0 };
  const coForm = $('#checkoutForm');
  $('#govSelect').innerHTML = '<option value="">اختاري المحافظة</option>' + GOVERNORATES.map(([g]) => `<option>${g}</option>`).join('');

  function openCheckout() {
    if (!Store.cart.length) { toast('أضيفي قطعة إلى السلة أولًا', { ic: 'bag' }); return; }
    Layers.close($('#cartDrawer'));
    co.step = 0;
    if (Store.user) {
      coForm.name.value ||= Store.user.name;
      coForm.phone.value ||= Store.user.phone;
      coForm.email.value ||= Store.user.email;
    }
    $('#savedAddresses').innerHTML = Store.addresses.map((a, i) => `<button type="button" data-use-addr="${i}">${icon('pin')}<span>${esc(a.governorate)} · ${esc(a.city)} — ${esc(a.address)}</span></button>`).join('');
    drawCheckoutStep();
    drawCoSummary();
    Layers.open($('#checkout'), 'input[name=name]');
  }

  function zoneOf(gov) { return (GOVERNORATES.find(g => g[0] === gov) || [, 'metro'])[1]; }
  function drawCoSummary() {
    const sub = Store.subtotal(), disc = Store.discount(sub);
    const gov = coForm.governorate.value;
    const ship = Store.shippingFee(sub, zoneOf(gov));
    $('#coItems').innerHTML = Store.cart.map(l => {
      const p = Store.product(l.id);
      return `<div class="co-item"><div class="thumb"><img src="${img(Store.lineImage(l), 140)}" alt=""><b>${l.qty}</b></div><div>${esc(p.name)}<small>${esc([l.color, l.size !== 'ONE' ? l.size : '', l.length || ''].filter(Boolean).join(' · '))}</small></div><span>${money(p.price * l.qty)}</span></div>`;
    }).join('');
    $('#coSubtotal').textContent = money(sub);
    $('#coDiscountRow').hidden = !disc;
    $('#coDiscount').textContent = '− ' + money(disc);
    $('#coCoupon').textContent = Store.coupon ? `(${Store.coupon})` : '';
    $('#coShipping').textContent = !gov && sub < FREE_SHIPPING_MIN ? 'اختاري المحافظة' : ship ? money(ship) : 'مجاني';
    $('#coTotal').textContent = money(sub - disc + (gov ? ship : 0));
    if (gov) {
      const z = SHIPPING_ZONES[zoneOf(gov)];
      $('#zoneNote').textContent = `التوصيل إلى ${gov} خلال ${z.days} أيام عمل${ship ? ` · رسوم الشحن ${money(ship)}` : ' · الشحن مجاني لطلبكِ'}`;
    } else $('#zoneNote').textContent = '';
  }

  function drawCheckoutStep() {
    $$('.co-step').forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === co.step));
    $$('#stepper li').forEach((li, i) => { li.classList.toggle('is-active', i === co.step); li.classList.toggle('is-done', i < co.step); });
    $('#coBack').hidden = co.step === 0;
    $('#coNext span').textContent = co.step === 3 ? `تأكيد الطلب · ${$('#coTotal').textContent}` : 'متابعة';
    if (co.step === 3) drawReview();
    $('.checkout-shell').scrollTop = 0;
  }

  function drawReview() {
    const f = coForm;
    const pay = f.payment.value;
    $('#reviewBox').innerHTML = `
      <div><span>الاسم</span><strong>${esc(f.name.value)}</strong><button type="button" data-goto-step="0">تعديل</button></div>
      <div><span>الموبايل</span><strong dir="ltr">${esc(f.phone.value)}</strong><button type="button" data-goto-step="0">تعديل</button></div>
      <div><span>العنوان</span><strong>${esc(f.governorate.value)} · ${esc(f.city.value)} — ${esc(f.address.value)}</strong><button type="button" data-goto-step="1">تعديل</button></div>
      <div><span>الدفع</span><strong>${payLabels[pay]}${pay === 'card' ? ' ···· ' + esc(f.cardNumber.value.slice(-4)) : ''}</strong><button type="button" data-goto-step="2">تعديل</button></div>`;
    $('#coNext span').textContent = `تأكيد الطلب · ${$('#coTotal').textContent}`;
  }

  function validStep(step) {
    const f = coForm;
    if (step === 0) return validate(f, { name: R.name, phone: R.phone, email: R.emailOpt });
    if (step === 1) return validate(f, {
      governorate: v => !!v || 'اختاري المحافظة',
      city: v => v.trim().length >= 2 || 'اكتبي المدينة أو الحي',
      address: v => v.trim().length >= 8 || 'اكتبي العنوان بالتفصيل (الشارع ورقم العمارة)'
    });
    if (step === 2 && f.payment.value === 'card') return validate(f, {
      cardNumber: v => /^\d{16}$/.test(v.replace(/\s/g, '')) || 'رقم البطاقة 16 رقمًا',
      cardExp: v => {
        const m = v.match(/^(\d{2})\/(\d{2})$/);
        if (!m || +m[1] < 1 || +m[1] > 12) return 'الصيغة MM/YY';
        const exp = new Date(2000 + +m[2], +m[1]);
        return exp > new Date() || 'البطاقة منتهية';
      },
      cardCvv: v => /^\d{3,4}$/.test(v) || '3 أو 4 أرقام'
    });
    if (step === 3) {
      const ok = f.terms.checked;
      $('#termsErr').textContent = ok ? '' : 'يجب الموافقة على السياسة لإتمام الطلب';
      return ok;
    }
    return true;
  }

  coForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validStep(co.step)) return;
    if (co.step < 3) { co.step++; drawCheckoutStep(); return; }
    const f = coForm;
    const btn = $('#coNext');
    btn.disabled = true;
    $('#coNext span').textContent = 'جارٍ تأكيد الطلب…';
    setTimeout(() => {
      const order = Store.placeOrder({
        name: f.name.value.trim(), phone: toLatinDigits(f.phone.value.trim()), email: f.email.value.trim(),
        governorate: f.governorate.value, city: f.city.value.trim(), address: f.address.value.trim(),
        notes: f.notes.value.trim(), payment: f.payment.value
      });
      btn.disabled = false;
      f.reset();
      Layers.close($('#checkout'));
      go('#/order/' + order.id);
      toast('تم تأكيد طلبكِ بنجاح', { ic: 'sparkle' });
    }, 1100);
  });
  $('#coBack').addEventListener('click', () => { co.step = Math.max(0, co.step - 1); drawCheckoutStep(); });
  coForm.governorate.addEventListener('change', drawCoSummary);
  coForm.addEventListener('change', e => {
    if (e.target.name !== 'payment') return;
    const v = e.target.value;
    $('#cardFields').hidden = v !== 'card';
    const note = { vodafone: 'بعد تأكيد الطلب حوّلي الإجمالي على رقم فودافون كاش 010 0000 0000 وأرسلي صورة التحويل على واتساب.', instapay: 'بعد تأكيد الطلب حوّلي الإجمالي على rawaq@instapay وأرسلي صورة التحويل على واتساب.' }[v];
    $('#walletNote').hidden = !note;
    $('#walletNote').textContent = note || '';
  });
  coForm.cardNumber.addEventListener('input', e => { e.target.value = toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); });
  coForm.cardExp.addEventListener('input', e => { let v = toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
  coForm.cardCvv.addEventListener('input', e => { e.target.value = toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 4); });

  /* =========================================================
     Global click delegation
     ========================================================= */
  document.addEventListener('click', e => {
    const t = e.target;
    let el;

    // close buttons inside layers
    if ((el = t.closest('[data-close]'))) {
      const layer = el.closest('.layer');
      if (layer) Layers.close(layer);
      if (el.tagName !== 'A') return;
    }
    if ((el = t.closest('a[href^="#/"]'))) {
      // navigating closes any open layer (handled by router)
      if (el.getAttribute('href') === location.hash) { e.preventDefault(); onRoute(); }
      return;
    }
    if ((el = t.closest('[data-toast]'))) { e.preventDefault(); toast(el.dataset.toast, { ic: 'sparkle' }); return; }
    if ((el = t.closest('[data-scroll]'))) { e.preventDefault(); Motion.scrollTo(el.dataset.scroll); return; }
    if ((el = t.closest('[data-open="sizeGuide"]'))) { e.preventDefault(); Layers.open($('#sizeGuide')); return; }
    if ((el = t.closest('[data-wish]'))) {
      const on = Store.toggleWish(el.dataset.wish);
      const p = Store.product(el.dataset.wish);
      $$(`[data-wish="${p.id}"]`).forEach(b => { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      toast(on ? `حُفظت «${p.name}» في المفضلة` : 'أُزيلت من المفضلة', { ic: 'heart', action: on ? { label: 'عرض', fn: () => go('#/wishlist') } : null });
      if (current.route === 'wishlist') renderWishlist();
      return;
    }
    if ((el = t.closest('[data-quick]'))) { openQuick(el.dataset.quick); return; }
    if ((el = t.closest('[data-quick-add]'))) { quickAdd(el.dataset.quickAdd); if (Layers.isOpen($('#cartDrawer'))) renderCart(); return; }
    if ((el = t.closest('[data-add-look]'))) {
      el.dataset.addLook.split(',').forEach(id => Store.addToCart(id, { size: Store.product(id).sizes.includes('M') ? 'M' : null, length: 56 }));
      toast('أُضيفت الإطلالة كاملة إلى سلتكِ', { ic: 'bag' });
      openCart();
      return;
    }
    // cart lines
    if ((el = t.closest('[data-line-inc]'))) { const l = Store.cart.find(x => x.key === el.dataset.lineInc); if (l) Store.setQty(l.key, l.qty + 1); return; }
    if ((el = t.closest('[data-line-dec]'))) { const l = Store.cart.find(x => x.key === el.dataset.lineDec); if (l) Store.setQty(l.key, l.qty - 1); return; }
    if ((el = t.closest('[data-line-remove]'))) {
      const l = Store.cart.find(x => x.key === el.dataset.lineRemove);
      if (!l) return;
      const backup = { ...l };
      Store.removeLine(l.key);
      toast('حُذفت القطعة من السلة', { ic: 'trash', action: { label: 'تراجع', fn: () => Store.addToCart(backup.id, backup) } });
      return;
    }
    if (t.closest('[data-remove-coupon]')) { Store.removeCoupon(); return; }
    // product page options
    if (current.route === 'product' && pd.p) {
      if ((el = t.closest('[data-pd-color]'))) {
        pd.color = el.dataset.pdColor;
        $$('[data-pd-color]').forEach(b => b.classList.toggle('is-active', b === el));
        $('#pdColorName').textContent = pd.color;
        updatePdImages(); updateWaLink(); return;
      }
      if ((el = t.closest('[data-pd-size]'))) {
        pd.size = el.dataset.pdSize;
        $$('[data-pd-size]').forEach(b => b.classList.toggle('is-active', b === el));
        $('#sizeErr').textContent = ''; updateWaLink(); return;
      }
      if ((el = t.closest('[data-pd-length]'))) {
        pd.length = el.dataset.pdLength;
        $$('[data-pd-length]').forEach(b => b.classList.toggle('is-active', b === el));
        $('#lengthErr').textContent = ''; updateWaLink(); return;
      }
      if ((el = t.closest('[data-pd-qty]'))) {
        pd.qty = Math.max(1, Math.min(10, pd.qty + Number(el.dataset.pdQty)));
        $('#pdQty').textContent = pd.qty; updateWaLink(); return;
      }
      if ((el = t.closest('[data-pd-thumb]'))) { setPdImage(Number(el.dataset.pdThumb)); return; }
      if (t.closest('#pdAdd')) { pdAdd(); return; }
      if (t.closest('#pdShare')) {
        const url = location.href;
        if (navigator.share) navigator.share({ title: pd.p.name, url }).catch(() => { });
        else navigator.clipboard?.writeText(url).then(() => toast('تم نسخ رابط القطعة', { ic: 'share' }), () => toast(url, { ic: 'share' }));
        return;
      }
    }
    // quick view options
    if ((el = t.closest('[data-qv-color]'))) { qv.color = el.dataset.qvColor; drawQuick(); return; }
    if ((el = t.closest('[data-qv-size]'))) { qv.size = el.dataset.qvSize; drawQuick(); return; }
    if ((el = t.closest('[data-qv-length]'))) { qv.length = el.dataset.qvLength; drawQuick(); return; }
    // search
    if ((el = t.closest('[data-q]'))) { $('#searchInput').value = el.dataset.q; renderSearch(el.dataset.q); Store.pushSearch(el.dataset.q); return; }
    // tabs
    if ((el = t.closest('[data-tab]'))) { switchTab(el.closest('.modal-panel'), el.dataset.tab); return; }
    // account
    if ((el = t.closest('[data-auth]'))) { openAuth(el.dataset.auth); return; }
    if ((el = t.closest('[data-acct]'))) { history.replaceState(null, '', '#/account/' + el.dataset.acct); renderAccount(el.dataset.acct); return; }
    if (t.closest('[data-logout]')) { Store.logout(); toast('تم تسجيل الخروج. نراكِ قريبًا', { ic: 'logout' }); renderAccount(); return; }
    if ((el = t.closest('[data-remove-addr]'))) { Store.removeAddress(Number(el.dataset.removeAddr)); renderAccount('addresses'); return; }
    // checkout
    if ((el = t.closest('[data-use-addr]'))) {
      const a = Store.addresses[Number(el.dataset.useAddr)];
      coForm.governorate.value = a.governorate; coForm.city.value = a.city; coForm.address.value = a.address;
      drawCoSummary(); return;
    }
    if ((el = t.closest('[data-goto-step]'))) { co.step = Number(el.dataset.gotoStep); drawCheckoutStep(); return; }
  });

  /* ---------- Fixed controls ---------- */
  $('#menuBtn').addEventListener('click', () => { Layers.open($('#mobileMenu')); $('#menuBtn').setAttribute('aria-expanded', 'true'); });
  $('#searchBtn').addEventListener('click', openSearch);
  $('#cartBtn').addEventListener('click', openCart);
  $('#accountBtn').addEventListener('click', () => Store.user ? go('#/account') : openAuth());
  $('#checkoutBtn').addEventListener('click', openCheckout);
  $('#lbPrev').addEventListener('click', () => lightboxStep(-1));
  $('#lbNext').addEventListener('click', () => lightboxStep(1));
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') Layers.close($('#lightbox')); });

  let searchTimer;
  $('#searchInput').addEventListener('input', e => { clearTimeout(searchTimer); searchTimer = setTimeout(() => renderSearch(e.target.value), 140); });
  $('#searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      Store.pushSearch(e.target.value.trim());
      go('#/shop?q=' + encodeURIComponent(e.target.value.trim()));
    }
  });
  $('#searchAll').addEventListener('click', () => Store.pushSearch($('#searchInput').value));
  document.addEventListener('keydown', e => {
    if ((e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  $('#couponForm').addEventListener('submit', e => {
    e.preventDefault();
    const res = Store.applyCoupon($('#couponInput').value);
    if (!res.ok) { $('#couponMsg').className = 'coupon-msg bad'; $('#couponMsg').textContent = res.msg; return; }
    $('#couponInput').value = '';
    toast('تم تطبيق كود الخصم', { ic: 'gift' });
  });

  $('#calcForm').addEventListener('submit', e => {
    e.preventDefault();
    const h = Number(e.target.height.value), w = Number(e.target.weight.value);
    if (!(h >= 140 && h <= 195) || !(w >= 40 && w <= 140)) {
      $('#calcResult').innerHTML = '<p>أدخلي طولًا بين 140 و195 سم ووزنًا بين 40 و140 كجم.</p>';
      return;
    }
    const r = calcSize(h, w);
    const onProduct = current.route === 'product' && pd.p && isAbaya(pd.p);
    $('#calcResult').innerHTML = `
      <div><strong>${r.size}</strong><span>المقاس المقترح</span></div>
      <div><strong>${r.length}</strong><span>الطول المقترح (بوصة)</span></div>
      <p>لإطلالة أوسع اختاري مقاسًا أكبر. إن كنتِ ترتدين كعبًا عاليًا فأضيفي درجة للطول.
      ${onProduct ? `<br><button class="btn btn-gold sm" type="button" id="applyCalc" style="margin-top:12px"><span>اختاري ${r.size} · ${r.length} لهذه القطعة</span></button>` : ''}</p>`;
    const ap = $('#applyCalc');
    if (ap) ap.onclick = () => {
      const sb = $(`[data-pd-size="${r.size}"]:not([disabled])`);
      const lb2 = $(`[data-pd-length="${r.length}"]`);
      if (sb) sb.click(); else toast(`المقاس ${r.size} غير متوفر في هذه القطعة`, { ic: 'ruler' });
      if (lb2) lb2.click();
      Layers.close($('#sizeGuide'));
    };
  });

  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f, { name: R.name, phone: R.phone, message: v => v.trim().length >= 10 || 'اكتبي رسالتكِ (10 أحرف على الأقل)' })) return;
    f.reset();
    toast('وصلتنا رسالتكِ، سنرد عليكِ خلال ساعات', { ic: 'mail' });
  });

  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#newsEmail').value.trim();
    if (!EMAIL_RE.test(v)) { $('#newsErr').textContent = 'اكتبي بريدًا إلكترونيًا صحيحًا'; return; }
    $('#newsErr').textContent = '';
    e.target.reset();
    toast('أهلًا بكِ! كود خصمكِ: RAWAQ10', { ic: 'gift' });
  });

  /* ---------- Store events ---------- */
  Store.on(type => {
    updateBadges();
    if (type === 'cart') {
      if (Layers.isOpen($('#cartDrawer'))) renderCart();
      if (Layers.isOpen($('#checkout'))) drawCoSummary();
    }
  });

  /* =========================================================
     Boot
     ========================================================= */
  renderMega();
  updateBadges();
  Motion.init();
  onRoute(true);
  Motion.preloader();
})();
