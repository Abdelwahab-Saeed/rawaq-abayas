/* =========================================================
   شَهد — الحركة (Preloader, Lenis, GSAP, Cursor)
   كل شيء هنا اختياري: الموقع يعمل بالكامل لو فشل تحميل
   المكتبات أو لو المستخدم مفعّل "تقليل الحركة".
   ========================================================= */

const Motion = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = () => !!(window.gsap && window.ScrollTrigger);
  let lenis = null;
  let ctx = null;

  /* ---------- Smooth scroll ---------- */
  function initLenis() {
    if (reduced || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGsap()) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Preloader (مرة واحدة لكل جلسة) ---------- */
  function preloader() {
    const el = document.getElementById('preloader');
    const done = () => {
      document.body.classList.remove('is-loading');
      document.dispatchEvent(new CustomEvent('shahd:ready'));
    };
    if (!el) { done(); return Promise.resolve(); }
    const seen = Storage.session('seenIntro');
    if (reduced || seen) {
      el.classList.add('is-gone');
      done();
      return Promise.resolve();
    }
    Storage.session('seenIntro', '1');
    return new Promise(resolve => {
      const counter = document.getElementById('preloaderCount');
      const start = performance.now();
      const duration = 1700;
      const tick = now => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = Math.round(eased * 100);
        if (p < 1) requestAnimationFrame(tick);
        else {
          el.classList.add('is-done');
          setTimeout(() => { done(); resolve(); }, 900);
          setTimeout(() => el.classList.add('is-gone'), 1700);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- انتقال الصفحات ---------- */
  function curtain(swap) {
    const c = document.getElementById('routeCurtain');
    if (reduced || !c) { swap(); return; }
    c.classList.remove('is-out');
    void c.offsetWidth;
    c.classList.add('is-in');
    setTimeout(() => {
      swap();
      c.classList.remove('is-in');
      c.classList.add('is-out');
      setTimeout(() => c.classList.remove('is-out'), 650);
    }, 560);
  }

  function scrollTop() {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }
  function scrollTo(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function lock() { if (lenis) lenis.stop(); }
  function unlock() { if (lenis) lenis.start(); }

  /* ---------- مؤثرات خاصة بكل صفحة ---------- */
  let mm = null;
  function onRoute(view) {
    const sig = view.querySelector('#signature');
    if (ctx) { ctx.revert(); ctx = null; }
    if (mm) { mm.revert(); mm = null; }
    let deferred = null;
    if (reduced || !hasGsap()) {
      if (sig) sig.classList.add('no-pin');
      return;
    }
    ctx = gsap.context(() => {
      // Parallax
      view.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const target = el.querySelector('img') || el;
        gsap.fromTo(target, { yPercent: -speed * 60 }, {
          yPercent: speed * 60, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      // Pinned horizontal scroll for the signature edit (desktop only)
      if (sig) {
        mm = gsap.matchMedia();
        mm.add('(min-width: 1025px)', () => {
          sig.classList.remove('no-pin');
          const track = sig.querySelector('.signature-track');
          const distance = () => Math.max(0, track.scrollWidth - track.clientWidth + 40);
          gsap.to(track, {
            x: () => distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: sig, start: 'top top', end: () => '+=' + distance(),
              pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1
            }
          });
          return () => sig.classList.add('no-pin');
        });
        mm.add('(max-width: 1024px)', () => { sig.classList.add('no-pin'); });
      }

      // Hero intro: arches rise in
      const hero = view.querySelector('.hero');
      if (hero) {
        const intro = () => {
          gsap.from(hero.querySelector('.arch-main'), { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.out', delay: .15 });
          gsap.from(hero.querySelector('.arch-small'), { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .6 });
          gsap.fromTo(hero.querySelector('.spin-badge'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.6)', delay: .9 });
        };
        if (document.body.classList.contains('is-loading')) deferred = intro;
        else intro();
        gsap.to(hero.querySelector('.hero-bg-word'), { xPercent: -12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to(hero.querySelector('.hero-visual'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }

      // Footer giant word
      const giant = document.querySelector('.footer-giant');
      if (giant) gsap.from(giant, { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    }, view);

    if (deferred) {
      const c = ctx, fn = deferred;
      document.addEventListener('shahd:ready', () => { if (c === ctx) c.add(fn); }, { once: true });
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function refresh() { if (hasGsap()) ScrollTrigger.refresh(); }

  /* ---------- مؤشر الماوس المخصص + الأزرار المغناطيسية ---------- */
  function initCursor() {
    if (!finePointer || reduced) return;
    const cur = document.getElementById('cursor');
    const label = cur.querySelector('.cursor-label');
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const view = e.target.closest('[data-cursor="view"]');
      const link = e.target.closest('a, button, select, input, label, summary');
      cur.classList.toggle('is-view', !!view);
      cur.classList.toggle('is-link', !view && !!link);
      label.textContent = view ? 'عرض' : '';
    });

    document.addEventListener('mousemove', e => {
      const m = e.target.closest('.magnetic');
      document.querySelectorAll('.magnetic.is-pull').forEach(el => {
        if (el !== m) { el.classList.remove('is-pull'); el.style.transform = ''; }
      });
      if (!m) return;
      const r = m.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      m.classList.add('is-pull');
      m.style.transform = `translate(${dx}px, ${dy}px)`;
    }, { passive: true });
  }

  function init() {
    initLenis();
    initCursor();
    window.addEventListener('load', refresh);
  }

  return { init, preloader, curtain, scrollTop, scrollTo, lock, unlock, onRoute, refresh, reduced, get lenis() { return lenis; } };
})();
