/* ============================================================
   MARKET FORCES — responsive view registry + THE FACTORY (cost lab)
   Sliders live in a static control block; everything reactive sits in
   #labDyn so dragging a slider never destroys the element being dragged.
   ============================================================ */

const VIEWS = {};
function drawViews(root) {
  qa('[data-view]', root || document).forEach(el => {
    const f = VIEWS[el.dataset.view];
    if (!f) return;
    const w = Math.max(360, Math.round(el.clientWidth - 14));
    el.innerHTML = f(w);
  });
}
window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => drawViews(), 150); });

/* ---- reusable: the perfect-competition firm diagram ---- */
function cfgPCFirm(w, o) {
  const K = o.K, P = o.P, L = o.L;
  const qMax = ECON.capacity(K) * 1.01;
  const yMax = o.yMax || 74;
  const ser = [];
  const mk = (fn, color, label) => {
    const pts = [];
    /* only the rising branch of total product: past its peak the same output
       would need fewer workers, so a cost curve drawn there would double back */
    for (let l = 0.25; l <= K * ECON.X_TPP; l += 0.25) {
      const x = ECON.output(K, l), y = fn(K, l);
      if (x <= qMax && y <= yMax) pts.push([x, y]);
    }
    if (pts.length) ser.push({ pts, color, width: 2.8, label });
  };
  mk(ECON.mc, PAL.red, 'MC');
  mk(ECON.ac, PAL.blue, 'AC');
  if (o.showAVC !== false) mk(ECON.avc, PAL.green, 'AVC');
  if (o.showAFC) mk(ECON.afc, PAL.violet, 'AFC');

  const Q = ECON.output(K, L), AC = ECON.ac(K, L);
  const profit = ECON.profit(K, L, P);
  const shapes = [], points = [], vlines = [], hlines = [];
  hlines.push({ y: P, color: PAL.ink, dash: '7 5', label: `P = MR = AR = $${fmt(P, 0)}`, labelSide: 'left' });

  if (o.showProfit !== false && L > 0 && Q > 0) {
    const top = Math.max(AC, P), bot = Math.min(AC, P);
    shapes.push({ type: 'rect', x0: 0, y0: top, x1: Q, y1: bot, fill: profit >= 0 ? PAL.green : PAL.red, opacity: .17, stroke: profit >= 0 ? PAL.green : PAL.red, sw: 1.5, dash: '4 3' });
    vlines.push({ x: Q, color: PAL.guide, label: `Q = ${fmt(Q, 1)}` });
    points.push({ x: Q / 2, y: (AC + P) / 2, color: profit >= 0 ? PAL.green : PAL.red, r: 0, label: profit >= 0 ? 'profit box' : 'loss box', dx: -4, anchor: 'middle' });
  }
  return {
    w, h: Math.round(Math.min(580, Math.max(360, w * 0.66))),
    x: [0, qMax], y: [0, yMax],
    xLabel: 'Output Q (units per period)', yLabel: 'Cost per unit ($)',
    series: ser, shapes, points, vlines, hlines
  };
}

/* ============================================================
   SCENE: lab
   ============================================================ */
const LABTABS = {
  production: { label: 'Production', sub: 'How output responds to workers', n: 1 },
  costs: { label: 'Cost curves', sub: 'Where your money goes', n: 2 }
};
const LAB_GROUP_TASKS = {
  production: ['p_mp', 'p_ap'],
  costs: ['c_minac', 'c_shut']
};
function labGroupDone(k) { return LAB_GROUP_TASKS[k].every(id => S.lab.missions[id]); }

