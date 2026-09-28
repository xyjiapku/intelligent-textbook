/* ============================================================
   MARKET FORCES — chapter engine + Chapter 1 (Perfect Competition),
   plus the shared monopolistic-competition firm diagram.
   Playing order lives in CHAPTERS (03_ui.js): pc → mono → mc → oligo.
   ============================================================ */

const BEATS = {};

/* Beats are built lazily (as functions) because their text is filled with the
   student's own product, colour and firm name — all of which are only known
   after the setup screen. Building them at load time would freeze "bakery"
   into a run where the student chose soap. */
function beatsFor(id) { const b = BEATS[id]; return typeof b === 'function' ? b() : (b || []); }
function curBeats() { return beatsFor(S.chs[S.chIdx]); }
function curBeat() { return curBeats()[S.beat]; }

function enterBeat() {
  const b = curBeat();
  S.locked = false; S.res = null; S.checkAns = null; S.pick = null;
  if (!b) return;
  if (b.setup) S.dec = Object.assign({ ad: 0, variant: 0, monoK: 3, welfare: true }, typeof b.setup === 'function' ? b.setup() : b.setup);
  if (b.onEnter) b.onEnter();
}
function advance() {
  /* one gate for the whole game: a step is finished when its task list says so */
  if (gateOpen()) { toast(gateMessage()); return; }
  S.beat++;
  if (S.beat >= curBeats().length) {
    S.chIdx++;
    S.beat = 0;
    if (S.chIdx >= S.chs.length) { go('debrief'); return; }
  }
  enterBeat();
  go('chapter');
}

/* ---------------- scene: chapter ---------------- */
SCENES.chapter = {
  html() {
    const ch = chapter(), beats = curBeats(), b = beats[S.beat];
    const dots = beats.map((x, i) => `<span class="stepdot ${i < S.beat ? 'done' : i === S.beat ? 'on' : ''}" style="text-transform:none;letter-spacing:0">${i < S.beat ? '\u2713' : i + 1}</span>`).join('');
    return `
    <div class="card tight" style="display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:.6rem">
        <span class="ch-icon">${chicon(ch.id)}</span>
        <div><div class="kicker">Chapter ${ch.n} of ${S.chs.length} &middot; ${ch.tag}</div><h2 style="margin:0">${ch.title}</h2></div>
      </div>
      <div class="steps" style="margin:0">${dots}</div>
    </div>
    ${renderBeat(b)}`;
  },
  mount() { mountBeat(); }
};

function renderBeat(b) {
  if (!b) return '';
  if (b.t === 'intro') return beatIntro(b);
  if (b.t === 'event') return beatEvent(b);
  if (b.t === 'decision') return beatDecision(b);
  if (b.t === 'check') return beatCheck(b);
  if (b.t === 'report') return beatReport(b);
  return '';
}
function mountBeat() {
  const b = curBeat();
  if (b && b.mount) b.mount();
  drawViews();
  bindDecisionInputs();
}
function bindDecisionInputs() {
  const m = { 'dec-l': 'dec-l', 'dec-p': 'dec-p', 'dec-k': 'dec-k', 'dec-soc': 'dec-soc' };
  // handled through the global data-i delegate
}

