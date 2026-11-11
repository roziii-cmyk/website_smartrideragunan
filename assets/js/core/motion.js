/* Smart Ragunan Ride - subtle scroll motion */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('main section, .card-hover, .card').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  const reveal = (scope = document) => {
    scope.querySelectorAll('main section:not(.hero-ragunan), .card-hover, main .card').forEach((el, index) => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      if (!el.classList.contains('is-visible')) {
        el.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
        observer.observe(el);
      }
    });
  };

  reveal();
  const gridObserver = new MutationObserver(() => reveal());
  document.querySelectorAll('#homeGrid, #bikeGrid, #testiGrid, #readings, #log').forEach(el => {
    gridObserver.observe(el, { childList: true, subtree: true });
  });
})();
