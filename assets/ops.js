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
  //  Stacked body: Local Brain (full-width centerpiece) then a
  //  rail row (activity feed + approvals) underneath.
  // =========================================================
  var body = el('div', 'ops-body');
  root.appendChild(body);

  // ---------------------------------------------------------
  //  2) Local Brain panel — the constellation centerpiece.
  //     Ported (visual technique) from the internal console;
  //     EVERY data string here is fabricated, no internals.
  // ---------------------------------------------------------
  (function localBrain() {
    var stage = el('div', 'lb-stage');
    var canvas = el('canvas', null);
    canvas.id = 'lb-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label',
      'Simulated on-device memory constellation — illustrative');
    stage.appendChild(canvas);

    // corner brackets
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) {
      stage.appendChild(el('span', 'lb-brk ' + c));
    });

    var hud = el('div', 'lb-hud');

    // --- top-left: status label + subtitle ---
    var tl = el('div', 'lb-tl');
    var lab = el('div', 'lb-label');
    lab.appendChild(el('span', 'lb-dot'));
    lab.appendChild(el('span', null, 'LOCAL BRAIN · ALIVE'));
    tl.appendChild(lab);
    tl.appendChild(el('div', 'lb-sub',
      'on-device model · embeddings · memory index · healthy'));
    hud.appendChild(tl);

    // --- top-right eyebrow ---
    var eyebrow = el('div', 'lb-eyebrow', 'on-device · private · always-on');
    hud.appendChild(eyebrow);

    // --- metric rail (right) ---
    var pnl = el('div', 'lb-panel');
    // each metric: optional gauge bar. value rendered via textContent + small unit
    function metric(key, big, unit, gaugePct) {
      var m = el('div', 'lb-m');
      m.appendChild(el('span', 'lb-k', key));
      var v = el('span', 'lb-v');
      v.appendChild(document.createTextNode(big));
      if (unit) v.appendChild(el('small', null, ' ' + unit));
      m.appendChild(v);
      pnl.appendChild(m);
      if (gaugePct != null) {
        var bar = el('div', 'lb-bar');
        var fill = el('i', null);
        fill.style.width = gaugePct + '%';
        bar.appendChild(fill);
        pnl.appendChild(bar);
        return { num: v.firstChild, fill: fill };
      }
      return { num: v.firstChild };
    }
    var mMem = metric('Memory', '72%', '', 72);
    var mLoad = metric('Load', '2.4', '', 24);
    var mTok = metric('Throughput', '78', 'tok/s', null);
    metric('Models', '2', 'resident', null);
    var mMemories = metric('Memories', '12,408', 'stored', null);
    hud.appendChild(pnl);

    // --- legend (bottom-left) ---
    var leg = el('div', 'lb-legend');
    [['#65d19e', 'fact'], ['#70aae0', 'preference'],
     ['#a880de', 'curiosity'], ['#e6c86e', 'session']].forEach(function (r) {
      var row = el('div', 'lb-row');
      var sw = el('span', 'lb-sw');
      sw.style.background = r[0];
      sw.style.boxShadow = '0 0 8px ' + r[0];
      row.appendChild(sw);
      row.appendChild(document.createTextNode(r[1]));
      leg.appendChild(row);
    });
    hud.appendChild(leg);

    // --- live feed (bottom) ---
    var feed = el('div', 'lb-feed');
    feed.appendChild(el('div', 'lb-fh', 'live feed'));
    var lines = el('div', 'lb-lines');
    feed.appendChild(lines);
    hud.appendChild(feed);

    stage.appendChild(hud);
    body.appendChild(stage);

    // =====================================================
    //  Canvas: rotating 3D-projected memory sphere + stars.
    //  Technique ported from the internal console; dark-only.
    // =====================================================
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    function fit() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * DPR); canvas.height = Math.max(1, H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildStars(); buildField();
      // when not running an animation loop (static / reduced-motion), a resize
      // must repaint the single frame itself — nothing else will.
      if (!running && W > 0 && H > 0) render();
    }

    // 4 legend-category colours, in order: fact / preference / curiosity / session
    var KCOL = [[101, 209, 158], [112, 170, 224], [168, 128, 222], [230, 200, 110]];
    function rgba(i, a) { var c = KCOL[i]; return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

    var N = 64, nodes = [];
    for (var ni = 0; ni < N; ni++) {
      var y = 1 - (ni / (N - 1)) * 2, rr = Math.sqrt(Math.max(0, 1 - y * y)), th = ni * 2.399963;
      var kind = ni % 7 === 0 ? 3 : ni % 3 === 0 ? 2 : ni % 2 === 0 ? 1 : 0;
      nodes.push({ x: Math.cos(th) * rr, y: y, z: Math.sin(th) * rr, kind: kind, flare: 0, pulse: Math.cos(ni * 1.7) * 0.5 });
    }
    var edges = [];
    for (var ei = 0; ei < N; ei++) {
      var d = [];
      for (var ej = 0; ej < N; ej++) if (ei !== ej) {
        var dx = nodes[ei].x - nodes[ej].x, dy = nodes[ei].y - nodes[ej].y, dz = nodes[ei].z - nodes[ej].z;
        d.push([dx * dx + dy * dy + dz * dz, ej]);
      }
      d.sort(function (a, b) { return a[0] - b[0]; });
      for (var k = 0; k < 2; k++) edges.push([ei, d[k][1]]);
    }

    var _s = 1; function srnd() { _s = Math.sin(_s * 43758.5453 + 12.9898) * 0.5 + 0.5; return _s; }
    var stars = [];
    function buildStars() {
      _s = 7.1; stars = [];
      var n = Math.round(W * H / 3200);
      for (var i = 0; i < n; i++) {
        var x = srnd(), yy = srnd(), m = srnd(), sz = srnd(), hue = srnd();
        var band = Math.exp(-Math.pow((yy - (0.25 + x * 0.45)), 2) / 0.018);
        if (m < band * 0.8 || m < 0.62) {
          stars.push({ x: x * W, y: yy * H, r: 0.35 + sz * 1.9, z: 0.3 + sz * 0.7, tw: m * 6.28, band: band,
            tint: hue < 0.18 ? [170, 150, 230] : hue > 0.85 ? [150, 200, 210] : [180, 200, 230] });
        }
      }
    }
    var field = [];
    function buildField() {
      _s = 3.7; field = [];
      var n = Math.min(80, Math.round(W * H / 14000));
      for (var i = 0; i < n; i++) field.push({ x: srnd() * W, y: srnd() * H, vx: (srnd() - 0.5) * 0.12, vy: (srnd() - 0.5) * 0.12, r: 0.6 + srnd() * 1.3 });
    }
    var LINK = 130;
    var shoot = null, shootT = 0, ang = 0, tilt = 0.38, t = 0, running = false, raf = null;

    function firePulse() {
      var i = (t * 7) % N | 0; nodes[i].flare = 1;
      edges.forEach(function (e) {
        if (e[0] === i || e[1] === i) { var o = e[0] === i ? e[1] : e[0]; nodes[o].flare = Math.max(nodes[o].flare, 0.55); }
      });
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      var lineC = '120,180,210';
      // nebula
      var neb = [[0.28, 0.30, '130,90,210'], [0.74, 0.20, '60,170,185'], [0.58, 0.66, '90,120,225'], [0.40, 0.84, '150,90,180']];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var q = 0; q < neb.length; q++) {
        var nb = neb[q], nx = nb[0] * W + Math.sin(t * 0.0016 + nb[0] * 9) * 36, ny = nb[1] * H + Math.cos(t * 0.0013 + nb[1] * 7) * 26;
        var rad = Math.min(W, H) * 0.55, g = ctx.createRadialGradient(nx, ny, 0, nx, ny, rad);
        g.addColorStop(0, 'rgba(' + nb[2] + ',0.12)'); g.addColorStop(0.6, 'rgba(' + nb[2] + ',0.04)'); g.addColorStop(1, 'rgba(' + nb[2] + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, rad, 0, 7); ctx.fill();
      }
      ctx.restore();
      // milky band
      ctx.save(); ctx.translate(W * 0.46, H * 0.40); ctx.rotate(0.50);
      var bw = ctx.createLinearGradient(0, -H * 0.22, 0, H * 0.22);
      bw.addColorStop(0, 'rgba(150,175,215,0)'); bw.addColorStop(0.5, 'rgba(150,175,215,0.07)'); bw.addColorStop(1, 'rgba(150,175,215,0)');
      ctx.fillStyle = bw; ctx.fillRect(-W, -H * 0.22, W * 2, H * 0.44); ctx.restore();
      // stars
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var si = 0; si < stars.length; si++) {
        var s = stars[si], tw = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.012 * s.z + s.tw));
        var a = 0.20 + tw * 0.42 * s.z + s.band * 0.28, c = s.tint;
        if (s.r > 1.5) {
          var gr = s.r * 4, g2 = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gr);
          g2.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.5) + ')'); g2.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
          ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(s.x, s.y, gr, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.min(1, a) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      ctx.restore();
      // drifting field links
      for (var fi = 0; fi < field.length; fi++) { var p = field[fi]; p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H; }
      for (var i2 = 0; i2 < field.length; i2++) for (var j2 = i2 + 1; j2 < field.length; j2++) {
        var fa = field[i2], fb = field[j2], fdx = fa.x - fb.x, fdy = fa.y - fb.y, fd = Math.hypot(fdx, fdy);
        if (fd < LINK) { var al = (1 - fd / LINK) * 0.26; ctx.strokeStyle = 'rgba(' + lineC + ',' + al + ')'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(fa.x, fa.y); ctx.lineTo(fb.x, fb.y); ctx.stroke(); }
      }
      for (var fk = 0; fk < field.length; fk++) { var fp = field[fk]; ctx.fillStyle = 'rgba(' + lineC + ',0.5)'; ctx.beginPath(); ctx.arc(fp.x, fp.y, fp.r, 0, 7); ctx.fill(); }
      // shooting star
      if (!shoot && t - shootT > 260) { shoot = { x: W * 0.1 + srnd() * W * 0.5, y: H * 0.1 + srnd() * H * 0.2, life: 1 }; shootT = t; }
      if (shoot) {
        var sx = shoot.x + (1 - shoot.life) * 260, sy = shoot.y + (1 - shoot.life) * 120, sg = ctx.createLinearGradient(sx - 70, sy - 32, sx, sy);
        sg.addColorStop(0, 'rgba(190,205,230,0)'); sg.addColorStop(1, 'rgba(190,205,230,' + (shoot.life * 0.7) + ')');
        ctx.strokeStyle = sg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx - 70, sy - 32); ctx.lineTo(sx, sy); ctx.stroke(); shoot.life -= 0.025; if (shoot.life <= 0) shoot = null;
      }
      // sphere
      var cx = W / 2, cy = H * 0.40, R = Math.min(W, H) * 0.40;
      var cI = 0.34, core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
      core.addColorStop(0, 'rgba(90,160,180,' + cI + ')'); core.addColorStop(0.55, 'rgba(80,120,160,' + (cI * 0.45) + ')'); core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, 7); ctx.fill();
      var bodyG = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      bodyG.addColorStop(0, 'rgba(120,160,185,0.10)'); bodyG.addColorStop(0.7, 'rgba(30,45,65,0.05)'); bodyG.addColorStop(1, 'rgba(10,20,35,0.18)');
      ctx.fillStyle = bodyG; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(170,205,230,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();

      var ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
      function proj(x, y, z) { var X = x * ca - z * sa, Z = x * sa + z * ca, Y = y; var Y2 = Y * ct - Z * st, Z2 = Y * st + Z * ct, pp = 1 / (1.9 - Z2 * 0.62); return { sx: cx + X * R * pp, sy: cy + Y2 * R * pp, depth: (Z2 + 1) / 2 }; }
      // orbital ring
      ctx.beginPath(); var first = true;
      for (var oa = 0; oa <= 6.3; oa += 0.12) { var pt = proj(Math.cos(oa) * 1.28, 0, Math.sin(oa) * 1.28), oal = 0.05 + pt.depth * 0.13; ctx.strokeStyle = 'rgba(' + lineC + ',' + oal + ')'; if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; } else ctx.lineTo(pt.sx, pt.sy); }
      ctx.lineWidth = 0.8; ctx.stroke();
      for (var rk = 0; rk < 2; rk++) { var ra = ang * 2 + rk * Math.PI, rpt = proj(Math.cos(ra) * 1.28, 0, Math.sin(ra) * 1.28); ctx.fillStyle = rgba(rk ? 1 : 0, 0.5 + rpt.depth * 0.4); ctx.beginPath(); ctx.arc(rpt.sx, rpt.sy, 1.5 + rpt.depth * 2, 0, 7); ctx.fill(); }
      // wireframe shell
      ctx.lineWidth = 0.7;
      for (var lat = -2; lat <= 2; lat++) { var ly = lat * 0.36, lr = Math.sqrt(Math.max(0, 1 - ly * ly)); ctx.beginPath(); var fr = true; for (var la = 0; la <= 6.4; la += 0.18) { var lpt = proj(Math.cos(la) * lr, ly, Math.sin(la) * lr), lal = 0.04 + lpt.depth * 0.11; ctx.strokeStyle = 'rgba(' + lineC + ',' + lal + ')'; if (fr) { ctx.moveTo(lpt.sx, lpt.sy); fr = false; } else ctx.lineTo(lpt.sx, lpt.sy); } ctx.stroke(); }
      for (var lon = 0; lon < 6; lon++) { var ph = lon * Math.PI / 6; ctx.beginPath(); var fr2 = true; for (var ma = -1.6; ma <= 1.65; ma += 0.16) { var mpt = proj(Math.cos(ma) * Math.cos(ph), Math.sin(ma), Math.cos(ma) * Math.sin(ph)), mal = 0.03 + mpt.depth * 0.09; ctx.strokeStyle = 'rgba(' + lineC + ',' + mal + ')'; if (fr2) { ctx.moveTo(mpt.sx, mpt.sy); fr2 = false; } else ctx.lineTo(mpt.sx, mpt.sy); } ctx.stroke(); }
      // node edges
      var P = nodes.map(function (n) { return proj(n.x, n.y, n.z); });
      edges.forEach(function (e) {
        var pa = P[e[0]], pb = P[e[1]], dep = (pa.depth + pb.depth) / 2, lit = Math.max(nodes[e[0]].flare, nodes[e[1]].flare);
        if (lit > 0.3) { ctx.strokeStyle = rgba(nodes[e[0]].kind, 0.3 + lit * 0.5); ctx.lineWidth = 1.4; }
        else { ctx.strokeStyle = 'rgba(' + lineC + ',' + (0.04 + dep * 0.11) + ')'; ctx.lineWidth = 0.55; }
        ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy); ctx.stroke();
      });
      // node bloom
      var order = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[a].depth - P[b].depth; });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      order.forEach(function (i) {
        var p = P[i], n = nodes[i];
        var breathe = 1 + 0.12 * Math.sin(t * 0.03 + n.pulse * 6.28), rad = (1.4 + p.depth * 2.8) * breathe + n.flare * 5, dof = p.depth < 0.4 ? 1.6 : 1, gr = (rad * 4.5 + n.flare * 16) * dof, g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, gr);
        g.addColorStop(0, rgba(n.kind, (0.32 * p.depth) + n.flare * 0.55)); g.addColorStop(1, rgba(n.kind, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.sx, p.sy, gr, 0, 7); ctx.fill();
      });
      ctx.restore();
      order.forEach(function (i) {
        var p = P[i], n = nodes[i], breathe = 1 + 0.12 * Math.sin(t * 0.03 + n.pulse * 6.28), dofS = p.depth < 0.35 ? 0.7 : 1, rad = ((1.4 + p.depth * 2.8) * breathe + n.flare * 5) * dofS, a = 0.42 + p.depth * 0.55;
        ctx.fillStyle = rgba(n.kind, Math.min(1, a + n.flare * 0.4)); ctx.beginPath(); ctx.arc(p.sx, p.sy, rad, 0, 7); ctx.fill();
        if (n.flare > 0.05) { ctx.strokeStyle = rgba(n.kind, n.flare * 0.55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.sx, p.sy, rad + (1 - n.flare) * 28, 0, 7); ctx.stroke(); }
        n.flare *= 0.945; if (n.flare < 0.01) n.flare = 0;
      });
    }

    function frame() {
      if (!running) return;
      t++; ang += 0.0024;
      render();
      raf = requestAnimationFrame(frame);
    }

    // ---- live feed: rotating canned pool, real-time timestamps ----
    var POOL = [
      ['recall', 'k=5 → 5 hits · calendar, recipes', '207ms'],
      ['classify', '→ surface · conf 0.82', '190ms'],
      ['embed', '→ 768d', '44ms'],
      ['health', '200 · reachable', '12ms'],
      ['score', '→ 3 signals ranked', '61ms'],
      ['recall', 'k=5 → 4 hits · errands, travel', '198ms'],
      ['classify', '→ rank · conf 0.77', '173ms'],
      ['embed', '→ 768d', '39ms']
    ];
    var oi = 0;
    function stamp() {
      var d = new Date();
      function pad(n) { return String(n).padStart(2, '0'); }
      return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    function pushLine() {
      var o = POOL[oi % POOL.length]; oi++;
      var ln = el('div', 'lb-ln');
      ln.appendChild(el('span', 'lb-t', stamp()));
      ln.appendChild(document.createTextNode(' '));
      ln.appendChild(el('span', 'lb-op', o[0]));
      ln.appendChild(document.createTextNode(' ' + o[1] + ' '));
      ln.appendChild(el('span', 'lb-t', '· ' + o[2]));
      lines.appendChild(ln);
      while (lines.children.length > 5) lines.removeChild(lines.firstChild);
    }

    // ---- metric ticks (believable, textContent only) ----
    var memPct = 72, load = 2.4, tok = 78, memories = 12408;
    function tick() {
      memPct = Math.max(58, Math.min(86, memPct + (rng() - 0.5) * 4));
      load = Math.max(1.2, Math.min(4.1, load + (rng() - 0.5) * 0.5));
      tok = Math.max(54, Math.min(96, Math.round(tok + (rng() - 0.5) * 8)));
      if (rng() > 0.55) memories += 1 + Math.floor(rng() * 3);
      mMem.num.textContent = Math.round(memPct) + '%'; mMem.fill.style.width = Math.round(memPct) + '%';
      mLoad.num.textContent = load.toFixed(1); mLoad.fill.style.width = Math.round(load / 6 * 100) + '%';
      mTok.num.textContent = tok;
      mMemories.num.textContent = memories.toLocaleString('en-US');
    }

    // ---- lifecycle ----
    fit();
    new ResizeObserver(fit).observe(canvas);
    for (var pl = 0; pl < 5; pl++) pushLine();

    if (reduceMotion()) {
      // single static frame; defer one rAF so layout/size is settled, and
      // re-render once more after first paint to catch a late resize.
      requestAnimationFrame(function () { fit(); render(); });
      return;
    }

    function startAnim() { if (!running && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } }
    function stopAnim() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

    var vis = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? startAnim() : stopAnim(); });
    }, { threshold: 0.06 });
    vis.observe(stage);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAnim(); else if (onScreen) startAnim();
    });
    var onScreen = false;
    var vis2 = new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; }); }, { threshold: 0.06 });
    vis2.observe(stage);

    every(2800, function () { if (running) { firePulse(); pushLine(); } });
    every(1600, function () { if (running) pushLine(); });
    every(1500, tick);
  })();

  // ---------------------------------------------------------
  //  Rail row: activity feed + approvals lane (under the brain)
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