SCENES.lab = {
  html() {
    const tabs = Object.keys(LABTABS).map(k => {
      const done = labGroupDone(k);
      return `<button class="labtab ${S.lab.tab === k ? 'sel' : ''} ${done ? 'done' : ''}" data-a="lab-tab" data-v="${k}">
        <span class="lt-n">${done ? uicon('check-sm') : LABTABS[k].n}</span>
        <span class="lt-t">${LABTABS[k].label}<small>${LABTABS[k].sub}</small></span>
      </button>`;
    }).join('');
    const onCosts = S.lab.tab === 'costs';
    return `
    <div class="card tight lab-head">
      <div>
        <div class="kicker">${esc(S.firmName)} &middot; R&amp;D period</div>
        <h2 style="margin:0">The Factory</h2>
      </div>
      <div class="small muted" style="max-width:34rem">Nothing is at stake in here. Experiment freely &mdash; this is where you learn what the business can do before you have to trade with it.</div>
    </div>
    <div class="labwork">
      <div class="labmain" id="labDyn"></div>
      <aside class="labrail">
        <div class="labrail-scroll">
          <div class="labtabs">${tabs}</div>
          <div class="card tight labrail-card" id="labCtl"></div>
          <div class="readout labrail-read" id="labRead"></div>
          <div class="small muted labrail-hint">${onCosts
            ? 'Find the lowest point of AC and of AVC, then press Submit. The market chapters open once both crews are sent in.'
            : 'Hunt for the crew where MP peaks and where AP peaks, then press Submit. The next page opens itself.'}</div>
        </div>
        <div class="labrail-go">
          <button class="btn primary wide" data-a="${onCosts ? 'lab-check-cost' : 'lab-check-prod'}">Submit answers</button>
          ${onCosts ? '<button class="btn wide lab-finish-btn" data-a="lab-finish">I understand my firm &rarr;</button>' : ''}
        </div>
      </aside>
    </div>`;
  },
  mount() {
    q('#labCtl').innerHTML = LABVIEW[S.lab.tab].ctl();
    /* wherever the slider already is counts as the first tested crew size */
    discover(S.lab.K, S.lab.L);
    softLabUpdate();
    fitRail();
  }
};
ACTS['lab-tab'] = t => { S.lab.tab = t.dataset.v; repaint(); };

/* THE RAIL'S STARTING LINE (round 9, request #2).
   `49-lab-rail-go.css` caps the rail so its pinned "Submit answers" block is
   reachable without scrolling — but the cap is `100vh - <where the rail
   starts> - HUD`, and "where the rail starts" is a laid-out fact, not a
   constant: it depends on how many lines "The Factory" head takes and how
   long the firm's name is. Guessing it is what left the button 38px under the
   fold; so it is measured instead and published as `--rail-top`.

   The measurement is taken from the VIEWPORT top, matching the `100vh` term
   in the calc(). It is read once per mount and again on resize, never per
   frame: the value only changes when the head re-wraps or the window does.

   Deliberately silent about the rods' own fitRods() — the two are unrelated
   and keeping them apart means a change to one cannot disturb the other. */
function fitRail() {
  const rail = q('.labrail');
  if (!rail || !rail.offsetWidth) return;
  const top = rail.getBoundingClientRect().top;
  if (!(top > 0)) return;
  document.documentElement.style.setProperty('--rail-top', top.toFixed(1) + 'px');
}
window.addEventListener('resize', () => { if (S.scene === 'lab') fitRail(); });

function softLabUpdate() {
  const d = q('#labDyn');
  if (d) { d.innerHTML = LABVIEW[S.lab.tab].dyn(); drawViews(); }
  const cl = q('#ctlL'); if (cl) cl.textContent = S.lab.L + (S.lab.L === 1 ? ' worker' : ' workers');
  /* the numbers live in the rail, refreshed in place so moving a slider never
     destroys the element being dragged */
  const rd = q('#labRead'); if (rd) rd.innerHTML = labReadout();
  taskSync();
}

/* ============================================================
   DISCOVERY
   The lab does not hand the data over. A crew size only appears in the table
   once the student has actually stopped on it — and the curves are drawn through
   the points they have found, and no further. The tasks ("where does MP peak?")
   then cannot be answered by reading; they have to be hunted for.
   "Reveal the whole table" is there for the teacher who wants to talk over the
   finished picture.
   ============================================================ */
function labFound(K) { S.lab.found = S.lab.found || {}; return (S.lab.found[K] = S.lab.found[K] || {}); }
function isKnown(K, L) { return !!S.lab.all || !!labFound(K)[L]; }
function discover(K, L) { if (L == null || L < 0) return; labFound(K)[L] = 1; }
function knownLevels(K) {
  const out = [];
  for (let L = 0; L <= ECON.maxL(K); L++) if (isKnown(K, L)) out.push(L);
  return out;
}
function labNotebookCount(K) { return knownLevels(K).length; }

