/* ============================================================
   MARKET FORCES — THE BOTTOM HUD
   ------------------------------------------------------------
   Round 8:
     "做一个底栏，把顶栏的 Cash，Firm value，Insight 都放在这里，
      还有 tasks 和 check my answer。"

   WHY THIS REPLACES THE OLD ACTION DOCK
   -------------------------------------
   The old design had three pieces fighting for the same strip of screen:

     · css/44-action-dock.css — a pill that appeared only when the commit
       button had scrolled out of view, and hid itself again when it had not
     · js/07-tasks.js — a floating Tasks bubble pinned bottom-right
     · js/03-ui.js — the three counters, stranded in the top bar, far from
       anything that changes them

   The result was that the most important numbers in the game sat at the top
   of the screen, the most important buttons appeared and disappeared along
   the bottom, and the student had to track both. This file collapses all
   three into ONE permanent bar along the foot of the board:

     [ Cash · Firm value · Insight ............ Tasks · Submit · ⚙ ]

   Nothing here is conditional except the commit button, which is mirrored
   exactly as the old dock mirrored it — the real button stays where the card
   put it, and this shows a copy only while the real one is out of view.
   Everything else is always on screen, which is the point: a student can
   answer "how am I doing?" and "what am I supposed to do next?" by looking
   at one place, at any moment, in any scene.

   WHY IT IS NOT A CUT-AND-PASTE OF THE DOCK
   -----------------------------------------
   The dock lived outside the layout and never affected it. This bar is 4rem
   tall and permanently at the bottom, so it has to reserve space: the shell
   gets --hud-h of bottom padding, and .toast / .actiondock / the sticky
   decision bars are lifted clear of it. Getting that wrong is the one way
   this change could hide content, so the padding is measured at runtime
   (measureHud) rather than hard-coded — the bar wraps on narrow screens.

   LOAD ORDER: this file runs last (after 11-dock.js) so MF_DOCK, taskSync()
   and every ACTS entry already exist.
   ============================================================ */

