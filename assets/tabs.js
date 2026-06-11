(function () {
  var tabs = document.querySelectorAll('#mc-tabs [data-tab]');
  if (!tabs.length) return;
  var views = { overview: 'view-overview', fleet: 'fleet', topology: 'topology',
                ops: 'ops', security: 'security', roadmap: 'roadmap' };
  // Display order for the bottom "next tab" navigation (wraps).
  var order = ['overview', 'fleet', 'topology', 'ops', 'security', 'roadmap'];
  var LABELS = { overview: 'Overview', fleet: 'The Fleet', topology: 'Architecture',
                 ops: 'Operations', security: 'Security', roadmap: 'Roadmap' };
  // Old in-page anchors map onto the new tabs (deep-link compatibility).
  var aliases = { top: 'overview', glance: 'overview' };
  function resolve(key) {
    key = aliases[key] || key;
    return views[key] ? key : 'overview';
  }
  function go(key) {
    history.replaceState(null, '', '#' + key);
    show(key);
    window.scrollTo({ top: 0 });
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

  // ---- bottom "next tab" footer nav, generated per view ----
  function buildFooterNav(key) {
    var i = order.indexOf(key);
    var nextKey = order[(i + 1 + order.length) % order.length];

    var nav = document.createElement('nav');
    nav.className = 'mc-footnav';
    nav.setAttribute('aria-label', 'Continue to another section');

    var quiet = document.createElement('div');
    quiet.className = 'mc-footnav-quiet';
    order.forEach(function (k) {
      if (k === key || k === nextKey) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mc-foot-pill';
      b.dataset.tab = k;
      b.textContent = LABELS[k];
      b.addEventListener('click', function () { go(k); });
      quiet.appendChild(b);
    });

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'mc-foot-next';
    next.dataset.tab = nextKey;
    var lab = document.createElement('span');
    lab.className = 'mc-foot-next-lab';
    lab.textContent = 'Next';
    var name = document.createElement('span');
    name.className = 'mc-foot-next-name';
    name.textContent = LABELS[nextKey];
    var arrow = document.createElement('span');
    arrow.className = 'mc-foot-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    next.appendChild(lab);
    next.appendChild(name);
    next.appendChild(arrow);
    next.addEventListener('click', function () { go(nextKey); });

    nav.appendChild(quiet);
    nav.appendChild(next);
    return nav;
  }

  order.forEach(function (key) {
    var container = document.getElementById(views[key]);
    if (container) container.appendChild(buildFooterNav(key));
  });

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { go(b.dataset.tab); });
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