/* The live numbers, rendered in the rail under the slider so they can be watched
   while the slider moves. Refreshed by softLabUpdate() without re-rendering the
   controls, so a drag never breaks. */
function labReadout() {
  const K = S.lab.K, L = S.lab.L;
  const ro = (label, value, cls) =>
    `<div class="ro${cls ? ' ' + cls : ''}"><div class="rl">${label}</div><div class="rv">${value}</div></div>`;
  if (S.lab.tab === 'costs') {
    return ro('Output Q', fmt(ECON.output(K, L), 1), 'hi')
      + ro('Total cost', money(ECON.tc(K, L)))
      + ro('Average cost', L ? money(ECON.ac(K, L), 2) : '—')
      + ro('Average variable cost', L ? money(ECON.avc(K, L), 2) : '—')
      + ro('Marginal cost', L ? money(ECON.mc(K, L), 2) : '—');
  }
  const mpv = L ? ECON.mp(K, L) : 0;
  return ro('Output Q', fmt(ECON.output(K, L), 1), 'hi')
    + ro('Marginal product', L ? fmt(mpv, 2) : '—', mpv < 0 ? 'neg' : '')
    + ro('Average product', L ? fmt(ECON.ap(K, L), 2) : '—')
    + ro('Labour cost', money(ECON.WAGE * L));
}

/* ---------------- tab 1: production ---------------- */
const LABVIEW = {};

LABVIEW.production = {
  ctl() {
    const K = S.lab.K, L = S.lab.L, top = ECON.maxL(K);
    return `<div class="ctl" style="margin:0">
        <div class="clab"><span class="t">1 &middot; ${Caps()} &mdash; capital, fixed for the period</span></div>
        <div class="optrow lab-k">${MACHINE_CHOICES.map(k => `<button class="opt ${K === k ? 'sel' : ''}" data-a="lab-k" data-v="${k}">${k} ${k > 1 ? caps() : cap()}<small>${money(ECON.MACHINE * k)} / period</small></button>`).join('')}</div>
        <div class="clab" style="margin-top:.7rem"><span class="t">2 &middot; Workers hired &mdash; labour, variable</span><span class="v" id="ctlL">${L} worker${L === 1 ? '' : 's'}</span></div>
        ${sliderRow('lab-l', 0, top, 1, L, ticksFor(top))}
        <div class="small muted" style="margin-top:.25rem">Use the − and + buttons to land on an exact crew size. With ${K} ${K > 1 ? caps() : cap()} there are ${top} levels to try.</div>
      </div>`;
  },
  dyn() {
    const K = S.lab.K, L = S.lab.L;
    const top = ECON.maxL(K);
    const rows = [];
    for (let l = 0; l <= top; l++) {
      const known = isKnown(K, l);
      rows.push(`<tr class="${l === L ? 'hl' : ''}${known ? '' : ' unknown'}"><td>${l}</td>
        <td>${known ? fmt(ECON.output(K, l), 1) : '?'}</td>
        <td>${(!known || l === 0) ? '?' : fmt(ECON.mp(K, l), 2)}</td>
        <td>${(!known || l === 0) ? '?' : fmt(ECON.ap(K, l), 2)}</td></tr>`);
    }
    const mpPeakL = labPeerL('mp'), apPeakL = labPeerL('ap');
    const overCrowd = L > 4 * K;
    return `
    <div class="chartcard" data-view="lab-factory"></div>
    <div class="chartpair">
      <div class="chartcard" data-view="lab-tp"></div>
      <div class="chartcard" data-view="lab-mp"></div>
    </div>
    <div class="card tight small muted">
      <b>Fixed factors</b> (land ${money(ECON.LAND)} + ${K} ${K > 1 ? caps() : cap()} × ${money(ECON.MACHINE)}) cost <b>${money(ECON.tfc(K))}</b> per period whatever you produce.
      At this output you also pay <b>${money(ECON.tvc(K, L))}</b> of variable cost (${money(ECON.WAGE * L)} wages + ${money(ECON.MAT * ECON.output(K, L))} materials) &mdash; total cost <b>${money(ECON.tc(K, L))}</b>.
      ${overCrowd ? '<br><b style="color:var(--warn)">Look at the floor: ' + L + ' workers are sharing ' + K + ' ' + (K > 1 ? caps() : cap()) + '. They are getting in each other’s way.</b>' : ''}
      ${(S.lab.missions['p_mp'] && S.lab.missions['p_ap']) ? `<br><b style="color:var(--good)">Both found.</b> Marginal product peaks at worker ${mpPeakL} (MP = ${fmt(ECON.mp(K, mpPeakL), 2)}), and average product peaks at worker ${apPeakL} — exactly where AP = MP.` : ''}
    </div>
    <div class="scroll" style="margin-top:.8rem">
      <table class="dt"><thead><tr><th>Workers</th><th>Output Q</th><th>Marginal product</th><th>Average product</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    </div>`;
  }
};

