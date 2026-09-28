/* ============================================================
   MARKET FORCES — THE TASK SYSTEM
   ------------------------------------------------------------
   One registry decides three things that used to disagree:
     1. what the student is being asked to do in this section
     2. whether the section may be left (the exit gate)
     3. what the side rail shows
   If a task is not in here, it cannot block progress; if it is in
   here, it always blocks progress. There is no second rulebook.
   ============================================================ */

/* ---- helpers: the "correct answers" the lab tasks are chasing ---- */
function labPeerL(kind) {
  const K = S.lab.K;
  const low = kind === 'ac' || kind === 'avc';
  let best = 1, v = low ? Infinity : -Infinity;
  const top = ECON.maxL(K);
  for (let l = 1; l <= top; l++) {
    const y = kind === 'mp' ? ECON.mp(K, l)
      : kind === 'ap' ? ECON.ap(K, l)
        : kind === 'ac' ? ECON.ac(K, l) : ECON.avc(K, l);
    if (low ? y < v : y > v) { v = y; best = l; }
  }
  return best;
}

/* ---- the lab's four tasks, two per tab. Every one is required. ---- */
const LAB_TASKS = [
  {
    id: 'p_mp', group: 'production', reward: 10,
    label: 'Set workers so that <b>marginal product is at its maximum</b>.',
    hint: 'Watch the MP column as you add workers — it rises, turns, then falls.',
    met: () => S.lab.L === labPeerL('mp'),
    why: () => `Marginal product peaks at worker ${labPeerL('mp')}: one more worker adds more output than any other hire does.`
  },
  {
    id: 'p_ap', group: 'production', reward: 10,
    label: 'Set workers so that <b>average product is at its maximum</b>.',
    hint: 'That is exactly where AP = MP.',
    met: () => S.lab.L === labPeerL('ap'),
    why: () => `Average product peaks at worker ${labPeerL('ap')} — the point where the marginal worker is exactly as productive as the average.`
  },
  {
    id: 'c_minac', group: 'costs', reward: 10,
    label: 'Set workers to the level that <b>minimises average total cost</b>.',
    hint: 'Follow the AC column down, then up again.',
    met: () => S.lab.L === labPeerL('ac'),
    why: () => `Average cost bottoms out at worker ${labPeerL('ac')}. Either side of it, a unit costs more to make.`
  },
  {
    id: 'c_shut', group: 'costs', reward: 10,
    label: 'Set workers to the level that <b>minimises average variable cost</b>.',
    hint: 'The AC curve is still falling here — that is the AFC at work.',
    met: () => S.lab.L === labPeerL('avc'),
    why: () => `Average variable cost bottoms out at worker ${labPeerL('avc')}. Below that price there is nothing left to gain by producing, so this is the shutdown price.`
  }
].map(t => Object.assign(t, {
  /* "ok" is the submitted result: the student has confirmed it with Submit answers */
  ok: () => !!S.lab.missions[t.id],
  required: true
}));

/* ---- the tasks attached to whatever chapter beat is on screen ---- */
function beatTasks() {
  const b = curBeat();
  if (!b) return [];
  const id = 'beat:' + (S.chs[S.chIdx] || 'pc') + ':' + S.beat;
  const mk = (label, hint, done) => [{ id, label, hint, ok: done, met: done, required: true, reward: 0 }];
  if (b.t === 'decision') {
    return mk(b.taskLabel || 'Lock in your decision.',
      b.taskHint || 'Move the sliders until the numbers look right, then lock it in.',
      () => S.locked);
  }
  if (b.t === 'check') {
    return mk('Answer the question.',
      'There is a right answer — and a reason for it.', () => S.checkAns != null);
  }
  if (b.t === 'intro') {
    const chs = typeof b.choices === 'function' ? b.choices() : b.choices;
    if (chs && chs.length) {
      return mk('Choose how your firm will respond.',
        'Pick one of the options to carry on.', () => S.pick != null);
    }
  }
  return [];
}

/* ---- the section: what the rail is looking at right now ---- */
function sectionKey() {
  if (S.scene === 'lab') return 'lab:' + S.lab.tab;
  if (S.scene === 'chapter') return 'ch:' + (S.chs[S.chIdx] || 'pc') + ':' + S.beat;
  return S.scene;
}
function sectionTasks() {
  if (S.scene === 'lab') return LAB_TASKS.filter(t => t.group === S.lab.tab);
  if (S.scene === 'chapter') return beatTasks();
  return [];
}
/* everything that must be finished before this section can be left.
   For the lab that is every task in the factory, not just the tab you happen to be on. */
