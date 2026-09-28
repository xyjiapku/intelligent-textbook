/* ============================================================
   MARKET FORCES — v4 achievements and streak layer

   Loaded after 08-end.js (window.MF exists) and after 09-plates.js.

   Design rules for this file:
     · It ADDS a layer; it never rewrites the economic engine. Every unlock is
       derived by reading state the engine already keeps (S.log, S.lab.missions,
       S.insight, S.value, S.dec), so a badge can never disagree with the
       numbers the student saw.
     · The one hook with real leverage is logRun(), because every profitable
       outcome in the game — all four chapters, the oligopoly rounds, the
       monopoly fine — already funnels through it. Wrapping that single function
       gives us chapter, label and profit for the whole run.
     · Badges are awarded lazily (checked on every repaint and after every
       settlement) rather than at the moment they are earned, so a rule change
       can never strand a badge.
     · Nothing here is required for the game to run. Remove the <script> tag
       and play is bit-for-bit what it was.
   ============================================================ */
(function () {
  'use strict';

  var BASE = 'assets/';

  /* Achievements are kept in one table so the badge cabinet, the unlock toast
     and the debrief wall all read from a single source. `test` receives the
     whole stash and returns a boolean; `want` is the human-readable condition
     shown while the badge is still locked. */
  var BADGES = [
    {
      id: 'first_ledger', icon: 'ledger', tone: 'ink',
      t: 'First Entry', want: 'Settle your first season.',
      d: 'You have opened the ledger and lived with one decision.',
      test: function (a) { return a.seasons >= 1; }
    },
    {
      id: 'in_the_black', icon: 'coin', tone: 'gold',
      t: 'In the Black', want: 'End a season with a positive profit.',
      d: 'A season that paid for itself.',
      test: function (a) { return a.bestSeason > 0; }
    },
    {
      id: 'lab_reader', icon: 'flask', tone: 'indigo',
      t: 'Read the Floor', want: 'Crack both factory missions.',
      d: 'You found peak marginal product and peak average product at the bench.',
      test: function (a) { return a.labProd && a.labCosts; }
    },
    {
      id: 'curve_breaker', icon: 'curve', tone: 'teal',
      t: 'Curve Breaker', want: 'Bank every factory task.',
      d: 'Production and cost curves both mapped on your own numbers.',
      test: function (a) { return a.labAll; }
    },
    {
      id: 'price_taker', icon: 'shop', tone: 'ink',
      t: 'One of Many', want: 'Complete the perfect competition chapter.',
      d: 'You took the market price and made the most of a market with no power in it.',
      test: function (a) { return a.chDone.pc; }
    },
    {
      id: 'price_maker', icon: 'crown', tone: 'gold',
      t: 'Price Maker', want: 'Complete the monopoly chapter.',
      d: 'You set the price, restricted the output, and watched the deadweight loss appear.',
      test: function (a) { return a.chDone.mono; }
    },
    {
      id: 'differentiator', icon: 'star', tone: 'violet',
      t: 'Differentiator', want: 'Complete the monopolistic competition chapter.',
      d: 'You made the product yours — and found out how quickly that rent gets competed away.',
      test: function (a) { return a.chDone.mc; }
    },
    {
      id: 'strategist', icon: 'chess', tone: 'teal',
      t: 'Strategist', want: 'Complete the oligopoly chapter.',
      d: 'You played the rival, not the market.',
      test: function (a) { return a.chDone.oligo; }
    },
    {
      id: 'streak3', icon: 'flame', tone: 'gold',
      t: 'Three in a Row', want: 'Bank three profitable seasons back to back.',
      d: 'Three consecutive seasons in the black.',
      test: function (a) { return a.bestStreak >= 3; }
    },
    {
      id: 'streak5', icon: 'flame2', tone: 'gold',
      t: 'Snowball', want: 'Bank five profitable seasons back to back.',
      d: 'Five on the trot. The compounding did the rest.',
      test: function (a) { return a.bestStreak >= 5; }
    },
    {
      id: 'curious', icon: 'lamp', tone: 'indigo',
      t: 'Curious', want: 'Collect 10 Insight points.',
      d: 'Ten points of "why did that happen?"',
      test: function (a) { return a.insight >= 10; }
    },
    {
      id: 'scholar', icon: 'lamp2', tone: 'violet',
      t: 'Scholar', want: 'Collect 20 Insight points.',
      d: 'You did not just play the market, you read it.',
      test: function (a) { return a.insight >= 20; }
    },
    {
      id: 'play_perfect', icon: 'shield', tone: 'teal',
      t: 'Perfect Play', want: 'Maximise profit in every single decision.',
      d: 'Not one choice left money on the table \u2014 you found the best available answer every time you were asked.',
      /* STRICT, for the same reason the old Clean Sheet badge was: this is a
         claim about the whole run, so it is re-tested against the decision
         record every time it is read. A cached award would survive the very
         choice that disproves it.

         Reads the decisions you were GIVEN, not the money you made. The old
         "no losing season" rule was unwinnable by construction: perfect
         competition's second season loses money at every worker count, so even
         a flawless player finished in the red and the badge could never be
         earned. The oligopoly rounds stay IN the test \u2014 the rival's move is a
         coin toss, but your reply to it is a real decision, and a game whose
         whole subject is strategic interdependence should not hand out an
         exemption from its own hardest choices. */
      strict: true,
      test: function (a) { return a.play.given >= 5 && a.play.missed === 0; }
    },
    {
      id: 'shutdown_rule', icon: 'anvil', tone: 'crimson',
      t: 'Shutdown Rule', want: 'Keep producing through a season that cannot be saved.',
      d: 'You kept the doors open when the price fell below average total cost but stayed above average variable cost \u2014 and lost less than closing would have cost you.',
      /* The single hardest idea in the perfect-competition chapter, and the one
         students get wrong most often: at $27 the firm is losing money, and
         producing anyway is still the right answer. The test is deliberately
         narrow \u2014 it fires only on the losing season, and only if the loss was
         kept smaller than the fixed cost that shutting down would have meant. */
      test: function (a) { return a.shutdownHeld; }
    },
    {
      id: 'recovered', icon: 'anvil', tone: 'crimson',
      t: 'Back to the Anvil', want: 'Bank a profit after a losing season.',
      d: 'You took the loss, understood it, and traded your way back.',
      test: function (a) { return a.recoveries >= 1; }
    },
    {
      id: 'mogul', icon: 'crown2', tone: 'gold',
      t: 'Market Mogul', want: 'Finish with the top rank.',
      d: 'You found the profitable ground in every market and kept it.',
      test: function (a) { return a.rank === 'MARKET MOGUL'; }
    },
    {
      id: 'full_campaign', icon: 'map', tone: 'ink',
      t: 'Full Journey', want: 'Settle a season in all four market structures.',
      d: 'Four structures, one firm, one continuous ledger.',
      test: function (a) {
        return !!(a.chLanded.pc && a.chLanded.mono && a.chLanded.mc && a.chLanded.oligo);
      }
    }
  ];

  /* ---------------- badge artwork ----------------
     Drawn inline rather than loaded, so a badge can never 404 and the cabinet
     stays sharp at any text size the student picks. */
  var ART = {
    ledger: '<path d="M6 4h9l4 4v12H6z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15 4v4h4M8.5 12h7M8.5 15h4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
    coin: '<circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.4v7.2M9.8 10.4h3.6a1.9 1.9 0 0 1 0 3.8h-3" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    flask: '<path d="M10 4h4v5l4 8a2.4 2.4 0 0 1-2.1 3.4H8.1A2.4 2.4 0 0 1 6 17l4-8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 15h9" stroke="currentColor" stroke-width="1.5"/>',
    curve: '<path d="M4 19V5M4 19h15" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 16.5q5-11 13-8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="13" cy="11.4" r="1.9" fill="currentColor"/>',
    shop: '<path d="M4.5 10 6 5h12l1.5 5c0 1.9-1.3 3-2.9 3-1 0-1.9-.5-2.4-1.4-.5.9-1.3 1.4-2.2 1.4s-1.7-.5-2.2-1.4c-.5.9-1.4 1.4-2.4 1.4C5.8 13 4.5 11.9 4.5 10z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 13v6.5h12V13" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    crown: '<path d="M4 8.5l3.6 3.2L12 5.5l4.4 6.2L20 8.5 18.6 18H5.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    star: '<path d="M12 4.6l2.5 5.2 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    chess: '<circle cx="12" cy="7.5" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.6 19c0-3.4 1.5-5.4 3.4-5.4S15.4 15.6 15.4 19z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 19h11" stroke="currentColor" stroke-width="1.7"/>',
    flame: '<path d="M12 3.5c3 4 5.4 6.2 5.4 9.6a5.4 5.4 0 0 1-10.8 0c0-3.4 2.4-5.6 5.4-9.6z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 11c1.4 1.6 2.2 2.7 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.3.8-2.4 2.2-4z" fill="currentColor" opacity=".55"/>',
    flame2: '<path d="M12 3.2c3.4 4.4 6 6.9 6 10.6a6 6 0 0 1-12 0c0-3.7 2.6-6.2 6-10.6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.4c1.7 1.9 2.7 3.3 2.7 4.8a2.7 2.7 0 0 1-5.4 0c0-1.5 1-2.9 2.7-4.8z" fill="currentColor" opacity=".6"/><path d="M9 5.5l-2-2M15 5.5l2-2" stroke="currentColor" stroke-width="1.4"/>',
    lamp: '<path d="M8 15.5 10 6h4l2 9.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 18.5h5M12 15.5V19" stroke="currentColor" stroke-width="1.5"/><path d="M12 3.6v1.6M6.4 6.2l1.1 1.1M17.6 6.2l-1.1 1.1" stroke="currentColor" stroke-width="1.4"/>',
    lamp2: '<circle cx="12" cy="10" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.4v1.8M12 15.8V18M4.3 10h1.8M17.9 10h1.8M6.5 4.5l1.3 1.3M17.5 4.5l-1.3 1.3" stroke="currentColor" stroke-width="1.5"/><path d="M9.6 21h4.8" stroke="currentColor" stroke-width="1.6"/>',
    shield: '<path d="M12 3.4 19 6v6c0 4.4-2.9 7.6-7 8.6-4.1-1-7-4.2-7-8.6V6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 12.1l2.4 2.4 4.1-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    anvil: '<path d="M4 9.5h9.5c.6 0 1 .5.7 1l-1.3 2.1c-.5.9-1.4 1.4-2.4 1.4H8.5v2.6h-3v-2.6C5 14 4 12.9 4 11.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14.5 10.6h4.2M6.4 17.6h9.2" stroke="currentColor" stroke-width="1.5"/>',
    crown2: '<path d="M3.6 8l4 3.6L12 4.8l4.4 6.8 4-3.6L18.8 19H5.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="4.8" r="1.5" fill="currentColor"/><path d="M4.4 21h15.2" stroke="currentColor" stroke-width="1.4"/>',
    map: '<path d="M4 6.5 9 5l6 1.5L20 5v12l-5 1.5L9 17l-5 1.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 5v12M15 6.5v12" stroke="currentColor" stroke-width="1.4"/>'
  };

  /* ---------------- the state stash ----------------
     Everything the badge tests read. Rebuilt from engine state on demand so
     there is exactly one place where our numbers come from. */
  function compute() {
    var S = MF.S;
    var log = (S.log || []).slice();
    var best = 0, loss = 0, cur = 0, bestStreak = 0, recov = 0, prevLoss = false;
    log.forEach(function (x) {
      var p = +x.profit || 0;
      if (p > best) best = p;
      if (p < 0) { loss++; cur = 0; prevLoss = true; }
      else {
        cur++;
        if (cur > bestStreak) bestStreak = cur;
        if (prevLoss) { recov++; prevLoss = false; }
      }
    });
    /* Chapter completion is read off the LEDGER, not off S.chs. S.chs is the
       list of chapters this run WILL include — a student who answers one
       question in chapter 1 has all four ids in S.chs and would otherwise
       collect every chapter badge before playing any of them. A chapter counts
       as played only once a settlement for it exists in the log. */
    var chLanded = {};
    log.forEach(function (x) { if (x.ch) chLanded[x.ch] = true; });
    var mis = (S.lab && S.lab.missions) || {};
    var rank = 'SURVIVOR';
    try { rank = MF.rankOf(S.value).t; } catch (e) {}
    /* --- the decision record ------------------------------------------------
       S.play is written by scorePlay() at the moment of every lock-in
       (js/05-chapters.js). Read it back defensively: a run started before this
       layer existed has no S.play, and a missing field must read as "nothing
       claimed" rather than throwing. */
    var play = (S.play && typeof S.play === 'object') ? S.play : {};
    var given = +play.picks || 0;
    var missed = +play.missed || 0;
    /* --- the shutdown decision ----------------------------------------------
       The one beat where the right answer is to accept a loss. Identified by
       its own economics rather than by a hard-coded season number, so the rule
       keeps working if the price ladder is ever retuned: a settlement in the
       perfect-competition chapter that lost money, but lost less than the fixed
       cost of producing nothing. */
    var shutdownHeld = false;
    log.forEach(function (x) {
      if (x.ch !== 'pc') return;
      var p = +x.profit || 0;
      if (p >= 0) return;
      var fixed = -ECON.tfc(1);
      if (p > fixed) shutdownHeld = true;
    });
    return {
      seasons: log.length,
      bestSeason: best,
      losses: loss,
      bestStreak: bestStreak,
      recoveries: recov,
      insight: +S.insight || 0,
      value: +S.value || 0,
      play: { given: given, missed: missed, gap: +play.gap || 0, perfect: +play.perfect || 0 },
      shutdownHeld: shutdownHeld,
      fines: MF.finesTotal ? MF.finesTotal() : (+S.fines || 0),
      /* The mission keys must match the ids registered in LAB_TASKS
         (js/07-tasks.js): p_mp / p_ap / c_minac / c_shut. They used to be
         written as c_ac / c_avc here, which never appear in S.lab.missions,
         so labCosts was permanently false and both cost-side badges were
         unreachable even after the student banked all four tasks. */
      labProd: !!(mis['p_mp'] && mis['p_ap']),
      labCosts: !!(mis['c_minac'] && mis['c_shut']),
      labAll: (function () {
        /* "every factory task" = both groups marked done, which the engine
           already exposes as S.lab.__finished after the costs tab is cleared */
        return !!(S.lab && S.lab.__finished);
      })(),
      chLanded: chLanded,
      chDone: chLanded,
      chs: (S.chs || []).length,
      rank: rank
    };
  }

  /* Badges that have already fired this run, and the ones the student has seen
     in this tab. Kept on MF so a repaint cannot lose them. */
  function store() {
    if (!MF.__ach) MF.__ach = { got: {}, seen: {}, queue: [] };
    return MF.__ach;
  }

  var BADGE_BY_ID = {};
  BADGES.forEach(function (b) { BADGE_BY_ID[b.id] = b; });

  /* Earned set.
     Two kinds of badge live in one table:
       · ordinary  — awarded the first time the condition holds and kept. Right
                     for "you did this once" claims (first ledger, a 5-streak).
       · strict    — a claim about the FINISHED run (Clean Sheet). Re-tested on
                     every read and withdrawn if it stops holding, because a
                     cached award would survive the very loss that disproves it.
     Everything downstream (cabinet, wall, counters) goes through here, so the
     two kinds can never disagree with each other. */
  function earnedSet() {
    var st = store(), a = compute(), out = {};
    BADGES.forEach(function (b) {
      if (b.strict) {
        var ok = false;
        try { ok = !!b.test(a); } catch (e) { ok = false; }
        if (ok) st.got[b.id] = 1; else delete st.got[b.id];
        if (ok) out[b.id] = 1;
      } else if (st.got[b.id]) {
        out[b.id] = 1;
      }
    });
    return out;
  }
  function earnedCount() { return Object.keys(earnedSet()).length; }

  function award() {
    var st = store(), a = compute(), fresh = [];
    BADGES.forEach(function (b) {
      if (b.strict) return;          /* strict badges are shown, not announced */
      if (st.got[b.id]) return;
      var ok = false;
      try { ok = !!b.test(a); } catch (e) { ok = false; }
      if (ok) { st.got[b.id] = 1; fresh.push(b); }
    });
    if (fresh.length) {
      st.queue = st.queue.concat(fresh);
      drain();
    }
    return fresh;
  }

  /* Toast the queue one at a time so two badges earned in the same settlement
     do not overwrite each other on screen.

     WHY THIS HAS ITS OWN HOST. The unlock used to be appended to `#toast`, the
     game's own message bar. That element is `opacity:0; visibility:hidden`
     until it carries `.show`, and both of those apply to its children — so the
     badge toast was invisible even on the runs where `award()` did fire, and it
     inherited the bar's off-screen translate on top of that. It gets its own
     fixed layer now: nothing about the game's toasts can hide it, and nothing
     about it can hold the game's toasts open.

     NON-BLOCKING BY CONSTRUCTION. The layer and the toast body are both
     `pointer-events:none`, so the only thing that accepts a click is the ✕.
     A badge appearing mid-decision therefore cannot swallow a press on the
     controls behind it, and the toast leaves on its own if it is ignored. */
  var draining = false;
  function unlockHost() {
    var host = document.getElementById('mf-unlock-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'mf-unlock-host';
      document.body.appendChild(host);
    }
    /* sit just above the real bottom bar rather than a guessed 3.4rem — the
       bar grows when its flyout is open and on narrow screens */
    var hud = document.querySelector('.hudbar');
    if (hud) host.style.setProperty('--mf-hud-h', hud.offsetHeight + 'px');
    return host;
  }
  function drain() {
    if (draining) return;
    var st = store();
    if (!st.queue.length) return;
    draining = true;
    var b = st.queue.shift();
    showUnlock(b, function () {
      draining = false;
      setTimeout(drain, 300);
    });
  }

  function showUnlock(b, done) {
    var host = unlockHost();
    var el = document.createElement('div');
    el.className = 'mf-unlock tone-' + (b.tone || 'ink');
    el.innerHTML =
      '<span class="mf-unlock-art">' + badgeSVG(b, 26) + '</span>' +
      '<span class="mf-unlock-tx">' +
        '<span class="mf-unlock-k">Badge earned</span>' +
        '<span class="mf-unlock-t">' + esc(b.t) + '</span>' +
        '<span class="mf-unlock-d">' + esc(b.d) + '</span>' +
      '</span>' +
      '<button class="mf-unlock-x" type="button" aria-label="Dismiss this badge">\u2715</button>';
    host.appendChild(el);

    var gone = false, timer = null;
    function close() {
      if (gone) return;
      gone = true;
      if (timer) clearTimeout(timer);
      el.classList.add('mf-out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (done) done();
      }, 600);
    }
    /* long enough to read a title and a line of description, short enough that a
       queue of badges never becomes a wall; the ✕ is there for sooner */
    timer = setTimeout(close, 6500);
    var x = el.querySelector('.mf-unlock-x');
    if (x) x.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); close();
    });
  }

  function badgeSVG(b, size) {
    size = size || 30;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true">'
      + (ART[b.icon] || ART.ledger) + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------------- the cabinet ----------------
     A panel listing every badge, earned or not, so the student can see what is
     left. Opens from the top bar; shows the streak on the same sheet. */
  function cabinetHTML() {
    var st = store(), a = compute(), got = earnedSet();
    var n = Object.keys(got).length;
    var cards = BADGES.map(function (b) {
      var on = !!got[b.id];
      return '<div class="mf-badge ' + (on ? 'on tone-' + b.tone : 'off') + '">'
        + '<span class="mf-badge-art">' + badgeSVG(b, 30) + '</span>'
        + '<span class="mf-badge-tx">'
          + '<span class="mf-badge-t">' + esc(b.t) + '</span>'
          + '<span class="mf-badge-d">' + esc(on ? b.d : b.want) + '</span>'
        + '</span>'
        + (on ? '<span class="mf-badge-tick" aria-hidden="true">\u2713</span>' : '')
        + '</div>';
    }).join('');
    return ''
      + '<button class="btn close" data-a="mf-ach-close">Close \u2715</button>'
      + '<div class="kicker">Honours board</div>'
      + '<h2>Badges</h2>'
      + '<div class="mf-ach-head">'
        + '<div class="mf-ach-cnt"><b>' + n + '</b> of ' + BADGES.length + ' earned</div>'
        + '<div class="mf-ach-track"><i style="width:' + Math.round(n / BADGES.length * 100) + '%"></i></div>'
      + '</div>'
      + '<div class="mf-ach-note">'
        + '<div><span class="k">Seasons banked</span><b>' + a.seasons + '</b></div>'
        + '<div><span class="k">Best streak</span><b>' + a.bestStreak + '</b></div>'
        + '<div><span class="k">Best season</span><b>' + money(a.bestSeason, 0) + '</b></div>'
        + '<div><span class="k">Insight</span><b>' + a.insight + '</b></div>'
      + '</div>'
      + '<div class="mf-badgegrid">' + cards + '</div>';
  }

  /* The debrief's other half: the decisions that were not the best available
     one, with the money each was worth. Shown only when there is something to
     show, and phrased so it reads as a lesson rather than a scolding. */
  function shortfallWall() {
    var a = compute();
    if (!a.play.missed) {
      if (a.play.given >= 5) {
        return '<div class="card mf-gap" data-note="flat">'
          + '<div class="kicker">Decision review</div>'
          + '<h3 style="margin:.2rem 0 .4rem">No money left on the table</h3>'
          + '<div class="small">You faced ' + a.play.given + ' decisions and found the best available answer to every one of them.'
          + ' Worth knowing that this is not the same as making a profit every time \u2014 some decisions could not be saved.'
          + '</div></div>';
      }
      return '';
    }
    var rows = shortfalls.slice().sort(function (x, y) { return y.gap - x.gap; }).map(function (n) {
      return '<div class="scoreline"><span>' + esc(n.why || '') + '</span><b class="bad">' + money0(n.gap) + '</b></div>';
    }).join('');
    return ''
      + '<div class="card mf-gap">'
        + '<div class="kicker">Decision review</div>'
        + '<h3 style="margin:.2rem 0 .4rem">Where you could have done better</h3>'
        + '<div class="small">Out of ' + a.play.given + ' decisions you found the best answer ' + a.play.perfect + ' times.'
        + ' These are the ones that cost you something, largest first.</div>'
        + rows
        + '<div class="scoreline" style="border:none;font-weight:800"><span>Total left on the table</span><b class="bad">' + money0(a.play.gap) + '</b></div>'
        + '<div class="small muted" style="margin-top:.4rem">This is not a penalty \u2014 nothing has been subtracted from your firm value. It is the answer to a better question than "did you make a profit": <b>did you make the best of the hand you were dealt?</b></div>'
      + '</div>';
  }

  /* ---------------- HUD hookups ----------------
     Round 8 moved the three counters out of the top bar and into the bottom
     HUD, which took `.tb-stats` with them. The streak pill used to be
     injected into `.tb-stats`; it is re-homed into the HUD's counter row
     (where the numbers it belongs beside now live) and the badge button into
     the HUD's action row (beside Tasks, which is what it opens).

     Both hosts are looked up fresh on every call, because the HUD is built by
     js/12-hud.js and may legitimately not exist yet on the very first paint.
     If neither is there we do nothing — a missing decoration is a cosmetic
     loss, not a reason to throw inside a repaint. */
  function decorateTopbar() {
    var hud = document.querySelector('.hudbar');
    if (!hud) return;
    var statRow = hud.querySelector('.hb-stats');
    var actRow = hud.querySelector('.hb-act');
    if (!statRow || !actRow) return;
    var a = compute();

    /* streak pill — first in the counter row, so it reads as one more figure.

       THE PILL SHOWED "×0". It used to appear whenever the run's BEST streak
       was 2 or more, but print the LIVE one. Those two numbers disagree the
       moment a season loses money: `noteSettlement` resets the live count to
       zero while the best is untouched, so a run with a best of 5 and a busted
       current streak kept a permanent, meaningless "Streak ×0" pinned to the
       left of the money counters — measured on the debrief screen, where the
       run had just finished and the live count can never rise again.

       A counter that reads zero for the rest of the game is not information.
       The rule now matches the number it prints: show the pill while a streak
       is actually RUNNING, and once it is broken keep it only if the run set a
       record worth reporting — and then print the record, labelled as such,
       rather than a zero under the word "Streak". */
    var live = MF.__streakLive || 0;
    var best = MF.__streakBest || a.bestStreak || 0;
    var run = live >= 2;
    /* the record only earns a permanent slot once it is long enough to be an
       achievement in its own right; 2 is a coincidence, not a run */
    var record = !run && best >= 3;
    var pill = statRow.querySelector('.mf-streak');
    if (run || record) {
      if (!pill) {
        pill = document.createElement('div');
        pill.className = 'mf-streak';
        statRow.insertBefore(pill, statRow.firstChild);
      }
      pill.classList.toggle('hot', live >= 3);
      pill.classList.toggle('rec', record);
      pill.innerHTML = record
        ? '<span>Best<b>' + best + '\u00d7</b></span>'
        + '<span class="mf-streak-fl">\u2605</span>'
        : '<span>Streak<b>' + live + '\u00d7</b></span>'
        + '<span class="mf-streak-fl">' + (live >= 3 ? '\u25b2' : '\u2022') + '</span>';
    } else if (pill) {
      pill.parentNode.removeChild(pill);
    }

    /* badge button — into the action row, before Tasks */
    var btn = actRow.querySelector('.mf-achbtn');
    var got = earnedCount();
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'hb-cog mf-achbtn';
      btn.setAttribute('data-a', 'mf-ach-open');
      actRow.insertBefore(btn, actRow.firstChild);
    }
    btn.innerHTML = '<span class="mf-achbtn-ic">' + badgeSVG({ icon: 'crown2' }, 15) + '</span>'
      + ' <span class="mf-achbtn-n">' + got + '/' + BADGES.length + '</span>';
    btn.title = got + ' of ' + BADGES.length + ' badges earned';
  }

  /* ---------------- live streak ----------------
     A running count of consecutive profitable settlements, shown in the header
     while it is happening, and recorded as the best run for the debrief. */
  function noteSettlement(profit) {
    var p = +profit || 0;
    if (p >= 0) {
      MF.__streakLive = (MF.__streakLive || 0) + 1;
      MF.__streakBest = Math.max(MF.__streakBest || 0, MF.__streakLive);
    } else {
      MF.__streakLive = 0;
    }
  }

  /* ---------------- the shortfall note ----------------
     Request: when a student picks a quantity that is not the best one, and the
     game carries on anyway, they should be told they could have done better.
     scorePlay() calls this at lock-in with the gap it measured. It is a note,
     not a rebuke: it names the better decision and the money it was worth, and
     it never appears when the student was already at the optimum. */
  var shortfalls = [];
  function noteShortfall(note) {
    if (!note || !(note.gap > 1)) return;
    shortfalls.push(note);
    showShortfall(note);
  }

  function money0(x) { return (x < 0 ? '\u2212$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US'); }

  function showShortfall(n) {
    var host = document.getElementById('toast');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'mf-shortfall';
    el.innerHTML =
      '<span class="mf-sf-art">'
        + '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
        + '<path d="M12 3.6 21 19.4H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'
        + '<path d="M12 10v4.2M12 16.8v.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '</svg></span>'
      + '<span class="mf-sf-tx">'
        + '<span class="mf-sf-k">You could have done better</span>'
        + '<span class="mf-sf-t">' + money0(n.gap) + ' left on the table</span>'
        + '<span class="mf-sf-d">' + esc(n.why || '') + '</span>'
      + '</span>';
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add('mf-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
    }, 5200);
  }

  /* The running list, for the debrief and for a harness to inspect. */
  function shortfallList() { return shortfalls.slice(); }

  /* ---------------- install ---------------- */
  var installed = false;

  /* award() and the counter must move together.
     They used to be two separate calls at every site, and one of the sites was
     wrong — which is how the bottom bar ended up frozen at 4/17 while the
     cabinet, which reads the earned set directly, showed sixteen. Anything that
     awards now also repaints. */
  function sync() {
    try { award(); } catch (e) {}
    try { decorateTopbar(); } catch (e) {}
  }

  function install() {
    if (installed) return true;
    if (!window.MF || !MF.S || !MF.SCENES) return false;

    /* ============================================================
       THE HOOKS, AND WHY THEY ARE ATTACHED WHERE THEY ARE
       ------------------------------------------------------------
       Every settlement in this game calls the bare `logRun(...)` declared in
       05-chapters.js. `window.MF` is a plain object built with
       `{ logRun: logRun, … }`, so `MF.logRun = wrapper` replaces a PROPERTY that
       nothing calls — the engine goes on calling its own closure-local function.

       That is what this layer used to do, for three names (`logRun`, `paintTop`,
       `advance`), on the stated belief that logRun was "the one high-leverage
       hook: every settlement goes through logRun". It is a high-leverage point,
       but wrapping the property does not reach it. Measured with
       `_tools/probe_achhud.js`: during a real settlement all three wrapped
       properties were called ZERO times, so `award()` never ran when a badge was
       earned and `decorateTopbar()` never ran after a settlement. The counter
       froze, and the unlock toast never fired at all.

       The seams that DO work are the ones shared by REFERENCE:
         · `MF.ACTS`   — the action table, one plain object every module reads
                         the same entry from. `ACTS['dec-lock']` is the single
                         funnel for every settlement (all five decision kinds
                         route through it), and `ACTS['next']` for every beat
                         advance. Those two cover the whole game.
         · `MF.SCENES` — used below for the debrief wall.
       ============================================================ */

    /* 1 · settlements — the real funnel. Every decision kind locks through
       `ACTS['dec-lock']`; that is where the ledger grows and where badges
       become true. */
    ['dec-lock', 'next'].forEach(function (k) {
      var inner = MF.ACTS[k];
      if (typeof inner !== 'function' || inner.__mfAch) return;
      MF.ACTS[k] = function () {
        var r = inner.apply(this, arguments);
        sync();
        return r;
      };
      MF.ACTS[k].__mfAch = true;
    });

    /* 1b · …and the same for `MF.logRun`, left in place because it costs
       nothing and would start working the day the engine is changed to call it
       through MF. It is NOT load-bearing: the ACTS hooks above are. */
    var innerLog = MF.logRun;
    if (typeof innerLog === 'function' && !innerLog.__mfAch) {
      MF.logRun = function (ch, label, profit) {
        var r = innerLog.apply(MF, arguments);
        noteSettlement(profit);
        sync();
        try { paintTop(); } catch (e) {}
        return r;
      };
      MF.logRun.__mfAch = true;
    }

    /* 2 · the shared action table for the non-settlement badges. Banking a
       factory task calls bankLab() → paintTop() and never touches logRun, so
       "Read the Floor" and "Curve Breaker" used to stay locked until the student
       happened to settle a season afterwards. */
    ['lab-check-prod', 'lab-check-cost', 'lab-tab', 'lab-finish'].forEach(function (k) {
      var inner = MF.ACTS[k];
      if (typeof inner !== 'function' || inner.__mfAch) return;
      MF.ACTS[k] = function () {
        var r = inner.apply(this, arguments);
        sync();
        return r;
      };
      MF.ACTS[k].__mfAch = true;
    });

    /* 4 · the cabinet and its close action */
    MF.ACTS['mf-ach-open'] = function () {
      MF.openSheet(cabinetHTML());
    };
    MF.ACTS['mf-ach-close'] = function () { MF.closeSheet(); };

    /* 5 · replace the debrief's badge-less result with the honours wall.
       award() runs first so a run that reached the debrief by any path — the
       normal one, a restored session, a harness — shows the badges it earned
       rather than only the ones a hook happened to observe. */
    var db = MF.SCENES.debrief;
    if (db && !db.__v4ach) {
      var innerDb = db.html;
      db.html = function () {
        try { award(); } catch (e) {}
        var body = innerDb.call(this);
        try { body = body + badgeWall(); } catch (e) {}
        try { body = body + shortfallWall(); } catch (e) {}
        return body;
      };
      db.__v4ach = true;
    }

    installed = true;
    sync();
    return true;
  }

  /* The wall appended to the debrief: earned badges in full colour, the rest
     ghosted with the condition still outstanding. */
  function badgeWall() {
    if (!MF.S.log || !MF.S.log.length) return '';
    var st = store(), a = compute(), got = earnedSet();
    var n = Object.keys(got).length;
    var cards = BADGES.map(function (b) {
      var on = !!got[b.id];
      return '<div class="mf-wall-badge ' + (on ? 'on tone-' + b.tone : 'off') + '">'
        + '<span class="mf-wb-art">' + badgeSVG(b, 26) + '</span>'
        + '<span class="mf-wb-t">' + esc(b.t) + '</span>'
        + '<span class="mf-wb-d">' + esc(on ? b.d : b.want) + '</span>'
        + '</div>';
    }).join('');
    var streak = MF.__streakBest || a.bestStreak || 0;
    return ''
      + '<div class="card mf-wall">'
        + '<div class="mf-wall-head">'
          + '<div>'
            + '<div class="kicker">Honours</div>'
            + '<h3 style="margin:0">Badges earned</h3>'
          + '</div>'
          + '<div class="mf-wall-score"><b>' + n + '</b><span>of ' + BADGES.length + '</span></div>'
        + '</div>'
        + '<div class="mf-wall-meta">'
          + '<div><span class="k">Seasons banked</span><b>' + a.seasons + '</b></div>'
          + '<div><span class="k">Longest streak</span><b>' + streak + '\u00d7</b></div>'
          + '<div><span class="k">Best season</span><b>' + money(a.bestSeason, 0) + '</b></div>'
          + '<div><span class="k">Losing seasons</span><b>' + a.losses + '</b></div>'
        + '</div>'
        + '<div class="mf-wallgrid">' + cards + '</div>'
        + '<div class="small muted mf-wall-foot">Every badge above is read back off the ledger you actually kept \u2014 the seasons you banked, the missions you cracked, the run you put together.</div>'
      + '</div>';
  }

  /* boot */
  if (!install()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    window.addEventListener('load', install);
    var tries = 0, iv = setInterval(function () {
      if (install() || ++tries > 40) clearInterval(iv);
    }, 50);
  } else {
    try { MF.repaint(); } catch (e) {}
  }

  /* ROUND 8 — the badge button now lives in the bottom HUD, which js/12-hud.js
     builds on its own schedule. Repainting once is not enough: whichever of the
     two modules boots second would find an empty .hb-act and silently drop the
     decoration. So the badge button is re-asserted whenever the HUD announces
     itself, and once more on load. decorateTopbar() is idempotent and cheap. */
  function reassert() { sync(); }
  window.addEventListener('load', reassert);
  window.addEventListener('mf:hud', reassert);
  if (window.MF_HUD) reassert();
  var badgeTries = 0, badgeIv = setInterval(function () {
    reassert();
    if (window.MF_HUD || ++badgeTries > 40) clearInterval(badgeIv);
  }, 50);

  window.MF_ACH = {
    version: 1,
    badges: BADGES,
    compute: compute,
    /* earned() reports the SAME set the UI shows — strict badges re-tested,
       ordinary badges from the cache — so a harness can never disagree with
       what the student sees on screen. */
    earned: function () { return Object.keys(earnedSet()); },
    award: award,
    cabinetHTML: cabinetHTML,
    shortfalls: shortfallList,
    /* Called by scorePlay() in js/05-chapters.js. Exposed on MF so the engine
       can reach it without knowing whether this layer is loaded — the game
       plays identically with this file removed. */
    noteShortfall: noteShortfall,
    installed: function () { return installed; }
  };
  /* scorePlay() calls MF.noteShortfall, so publish it on MF, not just here. */
  try { MF.noteShortfall = noteShortfall; } catch (e) {}
})();