/* ---------------- tab 2: costs ---------------- */
LABVIEW.costs = {
  ctl() {
    const K = S.lab.K, L = S.lab.L, top = ECON.maxL(K);
    return `<div class="ctl" style="margin:0">
        <div class="clab"><span class="t">${Caps()} &mdash; capital, fixed for the period</span></div>
        <div class="optrow lab-k">${MACHINE_CHOICES.map(k => `<button class="opt ${K === k ? 'sel' : ''}" data-a="lab-k" data-v="${k}">${k} ${k > 1 ? caps() : cap()}<small>${money(ECON.MACHINE * k)} / period</small></button>`).join('')}</div>
        <div class="clab" style="margin-top:.7rem"><span class="t">Workers hired &mdash; labour, variable</span><span class="v" id="ctlL">${L} worker${L === 1 ? '' : 's'}</span></div>
        ${sliderRow('lab-l', 0, top, 1, L, ticksFor(top))}
        <div class="small muted" style="margin-top:.25rem">Watch AC and AVC as you go: each has a bottom, and MC cuts both of them there.</div>
      </div>`;
  },
  dyn() {
    const K = S.lab.K, L = S.lab.L;
    const top = ECON.maxL(K);
    const minAcL = labPeerL('ac'), minAvcL = labPeerL('avc');
    const minAc = ECON.ac(K, minAcL), minAvc = ECON.avc(K, minAvcL);
    const rows = [];
    for (let l = 0; l <= top; l++) {
      const known = isKnown(K, l), val = v => (known && l > 0 ? v : '?');
      rows.push(`<tr class="${l === L ? 'hl' : ''}${known ? '' : ' unknown'}">
        <td>${l}</td><td>${known ? fmt(ECON.output(K, l), 1) : '?'}</td>
        <td>${money(ECON.tfc(K))}</td><td>${known ? money(ECON.tvc(K, l)) : '?'}</td><td>${known ? money(ECON.tc(K, l)) : '?'}</td>
        <td>${val(money(ECON.afc(K, l), 2))}</td><td>${val(money(ECON.avc(K, l), 2))}</td>
        <td>${val(money(ECON.ac(K, l), 2))}</td><td>${val(money(ECON.mc(K, l), 2))}</td></tr>`);
    }
    return `
    <div class="chartcard" data-view="lab-costs"></div>
    <div class="card tight">
      <div class="small" style="font-weight:800">What to notice</div>
      <div class="grid2" style="gap:1.1rem">
        <div>
          <ul class="clean small" style="margin:0">
            <li><b>AFC falls for ever.</b> The same rent is spread over more and more units.</li>
            <li><b>AVC eventually rises.</b> Crowded ${caps()} mean each extra worker adds less output, so each unit costs more.</li>
          </ul>
        </div>
        <div>
          <ul class="clean small" style="margin:0">
            <li><b>MC cuts AC at AC’s lowest point.</b> Below that point MC drags AC down; above it, MC pushes AC up.</li>
            <li><b>MC cuts AVC at AVC’s lowest point.</b> Below that price the firm shuts down.</li>
          </ul>
        </div>
      </div>
      <div class="small muted" style="margin-top:.5rem;border-top:1px dashed var(--line);padding-top:.45rem">With ${K} ${K > 1 ? caps() : cap()}: lowest AC is <b>${money(minAc, 2)}</b> at about <b>${fmt(ECON.output(K, minAcL), 1)} units</b> (worker ${minAcL}); lowest AVC is <b>${money(minAvc, 2)}</b> at worker ${minAvcL}.</div>
    </div>
    <div class="scroll" style="margin-top:.8rem">
      <table class="dt"><thead><tr><th>Workers</th><th>Output Q</th><th>TFC</th><th>TVC</th><th>TC</th><th>AFC</th><th>AVC</th><th>AC</th><th>MC</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    </div>`;
  }
};