function gateTasks() {
  if (S.scene === 'lab') return LAB_TASKS;
  if (S.scene === 'chapter') return beatTasks();
  return [];
}
function gateMissing() { return gateTasks().filter(t => t.required && !t.ok()); }
function gateOpen() { return gateMissing().length > 0; }
function gateMessage() {
  const m = gateMissing();
  if (!m.length) return '';
  if (S.scene === 'lab') {
    const other = m.filter(t => t.group !== S.lab.tab);
    const here = m.filter(t => t.group === S.lab.tab);
    if (!here.length && other.length) return `Still open: ${other.length} task${other.length > 1 ? 's' : ''} in the other tabs of the factory.`;
  }
  return `Not finished yet: ${m[0].label.replace(/<[^>]+>/g, '')}`;
}

/* ============================================================
   THE PANEL ITSELF
   A floating gold card. Collapsed it is a badge in the corner; expanded it sits
   over the middle of the screen. It is never part of the page grid, so opening
   or closing it cannot change the width of anything the student is reading.
   ============================================================ */
function taskCount(tasks) { return { done: tasks.filter(t => t.ok()).length, total: tasks.length }; }

function taskStateOf(t) {
  if (t.ok()) return 'ok';
  if (t.met && t.met()) return 'armed';
  return 'open';
}

function taskItemHTML(t, i) {
  const state = taskStateOf(t);
  let hint = t.hint;
  /* The old wording here was "press Check my answers to bank it", which asked
     the student to decode a metaphor before they could act. "Submit" is the
     word they already use for exactly this move in every other piece of
     schoolwork, and the tag now names the STATE the task is in rather than a
     transaction they have to interpret. */
  if (state === 'armed') hint = 'Looks right \u2014 press <b>Submit answers</b> to send it in.';
  else if (state === 'ok' && t.why) hint = t.why();
  const tag = state === 'ok' ? '<span class="tp-tag ok">submitted</span>'
    : state === 'armed' ? '<span class="tp-tag armed">ready to submit</span>'
      : (t.reward ? `<span class="tp-tag open">+${t.reward} Insight</span>` : '');
  return `<div class="tp-item ${state}">
    <span class="tp-num">${state === 'ok' ? '\u2713' : i + 1}</span>
    <div class="tp-body"><div class="tp-lab">${t.label}${tag}</div>${hint ? `<div class="tp-hint">${hint}</div>` : ''}</div>
  </div>`;
}

function taskBody() {
  if (S.scene === 'lab') {
    const cur = S.lab.tab;
    const mine = LAB_TASKS.filter(t => t.group === cur);
    const c = taskCount(mine), all = taskCount(LAB_TASKS);
    const groups = Object.keys(LABTABS).map(g => {
      const cc = taskCount(LAB_TASKS.filter(t => t.group === g));
      /* NB: `cc` is { done:<count>, total }. Spreading it and then re-declaring
         `done` as a boolean silently clobbers the count, and the row rendered
         "false/2" instead of "0/2". The all-done flag therefore gets its own
         key (`complete`); `done` stays a number. */
      return { g, label: LABTABS[g].label.replace(/^\d+ \u00b7 /, ''), ...cc, complete: cc.done === cc.total, here: g === cur };
    });
    return {
      open: c.done, total: c.total,
      allDone: all.done === all.total,
      kick: 'The Factory \u00b7 ' + LABTABS[cur].label.replace(/^\d+ \u00b7 /, ''),
      items: mine.map(taskItemHTML).join(''),
      groups,
      notebook: {
        label: LABTABS[cur].label.replace(/^\d+ \u00b7 /, ''),
        known: labNotebookCount(S.lab.K),
        total: ECON.maxL(S.lab.K) + 1
      },
      groupNote: all.done === all.total
        ? 'Every task in the factory is done \u2014 the gate is open.'
        : `The gate opens once all ${all.total} factory tasks are done. ${all.total - all.done} still to go.`,
      note: c.done === c.total ? 'This tab is finished.' : 'Find each one, then press Submit answers to send them in.',
      jump: c.done === c.total ? null : 'Go to the next unfinished tab'
    };
  }
  const tasks = sectionTasks();
  if (!tasks.length) {
    if (S.scene !== 'chapter') return null;
    return {
      open: 0, total: 0, allDone: true,
      kick: 'This step',
      items: '<div class="tp-item"><div class="tp-body"><div class="tp-hint">Nothing to decide here \u2014 read on, then continue.</div></div></div>',
      note: '', jump: null, groups: null
    };
  }
  const c = taskCount(tasks);
  return {
    open: c.done, total: c.total,
    allDone: c.done === c.total,
    kick: S.scene === 'chapter' ? 'This step' : 'Tasks',
    items: tasks.map(taskItemHTML).join(''),
    groups: null,
    note: c.done === c.total ? 'Step complete \u2014 carry on.' : 'Finish this and the Continue button will let you through.',
    jump: null
  };
}

