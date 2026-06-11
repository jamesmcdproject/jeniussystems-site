(function () {
  var grid = document.getElementById('fleet-grid');
  if (!grid) return;

  var TIER_LABELS = {
    hub: 'Hub',
    worker: 'Task workers',
    specialist: 'Specialists',
    gated: 'Built & gated — not yet deployed'
  };
  var ALLOWED_ACCENTS = { violet: 1, sky: 1, emerald: 1, amber: 1, rose: 1, slate: 1 };

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function card(agent) {
    var accent = ALLOWED_ACCENTS[agent.accent] ? agent.accent : 'slate';
    var name = String(agent.name || '');
    var blurb = String(agent.blurb || '');
    var tags = Array.isArray(agent.tags) ? agent.tags.map(String) : [];

    var frame = el('div', 'fl-card reveal in');
    frame.setAttribute('data-ac', accent);
    var core = el('div', 'fl-core');

    var head = el('div', 'fl-head');
    var orb = el('div', 'fl-orb');
    var letter = el('span');
    letter.textContent = name.slice(0, 1).toUpperCase();
    orb.appendChild(letter);

    var idblock = el('div', 'fl-id');
    var h = el('h4', 'fl-name');
    h.textContent = name;
    idblock.appendChild(h);
    if (tags.length) {
      var tagline = el('div', 'fl-tags');
      tagline.textContent = tags.join(' · ');
      idblock.appendChild(tagline);
    }
    head.appendChild(orb);
    head.appendChild(idblock);

    var p = el('p', 'fl-blurb');
    p.textContent = blurb;

    core.appendChild(head);
    core.appendChild(p);
    frame.appendChild(core);
    return frame;
  }

  function render(data) {
    if (!data || !Array.isArray(data.tiers)) throw new Error('bad shape');
    var frag = document.createDocumentFragment();
    var any = false;

    data.tiers.forEach(function (tier) {
      if (!tier || !Array.isArray(tier.agents) || !tier.agents.length) return;
      var label = TIER_LABELS[tier.name] || tier.name;

      var headRow = el('div', 'fl-tier reveal in');
      var lab = el('span', 'eyebrow fl-tier-label');
      lab.textContent = label;
      var rule = el('span', 'fl-rule');
      headRow.appendChild(lab);
      headRow.appendChild(rule);
      frag.appendChild(headRow);

      var row = el('div', 'fl-grid');
      tier.agents.forEach(function (a) { row.appendChild(card(a)); any = true; });
      frag.appendChild(row);
    });

    if (!any) throw new Error('no agents');

    grid.textContent = '';
    grid.appendChild(frag);

    var stamp = document.getElementById('fleet-updated');
    if (stamp && typeof data.generated === 'string') {
      stamp.textContent = 'Roster updated ' + data.generated;
    }
  }

  fetch('data/fleet.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(render)
    .catch(function () { /* leave the static fallback cards untouched */ });
})();
