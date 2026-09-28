/* ============================================================
   MARKET FORCES — THE ACTION DOCK
   ------------------------------------------------------------
   The commit button ("Lock in the decision", "Submit answers")
   lives at the FOOT of its card. On a long card the student has
   to scroll to reach the one control the page was built around,
   which is the worst possible place for it.

   The dock does not move that button — moving it would break the
   card layout and the ARIA order. Instead it MIRRORS the button
   into a fixed bar whenever the real one is out of view, and
   forwards the click to the original. One source of truth for
   the handler, two places it can be pressed.

   Load order matters: this file is last, so SCENES / ACTS /
   taskSync all exist by the time it mounts.
   ============================================================ */

/* Which button is "the commit" for the scene currently on screen?
   Read straight out of the DOM rather than re-deriving it from state, so the
   dock can never disagree with what the card actually rendered. */
const DOCK_PRIMARY = [
  'dec-lock', 'lab-check-prod', 'lab-check-cost'
];
const DOCK_SECONDARY = ['lab-finish'];

function dockPick() {
  const app = q('#app');
  if (!app) return null;
  /* the LAST match wins: later in the DOM means lower in the card, which is
     where the commit button always sits */
  let hit = null;
  DOCK_PRIMARY.forEach(a => {
    const list = app.querySelectorAll('[data-a="' + a + '"]');
    if (list.length) hit = list[list.length - 1];
  });
  if (!hit || hit.disabled) return null;
  const sec = DOCK_SECONDARY
    .map(a => app.querySelector('[data-a="' + a + '"]'))
    .filter(n => n && !n.disabled)[0] || null;
  return { main: hit, sec: sec };
}

/* Is the real button already comfortably on screen? 44px of slack means a
   button peeking over the bottom edge still counts as "not visible", which is
   exactly the case the dock exists to cover.
   A zero-sized rect (display:none, a detached node, or an environment with no
   layout engine at all) must NOT read as "visible" — that would silently
   switch the dock off, which is the one failure mode with no visible symptom. */
function dockVisible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  const vh = window.innerHeight || 0;
  if (!vh) return false;
  return r.top >= 0 && r.bottom <= vh - 44;
}

function dockLabel(main) {
  const t = (main.textContent || '').trim();
  return t || 'Continue';
}

let dockEl = null;
function dockMount() {
  if (dockEl) return dockEl;
  dockEl = document.createElement('div');
  dockEl.className = 'actiondock';
  dockEl.setAttribute('role', 'region');
  dockEl.setAttribute('aria-label', 'Main action');
  document.body.appendChild(dockEl);

  /* Click forwarding. The original button carries the data-a hook, so rather
     than re-implementing the handler we synthesise a click on it — that keeps
     ACTS, analytics and any future listener in one place. */
  dockEl.addEventListener('click', e => {
    const x = e.target.closest('.ad-x');
    if (x) { dockSync(true); return; }
    const b = e.target.closest('[data-ad-go]');
    if (!b) return;
    const sel = b.getAttribute('data-ad-go');
    const pick = dockPick();
    const target = sel === 'sec' && pick ? pick.sec : (pick && pick.main);
    if (!target) return;
    /* let the visitor be who they are: pointer + click, no synthetic trust */
    target.click();
    /* the scene is about to change; hide immediately so the bar does not
       linger over the next card for a frame */
    dockHide();
  });
  return dockEl;
}

/* dismissed for the current beat only — advancing the game re-arms it */
let dockMuted = '';
function dockSync(mute) {
  /* ROUND 8 — SUPERSEDED BY THE BOTTOM HUD.
     js/12-hud.js now owns the commit button: it lives in the permanent
     bottom bar (css/48-hud-bar.css) instead of appearing and disappearing
     in a floating pill. That bar does the same job this one did — mirror the
     commit button while the real one is off-screen, forward the click — so
     running both would draw the same button twice.
     12-hud.js sets window.MF_HUD when it installs. Once it is there this
     module stands down: the listener stays attached (removing it would need
     a named handler and buys nothing) but every call returns immediately.
     MF_DOCK is still exported below, so the harness can still drive the old
     path in isolation if it ever needs to. */
  if (window.MF_HUD) return;
  const pick = dockPick();
  const el = dockMount();

  if (!pick) { dockHide(); return; }

  const id = (S.chIdx + ':' + S.beat + ':' + S.lab.tab);
  if (mute) { dockMuted = id; }

  const show = !dockVisible(pick.main) && dockMuted !== id;
  document.documentElement.classList.toggle('mf-dockup', !!show);

  if (!show) { dockHide(); return; }

  const label = dockLabel(pick.main);
  const secHTML = pick.sec
    ? `<button class="btn" data-ad-go="sec">${esc(dockLabel(pick.sec))}</button>`
    : '';
  const kick = pick.main.getAttribute('data-ad-kick')
    || (S.scene === 'lab' ? 'Ready when you are' : 'Your call');

  const html = `<span class="ad-txt"><span class="ad-k">${esc(kick)}</span>`
    + `<span class="ad-t">${esc(label)}</span></span>`
    + secHTML
    + `<button class="btn primary big" data-ad-go="main">${esc(label)}</button>`
    + `<button class="ad-x" title="Hide until this page changes" aria-label="Hide">\u2715</button>`;
  if (el.innerHTML !== html) el.innerHTML = html;
  el.classList.add('show');
}

function dockHide() {
  if (dockEl) dockEl.classList.remove('show');
  document.documentElement.classList.remove('mf-dockup');
}

/* Re-check on scroll and resize: the whole point is to react to where the real
   button is. rAF-throttled, because scroll fires far faster than paint. */
let dockTick = 0;
function dockQueue() {
  if (dockTick) return;
  dockTick = requestAnimationFrame(function () {
    dockTick = 0;
    dockSync();
  });
}

window.addEventListener('scroll', dockQueue, { passive: true });
window.addEventListener('resize', dockQueue);

/* MF export — the harness drives dockSync() directly. */
window.MF_DOCK = {
  sync: dockSync,
  hide: dockHide,
  pick: dockPick,
  visible: dockVisible
};