/* a small progress ring for the floating badge.
   The count in the middle is the one number a student glances at, so the ring
   and its type were both scaled up: at 30px the 12-unit text rendered at about
   10.6px on screen (12 × 30/34), which is unreadable at the back of a room. */
function ringSVG(done, total, size) {
  const R = 13, C = 2 * Math.PI * R;
  const frac = total ? Math.min(1, done / total) : 1;
  const col = total === 0 ? '#94A3B8' : (done === total ? '#0B825F' : '#8A6100');
  return `<svg class="tf-ring" width="${size}" height="${size}" viewBox="0 0 34 34" aria-hidden="true">
    <circle cx="17" cy="17" r="${R}" fill="none" stroke="rgba(74,50,0,.18)" stroke-width="4"/>
    <circle cx="17" cy="17" r="${R}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"
      stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 17 17)"/>
    <text x="17" y="22" text-anchor="middle" font-size="16" font-weight="800" fill="${col}">${total ? done : '\u2014'}</text>
  </svg>`;
}

function taskFabHTML(m) {
  const quiet = m.total === 0 || m.allDone;
  const label = m.total === 0 ? 'Nothing to do' : (m.allDone ? 'All done' : `${m.open} of ${m.total} done`);
  return `${ringSVG(m.open, m.total, 38)}
    <span class="tf-txt"><b>Tasks</b><small>${label}</small></span>`;
}

function taskPanelHTML(m) {
  const pct = m.total ? Math.round(m.open / m.total * 100) : 100;
  const bk = m.notebook;
  const book = bk ? `
    <div class="tp-book">
      <div class="tbrow"><span>Your notebook \u00b7 ${bk.label}</span><b>${bk.known} / ${bk.total}</b></div>
      <div class="tp-bar"><i style="width:${Math.round(bk.known / bk.total * 100)}%"></i></div>
      <div class="tbnote">${bk.known >= bk.total
      ? '\u2713 Every crew size tested \u2014 the whole curve is on the charts.'
      : 'A row only fills in once you have actually stopped on that crew size. Drag the slider (or use the + / \u2212 buttons) and let go.'}</div>
      ${bk.known >= bk.total ? '' : '<div class="btnrow" style="margin-top:.55rem"><button class="btn wide" data-a="lab-reveal">Reveal the whole table</button></div>'}
    </div>` : '';
  const groups = m.groups ? `
    <div class="tp-groups">
      ${m.groups.map(g => `<div class="tp-group${g.complete ? ' done' : ''}">
        <span class="tp-gn">${g.label}${g.here ? ' <span class="tp-tag open">you are here</span>' : ''}</span>
        <span class="tp-gp">${g.complete ? '\u2713 ' : ''}${g.done}/${g.total}</span></div>`).join('')}
      <div class="tp-hint" style="margin-top:.4rem">${m.groupNote}</div>
    </div>` : '';
  return `
    <span class="tp-grain" aria-hidden="true"></span>
    <span class="tp-fox a" aria-hidden="true"></span>
    <span class="tp-fox b" aria-hidden="true"></span>
    <span class="tp-fox c" aria-hidden="true"></span>
    <span class="tp-rosettes" aria-hidden="true"></span>
    <span class="tp-margin" aria-hidden="true"></span>
    <div class="tp-head">
      <span class="tp-crest">${uicon("trophy")}</span>
      <div class="tp-title">
        <div class="tp-kick">Tasks \u00b7 ${m.kick}</div>
        <h3>${m.total ? `${m.open} of ${m.total} done` : 'Nothing to decide here'}</h3>
      </div>
      <button class="tp-close" data-a="task-close" title="Close (Esc)">\u2715</button>
    </div>
    <div class="tp-bar"><i style="width:${pct}%"></i></div>
    <div class="tp-barlab"><span>${m.allDone ? 'Complete' : 'In progress'}</span><span>${pct}%</span></div>
    ${book}
    <div class="tp-list">${m.items}</div>
    ${groups}
    <div class="tp-foot">
      <div class="tp-note">${m.note}</div>
      ${m.jump ? `<button class="btn primary" data-a="task-jump">${m.jump} \u2192</button>` : ''}
    </div>`;
}