/* ---------------- beat renderers ---------------- */
function beatTitle(b){ return typeof b.title === "function" ? b.title() : b.title; }
function beatIntro(b) {
  const ch = chapter();
  const chs = typeof b.choices === 'function' ? b.choices() : b.choices;
  const choices = chs ? `<div class="optrow">${chs.map(c =>
    `<button class="opt ${S.pick == c.v ? 'sel' : ''}" data-a="intro-pick" data-v="${c.v}">${c.label}<small>${c.sub}</small></button>`).join('')}</div>` : '';
  const bullets = (b.bullets || []).length
    ? `<ul class="clean">${b.bullets.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
  const art = b.art ? `<div class="chartcard" style="max-width:900px;margin-left:auto;margin-right:auto">${typeof b.art === 'function' ? b.art() : b.art}</div>` : '';
  return `
  <div class="card fade">
    <div class="kicker">${b.kicker || ('Chapter ' + ch.n)}</div>
    <h2>${beatTitle(b)}</h2>
    ${(b.paras || []).map(p => `<div class="narr">${p}</div>`).join('')}
    ${art}
    ${choices}
    ${bullets ? `<div class="grid2" style="margin-top:.3rem"><div>${bullets}</div><div></div></div>` : ''}
    <div class="btnrow right"><button class="btn primary big" data-a="next">${b.btn || 'Continue \u2192'}</button></div>
    ${(chs && S.pick == null) ? '<div class="small muted" style="text-align:right">Make your choice to continue.</div>' : ''}
  </div>`;
}
ACTS['intro-pick'] = t => { S.pick = t.dataset.v; if (curBeat().onPick) curBeat().onPick(t.dataset.v); repaint(); };

/* ---------------- the soft path ----------------
   Dragging a slider must not rebuild the page. repaint() replaces #app's entire
   innerHTML, which tears down and re-creates every node in the scene — that is
   what made the whole screen flash on every pointermove, and it also threw away
   scroll position and hover state mid-gesture.

   res() therefore takes the cheap route whenever the current beat is a decision
   that has not been locked in yet: the card's STRUCTURE never changes while a
   slider moves, so we re-render only the parts whose values can change —
   the readout rail, the chart, the tick label — and leave the rest of the DOM
   standing. That is exactly the trick lab already uses in softLabUpdate().

   Anything else (a lock-in, a tab switch, an option button that alters the
   layout) still goes through the full repaint, so nothing that changes shape
   can be left stale. */
function res() {
  if (softDecisionUpdate()) return;
  repaint();
}

function softDecisionUpdate() {
  const b = curBeat();
  if (!b || b.t !== 'decision' || S.locked) return false;
  /* Only decision kinds whose control panel renders in full on every call —
     these four keep an identical DOM shape across the whole drag range, which
     is what makes a targeted update safe. */
  const fn = { pc: decPC, mc: decMC, mono: decMono, buyer: decBuyer, oligo: decOligo }[b.kind];
  if (typeof fn !== 'function') return false;

  /* Careful: the chapter scene renders a header card FIRST, then the beat. So
     '#app .card' is the header, not the decision card. The decision card is
     always the last direct child of #app, because renderBeat() is appended
     after the header in SCENES.chapter.html(). */
  const app = q('#app');
  const card = app && app.lastElementChild;
  if (!card || !card.classList.contains('card')) return false;

  /* Rebuild the card off-DOM, then move only the value-bearing nodes across.
     Anything the rebuild produced that we did not expect (a button appearing,
     a banner the student has now earned) falls through to a full repaint, so
     the soft path can never show a stale structure. */
  let fresh;
  try { fresh = document.createElement('div'); fresh.innerHTML = fn(b); } catch (e) { return false; }
  const freshCard = fresh.firstElementChild;
  if (!freshCard) return false;
  if (!sameShape(card, freshCard)) return false;

  const slots = freshCard.querySelectorAll('[data-slot]');
  if (!slots.length) return false;
  let moved = 0;
  slots.forEach(n => {
    const key = n.getAttribute('data-slot');
    const target = card.querySelector('[data-slot="' + key + '"]');
    if (!target) return;
    /* copy the payload, not the node, so listeners bound to the rail survive */
    target.innerHTML = n.innerHTML;
    if (n.hasAttribute('data-cls')) {
      const keep = target.getAttribute('data-keep-class') || '';
      target.className = keep + ' ' + n.getAttribute('data-cls');
    }
    if (n.hasAttribute('data-disp')) target.style.display = n.getAttribute('data-disp');
    moved++;
  });
  if (!moved) return false;
  drawViews();
  taskSync();
  if (window.MF_DOCK) MF_DOCK.sync();
  paintTop();
  return true;
}

/* Shallow structural fingerprint: tag + child element count + the set of
   data-slot keys. If the rebuilt card disagrees on any of these, the student
   is looking at a different card and the soft path must stand down. */
function sameShape(a, b) {
  const sig = el => el.tagName + ':' + el.children.length + ':'
    + [...el.querySelectorAll('[data-slot]')].map(n => n.getAttribute('data-slot')).sort().join(',');
  return sig(a) === sig(b);
}

function beatEvent(b) {
  const chg = b.change ? `<div style="margin:.8rem 0">${b.change}</div>` : '';
  return `
  <div class="card event ${b.cls || ''} fade">
    <div><span class="evt-tag ${b.cls || ''}">${b.tag || 'Market event'}</span></div>
    <h2 style="margin-top:.5rem">${beatTitle(b)}</h2>
    ${(b.paras || []).map(p => `<div class="narr">${p}</div>`).join('')}
    ${chg}
    ${b.street ? (typeof b.street === 'function' ? b.street() : b.street) : ''}
    ${b.art ? `<div class="chartcard">${typeof b.art === 'function' ? b.art() : b.art}</div>` : ''}
    <div class="btnrow right"><button class="btn primary big" data-a="next">${b.btn || 'Continue \u2192'}</button></div>
  </div>`;
}

function beatCheck(b) {
  const answered = S.checkAns != null;
  /* `t` and `fb` may be functions, like `list` and `insight` in beatReport —
     feedback that quotes a number has to read it from the engine, or it goes
     stale the moment anyone touches the cost curves. (The chapter-3 feedback
     used to claim every combination "tops out around $100-115"; the engine says
     $126, and there was no way for the text to notice.) */
  const val = x => (typeof x === 'function' ? x() : x);
  const opts = b.opts.map((o, i) => {
    let cls = '';
    if (answered) { if (o.ok) cls = 'ok'; else if (i === S.checkAns) cls = 'no'; }
    return `<button class="checkopt ${cls}" data-a="check-ans" data-v="${i}"><span class="optkey">${'ABCDE'[i]}</span><span>${val(o.t)}</span></button>`;
  }).join('');
  const a = answered ? b.opts[S.checkAns] : null;
  return `
  <div class="card fade">
    <div class="kicker">Check your thinking &middot; +${b.ins || 10} Insight</div>
    <h2>${beatTitle(b) || 'Think it through'}</h2>
    <div class="narr">${val(b.q)}</div>
    ${opts}
    <div class="fb ${answered ? 'show ' + (a.ok ? 'ok' : 'no') : ''}">${answered ? (a.ok ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + val(a.fb) : ''}</div>
    <div class="btnrow right"><button class="btn primary big" data-a="next">${answered ? 'Continue \u2192' : 'Choose an answer'}</button></div>
  </div>`;
}
ACTS['check-ans'] = t => {
  if (S.checkAns != null) return;
  S.checkAns = +t.dataset.v;
  const b = curBeat();
  if (b.opts[S.checkAns].ok) { S.insight += (b.ins || 10); }
  repaint();
  paintTop();
};
ACTS['next'] = () => advance();

/* ---------------- report beat ---------------- */
function beatReport(b) {
  const rows = S.log.filter(x => x.ch === chapter().id);
  const total = rows.reduce((a, x) => a + x.profit, 0);
  const list = typeof b.list === 'function' ? b.list() : b.list;
  /* the last chapter always ends the game, whatever the mode selected */
  const last = S.chIdx >= S.chs.length - 1;
  const nextLabel = last ? 'Go to the debrief \u2192' : (b.btn || 'Next chapter \u2192');
  return `
  <div class="card fade">
    <div class="kicker">Chapter ${chapter().n} &middot; debrief</div>
    <h2>${beatTitle(b)}</h2>
    ${(b.paras || []).map(p => `<div class="narr">${p}</div>`).join('')}
    <div class="card tight" data-note="flat">
      ${rows.map(x => `<div class="scoreline"><span>${x.label}</span><b class="${x.profit >= 0 ? '' : 'bad'}">${money(x.profit, 0)}</b></div>`).join('')}
      <div class="scoreline" style="border:none;font-weight:800"><span>Chapter ${chapter().n} total economic profit</span><b>${money(total, 0)}</b></div>
    </div>
    ${b.listTitle ? `<h3>${b.listTitle}</h3>` : ''}
    ${list && list.length ? `<ul class="clean">${list.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
    ${b.insight ? `<div class="card tight" data-note="blue"><div class="small"><b>Remember this:</b> ${typeof b.insight === 'function' ? b.insight() : b.insight}</div></div>` : ''}
    <div class="btnrow right"><button class="btn primary big" data-a="next">${nextLabel}</button></div>
  </div>`;
}

/* ============================================================
   DECISION BEAT
   ============================================================ */
function beatDecision(b) {
  if (b.kind === 'pc') return decPC(b);
  if (b.kind === 'mc') return decMC(b);
  if (b.kind === 'oligo') return decOligo(b);
  if (b.kind === 'mono') return decMono(b);
  if (b.kind === 'buyer') return decBuyer(b);
  return '';
}

/* Chart-first workspace: the diagram leads on the left; controls, live numbers
   and market position share a compact, sticky rail on the right. */
function decShell(b, ctl, out, chartViews, foot) {
  const brief = typeof b.brief === 'function' ? b.brief() : b.brief;
  const head = `
    <div class="kicker">Decision &middot; ${b.tag || chapter().title}</div>
    <h2>${typeof b.title === 'function' ? b.title() : b.title}</h2>
    <div class="narr">${brief}</div>
    ${b.context || ''}`;
  if (!chartViews) {
    return `
  <div class="card fade">${head}
    <div class="decwork decwork-nc">
      <div class="decmatrix">${out}</div>
      <aside class="decrail">${ctl}${foot || ''}</aside>
    </div>
  </div>`;
  }
  return `
  <div class="card fade">${head}
    <div class="decwork">
      <div class="decchart">${chartViews}</div>
      <aside class="decrail">${ctl}${out}${foot || ''}</aside>
    </div>
  </div>`;
}

/* ---------------- Chapter 1: perfect competition decisions ---------------- */
function decPC(b) {
  const P = S.dec.P, K = S.dec.K, L = S.dec.L;
  const Q = ECON.output(K, L), TR = P * Q, TC = ECON.tc(K, L), profit = TR - TC;
  const AC = L ? ECON.ac(K, L) : 0, MC = L ? ECON.mc(K, L) : 0;
  const best = ECON.bestL(K, P);
  if (S.locked) {
    const good = profit > 0;
    return `
    <div class="card ${good ? 'event good' : 'event bad'} fade">
      <div class="kicker">Result &middot; season ${b.season || ''}</div>
      <h2>${good ? 'A profitable season' : 'A season in the red'}</h2>
      <div class="tiles">
        <div class="tile hi"><div class="tl">Output</div><div class="tv">${fmt(Q, 1)}</div><div class="ts">units</div></div>
        <div class="tile"><div class="tl">Revenue</div><div class="tv">${money(TR)}</div><div class="ts">$${fmt(P, 0)} \u00d7 ${fmt(Q, 1)}</div></div>
        <div class="tile"><div class="tl">Total cost</div><div class="tv">${money(TC)}</div><div class="ts">AC = ${money(AC, 2)}</div></div>
        <div class="tile ${good ? 'pos' : 'neg'}"><div class="tl">${profitLabel(profit)}</div><div class="tv">${money(profit)}</div><div class="ts">added to firm value</div></div>
      </div>
      <div class="chartcard" data-view="dec-pc-chart"></div>
      ${b.after(profit, best)}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }
  const ctl = `
    <div class="ctl" style="margin-top:0">
      <div class="clab"><span class="t">Workers you hire this period</span><span class="v" data-slot="ctlL" data-keep-class="v" data-cls="v">${L}</span></div>
      ${sliderRow('dec-l', 0, ECON.maxL(K), 1, L, ticksFor(ECON.maxL(K)))}
    </div>`;
  /* data-slot marks the nodes whose TEXT or CLASS changes while a slider moves.
     softDecisionUpdate() copies only these; everything else in the card stays
     exactly as it is, which is what keeps the screen from flashing. */
  const out = `
    <div class="tiles" data-slot="out">
      <div class="tile hi"><div class="tl">Output</div><div class="tv">${fmt(Q, 1)}</div><div class="ts">${prod().unitPl} per period</div></div>
      <div class="tile"><div class="tl">Revenue</div><div class="tv">${money(TR)}</div><div class="ts">market price $${fmt(P, 0)}</div></div>
      <div class="tile"><div class="tl">Total cost</div><div class="tv">${money(TC)}</div><div class="ts">AC = ${L ? money(AC, 2) : '\u2014'}</div></div>
      <div class="tile ${profit >= 0 ? 'pos' : 'neg'}"><div class="tl">${profitLabel(profit)}</div><div class="tv">${money(profit)}</div><div class="ts">TR \u2212 TC</div></div>
      <div class="tile ${L && MC > P ? 'warn' : ''}"><div class="tl">MC</div><div class="tv">${L ? money(MC, 2) : '\u2014'}</div><div class="ts">${L ? (MC > P ? 'MC above price' : 'MC below price') : 'not producing'}</div></div>
    </div>`;
  const foot = `
    <div class="card tight" data-note="flat">
      <div class="small" style="font-weight:800">Your market position</div>
      <div class="scoreline"><span>Market price</span><b>$${fmt(P, 0)}</b></div>
      <div class="scoreline"><span>Your share of the town market</span><b>about ${fmt(Q / ECON.marketQ(P) * 100, 0)}%</b></div>
      <div class="scoreline"><span>Can you influence the price?</span><b>No</b></div>
      <div class="scoreline" style="border:none"><span>Fixed cost you pay anyway</span><b>${money(ECON.tfc(K))}</b></div>
      <div class="small muted" style="margin-top:.4rem">You are one of many identical sellers. The town's price is not yours to set.</div>
    </div>
    <div class="btnrow"><button class="btn primary wide big" data-a="dec-lock">Lock in the decision</button></div>`;
  return decShell(b, ctl, out, `<div class="chartcard" data-view="dec-pc-chart"></div>`, foot);
}

/* ---------------- monopolistic competition (chapter 3) ----------------
   THE FIRM'S OWN DEMAND CURVE, AND WHY IT IS WRITTEN AS TWO CONSTANTS.

   `q = (A − B·P) × mult`, where `mult` is the chapter's season multiplier times
   the advertising multiplier. It used to be written inline as `(120 − 2.2 * P)`
   in `mcFirm`, inverted by hand in `cfgMCFirm` (`54.55 − 0.4545·q/mult`), and
   again in the `dec-match` button — three copies of one curve, which is why the
   chart and the arithmetic could disagree without anyone noticing.

   `MC_K` is the set of plant sizes the decision panel actually offers. It used
   to be implicit: `bestMC()` searched K = 1…4 while the panel had **no capacity
   control at all**, so the "best available combination" it reported — and the
   profit it scored the student against — could name a plant the student was
   never able to buy. Measured at the launch season: bestMC returned $380 at
   K=2 against a reachable $338 at K=1, i.e. the scoring measured a $39 gap that
   could not be closed. Both the panel and the search now read this one list. */
const MC_DEMAND = { A: 120, B: 2.2 };
const MC_PRICE = { min: 24, max: 52 };
const MC_K = [1, 2];
const AD_LEVELS = [
  { v: 0, label: 'No advertising', spend: 0, mult: 1.0 },
  { v: 1, label: 'Local posters', spend: 140, mult: 1.40 },
  { v: 2, label: 'Full campaign', spend: 380, mult: 1.80 }
];
function mcFirm(K, P, mult, adSpend, L) {
  const qd = Math.max(0, (MC_DEMAND.A - MC_DEMAND.B * P) * mult);
  const qp = ECON.output(K, L);
  const sold = Math.min(qd, qp);
  const tc = ECON.tc(K, L) + adSpend;
  const tr = P * sold;
  return { qd, qp, sold, tc, tr, profit: tr - tc, lost: Math.max(0, qd - qp) };
}
/* PRODUCTION FOLLOWS FROM THE PRICE — IT IS NOT A SECOND DECISION.

   Asked for directly: "in the later decisions there should be no worker slider;
   everything should adjust automatically from the price, and let the curves do
   the talking. A given price corresponds to a given output, and the right number
   of workers follows from that — it is a detail the game should not be asking
   about here."

   That is also the correct economics. Once the price is set, the firm's output
   is whatever the demand curve says it can sell, capped by what the plant can
   physically make; the labour that produces it is an input requirement, not a
   choice. Asking the student to set it made them solve the production function a
   second time, and it put the one control that changes output at the bottom of a
   four-control panel.

   The worker slider stays in chapter 1 and in the lab, where choosing the crew
   IS the lesson — that is where the student discovers diminishing returns and
   where the peak of total product has to be found by hand. */
function mcAutoL(K, P, mult) {
  const qd = Math.max(0, (MC_DEMAND.A - MC_DEMAND.B * P) * mult);
  return ECON.labourFor(K, Math.min(qd, ECON.capacity(K)));
}
/* the two curves the chart draws, as functions of output */
function mcAR(q, mult) { return (MC_DEMAND.A - q / mult) / MC_DEMAND.B; }
function mcMR(q, mult) { return (MC_DEMAND.A - 2 * q / mult) / MC_DEMAND.B; }

/* WHERE THE FIRM STOPS — the output at which marginal revenue meets marginal
   cost, and the price the demand curve then supports.

   Solved on the same two functions the chart draws, so the marker on the chart
   can never float free of the curves it is supposed to sit on, and so it
   carries the season and advertising multipliers automatically: change the
   advertising budget and the equilibrium moves, because the demand curve it is
   read off has moved.

   MC is U-shaped here (the plant's marginal cost falls while the workers are
   under-used and rises once they are not), so MR can cross it twice. The
   profit-maximising point is the LAST crossing — the one where MR falls
   through MC from above — and that is the one returned. */
function mcEquilibrium(K, mult) {
  const cap = ECON.capacity(K);
  let found = null, prevQ = null, prevDiff = null;
  for (let q = 0.5; q <= cap; q += 0.5) {
    const L = ECON.labourFor(K, q);
    if (!isFinite(L)) break;
    const mc = ECON.mc(K, L);
    const diff = mcMR(q, mult) - mc;
    if (!isFinite(diff)) { prevQ = q; prevDiff = null; continue; }
    if (prevDiff !== null && prevDiff > 0 && diff <= 0) {
      let a = prevQ, b = q, fa = prevDiff;
      for (let i = 0; i < 40; i++) {
        const m = (a + b) / 2, Lm = ECON.labourFor(K, m);
        if (!isFinite(Lm)) break;
        const fm = mcMR(m, mult) - ECON.mc(K, Lm);
        if (!isFinite(fm)) break;
        if ((fa > 0) === (fm > 0)) { a = m; fa = fm; } else b = m;
      }
      const Q = (a + b) / 2, L2 = ECON.labourFor(K, Q);
      found = { Q, P: mcAR(Q, mult), mr: mcMR(Q, mult),
                mc: isFinite(L2) ? ECON.mc(K, L2) : Infinity, L: L2 };
    }
    prevQ = q; prevDiff = diff;
  }
  return found;
}
function decMC(b) {
  const K = S.dec.K, P = S.dec.P, ad = S.dec.ad, mult = S.dec.mult || 1;
  const adLv = AD_LEVELS[ad];
  /* the price decides how much the town will buy; the crew follows from it */
  const L = mcAutoL(K, P, mult * adLv.mult);
  const r = mcFirm(K, P, mult * adLv.mult, adLv.spend, L);
  if (S.locked) {
    const good = r.profit > 0;
    /* where MR crossed MC, read off the SAME demand curve the student's ad
       budget produced — so the comparison below moves when the advertising
       changes, which is the whole point of the chart's marker */
    const eq = mcEquilibrium(K, mult * adLv.mult);
    const eqProfit = eq ? mcFirm(K, eq.P, mult * adLv.mult, adLv.spend,
                                 ECON.labourFor(K, eq.Q)) : null;
    const gap = eq ? (eqProfit && isFinite(eqProfit.profit) ? r.profit - eqProfit.profit : null) : null;
    return `
    <div class="card ${good ? 'event good' : 'event bad'} fade">
      <div class="kicker">Result</div>
      <h2>${good ? 'Your version is selling' : 'A hard season'}</h2>
      <div class="tiles">
        <div class="tile"><div class="tl">Customers wanted</div><div class="tv">${fmt(r.qd, 1)}</div><div class="ts">at $${fmt(P, 0)}</div></div>
        <div class="tile"><div class="tl">You produced</div><div class="tv">${fmt(r.qp, 1)}</div><div class="ts">${r.lost > 0.05 ? '<b style="color:var(--bad)">' + fmt(r.lost, 1) + ' customers turned away</b>' : 'demand covered'}</div></div>
        <div class="tile"><div class="tl">Revenue</div><div class="tv">${money(r.tr)}</div><div class="ts">$${fmt(P, 0)} \u00d7 ${fmt(r.sold, 1)}</div></div>
        <div class="tile"><div class="tl">Costs</div><div class="tv">${money(r.tc)}</div><div class="ts">incl. ${money(adLv.spend)} advertising</div></div>
        <div class="tile ${good ? 'pos' : 'neg'}"><div class="tl">${profitLabel(r.profit)}</div><div class="tv">${money(r.profit)}</div><div class="ts">added to firm value</div></div>
        ${eq ? `<div class="tile hi"><div class="tl">Where MR = MC</div><div class="tv">${fmt(eq.Q, 1)} @ $${fmt(eq.P, 0)}</div><div class="ts">${gap === null ? 'the rule you were looking for' : (Math.abs(gap) <= 1 ? 'you found it' : money(eqProfit.profit) + ' there')}</div></div>` : ''}
      </div>
      <div class="chartcard" data-view="dec-mc-chart"></div>
      ${b.after(r, eq)}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }
  /* THE PANEL HAS ONE LEVER: THE PRICE.
     The rail used to stack price → advertising → capacity → workers, which put
     the worker slider FOURTH in a stack that made the rail about 1780px tall
     inside a 768px viewport. It is `position:sticky`, so it pinned to the top
     and its lower half could only be reached by scrolling the whole page to its
     end — reported from play as "the panel on the right is too low, you have to
     scroll to see the worker slider". The consequence was worse than a nuisance:
     output is what that slider set, so a player who never found it stayed at the
     starting crew of 6 and produced 35.9 units whatever price they chose, which
     reads as "the quantity is stuck at 35.9". (35.9 is `output(1, 6)` exactly.)

     Reordering fixed the findability; this goes further and removes the control
     altogether, because it should never have been a second decision. Set the
     price and the demand curve says how much the town buys; the crew is what it
     takes to make that, capped by the plant. The readout reports both numbers so
     the curves still do the talking, and the student is left with the one lever
     the chapter is actually about.

     The worker slider lives on in chapter 1 and in the lab, where finding the
     crew that maximises output IS the lesson. */
  const ctl = `
    <div class="ctl" style="margin-top:0">
      <div class="clab"><span class="t">Your price</span><span class="v" data-slot="ctlP" data-keep-class="v">$${fmt(P, 0)}</span></div>
      ${sliderRow('dec-p', MC_PRICE.min, MC_PRICE.max, 1, P, `<div class="ticks"><span>$${MC_PRICE.min}</span><span>$${(MC_PRICE.min + MC_PRICE.max) / 2}</span><span>$${MC_PRICE.max}</span></div>`)}
      <div class="small muted" data-slot="mcNote" style="margin-top:.3rem">At $${fmt(P, 0)} the town buys <b>${fmt(r.qd, 1)} units</b>, which your plant makes with <b>${fmt(L, 1)} workers</b>.${
        r.lost > 1
          ? ` <b style="color:var(--bad)">Your plant can only make ${fmt(ECON.capacity(K), 0)} \u2014 ${fmt(r.lost, 1)} customers are turned away at this price.</b>`
          : ''}</div>
    </div>
    <div class="ctlpair">
      <div class="ctl">
        <div class="clab"><span class="t">${Caps()} \u2014 the ceiling on output</span><span class="v">${K}</span></div>
        <div class="optrow" data-slot="mcK">${MC_K.map(k => `<button class="opt ${K === k ? 'sel' : ''}" data-a="dec-k" data-v="${k}">${k} ${k > 1 ? caps() : cap()}<small>${money(ECON.MACHINE * k)} / period \u00b7 up to ${fmt(ECON.capacity(k), 0)} units</small></button>`).join('')}</div>
      </div>
      <div class="ctl">
        <div class="clab"><span class="t">Advertising budget</span><span class="v" data-slot="mcAdV" data-keep-class="v">${money(adLv.spend)}</span></div>
        <div class="optrow" data-slot="mcAd">${AD_LEVELS.map(a => `<button class="opt ${ad === a.v ? 'sel' : ''}" data-a="dec-ad" data-v="${a.v}">${a.label}<small>${a.spend ? money(a.spend) + ' \u00b7 demand \u00d7' + fmt(a.mult, 2) : 'free'}</small></button>`).join('')}</div>
      </div>
    </div>`;
  /* NOTE: the MR = MC point is deliberately NOT shown while the student is
     still choosing — the brief asks them to find the price that earns the most,
     and marking the answer on the chart would turn that into a reading exercise.
     It appears on the outcome page (see the locked branch) and in the chart that
     goes with it, which is where it teaches rather than tells. */
  const out = `
    <div class="tiles" data-slot="out">
      <div class="tile hi"><div class="tl">Demand at your price</div><div class="tv">${fmt(r.qd, 1)}</div><div class="ts">your own demand curve</div></div>
      <div class="tile"><div class="tl">You can produce</div><div class="tv">${fmt(r.qp, 1)}</div><div class="ts">${r.lost > 0.05 ? '<b style="color:var(--bad)">' + fmt(r.lost, 1) + ' lost sales</b>' : 'all demand covered'}</div></div>
      <div class="tile"><div class="tl">Revenue</div><div class="tv">${money(r.tr)}</div><div class="ts">$${fmt(P, 0)} \u00d7 ${fmt(r.sold, 1)}</div></div>
      <div class="tile"><div class="tl">Costs</div><div class="tv">${money(r.tc)}</div><div class="ts">${L ? 'AC = ' + money(r.tc / r.qp, 2) : '\u2014'}</div></div>
      <div class="tile ${r.profit >= 0 ? 'pos' : 'neg'}"><div class="tl">${profitLabel(r.profit)}</div><div class="tv">${money(r.profit)}</div><div class="ts">TR \u2212 TC</div></div>
    </div>`;
  const foot = `
    <div class="card tight" data-note="flat">
      <div class="small" style="font-weight:800">Your market position</div>
      <div class="scoreline"><span>Product</span><b>${esc(prod().variants[S.dec.variant] || prod().variants[0])}</b></div>
      <div class="scoreline"><span>Number of rival ${sellers()}</span><b>many</b></div>
      <div class="scoreline"><span>Can you choose your price?</span><b style="color:var(--brand-d)">Yes \u2014 within limits</b></div>
      <div class="scoreline" style="border:none"><span>Do customers see you as unique?</span><b>Similar, not identical</b></div>
      <div class="small muted" style="margin-top:.4rem">Customers have a preference for your version \u2014 but a dozen other ${sellers()} sell something close enough. Your demand curve slopes downwards, and how far you can push the price depends on how different you really are.</div>
    </div>
    <div class="btnrow"><button class="btn primary wide big" data-a="dec-lock">Lock in the decision</button></div>`;
  return decShell(b, ctl, out, `<div class="chartcard" data-view="dec-mc-chart"></div>`, foot);
}
ACTS['dec-ad'] = t => { S.dec.ad = +t.dataset.v; res(); };
/* `dec-match` USED TO LIVE HERE. It set the crew to whatever matched demand —
   but production is no longer a decision the student makes, so the button that
   called it is gone and so is the action. Leaving the handler behind would keep
   telling the next reader that matching is something you do. */

/* ---------------- lock ----------------
   EVERY decision routes through here, which makes this the one place that can
   score a choice against what the choice was actually worth. scorePlay() writes
   the gap to the best available decision; 10-achievements.js reads it back and
   never has to guess where a number came from. */
ACTS['dec-lock'] = () => {
  const b = curBeat();
  S.locked = true;
  if (b.kind === 'pc') {
    const profit = ECON.profit(S.dec.K, S.dec.L, S.dec.P);
    const best = ECON.bestL(S.dec.K, S.dec.P);
    S.insight += (S.dec.L === best.L) ? 10 : 0;
    /* A season where every choice loses money still has a best answer: the
       smallest loss. The gap is measured against THAT, not against zero. */
    scorePlay(profit, best.profit, profit < 0
      ? `The best available move this season still lost ${money(-best.profit)} \u2014 you lost ${money(-profit)}.`
      : `Choosing ${best.L} workers would have made ${money(best.profit)} instead of ${money(profit)}.`);
    logRun(chapter().id, `${b.label || 'Season'} \u2014 price $${S.dec.P}`, profit);
    addValue(profit);
  } else if (b.kind === 'mc') {
    const adLv = AD_LEVELS[S.dec.ad];
    const mult = (S.dec.mult || 1) * adLv.mult;
    const r = mcFirm(S.dec.K, S.dec.P, mult, adLv.spend,
                     mcAutoL(S.dec.K, S.dec.P, mult));
    const best = bestMC(S.dec.mult || 1);
    if (Math.abs(r.profit - best.profit) <= 1) S.insight += 10;
    scorePlay(r.profit, best.profit,
      `The best available combination was ${best.adLabel.toLowerCase()} at $${fmt(best.P, 0)}: ${money(best.profit)}.`);
    logRun(chapter().id, `${b.label || 'Season'} \u2014 price $${fmt(S.dec.P, 0)}`, r.profit);
    addValue(r.profit);
  } else if (b.kind === 'oligo') {
    lockOligo(b);
  } else if (b.kind === 'mono') {
    lockMono(b);
  } else if (b.kind === 'buyer') {
    lockBuyer(b);
  }
  repaint();
  paintTop();
};

/* ---------------- scoring a single decision ----------------
   `gap` is how much profit was left on the table. It is recorded per beat so
   the badge layer can ask a question the ledger alone cannot answer: not "did
   you make money?" but "did you make the most of the choice you were given?".
   3 · why the number the student sees can never contradict the badge. */
function scorePlay(profit, best, why) {
  const gap = Math.max(0, best - profit);
  S.play = S.play || { picks: 0, perfect: 0, gap: 0, missed: 0 };
  S.play.picks++;
  S.play.gap += gap;
  if (gap <= 1) S.play.perfect++;
  else {
    S.play.missed++;
    const note = { gap: gap, best: best, got: profit, why: why, beat: S.beat, ch: S.chs[S.chIdx] };
    S.play.notes = (S.play.notes || []).concat([note]);
    if (typeof MF !== 'undefined' && MF.noteShortfall) MF.noteShortfall(note);
  }
}

/* The best a monopolistically-competitive decision could have done. Exhaustive
   over EXACTLY the grid the student is given — `MC_K` capacities, `AD_LEVELS`
   advertising budgets, `MC_PRICE` prices and every worker count — because a
   "best" that names an unselectable combination scores the student against a
   number they had no way of reaching. (It searched K = 1…4 while the panel had
   no capacity control at all: at the launch season that put the target $39
   above anything achievable.) Mirrors mcFirm() exactly, so it can never drift
   from the number on screen. */
function bestMC(mult) {
  let best = null;
  for (const K of MC_K) {
    for (let ad = 0; ad < AD_LEVELS.length; ad++) {
      const adLv = AD_LEVELS[ad];
      for (let P = MC_PRICE.min; P <= MC_PRICE.max; P++) {
        /* NO LOOP OVER LABOUR. The panel no longer offers it as a lever, and the
           lesson from round 11 was that the search and the panel have to offer
           exactly the same choices: a target the student cannot reach scores
           them against a number they had no way of producing. `mcAutoL` is the
           same call the panel makes. */
        const L = mcAutoL(K, P, mult * adLv.mult);
        const r = mcFirm(K, P, mult * adLv.mult, adLv.spend, L);
        if (!best || r.profit > best.profit + 1e-9) {
          best = { K: K, ad: ad, adLabel: adLv.label, P: P, L: L, profit: r.profit };
        }
      }
    }
  }
  return best;
}
/* the best the student could do WITHOUT advertising, at the same grid — the
   comparison the season-2 narration needs, derived rather than remembered */
function bestMCNoAd(mult) {
  let best = null;
  for (const K of MC_K) {
    for (let P = MC_PRICE.min; P <= MC_PRICE.max; P++) {
      const L = mcAutoL(K, P, mult);
      const r = mcFirm(K, P, mult, 0, L);
      if (!best || r.profit > best.profit + 1e-9) best = { K, P, L, profit: r.profit };
    }
  }
  return best;
}
/* STILL NEEDED: chapter 1's decision and the lab both drive the crew through
   this action. Only the monopolistically-competitive panel dropped it — there,
   and in every decision after chapter 1, the crew follows from the price. */
ACTS['dec-l'] = t => { S.dec.L = +t.value; res(); };
ACTS['dec-p'] = t => { S.dec.P = +t.value; res(); };
ACTS['dec-k'] = t => { S.dec.K = +t.dataset.v; res(); };
ACTS['dec-welfare'] = () => { S.dec.welfare = !S.dec.welfare; res(); };

/* ---------------- charts for decisions ---------------- */
VIEWS['dec-pc-chart'] = w => chart(cfgPCFirm(w, { K: S.dec.K, P: S.dec.P, L: S.dec.L, showProfit: true }));

function cfgMCFirm(w, o) {
  const K = o.K, mult = o.mult;
  const yMax = 76;
  const dem = [], mr = [], mc = [], ac = [];
  /* THE X-AXIS HAS TO COVER THE CURVES. It used to be a fixed 62, while the
     price slider runs down to $24 — where this firm's demand is 67 units — so
     the demand curve was drawn cut off before the cheapest price the student
     could charge, and there was nowhere to see the MR = MC crossing when the
     plant was large. The range now comes from the model: whatever demand
     reaches at the cheapest allowed price, or the plant's own ceiling,
     whichever is further right. */
  const qAtFloor = Math.max(0, (MC_DEMAND.A - MC_DEMAND.B * MC_PRICE.min) * mult);
  const qMax = Math.ceil(Math.max(qAtFloor, ECON.capacity(K)) * 1.02);
  for (let q = 0; q <= qMax; q += 1) {
    dem.push([q, mcAR(q, mult)]);
    mr.push([q, mcMR(q, mult)]);
  }
  /* the full rising branch of total product for this plant — `min(14, …)` used
     to truncate the curves for anything larger than a one-machine plant */
  for (let l = 1; l <= K * ECON.X_TPP; l++) {
    const q = ECON.output(K, l);
    if (q > 0 && q <= qMax) { mc.push([q, ECON.mc(K, l)]); ac.push([q, ECON.ac(K, l)]); }
  }
  const filter = a => a.filter(p => p[1] <= yMax && p[1] >= 0);
  const r = o.res;
  const shapes = [], points = [], hlines = [], vlines = [];
  /* ---- the equilibrium: where MR crosses MC, and the price that goes with it
     ----
     This is the "stop here" point the chapter talks about, and it was simply
     absent from the chart before: the student could read D, MR, MC and AC, but
     nothing on the diagram said where a profit-maximising firm would land, and
     changing the advertising budget moved both curves without any marker
     following them. It is computed from the same functions the curves are
     drawn from, so it moves with the ad multiplier automatically. */
  const eq = mult > 0 ? mcEquilibrium(K, mult) : null;
  if (o.showEq && eq && eq.Q > 0.5) {
    vlines.push({ x: eq.Q, color: PAL.violet, label: 'MR = MC' });
    points.push({ x: eq.Q, y: eq.mc, color: PAL.red, r: 4 });
    /* BELOW the point, not above: the student's own marker sits above its dot,
       and at a good answer the two are within a unit of each other — drawn on
       the same side the labels printed over each other ("you:53.8 unitsat$37"). */
    points.push({
      x: eq.Q, y: eq.P, color: PAL.violet, r: 6,
      label: `best: ${fmt(eq.Q, 1)} at $${fmt(eq.P, 0)}`, dy: 20, anchor: 'middle', dx: 0
    });
  }
  if (r && r.sold > 0.05) {
    const acHere = r.tc / r.qp;
    shapes.push({ type: 'rect', x0: 0, y0: Math.max(acHere, o.P), x1: r.sold, y1: Math.min(acHere, o.P), fill: r.profit >= 0 ? PAL.green : PAL.red, opacity: .17, stroke: r.profit >= 0 ? PAL.green : PAL.red, sw: 1.5, dash: '4 3' });
    points.push({ x: r.sold, y: o.P, color: PAL.ink, r: 6, label: `you: ${fmt(r.sold, 1)} units at $${fmt(o.P, 0)}`, dy: -11, anchor: 'middle', dx: 0 });
    /* a turned-away marker is only worth drawing when customers are actually
       being lost — at 0.2 units it was a dashed line through the picture and a
       label saying nothing, which is how noise gets mistaken for signal */
    if (r.lost > Math.max(1, 0.02 * r.qd)) {
      vlines.push({ x: r.qd, color: PAL.red, label: `${fmt(r.lost, 1)} customers turned away` });
    }
  }
  return {
    w, h: Math.round(Math.min(580, Math.max(360, w * 0.66))),
    x: [0, qMax], y: [0, yMax],
    xLabel: 'Your output q (units per period)', yLabel: 'Price / cost ($)',
    series: [
      { pts: filter(dem), color: PAL.green, width: 2.8, label: 'D = AR', area: .08 },
      { pts: filter(mr), color: PAL.violet, width: 2.4, label: 'MR', dash: '6 4' },
      { pts: filter(mc), color: PAL.red, width: 2.8, label: 'MC', labelDy: -10 },
      { pts: filter(ac), color: PAL.blue, width: 2.8, label: 'AC' }
    ],
    shapes, points, vlines, hlines
  };
}
VIEWS['dec-mc-chart'] = w => {
  const adLv = AD_LEVELS[S.dec.ad] || AD_LEVELS[0];
  const mult = (S.dec.mult || 1) * adLv.mult;
  const r = mcFirm(S.dec.K, S.dec.P, mult, adLv.spend, mcAutoL(S.dec.K, S.dec.P, mult));
  /* the MR = MC marker belongs to the DEBRIEF, not the decision: once the
     student has locked in, the chart should show them where a
     profit-maximising firm would have stopped, and that mark must move with
     the advertising they chose (it is read off the same demand curve). */
  return chart(cfgMCFirm(w, {
    K: S.dec.K, mult: (S.dec.mult || 1) * adLv.mult, P: S.dec.P, res: r,
    showProfit: true, showEq: !!S.locked
  }));
};

/* ============================================================
   CHAPTER 1 — PERFECT COMPETITION
   ============================================================ */
function pcStreet(n, closed) {
  const cells = [];
  for (let i = 0; i < n; i++) {
    cells.push({ label: i === 1 ? (S.firmName || 'You') : streetName(i), sub: i === 1 ? 'you' : 'rival', mine: i === 1, closed: closed && closed.indexOf(i) >= 0 });
  }
  return artStreet(prod(), S.colour, cells, { heading: `${n} ${sellers()} on the same street, all selling an identical ${prod().unit}` });
}

BEATS.pc = () => ([
  {
    t: 'intro',
    kicker: 'Chapter 1 \u00b7 Perfect Competition',
    title: 'A market where you are nobody',
    paras: [
      `Your workshop is one of five ${sellers()} on the same street. Every one of them sells the same ${prod().unit} in the same wrapper at the same price. Customers genuinely cannot tell them apart \u2014 and neither can you.`,
      `<b>There are hundreds of buyers and a handful of sellers, and no seller is big enough to matter.</b> Your output is a drop in the town's market. That makes you a <b>price taker</b>: the market fixes the price, and the only real decision left to you is how much to produce.`,
      `A rival copies your packaging, your logo and even your colour. In this market, that is not cheating \u2014 it is just what an identical product looks like.`
    ],
    art: () => pcStreet(5),
    bullets: [
      `<b>Fixed factors:</b> the workshop (${money(ECON.LAND)}) and one ${cap()} (${money(ECON.MACHINE)}) \u2014 <b>${money(ECON.tfc(1))}</b> per period, payable whatever you do.`,
      `<b>Variable factor you control:</b> workers at <b>${money(ECON.WAGE)}</b> each per period, plus materials at ${money(ECON.MAT)} per ${prod().unit}.`,
      `<b>Today's market price:</b> <b>$40</b> per ${prod().unit}.`,
      `<b>Your job:</b> choose how many workers to hire.`
    ],
    btn: 'Open for business \u2192'
  },
  {
    t: 'decision', kind: 'pc', tag: 'Your first season', label: 'Season 1', season: '1',
    setup: { P: 40, K: 1, L: 4 },
    title: 'Season one \u2014 the market price is $40',
    brief: `The price is given to you. Hire workers, produce, and find the output that makes the most profit.`,
    after: (profit, best) => `
      <div class="narr"><b>Where you stopped is the whole lesson.</b> Profit is highest where the cost of making one more ${prod().unit} (MC) is just equal to what the market pays for it ($40). Produce one unit more and MC climbs above the price \u2014 you would be adding cost faster than revenue.</div>
      <div class="card tight" data-note="amber">
        <div class="small"><b>Now notice what you could not do.</b> There was no price to choose. If you had raised your price to $45, every single customer would have walked next door and bought the identical ${prod().unit} for $40. Your demand curve is a flat horizontal line at the market price: <b>P = AR = MR</b>.</div>
      </div>`
  },
  {
    t: 'check',
    title: 'Can you simply charge more?',
    q: 'Your profit this season was positive. A friend suggests putting the price up to $45 to earn even more. What happens?',
    opts: [
      { t: `Sales rise \u2014 customers pay a premium for a well-run ${seller()}.`, ok: false, fb: `In this market customers cannot see any difference between the ${sellers()}. Nothing justifies a premium, because the product is homogeneous.` },
      { t: 'Sales collapse to zero \u2014 every rival still sells the identical product at $40.', ok: true, fb: 'Exactly. A price-taking firm faces a perfectly elastic demand curve. Charge one cent above the market price and you sell nothing at all; charge below it and you give away revenue you could have had. So you take the market price and choose only your output.' },
      { t: 'Sales fall a little, but you still make more profit.', ok: false, fb: 'That would be true for a firm with a downward-sloping demand curve \u2014 a firm whose product is differentiated. Not here.' }
    ]
  },
  {
    t: 'event', cls: 'warn', tag: 'Market event \u00b7 entry',
    title: 'Word gets out \u2014 and there are no barriers',
    paras: [
      `Your profit did not go unnoticed. Over the winter, three more ${sellers()} open on the same street.`,
      `<b>Nothing stops them.</b> A workshop lease, one ${cap()} and a few workers is all it takes: the technology is standard, the materials are available to anyone, and no licence protects you. In the language of economics, there are <b>no barriers to entry</b>.`,
      `The town\u2019s demand has not changed \u2014 but the same customers now have eight ${sellers()} to choose from. Sellers with stock to shift start cutting prices.`
    ],
    change: `<span class="pricetag"><span class="old">$40</span><span class="new">$22</span></span> <span class="delta down">market price falls by 45%</span>`,
    street: () => pcStreet(8),
    btn: 'Go to the market \u2192'
  },
  {
    t: 'decision', kind: 'pc', tag: 'Season 2', label: 'Season 2', season: '2',
    setup: { P: 22, K: 1, L: 4 },
    title: 'Season two \u2014 the price has collapsed to $22',
    brief: `The price is now below your average total cost. You cannot change that. Decide how much to produce.`,
    after: (profit, best) => `
      <div class="narr"><b>You lost ${money(-profit)}.</b> It is tempting to close the doors and produce nothing. Before you do, look at the arithmetic.</div>
      <div class="card tight" data-note="flat">
        <div class="scoreline"><span>Produce ${fmt(ECON.output(1, best.L), 1)} units \u2192 loss</span><b class="bad">${money(profit)}</b></div>
        <div class="scoreline" style="border:none"><span>Shut down, produce nothing \u2192 loss</span><b class="bad">${money(-ECON.tfc(1))}</b></div>
      </div>
      <div class="narr">Producing is the smaller loss. The rent and the ${cap()} lease must be paid either way \u2014 that is what makes them <b>fixed</b>. As long as the price covers <b>average variable cost</b>, every unit sold pays its own wages and materials and leaves something over towards the rent.</div>
      <div class="card tight" data-note="amber"><div class="small"><b>The shutdown price.</b> Below about <b>${money(ECON.minAVC(), 2)}</b> the price would no longer cover average variable cost, and the firm would be better off producing nothing at all.</div></div>`
  },
  {
    t: 'check',
    title: 'Should you shut down?',
    q: 'The price is $22 and you are making a loss. What is the rational decision?',
    opts: [
      { t: 'Shut down. No production means no loss.', ok: false, fb: `No \u2014 you would still owe ${money(ECON.tfc(1))} of fixed cost. Shutting down at this price makes the loss bigger, not smaller.` },
      { t: 'Keep producing \u2014 the price still covers average variable cost, so output reduces the loss.', ok: true, fb: `Correct. At $22 the price is above AVC (about ${money(ECON.minAVC(), 2)}), so every unit contributes something towards the fixed cost. Keep going. Shut down only when price falls below minimum AVC.` },
      { t: 'Raise the price to cover your costs.', ok: false, fb: 'You cannot raise the price. You are a price taker \u2014 that is the defining feature of this market.' }
    ]
  },
  {
    t: 'event', cls: 'good', tag: 'Market event \u00b7 exit',
    title: 'The shake-out \u2014 and why prices recover',
    paras: [
      'Two of your neighbours give up. They cannot cover their bills, so at the end of the season they close the workshop and walk away.',
      `<b>And there are no barriers to exit either.</b> The ${caps()} are leased, the workshop is rented by the season, and nobody can force them to keep producing. They simply leave.`,
      `Fewer sellers, and the same demand. On top of that, the new office park opens on the edge of town and more people want ${prod().unitPl}. Demand shifts outwards.`
    ],
    change: `<span class="pricetag"><span class="old">$22</span><span class="new">$34</span></span> <span class="delta up">market price recovers</span>`,
    street: () => pcStreet(8, [5, 7]),
    btn: 'Go to the market \u2192'
  },
  {
    t: 'decision', kind: 'pc', tag: 'Season 3', label: 'Season 3', season: '3',
    setup: { P: 34, K: 1, L: 4 },
    title: 'Season three \u2014 the price is back at $34',
    brief: 'The market has thinned out and demand has risen. The price is profitable again \u2014 but notice how much thinner the margin is than in your first season.',
    after: (profit, best) => {
      const s1 = ECON.bestL(1, 40).profit, s2 = ECON.bestL(1, 27).profit;
      return `
      <div class="narr">You are back in profit, but $${fmt(profit, 0)} is a long way short of your first season. <b>Competition has taken most of it.</b></div>
      <div class="card tight" data-note="flat">
        <div class="scoreline"><span>Season 1 at $40</span><b>${money(s1)}</b></div>
        <div class="scoreline"><span>Season 2 at $22</span><b class="bad">${money(s2)}</b></div>
        <div class="scoreline" style="border:none"><span>Season 3 at $34</span><b>${money(ECON.bestL(1, 34).profit)}</b></div>
      </div>
      <div class="narr">This is not bad luck. <b>Positive profit is a signal, and other firms can read it.</b> As long as there is profit to be had, someone will enter. Entry pushes the price down until the profit is gone.</div>`;
    }
  },
  {
    t: 'event', cls: 'warn', tag: 'Market event \u00b7 long run',
    title: 'The long run: profit is a magnet',
    paras: [
      `Two more ${sellers()} open. And two more. The price keeps sliding until it settles at <b>$${ECON.longRunP(1)}</b>.`,
      `At $${ECON.longRunP(1)}, the price equals the <b>lowest point of your average total cost curve</b>. Look at your own cost table: at ${fmt(ECON.minACL(1).q, 1)} ${prod().unitPl}, AC is ${money(ECON.minACL(1).ac, 2)} \u2014 the cheapest you can possibly make this product.`,
      'Your <b>economic profit is now zero</b>. Not an accounting loss \u2014 you still pay yourself, and you still cover every bill. But you earn exactly what your time and money could earn anywhere else. No more.'
    ],
    change: `<span class="pricetag"><span class="old">$34</span><span class="new">$${ECON.longRunP(1)}</span></span> <span class="delta down">converging on the minimum of average cost</span>`,
    art: w => `<div style="max-width:960px;margin:0 auto">${chart(Object.assign(cfgPCFirm(960, { K: 1, P: ECON.longRunP(1), L: ECON.minACL(1).L, showProfit: true, yMax: 74 }), { h: 420 }))}</div>`,
    btn: 'See what this means \u2192'
  },
  {
    t: 'report',
    title: 'What perfect competition did to you',
    paras: [
      'You never set a price. You never advertised. You never had an idea that customers could prefer. And yet the market produced a result that no single firm intended: a price that just covers the cost of production, and zero economic profit for everybody.'
    ],
    listTitle: 'Three things you should be able to explain now',
    list: [
      `<b>You are a price taker.</b> With a homogeneous product and many sellers, your demand curve is horizontal at the market price. Price = average revenue = marginal revenue.`,
      `<b>Profit attracts entry; entry destroys profit.</b> With no barriers to entry, positive profit pulls new firms in until price falls to the minimum of average cost. Losses drive firms out until price recovers.`,
      `<b>The long-run outcome is efficient.</b> P = MC (allocative efficiency: the last unit made is worth exactly what it costs) and output is at minimum AC (productive efficiency: it is made at the lowest possible average cost). The consumer gets the product at cost \u2014 and the firm gets nothing extra.`
    ],
    insight: 'Zero economic profit does not mean a bad business. It means you earn exactly the normal return available on your capital and labour anywhere else \u2014 which is precisely what competition delivers.',
    btn: 'Next: what if you were the only seller in town? \u2192'
  }
]);

/* ============================================================
   CHAPTER 2 onwards are defined in 06_chapters2.js
   ============================================================ */
