/* ============================================================
   Operations console — SIMULATED preview.
   Every number, label and event on this page is fabricated demo
   data. Nothing here reflects a live system, account, cost,
   model, endpoint or address. It exists to convey the *shape*
   of the console, not its contents.

   House rules honored here:
   - DOM built with createElement / textContent only (no innerHTML).
   - prefers-reduced-motion: reduce  -> no timers, one static frame.
   - document.hidden -> all timers paused (battery courtesy).
   ============================================================ */
(function () {
  var root = document.getElementById('ops-live');
  if (!root) return; // no-JS static fallback stays in place

  var rmQuery = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduceMotion() { return !!(rmQuery && rmQuery.matches); }

  // ---- tiny DOM helpers ----
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // ---- seeded deterministic RNG (mulberry32) so the demo is stable ----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mulberry32(20260611);

  // ---- timer registry, paused when the tab is hidden ----
  var intervals = [];
  function every(ms, fn) {
    if (reduceMotion()) return; // static: never schedule
    var id = null;
    function start() { if (id == null && !document.hidden && !reduceMotion()) id = setInterval(fn, ms); }
    function stop() { if (id != null) { clearInterval(id); id = null; } }
    intervals.push({ start: start, stop: stop });
    start();
  }
  document.addEventListener('visibilitychange', function () {
    intervals.forEach(function (t) { document.hidden ? t.stop() : t.start(); });
  });

  // =========================================================
  //  Panel scaffold builder
  // =========================================================
  function panel(accent, label) {
    var p = el('div', 'ops-panel');
    if (accent) p.setAttribute('data-ac', accent);
    if (label) {
      var head = el('div', 'ops-panel-head');
      head.appendChild(el('span', 'eyebrow ops-panel-label', label));
      p.appendChild(head);
    }
    return p;
  }

  // =========================================================
  //  1) Status strip
  // =========================================================
  (function statusStrip() {
    var strip = el('div', 'ops-strip');
    var tiles = [
      { ac: 'violet',  k: 'Agents',  v: '14' },
      { ac: 'sky',     k: 'Channels', v: '4' },
      { ac: 'emerald', k: 'Gateway', v: 'healthy', dot: true },
      { ac: 'sky',     k: 'Uptime',  v: '36d' }
    ];
    tiles.forEach(function (t) {
      var tile = el('div', 'ops-tile');
      tile.setAttribute('data-ac', t.ac);
      var top = el('div', 'ops-tile-top');
      top.appendChild(el('span', 'ops-dot' + (t.dot ? ' ops-dot-live' : '')));
      top.appendChild(el('span', 'ops-tile-key', t.k));
      var val = el('div', 'ops-tile-val', t.v);
      tile.appendChild(top);
      tile.appendChild(val);
      strip.appendChild(tile);
    });
    root.appendChild(strip);
  })();

  // =========================================================
  //  Two-column body: Local Brain (left, wide) + side rail
  // =========================================================
  var body = el('div', 'ops-body');
  root.appendChild(body);

  // ---------------------------------------------------------
  //  2) Local Brain panel — the centerpiece
  // ---------------------------------------------------------
  (function localBrain() {
    var p = panel('emerald', null);
    p.classList.add('ops-brain');

    // header: pulsing orb + title
    var head = el('div', 'ops-brain-head');
    var orb = el('span', 'ops-orb');
    orb.appendChild(el('span', 'ops-orb-core'));
    head.appendChild(orb);
    var titles = el('div');
    titles.appendChild(el('div', 'ops-brain-title', 'Local Brain'));
    titles.appendChild(el('div', 'ops-brain-sub', 'on the host · on-device'));
    head.appendChild(titles);
    var liveTag = el('span', 'ops-tag', 'live');
    head.appendChild(liveTag);
    p.appendChild(head);

    p.appendChild(el('div', 'ops-chart-cap', 'On-device inference activity'));

    // --- streaming area chart (SVG) ---
    var W = 600, H = 150;
    var wrap = el('div', 'ops-chart-wrap');
    var s = svg('svg', {
      'class': 'ops-chart', viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'none', role: 'img',
      'aria-label': 'Simulated on-device inference activity'
    });
    var defs = svg('defs');
    var grad = svg('linearGradient', { id: 'ops-fill', x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svg('stop', { offset: '0', 'stop-color': '#46c89a', 'stop-opacity': '0.42' }));
    grad.appendChild(svg('stop', { offset: '1', 'stop-color': '#46c89a', 'stop-opacity': '0' }));
    defs.appendChild(grad);
    s.appendChild(defs);
    var area = svg('path', { fill: 'url(#ops-fill)', stroke: 'none' });
    var line = svg('path', {
      fill: 'none', stroke: '#46c89a', 'stroke-width': '2',
      'stroke-linejoin': 'round', 'stroke-linecap': 'round',
      'vector-effect': 'non-scaling-stroke'
    });
    s.appendChild(area);
    s.appendChild(line);
    wrap.appendChild(s);
    p.appendChild(wrap);

    // seeded smooth random walk
    var N = 48, vals = [], v = 0.5;
    for (var i = 0; i < N; i++) {
      v += (rng() - 0.5) * 0.16;
      v = Math.max(0.12, Math.min(0.92, v));
      vals.push(v);
    }
    function draw() {
      var step = W / (N - 1), lp = '', ap = '';
      for (var i = 0; i < N; i++) {
        var x = (i * step).toFixed(1);
        var y = (H - vals[i] * (H - 14) - 7).toFixed(1);
        lp += (i ? 'L' : 'M') + x + ' ' + y + ' ';
        ap += (i ? 'L' : 'M') + x + ' ' + y + ' ';
      }
      ap += 'L' + W + ' ' + H + ' L0 ' + H + ' Z';
      line.setAttribute('d', lp.trim());
      area.setAttribute('d', ap);
    }
    draw();
    every(800, function () {
      v += (rng() - 0.5) * 0.16;
      v = Math.max(0.12, Math.min(0.92, v));
      vals.push(v); vals.shift();
      draw();
      pulse(); // nudge the orb roughly in sync
    });

    // orb pulse driver (CSS-class toggle so reduced-motion just no-ops)
    function pulse() {
      orb.classList.remove('ops-orb-beat');
      // force reflow so the animation restarts
      void orb.offsetWidth;
      orb.classList.add('ops-orb-beat');
    }

    // --- mono counters that drift upward ---
    var counters = el('div', 'ops-counters');
    var defsC = [
      { label: 'embeddings indexed', v: 48213, step: [3, 11] },
      { label: 'signals scored today', v: 1947, step: [1, 4] },
      { label: 'recall lookups', v: 612, step: [0, 2] }
    ];
    defsC.forEach(function (c) {
      var cell = el('div', 'ops-counter');
      var num = el('div', 'ops-counter-num', c.v.toLocaleString('en-US'));
      cell.appendChild(num);
      cell.appendChild(el('div', 'ops-counter-lab', c.label));
      counters.appendChild(cell);
      every(800, function () {
        c.v += c.step[0] + Math.floor(rng() * (c.step[1] - c.step[0] + 1));
        num.textContent = c.v.toLocaleString('en-US');
      });
    });
    p.appendChild(counters);

    body.appendChild(p);
  })();

  // ---------------------------------------------------------
  //  Side rail: activity feed + approvals lane
  // ---------------------------------------------------------
  var rail = el('div', 'ops-rail');
  body.appendChild(rail);

  // ---------------------------------------------------------
  //  3) Activity feed — rotating, deterministic
  // ---------------------------------------------------------
  (function activityFeed() {
    var p = panel('sky', 'Activity');
    var list = el('div', 'ops-feed');
    p.appendChild(list);
    rail.appendChild(p);

    var ACCENT = {
      Atlas: 'violet', Aurora: 'sky', Scout: 'sky', Envoy: 'sky',
      Steward: 'sky', Pulse: 'sky', Horizon: 'sky', Concierge: 'emerald',
      Sentinel: 'sky', Relay: 'sky'
    };
    // canned pool — generic actions, public names only, no specifics
    var POOL = [
      ['Aurora', 'assembled the morning brief'],
      ['Scout', 'filed 3 messages'],
      ['Sentinel', 'approved a routine action'],
      ['Atlas', 'answered a question'],
      ['Pulse', 'logged a health entry'],
      ['Horizon', 'read the day’s schedule'],
      ['Concierge', 'planned a short route'],
      ['Steward', 'drafted a fix plan'],
      ['Envoy', 'queued an outbound reply'],
      ['Relay', 'routed a request'],
      ['Atlas', 'recalled prior context'],
      ['Scout', 'sorted the inbox']
    ];
    var pi = 0;
    var ages = [2, 4, 7, 11, 16, 23, 31, 44]; // "Nm ago" buckets
    function rel(i) { return ages[Math.min(i, ages.length - 1)] + 'm ago'; }

    function makeRow(item, ageIdx, fresh) {
      var row = el('div', 'ops-feed-row' + (fresh ? ' ops-feed-enter' : ''));
      row.setAttribute('data-ac', ACCENT[item[0]] || 'slate');
      row.appendChild(el('span', 'ops-feed-dot'));
      var body = el('div', 'ops-feed-body');
      var line = el('div', 'ops-feed-line');
      line.appendChild(el('span', 'ops-feed-agent', item[0]));
      line.appendChild(el('span', 'ops-feed-act', ' ' + item[1]));
      body.appendChild(line);
      body.appendChild(el('div', 'ops-feed-time', rel(ageIdx)));
      row.appendChild(body);
      return row;
    }

    // seed 7 rows
    var rows = [];
    for (var i = 0; i < 7; i++) {
      var it = POOL[pi % POOL.length]; pi++;
      var r = makeRow(it, i, false);
      rows.push(r); list.appendChild(r);
    }

    every(5000, function () {
      // drop oldest (last), insert new at top
      var last = rows.pop();
      if (last) list.removeChild(last);
      var it = POOL[pi % POOL.length]; pi++;
      var r = makeRow(it, 0, true);
      list.insertBefore(r, list.firstChild);
      rows.unshift(r);
      // re-stamp ages so timestamps drift older down the list
      rows.forEach(function (row, idx) {
        var t = row.querySelector('.ops-feed-time');
        if (t) t.textContent = rel(idx);
      });
    });
  })();

  // ---------------------------------------------------------
  //  4) Approvals lane
  // ---------------------------------------------------------
  (function approvals() {
    var p = panel('amber', 'Approvals');
    var lane = el('div', 'ops-appr');
    var row = el('div', 'ops-appr-row');
    row.appendChild(el('span', 'ops-dot ops-dot-amber'));
    var t = el('div');
    t.appendChild(el('div', 'ops-appr-main', '1 action awaiting approval'));
    t.appendChild(el('div', 'ops-appr-sub', 'sensitive tier'));
    row.appendChild(t);
    lane.appendChild(row);
    lane.appendChild(el('div', 'ops-appr-foot', 'auto-approved today: 23 routine'));
    p.appendChild(lane);
    rail.appendChild(p);
  })();
})();
