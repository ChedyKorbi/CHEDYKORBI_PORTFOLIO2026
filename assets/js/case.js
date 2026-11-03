/* Case-study pages: reveals and gallery lightbox. */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal,.g').forEach(el => io.observe(el));
  const items = [...document.querySelectorAll('.gallery > .g')];
  const srcs = items.map(i => i.querySelector('img')?.src);
  const lb = document.getElementById('lightbox');
  if (!lb || !items.length) return;
  const img = lb.querySelector('img');
  let k = 0;
  const open = i => { k = i; img.src = srcs[k]; img.alt = items[k].querySelector('img').alt; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); items[k].focus(); };
  const move = d => { k = (k + d + srcs.length) % srcs.length; img.src = srcs[k]; };
  items.forEach((it, i) => { it.tabIndex = 0; it.addEventListener('click', () => open(i)); it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } }); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => move(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => move(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); });
})();