/* ---- sync: called after every render, and after every live lab update ---- */
/* The two turned-brass rollers that clamp the sheet. They are children of the
   overlay (see the note in taskSync) and are positioned against the panel by
   CSS, so this only has to keep them present.

   ROUND 9, second pass. Keeping them present was not enough: the CSS had to
   GUESS the panel's box, because the rods live on the overlay while the panel
   is a flex child whose height is decided by its content (`max-height:86vh`,
   but usually shorter). A guess based on 86vh put the bottom roller well below
   a short sheet — the user's complaint that it "不在羊皮纸的末端".

   There is no CSS way to read a sibling's height, so the rods are measured
   into place instead: the panel's own bounding box is taken in viewport
   coordinates, converted to an offset from the overlay's centre — which is
   where the overlay's flexbox has put the panel — and published as two custom
   properties. `offsetHeight` is read only after the panel has been written, so
   this runs once per real change rather than per frame. The measurement is
   cheap (two reads) and idempotent, and if the panel is hidden or has no box
   the class is simply dropped and the CSS fallback takes over. */
function syncRods(ov) {
  if (!ov) return;
  ['r-top', 'r-bot'].forEach(cls => {
    if (!ov.querySelector('.tp-rod.' + cls)) {
      const rod = document.createElement('span');
      rod.className = 'tp-rod ' + cls;
      rod.setAttribute('aria-hidden', 'true');
      ov.appendChild(rod);
    }
  });
  fitRods(ov);
}

/* Measure the sheet and pin the rollers to its head and fore-edge.
   Deliberately read-only against layout: no style is written before both
   rects have been taken, so this cannot cause a layout thrash loop. */
