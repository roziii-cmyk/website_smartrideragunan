/* Smart Ragunan Ride - slideshow/reveal saat scroll.
   Elemen masuk dari bawah dengan fade dan stagger ringan ketika terlihat. */
(() => {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectors = [
    'main section', 'main .card', '.card-hover', '.feature-card',
    '.hero-copy', '.hero-visual', '.step-no', '#homeGrid > *',
    '#bikeGrid > *', '#testiGrid > *'
  ].join(',');

  const reveal = (scope = document) => {
    const elements = scope.querySelectorAll(selectors);
    elements.forEach((el, index) => {
      if (el.id === 'fleetMap' || el.closest('#rsrMusic')) return;
      if (reduced) {
        el.classList.add('is-visible');
        return;
      }
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '');
        el.style.transitionDelay = `${Math.min(index % 5, 4) * 75}ms`;
      }
      if (!observer || !('IntersectionObserver' in window)) {
        el.classList.add('is-visible');
      } else if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  };

  let observer = null;
  if (!reduced && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  }

  // Pastikan konten awal tetap terlihat jika skrip berjalan terlambat.
  reveal();
  const watched = document.querySelectorAll('#homeGrid, #bikeGrid, #testiGrid, #readings, #log, #activeRentals');
  if ('MutationObserver' in window) {
    const mutations = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches(selectors)) reveal(node.parentElement || document);
          else reveal(node);
        }
      }));
    });
    watched.forEach(el => mutations.observe(el, { childList: true, subtree: true }));
  }
})();
