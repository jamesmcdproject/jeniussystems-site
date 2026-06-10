(function () {
  var tabs = document.querySelectorAll('#mc-tabs [data-tab]');
  if (!tabs.length) return;
  var views = { overview: 'view-overview', fleet: 'fleet', topology: 'topology',
                security: 'security', roadmap: 'roadmap' };
  // Old in-page anchors map onto the new tabs (deep-link compatibility).
  var aliases = { top: 'overview', glance: 'overview' };
  function resolve(key) {
    key = aliases[key] || key;
    return views[key] ? key : 'overview';
  }
  function show(key) {
    Object.keys(views).forEach(function (k) {
      var el = document.getElementById(views[k]);
      if (el) el.style.display = (k === key) ? '' : 'none';
    });
    tabs.forEach(function (b) {
      b.setAttribute('aria-current', b.dataset.tab === key ? 'page' : 'false');
    });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      history.replaceState(null, '', '#' + b.dataset.tab);
      show(b.dataset.tab);
      window.scrollTo({ top: 0 });
    });
  });
  // In-page anchor links (top nav, mobile menu) should switch tabs too.
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    var key = resolve(a.getAttribute('href').slice(1));
    if (!views[key]) return;
    show(key);
    history.replaceState(null, '', '#' + key);
    window.scrollTo({ top: 0 });
  });
  window.addEventListener('hashchange', function () {
    show(resolve((location.hash || '#overview').slice(1)));
  });
  show(resolve((location.hash || '#overview').slice(1)));
})();