function fitRods(ov) {
  const panel = q('#taskpanel');
  const rods = qa('.tp-rod', ov);
  if (!panel || !rods.length) return;
  /* rotated/zero box (closed sheet, print, a test harness with no layout) —
     leave the CSS fallback in charge rather than pinning to nonsense */
  if (!panel.offsetWidth || !panel.offsetHeight) {
    rods.forEach(r => r.classList.remove('mf-rod-fit'));
    return;
  }
  /* ---- AND WHY THE *LAYOUT* BOX IS USED INSTEAD, AS OF ROUND 11 ----
     `getBoundingClientRect()` reports the box AFTER transforms, and the sheet's
     open animation IS a transform:
         .taskpanel            { transform: translateY(8px) scale(.985) }
         .taskoverlay.show .taskpanel { transform: none }   (180ms)
     syncRods() is called in the same tick that adds `show`, so the measurement
     above was taken on the ANIMATING box and the rollers were pinned to a
     rectangle that stopped existing 180ms later. Measured with
     `_tools/probe_roller.py` (CDP-set viewport, boxes and picture in one
     coordinate space):
         top roller    mid - panel.top    = +13.2 px   (should be 0)
         bottom roller mid - panel.bottom = -33.2 px   (should be 0)
     The bottom roller therefore sat 33px inside the sheet and its brass was
     drawn across the title/crest at the head and across the footer's note and
     button at the foot. It also explains why this survived several rounds of
     assertions: every check compared the rollers with the same animating box
     they had been fitted to.

     `offsetTop` / `offsetLeft` / `offsetWidth` / `offsetHeight` are LAYOUT
     values and ignore transforms entirely, so measuring with them cannot be
     fooled by the animation. They are also the right units for the CSS that
     consumes them: an absolutely positioned child resolves `top`/`left` against
     its containing block's PADDING box, and `offset*` is likewise measured from
     the offsetParent's padding box. `--mf-rod-y` is consumed as
     `top: calc(50% + var(--mf-rod-y))`, where `50%` is half the padding-box
     height — i.e. `ov.clientHeight / 2`, which is why that is used below
     rather than `or.height` (the two differ the moment the overlay gains a
     border, and the border-box reading is the one that would be wrong). */
  const half = ov.clientHeight / 2;
  const E_top = panel.offsetTop;
  const E_bot = panel.offsetTop + panel.offsetHeight;
  /* THE ARITHMETIC, because getting it wrong is invisible until you measure.
     A rod's own `top` is `calc(50% + var(--mf-rod-y))`, so its midpoint is:

         mid = clientHeight / 2 + var(--mf-rod-y) + ROD_H / 2      (ROD_H = 34)

     We want that midpoint to sit exactly ON the paper's edge, i.e. on
     `panel.offsetTop` — so, writing `E` for the edge and `half` for
     `clientHeight / 2`:

         half + y + 17 = E
         y = E - half - 17

     The `- 17` is the half-rod that hangs below the midpoint, and it is the
     term that is easy to drop: leaving it out puts both rollers 17px inside
     the sheet, and adding it instead of subtracting puts them 26px outside.
     The bottom rod uses the mirrored edge and is negated because it is
     anchored with `bottom:` rather than `top:`. */
  const ROD_H = 34;
  const yTop = E_top - half - ROD_H / 2;
  const yBot = E_bot - half + ROD_H / 2;
  ov.style.setProperty('--mf-rod-y', yTop.toFixed(1) + 'px');
  ov.style.setProperty('--mf-rod-by', (yBot * -1).toFixed(1) + 'px');
  /* THE HORIZONTAL AXIS, and why it cannot be done in CSS.
     The overlay is full-bleed and the panel is centred inside it by flexbox,
     so `left:0` on a rod means the VIEWPORT's left edge, not the paper's.
     Centring the rod with `left:0;right:0;margin:auto` looks like it works
     and does not: a rod is wider than its containing block by design (it
     overhangs the paper at both ends), and CSS resolves `margin:auto` to ZERO
     the moment the free space goes negative — so the rod fell back to the
     left edge and sat 203px wide of the sheet while every vertical check
     still passed. Measured: rod l=-39.3 r=913.3 against a panel centred at
     l=203 r=1077 — a clean, silent, one-sided shift.
     So the offset is measured, exactly like the vertical one: the rod's
     centre must land on the panel's centre, published as a left offset from
     the overlay's own padding-box left edge — which is what `left` resolves
     against for an absolutely positioned child, and what `offsetLeft` is
     measured from. (The scale in the open animation is about the panel's
     centre, so it leaves the centre where it is; using the layout value here
     is for consistency with the vertical axis rather than a further fix.) */
  const cx = panel.offsetLeft + panel.offsetWidth / 2;
  ov.style.setProperty('--mf-rod-cx', cx.toFixed(1) + 'px');
  rods.forEach(r => r.classList.add('mf-rod-fit'));

  /* ROUND 11 — a `--mf-foot-h` used to be published here, so `.tp-groups`
     could reserve room for a `position:sticky` footer that would otherwise be
     painted over the last row. That reserve was a workaround for the pin; the
     pin itself is gone (`.tp-foot` is the sheet's last block in normal flow
     now — see css/46-task-scroll.css), so there is nothing left to reserve
     room from and the measurement is no longer taken. Removing a sticky
     element cost less than keeping a measured constant in sync with a box
     that no longer overlaps anything. */
}