/* ---- helpers shared by the two factory tabs ---- */

/* The capital-good menu. Four is enough to show that more capital shifts every
   curve, which is the whole point of the tab. */
const MACHINE_CHOICES = [1, 2, 3, 4];

/* Evenly spread axis ticks for a slider that now changes length with K. */
function ticksFor(max) {
  const marks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(max * f));
  return `<div class="ticks">${marks.map(m => `<span>${m}</span>`).join('')}</div>`;
}

/* ---------------- lab views ---------------- */
VIEWS['lab-factory'] = () => `<div style="max-width:820px;margin:0 auto">${artFactory(S.lab.K, S.lab.L, prod(), S.colour, {
  crowd: S.lab.L > 4 * S.lab.K, lazy: S.lab.L > 0 && S.lab.L < 4 * S.lab.K
})}</div>`;

VIEWS['lab-tp'] = w => {
  const K = S.lab.K, top = ECON.maxL(K);
  /* only the crew sizes the student has actually tried: the curve is what they
     have found out so far, not what the engine knows */
  const pts = knownLevels(K).map(l => [l, ECON.output(K, l)]);
  return chart({
    w, h: Math.round(Math.min(460, Math.max(280, w * 0.52))), x: [0, top],
    /* the axes are scaled to the whole technology so they do not jump around
       while the student explores */
    y: [0, Math.ceil(ECON.capacity(K) * 1.06)],
    xLabel: 'Workers hired', yLabel: 'Total product Q',
    series: pts.length > 1 ? [{ pts, color: S.colour, width: 3.2, label: 'Total product', area: .14 }] : [],
    points: pts.length ? [{ x: S.lab.L, y: ECON.output(K, S.lab.L), color: PAL.ink, r: 6, label: `L=${S.lab.L} \u2192 Q=${fmt(ECON.output(K, S.lab.L), 1)}`, dy: -12, anchor: 'middle', dx: 0 }] : [],
    vlines: S.lab.L ? [{ x: S.lab.L, color: PAL.guide }] : [],
    note: pts.length > 1 ? '' : 'move the slider and let go to start plotting'
  });
};
VIEWS['lab-mp'] = w => {
  const K = S.lab.K, top = ECON.maxL(K);
  const mp = [], ap = [];
  let hi = 0, lo = 0;
  /* the axis covers the whole technology (stable), the curves only cover what
     the student has found */
  for (let l = 1; l <= top; l++) {
    const m = ECON.mp(K, l), a = ECON.ap(K, l);
    hi = Math.max(hi, m, a); lo = Math.min(lo, m);
  }
  const known = knownLevels(K).filter(l => l > 0);
  known.forEach(l => { mp.push([l, ECON.mp(K, l)]); ap.push([l, ECON.ap(K, l)]); });
  const ser = [];
  if (ap.length > 1) ser.push({ pts: ap, color: PAL.green, width: 3, label: 'AP' });
  if (mp.length > 1) ser.push({ pts: mp, color: PAL.red, width: 3, label: 'MP' });
  /* the axis has to go below zero, or the workers who REDUCE output fall off
     the bottom of the chart instead of showing up as a falling curve */
  return chart({
    w, h: Math.round(Math.min(460, Math.max(280, w * 0.52))), x: [0, top],
    y: [lo < 0 ? Math.floor(lo * 1.18) : 0, Math.max(4, Math.ceil(hi * 1.12))],
    xLabel: 'Workers hired', yLabel: 'Product per worker',
    series: ser,
    hlines: lo < 0 ? [{ y: 0, color: PAL.guide, label: 'MP = 0', labelSide: 'left' }] : [],
    points: (S.lab.L ? [{ x: S.lab.L, y: ECON.mp(K, S.lab.L), color: PAL.red, r: 5.5 }, { x: S.lab.L, y: ECON.ap(K, S.lab.L), color: PAL.green, r: 5.5 }] : []),
    note: ser.length ? (lo < 0 ? 'past the peak, another worker lowers output' : '') : 'test a crew size to plot it'
  });
};
VIEWS['lab-costs'] = w => {
  const K = S.lab.K;
  const yMax = 70, ser = [];
  /* only the crew sizes the student has tested, and only the rising branch of
     total product: past its peak the same output would need fewer workers, so a
     cost curve drawn there would double back on itself */
  const known = knownLevels(K).filter(l => l > 0 && l <= K * ECON.X_TPP);
  const add = (fn, color, label) => {
    const pts = known.map(l => [ECON.output(K, l), fn(K, l)]).filter(p => p[1] <= yMax);
    if (pts.length > 1) ser.push({ pts, color, width: 3, label });
  };
  add(ECON.mc, PAL.red, 'MC');
  add(ECON.ac, PAL.blue, 'AC');
  add(ECON.avc, PAL.green, 'AVC');
  add(ECON.afc, PAL.violet, 'AFC');
  const minAcL = labPeerL('ac');
  const minAc = ECON.ac(K, minAcL);
  const minKnown = isKnown(K, minAcL);
  const Q = ECON.output(K, S.lab.L);
  return chart({
    w, h: Math.round(Math.min(520, Math.max(330, w * 0.62))),
    x: [0, ECON.capacity(K) * 1.02], y: [0, yMax],
    xLabel: 'Output Q (units per period)', yLabel: 'Cost per unit ($)',
    series: ser,
    points: minKnown ? [{ x: ECON.output(K, minAcL), y: minAc, color: PAL.ink, r: 5.5, label: `lowest AC = ${money(minAc, 2)}`, dy: -11, anchor: 'middle', dx: 0 }] : [],
    vlines: S.lab.L ? [{ x: Q, color: PAL.guide, label: `you: Q=${fmt(Q, 1)}` }] : [],
    note: ser.length ? '' : 'test a crew size to plot it'
  });
};

