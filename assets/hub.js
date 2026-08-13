/* Reveal choreography: one staggered load-time reveal (document order), nothing
   scroll-dependent — crawlers, screenshots, and print always see full content.
   Loaded blocking in <head> so the .js class lands before first paint.
   Content is fully visible without JS. */
(function () {
  document.documentElement.classList.add('js');

  function reveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    els.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 560) + 'ms';
      el.classList.add('in');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
  }
})();