(function () {
  'use strict';

  var bar = null;
  var live = {};

  function q0(s, r) { return (r || document).querySelector(s); }

  /* ------------------------------------------------------------------
     Which button is the commit for the scene on screen?
     Deliberately the SAME list the old dock used, read out of the DOM
     rather than re-derived from state, so the HUD can never disagree with
     what the card actually rendered.
     ------------------------------------------------------------------ */
  var COMMIT = ['dec-lock', 'lab-check-prod', 'lab-check-cost'];
  var COMMIT_SEC = ['lab-finish'];

  function pickCommit() {
    var app = q0('#app');
    if (!app) return null;
    /* the LAST match wins: later in the DOM means lower in the card, which is
       where the commit button always sits */
    var hit = null;
    COMMIT.forEach(function (a) {
      var list = app.querySelectorAll('[data-a="' + a + '"]');
      if (list.length) hit = list[list.length - 1];
    });
    if (!hit || hit.disabled) return null;
    var sec = COMMIT_SEC
      .map(function (a) { return app.querySelector('[data-a="' + a + '"]'); })
      .filter(function (n) { return n && !n.disabled; })[0] || null;
    return { main: hit, sec: sec };
  }

  /* Is the real button already comfortably on screen?
     The 44px slack means a button peeking over the bottom edge still counts
     as "not visible", which is exactly the case the mirror exists to cover —
     and now the slack also has to clear the HUD itself, so it is measured
     from the HUD's own top edge rather than the viewport floor. */
  function commitVisible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var vh = window.innerHeight || 0;
    if (!vh) return false;
    var floor = vh - (live.h || 0) - 24;
    return r.top >= 0 && r.bottom <= floor;
  }

  function label(el) {
    var t = (el.textContent || '').trim();
    return t || 'Continue';
  }

  /* ------------------------------------------------------------------
     build — the bar's skeleton, written once.
     The three counters are the only part that change value, so they are
     the only part updated per frame; rewriting the whole bar on every
     slider tick is what made the old badge flicker.
     ------------------------------------------------------------------ */
  function build() {
    bar = document.createElement('div');
    bar.className = 'hudbar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Firm dashboard');
    bar.innerHTML = ''
      + '<div class="hb-rule" aria-hidden="true"></div>'
      + '<div class="hb-in">'
      + '  <div class="hb-stats">'
      + '    <div class="hb-stat" data-k="cash">'
      + '      <span class="hb-ic"></span>'
      + '      <span class="hb-tx"><span class="hb-lab">Cash</span><b>—</b></span>'
      + '    </div>'
      + '    <div class="hb-stat" data-k="value">'
      + '      <span class="hb-ic"></span>'
      + '      <span class="hb-tx"><span class="hb-lab">Firm value</span><b>—</b></span>'
      + '    </div>'
      + '    <div class="hb-stat" data-k="insight">'
      + '      <span class="hb-ic"></span>'
      + '      <span class="hb-tx"><span class="hb-lab">Insight</span><b>—</b></span>'
      + '    </div>'
      + '  </div>'
      + '  <div class="hb-act">'
      /* The commit slot comes FIRST, before Tasks. Round 8 follow-up: with the
         button on the right, every time it appeared or disappeared the Tasks
         button slid sideways — a control that moves when you are aiming at it.
         It sits to the left now, and .hb-commit reserves its width even when
         empty, so nothing downstream ever shifts.
         The badge button is injected by 10-achievements.js as actRow.firstChild,
         so the visual order is: [badge] [commit] [Tasks] [gear]. */
      + '    <span class="hb-commit" aria-live="polite"></span>'
      + '    <button class="hb-tasks" data-a="task-open" aria-expanded="false">'
      + '      <span class="hb-ring"></span>'
      + '      <span class="hb-ttx"><b>Tasks</b><small>—</small></span>'
      + '    </button>'
      + '    <div class="hb-fs">'
      + '      <button class="hb-cog" data-a="hud-fs-open" title="Text size" aria-label="Text size">'
      + '        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 3.2v2.6M12 18.2v2.6M3.2 12h2.6M18.2 12h2.6M5.8 5.8l1.9 1.9M16.3 16.3l1.9 1.9M18.2 5.8l-1.9 1.9M7.7 16.3l-1.9 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
      + '      </button>'
      + '      <div class="hb-fsmenu" role="group" aria-label="Text size">'
      + '        <button class="fsbtn" data-a="fs" data-v="s" title="Smaller text">A</button>'
      + '        <button class="fsbtn" data-a="fs" data-v="m" title="Normal text">A</button>'
      + '        <button class="fsbtn" data-a="fs" data-v="l" title="Larger text">A+</button>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    /* Click forwarding for the mirrored commit button. The real button carries
       the data-a hook, so rather than re-implementing its handler we synthesise
       a click on it — one source of truth for the action, two places to press. */
    bar.addEventListener('click', function (e) {
      var go = e.target.closest && e.target.closest('[data-hb-go]');
      if (go) {
        var p = pickCommit();
        var target = go.getAttribute('data-hb-go') === 'sec' && p ? p.sec : (p && p.main);
        if (target) target.click();
        /* the scene is about to change; drop the commit button immediately so
           it does not linger over the next card for a frame */
        renderCommit(null);
        return;
      }
      /* the text-size menu is a popover; a click anywhere else closes it */
      if (!e.target.closest || !e.target.closest('.hb-fs')) closeFs();
    });

    document.addEventListener('click', function (e) {
      if (bar && e.target.closest && !e.target.closest('.hb-fs')) closeFs();
    });

    document.body.appendChild(bar);
    /* Announce. js/10-achievements.js hangs the badge button and the streak
       pill inside this bar; whichever of the two modules boots second would
       otherwise find an empty .hb-act and drop the decoration silently. */
    try {
      var ev = document.createEvent('Event');
      ev.initEvent('mf:hud', true, true);
      window.dispatchEvent(ev);
    } catch (e) {}
    return bar;
  }

  function closeFs() {
    if (bar) bar.classList.remove('fs-open');
  }
  window.MF_ACTS_FSOPEN = true;

  /* ------------------------------------------------------------------
     render — the numbers.
     Called from paintTop() and from softDecisionUpdate(), i.e. every time
     the firm's position could have moved.
     ------------------------------------------------------------------ */
  var MEDALS = { cash: 'coin', value: 'bars', insight: 'lamp' };

  function renderStats(force) {
    if (!bar) return;
    var vals = {
      cash: money(S.cash),
      value: money(S.value),
      insight: String(S.insight)
    };
    ['cash', 'value', 'insight'].forEach(function (k) {
      var cell = bar.querySelector('.hb-stat[data-k="' + k + '"]');
      if (!cell) return;
      var v = vals[k];
      /* the icon is a struck-brass medallion and is IDENTICAL for all three
         scenes — it is built once and only replaced when the icon set itself
         changes (which is never, per page). Rewriting it every frame would
         restart the SVG and make the bar shimmer on a slider drag. */
      if (!cell.dataset.ic) {
        cell.dataset.ic = '1';
        var ic = cell.querySelector('.hb-ic');
        if (ic) ic.innerHTML = micon(MEDALS[k]);
      }
      var b = cell.querySelector('b');
      if (b && b.textContent !== v) b.textContent = v;
      if (k === 'value') {
        var pos = S.value >= 0;
        if (cell.classList.contains('pos') !== pos) {
          cell.classList.toggle('pos', pos);
          cell.classList.toggle('neg', !pos);
        }
      }
    });
  }

  /* the Tasks button: ring + count, mirroring what the FAB used to show */
  function renderTasks() {
    if (!bar) return;
    var btn = bar.querySelector('.hb-tasks');
    if (!btn) return;
    var m = null;
    try { m = taskBody(); } catch (e) { m = null; }
    if (!m) { btn.classList.add('hb-off'); return; }
    btn.classList.remove('hb-off');
    var allDone = m.total > 0 && m.allDone;
    var sub = m.total === 0 ? 'nothing to do' : (allDone ? 'all done' : m.open + ' of ' + m.total + ' done');
    var ring = btn.querySelector('.hb-ring');
    if (ring) ring.innerHTML = ringSVG(m.open, m.total, 30);
    var small = btn.querySelector('small');
    if (small && small.textContent !== sub) small.textContent = sub;
    btn.classList.toggle('quiet', m.total === 0 || allDone);
    var expanded = document.getElementById('taskoverlay');
    btn.setAttribute('aria-expanded',
      expanded && expanded.classList.contains('show') ? 'true' : 'false');
  }

  /* the commit button — only while the real one is out of view */
  var mutedKey = '';
  function renderCommit(force) {
    if (!bar) return;
    var slot = bar.querySelector('.hb-commit');
    if (!slot) return;
    var p = pickCommit();
    if (!p) { clearSlot(slot); return; }
    var key = (S.chIdx + ':' + S.beat + ':' + (S.lab && S.lab.tab));
    if (force === 'mute') mutedKey = key;
    if (commitVisible(p.main) || mutedKey === key) { clearSlot(slot); return; }
    var lbl = label(p.main);
    var secHTML = p.sec
      ? '<button class="hb-sec" data-hb-go="sec">' + esc(label(p.sec)) + '</button>'
      : '';
    var html = secHTML
      + '<button class="btn primary hb-go" data-hb-go="main">' + esc(lbl) + '</button>';
    if (slot.innerHTML !== html) slot.innerHTML = html;
    bar.classList.add('commit-up');
  }
  function clearSlot(slot) {
    if (slot.innerHTML) slot.innerHTML = '';
    bar.classList.remove('commit-up');
  }

  /* ------------------------------------------------------------------
     measure — the bar reserves its own height.
     `--hud-h` drives the shell's bottom padding, the toast's offset and the
     lift on the sticky decision bars. Measured, never guessed: this bar
     wraps to three rows on a phone.
     ------------------------------------------------------------------ */
  function measureHud() {
    if (!bar) return;
    var h = bar.getBoundingClientRect().height;
    if (!(h > 0)) return;
    live.h = h;
    document.documentElement.style.setProperty('--hud-h', h.toFixed(1) + 'px');
  }

  /* ------------------------------------------------------------------
     install
     ------------------------------------------------------------------ */
  var installed = false;
  function install() {
    if (installed) return true;
    if (!window.MF || !MF.S) return false;
    installed = true;

    build();

    /* 1 · every full header redraw also refreshes the HUD. paintTop() is a
       property copy of the closure-local function (see the note in
       10-achievements.js), so the real hook is the ACTS table for anything
       that does not go through the exported MF.paintTop. We wrap both. */
    var innerPaint = MF.paintTop;
    if (typeof innerPaint === 'function') {
      MF.paintTop = function () {
        var r = innerPaint.apply(MF, arguments);
        sync();
        return r;
      };
    }

    /* 2 · the scenes that repaint without touching paintTop */
    ['lab-tab', 'lab-check-prod', 'lab-check-cost', 'lab-finish', 'dec-lock',
      'task-open', 'task-close', 'task-jump'].forEach(function (k) {
      var inner = MF.ACTS[k];
      if (typeof inner !== 'function' || inner.__mfHud) return;
      MF.ACTS[k] = function () {
        var r = inner.apply(this, arguments);
        sync();
        return r;
      };
      MF.ACTS[k].__mfHud = true;
    });

    /* 3 · the text-size cog. Same handler the top bar used — the setting
       lives in html[data-fs] and nothing else changes. */
    MF.ACTS['hud-fs-open'] = function (t, e) {
      if (e) e.stopPropagation();
      if (!bar) return;
      bar.classList.toggle('fs-open');
    };

    /* 4 · revealCharts() / scrollIntoView move the page without a resize;
       re-check on scroll, rAF-throttled because scroll fires far faster
       than paint */
    var tick = 0;
    function queue() {
      if (tick) return;
      tick = requestAnimationFrame(function () { tick = 0; renderCommit(); });
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { measureHud(); queue(); });

    /* 5 · the first paint happens before this file loads, so seed now */
    sync();
    return true;
  }

  function sync() {
    renderStats();
    renderTasks();
    renderCommit();
    measureHud();
  }

  /* MF export — the harness drives these directly */
  window.MF_HUD = {
    sync: sync,
    stats: renderStats,
    tasks: renderTasks,
    commit: renderCommit,
    pick: pickCommit,
    visible: commitVisible,
    el: function () { return bar; }
  };

  /* boot: MF is built in 08-end.js, which runs before this file */
  if (!install()) {
    /* MF should always exist by now, but a defensive retry costs nothing and
       turns a silent no-HUD into a working one a frame later */
    requestAnimationFrame(function () { install(); });
  }
})();