/* ---------------- lab interactions ----------------
   revealCharts() is the visible half of "Reveal the whole table".
   Two steps, in this order:
     1. scroll the chart panel to a comfortable place under the topbar
     2. arm the draw animation on every series path
   Order matters: measuring a path that is off-screen is fine, but starting the
   animation before the scroll finishes means the student arrives to curves that
   have already drawn themselves — the exact thing the button exists to prevent. */
const CHART_DRAW_MS = 1150;

/* Which cards actually hold curves?
   The round-8 bug: this used to return the FIRST `[data-view]` card. On the
   production tab the first card is `lab-factory`, which has no series in it —
   the curves live in `lab-tp` / `lab-mp` further down — so `paths` came back
   empty, `--mf-len` was never set, and the curves just appeared. The draw was
   wired to the wrong element the whole time; it only ever worked by luck on a
   tab where the first card happened to be the chart.
   Now it returns EVERY card that contains at least one curve. */
function chartPanels() {
  const hosts = qa('#labDyn [data-view]');
  const withCurves = hosts.filter(el => el.querySelector('.mf-curve'));
  if (withCurves.length) return withCurves;
  const dyn = q('#labDyn');
  return dyn && dyn.querySelector('.mf-curve') ? [dyn] : [];
}

function revealCharts() {
  const panels = chartPanels();
  if (!panels.length) return;

  /* Respect the student's motion preference: skip the delay entirely rather
     than starting a draw they will never be shown. */
  const calm = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll to the FIRST card that has curves, not to the top of the section —
     otherwise the student watches an empty frame while the curves draw below
     the fold. The topbar measures itself into --topbar-h at runtime. */
  let topPad = 12;
  try {
    const cs = getComputedStyle(document.documentElement).getPropertyValue('--topbar-h');
    const n = parseFloat(cs);
    if (isFinite(n)) topPad = n + 16;
  } catch (e) { /* jsdom / no layout: the plain offset is fine */ }

  const start = () => {
    /* One running index across ALL panels, so the curves come in one after
       another across the whole figure rather than three at once per card. */
    let si = 0;
    panels.forEach(panel => {
      panel.querySelectorAll('.mf-curve').forEach(p => {
        let len = 0;
        try { len = p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { len = 0; }
        /* jsdom has no getTotalLength. Falling back to a large constant keeps
           the animation valid rather than blanking the curve, and the dash
           would be hidden anyway because this browser never paints. */
        if (!len || !isFinite(len)) len = 2000;
        p.style.setProperty('--mf-len', Math.ceil(len) + 1);
        p.style.setProperty('--mf-dur', CHART_DRAW_MS + 'ms');
        /* the CSS staggers on --mf-i; the generated markup sets it per chart,
           but we re-stamp it here so the sequence is continuous across cards
           and a reveal always plays in the same order */
        p.style.setProperty('--mf-i', si++);
      });
      panel.classList.remove('mf-draw');
      /* force a reflow so re-adding the class restarts the animation instead
         of being optimised away as a no-op class change */
      void panel.offsetWidth;
      panel.classList.add('mf-draw');
    });
  };

  if (calm) { start(); return; }

  try {
    const first = panels[0];
    const y = first.getBoundingClientRect().top + window.pageYOffset - topPad;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    /* the page cannot be told when a smooth scroll ends, so the draw starts
       after a short beat — long enough that the eye is already travelling */
    setTimeout(start, 420);
  } catch (e) {
    start();
  }
}

ACTS['lab-l'] = t => { S.lab.L = +t.value; softLabUpdate(); };
ACTS['lab-reveal'] = () => {
  S.lab.all = true;
  /* Close the task sheet FIRST. The button lives inside it, so the student is
     looking at the overlay when they press it; leaving it open means the scroll
     and the draw both happen underneath a full-screen scrim and nobody sees a
     thing. Closing here, before repaint(), also keeps the panel from being
     re-opened by the taskSync() that repaint() runs. */
  openTasks(false);
  toast('Every crew size is now filled in \u2014 the whole curve is on the charts.');
  repaint();
  /* The student asked to see the whole table, so SHOW them: bring the chart
     into view and let the curves draw themselves. Both halves matter — the
     scroll puts the answer where they are looking, the draw makes it legible
     as an answer rather than as a page that was always like that. */
  revealCharts();
};
ACTS['lab-k'] = t => { S.lab.K = +t.dataset.v; repaint(); };

/* ---- banking a task is the only way to earn lab insight, and the only way to
   open the gate. Both read the same registry, so they cannot disagree. ---- */
function bankLab(ids, okMsg, missMsg) {
  let got = 0;
  ids.forEach(id => {
    const t = LAB_TASKS.filter(x => x.id === id)[0];
    if (t.met() && !S.lab.missions[id]) got += awardLabTask(id);
  });
  if (got) toast(`+${got} Insight \u00b7 ` + okMsg);
  else toast(missMsg);
  softLabUpdate(); paintTop();
}

ACTS['lab-check-prod'] = () => {
  bankLab(['p_mp', 'p_ap'], 'production function cracked',
    'Not quite \u2014 move the slider and watch how MP and AP behave.');
  /* a finished group turns its own page */
  if (labGroupDone('production') && S.lab.tab === 'production' && !S.lab.__toCosts) {
    S.lab.__toCosts = true;
    setTimeout(() => {
      if (S.scene === 'lab' && S.lab.tab === 'production') {
        toast('Production section complete \u2014 opening cost curves.');
        ACTS['lab-tab']({ dataset: { v: 'costs' } });
      }
    }, 1350);
  }
};
ACTS['lab-check-cost'] = () => {
  bankLab(['c_minac', 'c_shut'], 'cost curves mapped',
    'Not yet \u2014 find the lowest point of the AC curve, then of the AVC curve.');
  if (labGroupDone('costs') && S.lab.tab === 'costs' && !S.lab.__finished) {
    S.lab.__finished = true;
    setTimeout(() => { if (S.scene === 'lab') ACTS['lab-finish'](); }, 1350);
  }
};
ACTS['lab-finish'] = () => {
  if (gateOpen()) {
    const miss = gateMissing()[0];
    if (miss && miss.group) {
      S.lab.tab = miss.group;
    }
    toast(gateMessage());
    repaint();
    return;
  }
  S.K = S.lab.K; S.L = S.lab.L;
  S.chIdx = 0; S.beat = 0;
  enterBeat();
  go('chapter');
};
