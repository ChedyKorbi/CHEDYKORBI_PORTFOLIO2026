/* Chedy Korbi — portfolio motion layer. No dependencies; Lenis is used when it loads. */
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -80 }); }
    }));
  }

  /* ---------- hero intro ---------- */
  const heroWords = $$('.hero h1 .w');
  const heroIn = $$('.hero [data-in]');
  requestAnimationFrame(() => {
    heroWords.forEach((w, i) => {
      w.style.transition = `opacity 1s var(--ease) ${0.15 + i * 0.09}s, transform 1.2s var(--ease) ${0.15 + i * 0.09}s, filter 1s var(--ease) ${0.15 + i * 0.09}s`;
      w.style.opacity = 1; w.style.transform = 'none'; w.style.filter = 'none';
    });
    heroIn.forEach((el, i) => {
      el.style.transition = `opacity .9s var(--ease) ${0.55 + i * 0.12}s, transform 1.1s var(--ease) ${0.55 + i * 0.12}s`;
      el.style.opacity = 1; el.style.transform = 'none';
    });
  });

  /* ---------- starfield ---------- */
  const cv = $('#stars');
  if (cv) {
    const ctx = cv.getContext('2d');
    let w, h, dpr, stars = [], mx = 0, my = 0, tx = 0, ty = 0, running = true;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 7000);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.9 + 0.1,
        r: Math.random() * 1.1 + 0.2, p: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.004
      }));
    };
    resize(); addEventListener('resize', resize);
    if (fine) addEventListener('mousemove', e => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); });
    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) draw(); }).observe(cv);
    function draw() {
      if (!running) return;
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) { s.p += s.s; s.y -= s.z * 0.06; if (s.y < -4) s.y = h + 4; }
        const a = 0.25 + Math.sin(s.p) * 0.35 + s.z * 0.4;
        const x = s.x - mx * 26 * s.z, y = s.y - my * 18 * s.z;
        ctx.globalAlpha = clamp(a, 0.05, 1);
        ctx.fillStyle = '#dbe9ff';
        ctx.beginPath(); ctx.arc(x, y, s.r * s.z + 0.15, 0, 6.283); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- the live thing: evidence ribbon ---------- */
  const ribbon = $('.ribbon');
  if (ribbon) {
    const tabs = $$('[role="tab"]', ribbon);
    const rays = $$('.ray');
    const out = { b: $('.ribbon-panel b', ribbon), s: $('.ribbon-panel span', ribbon), a: $('.ribbon-panel a', ribbon) };
    let cur = 0, timer = null;
    const pick = (i, focus) => {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === cur); t.tabIndex = k === cur ? 0 : -1; });
      const t = tabs[cur];
      out.b.textContent = t.dataset.value; out.s.textContent = t.dataset.note;
      out.a.href = t.dataset.href; out.a.querySelector('em').textContent = t.textContent.trim();
      rays.forEach((r, k) => r.classList.toggle('on', k === cur));
      if (focus) t.focus();
    };
    const play = () => { if (reduce) return; stop(); timer = setInterval(() => pick(cur + 1), 3600); };
    const stop = () => clearInterval(timer);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { pick(i); stop(); });
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick(cur + 1, true); stop(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick(cur - 1, true); stop(); }
      });
    });
    rays.forEach((r, i) => { r.addEventListener('mouseenter', () => { pick(i); stop(); }); });
    ribbon.addEventListener('mouseenter', stop);
    ribbon.addEventListener('mouseleave', play);
    pick(0); play();
  }

  /* ---------- navigation ---------- */
  const nav = $('.nav');
  let lastY = scrollY;
  const menuBtn = $('.nav-menu');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });
  $$('.nav ul a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menuBtn?.setAttribute('aria-expanded', 'false'); if (menuBtn) menuBtn.textContent = 'Menu';
  }));
  const navLinks = $$('.nav ul a[href^="#"]');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(l => l.setAttribute('aria-current', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(l => { const s = $(l.getAttribute('href')); if (s) secObs.observe(s); });

  /* ---------- entrances ---------- */
  const riseObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, sibs = el.parentElement ? $$(':scope > [data-rise]', el.parentElement) : [el];
    const i = Math.max(0, sibs.indexOf(el));
    const d = (parseFloat(el.dataset.rise) || 0) + i * 0.075;
    el.style.transition = `opacity 1s var(--ease) ${d}s, transform 1.2s var(--ease) ${d}s`;
    el.style.opacity = 1; el.style.transform = 'none';
    riseObs.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-rise]').forEach(el => riseObs.observe(el));

  /* counters + meters */
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, t = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
    if (reduce) { el.textContent = pre + t.toFixed(dec) + suf; countObs.unobserve(el); return; }
    const t0 = performance.now(), dur = 1600;
    const step = now => {
      const p = clamp((now - t0) / dur), v = (1 - Math.pow(1 - p, 4)) * t;
      el.textContent = pre + v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step); countObs.unobserve(el);
  }), { threshold: 0.4 });
  $$('[data-count]').forEach(el => countObs.observe(el));
  const meterObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { $$('.ui-meter i', e.target).forEach(i => i.style.setProperty('--p', 1)); meterObs.unobserve(e.target); }
  }), { threshold: 0.3 });
  $$('.ui').forEach(u => { if (!reduce) $$('.ui-meter i', u).forEach(i => i.style.setProperty('--p', 0)); meterObs.observe(u); });

  /* statement words */
  const statement = $('.statement');
  let words = [];
  if (statement) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.append(part);
            else { const s = document.createElement('span'); s.className = 'wd'; s.textContent = part; frag.append(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(statement);
    words = $$('.wd', statement);
    if (reduce) words.forEach(w => w.classList.add('lit'));
  }

  /* ---------- scroll-linked layer (one rAF loop) ---------- */
  const heroCopy = $('.hero-copy'), beams = $$('.beam'), heroEl = $('.hero');
  const cases = $$('.case');
  const posterLines = $$('.poster b');
  const footWord = $('.foot-word');
  let ticking = false;
  const tick = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      if (!nav.classList.contains('open')) nav.classList.toggle('hide', y > lastY + 4 && y > vh * 0.8);
      if (y < lastY - 4) nav.classList.remove('hide');
      lastY = y;
    }
    if (reduce) return;
    if (heroEl && y < vh * 1.2) {
      const p = clamp(y / vh);
      if (heroCopy) { heroCopy.style.transform = `translateY(${p * 90}px) scale(${1 - p * 0.07})`; heroCopy.style.opacity = 1 - p * 1.1; }
      beams.forEach((b, i) => b.style.translate = `${p * (i ? -60 : 80)}px ${p * 120}px`);
    }
    if (innerWidth > 860) cases.forEach((c, i) => {
      const next = cases[i + 1];
      const inner = c.firstElementChild;
      if (!next) { inner.style.transform = ''; inner.style.filter = ''; return; }
      const r = next.getBoundingClientRect();
      const p = clamp(1 - (r.top - 100) / (vh * 0.85));
      inner.style.transform = `scale(${1 - p * 0.06})`;
      inner.style.filter = `brightness(${1 - p * 0.45})`;
    });
    cases.forEach(c => {
      const img = c.querySelector('.case-media img');
      if (!img) return;
      const r = c.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height));
      img.style.translate = `0 ${(0.5 - p) * 40}px`;
    });
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
    posterLines.forEach(b => {
      const r = b.getBoundingClientRect();
      const p = clamp((vh * 0.9 - r.top) / (vh * 0.5));
      b.style.backgroundSize = `${p * 100}% 100%, 100% 100%`;
    });
    if (footWord) {
      const r = footWord.getBoundingClientRect();
      const p = clamp((vh - r.top) / r.height);
      footWord.style.transform = `scale(${0.9 + p * 0.1})`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  tick();

  /* ---------- pointer feedback ---------- */
  if (fine && !reduce) {
    $$('.case-in').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
    $$('.btn').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const peek = $('.peek'), peekImg = peek && $('img', peek);
    let px = 0, py = 0, qx = 0, qy = 0, peekOn = false;
    $$('.index a[data-img]').forEach(a => {
      a.addEventListener('pointerenter', () => { peekImg.src = a.dataset.img; peek.classList.add('on'); peekOn = true; follow(); });
      a.addEventListener('pointerleave', () => { peek.classList.remove('on'); peekOn = false; });
    });
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
    function follow() {
      qx += (px - qx) * 0.16; qy += (py - qy) * 0.16;
      peek.style.left = qx + 'px'; peek.style.top = qy + 'px';
      if (peekOn || peek.classList.contains('on')) requestAnimationFrame(follow);
    }
  }

  /* year */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