function taskSync() {
  const fab = q('#taskfab'), ov = q('#taskoverlay'), panel = q('#taskpanel');
  if (!fab || !ov || !panel) return;
  const m = taskBody();

  if (!m) {
    fab.className = 'taskfab hide';
    ov.className = 'taskoverlay';
    S.task.key = '';
    return;
  }

  const key = sectionKey();
  if (S.task.key !== key) {
    S.task.key = key;
    const firstTime = !S.task.seen[key];
    S.task.seen[key] = 1;
    /* open it the first time a section is met so the tasks actually get read;
       never re-open it on a section the student has already seen */
    S.task.open = (m.total > 0 && firstTime);
  }

  fab.className = 'taskfab' + ((m.total === 0 || m.allDone) ? ' quiet' : '');
  fab.setAttribute('data-total', String(m.total));
  ov.className = 'taskoverlay' + (S.task.open ? ' show' : '');
  fab.setAttribute('aria-expanded', S.task.open ? 'true' : 'false');
  /* only touch the DOM when something really changed, so the badge never
     flickers while a slider is being dragged */
  const fabFresh = taskFabHTML(m);
  if (fab.innerHTML !== fabFresh) fab.innerHTML = fabFresh;
  const panelFresh = taskPanelHTML(m);
  if (panel.innerHTML !== panelFresh) panel.innerHTML = panelFresh;
  /* ROUND 9 — THE RODS LIVE ON THE OVERLAY, NOT ON THE SCANNING PANEL.
     `.taskpanel` is `overflow:auto`, and a scrolling box clips absolutely
     positioned children at its padding box. A rod at `bottom:-21px` is
     therefore cut off entirely — the sheet ended in a torn edge with brass
     only along the top. (The top rod survived only because `top:-21px` still
     fell inside the box's own overflow rect on the first paint.)
     The overlay does not scroll, so the rollers are mounted there and pinned
     to the panel's box with the CSS below. They are decoration: if the panel
     is absent there is nothing to clamp, hence the guard. */
  syncRods(ov);
  watchPanelBox(ov, panel);
}

/* ROUND 11 — THE ROLLERS WERE BEING FITTED TO A BOX THAT NO LONGER EXISTED.

   syncRods() runs at the end of taskSync(), in the very tick that puts the
   `show` class on the overlay. That is the tick the sheet's open transition
   STARTS in, and that transition is `translateY(8px) scale(.985)` → `none`
   over 180ms. `getBoundingClientRect()` includes transforms, so fitRods was
   measuring the sheet MID-ANIMATION and pinning the rollers to a box that
   stopped existing 180ms later.

   Measured with `_tools/probe_roller.py` — CDP-set viewport, so the boxes and
   the picture finally share one coordinate space:

       panel          63.0 .. 837.0
       top roller     59.2 ..  93.2   mid 76.2   should be  63.0
       bottom roller 786.8 .. 820.8   mid 803.8  should be 837.0

   Both are out; the bottom one lands 16.2px INSIDE the sheet's foot, which is
   what laid its brass across the footer's note (6.3px of overlap) and across
   the "Go to the next unfinished tab" button (17.3px) — the same class of
   collision round 9 fixed at the foot, and the reason the rollers have felt
   "off" for several rounds while every vertical assertion still passed. The
   assertions passed because they were checked against the same mid-animation
   box the rollers were fitted to; only a measurement taken after the sheet
   settled could see it.

   So the fit is now re-run whenever the panel's box really changes:
     · `transitionend` — the open/close animation finishing;
     · `ResizeObserver` — content growth (the factory checklist is taller once
       its rows exist) and viewport changes.

   Neither can feed back: fitRods writes only custom properties on the
   OVERLAY, never anything that can resize the panel. */
function watchPanelBox(ov, panel) {
  if (!panel || panel.__mfBoxWatch) return;
  panel.__mfBoxWatch = 1;
  panel.addEventListener('transitionend', e => {
    if (e.target === panel && e.propertyName === 'transform') fitRods(ov);
  });
  if (typeof ResizeObserver === 'function') {
    /* the first callback fires on observe(), which also covers the case where
       the sheet is already open and already settled when this is installed */
    new ResizeObserver(() => fitRods(ov)).observe(panel);
  }
}

function openTasks(force) { S.task.open = force == null ? true : force; taskSync(); }

ACTS['task-open'] = () => openTasks(true);
ACTS['task-close'] = () => openTasks(false);
ACTS['task-scrim'] = (t, e) => { if (e && e.target === t) openTasks(false); };
ACTS['task-jump'] = () => {
  const miss = gateMissing().filter(x => x.group)[0];
  if (miss) {
    if (miss.group) S.lab.tab = miss.group;
  }
  openTasks(false);
  repaint();
};

/* award the insight the moment a lab task is submitted */
function awardLabTask(id) {
  const t = LAB_TASKS.filter(x => x.id === id)[0];
  if (!t || S.lab.missions[id]) return 0;
  S.lab.missions[id] = 1;
  S.insight += t.reward;
  return t.reward;
}
