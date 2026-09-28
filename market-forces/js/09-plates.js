/* ============================================================
   MARKET FORCES — v4 plate layer (part 2)

   Loaded AFTER 08-end.js, so window.MF already exists and every
   scene object has been registered.

   This file only WRAPS the scene html/mount functions. It never
   touches S, ACTS, BEATS, tasks or the economic engine. Removing
   this <script> returns the game to its pre-v4 appearance exactly.

   The plate map below is derived from the engraving manifest in
   assets/. If an asset is missing the <img> simply fails and the
   scene still renders — no exception, no blank page.
   ============================================================ */
(function () {
  'use strict';

  var BASE = 'assets/';

  /* Chapter plates. `wash` drives the small-caps kicker colour. */
  var PLATES = {
    pc:    { img: 'ch_pc.jpg',    no: 'Plate I',   wash: '#33477E' },
    mono:  { img: 'ch_mono.jpg',  no: 'Plate II',  wash: '#6B4A7A' },
    mc:    { img: 'ch_mc.jpg',    no: 'Plate III', wash: '#1F6A63' },
    oligo: { img: 'ch_oligo.jpg', no: 'Plate IV',  wash: '#A9761B' }
  };

  var TOTAL_CH = 4;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function img(name) {
    return '<img src="' + BASE + name + '" loading="eager" decoding="async" alt="">';
  }

  /* ----------------------------------------------------------
     Chapter plate — sits above the beat, only on beat 0
     ---------------------------------------------------------- */
  function plateHTML(ch) {
    var p = PLATES[ch.id];
    if (!p) return '';
    return '<figure class="mf-plate" style="--v-wash:' + p.wash + '">'
      + img(p.img)
      + '<figcaption class="mf-plate-cap">'
        + '<div class="mf-plate-kick">Chapter ' + ch.n + ' of ' + TOTAL_CH + ' &middot; ' + esc(ch.tag) + '</div>'
        + '<div class="mf-plate-title">' + esc(ch.title) + '</div>'
      + '</figcaption>'
      + '<span class="mf-plate-no">' + p.no + '</span>'
      + '</figure>';
  }

  /* ----------------------------------------------------------
     Title screen — the balance plate becomes the masthead
     ---------------------------------------------------------- */
  function titlePlateHTML() {
    return '<div class="mf-titleplate">'
      + img('title.jpg')
      + '<div class="mf-tp-in">'
        + '<div class="mf-tp-kick">Economics Role Play</div>'
        + '<h1 class="mf-tp-word">MARKET FORCES</h1>'
        + '<div class="mf-tp-rule"></div>'
        + '<div class="mf-tp-sub">A firm&#8217;s journey through four market structures</div>'
        + '<div class="mf-tp-rule" style="margin:.6rem 0 .55rem"></div>'
        + '<div class="mf-tp-meta">Est. 1 firm &middot; 4 markets &middot; 1 ledger</div>'
      + '</div>'
      + '</div>';
  }

  /* ----------------------------------------------------------
     Factory tour + lab — the workshop engraving
     ---------------------------------------------------------- */
  function workshopHeadHTML(caption, note) {
    return '<figure class="mf-workshophead">'
      + img('workshop.jpg')
      + '<figcaption class="mf-wh-cap">'
        + '<div class="l"><div class="k">' + esc(caption || 'The works') + '</div>'
        + '<div class="t">Land and capital &#183; yours for the season</div></div>'
        + (note ? '<div class="r">' + esc(note) + '</div>' : '')
      + '</figcaption>'
      + '</figure>';
  }

  /* ----------------------------------------------------------
     Street strip — used on the "rivals on your street" beats
     ---------------------------------------------------------- */
  function streetPlateHTML(caption) {
    return '<figure class="mf-streetplate">'
      + img('street.jpg')
      + (caption ? '<figcaption class="mf-plate-cap" style="padding:.45rem .8rem .5rem">'
        + '<div class="mf-plate-kick" style="font-size:.72rem">' + esc(caption) + '</div></figcaption>' : '')
      + '</figure>';
  }

  /* ----------------------------------------------------------
     Debrief — the scholar's desk, with the seal over the score
     ---------------------------------------------------------- */
  function debriefPlateHTML(rankTitle) {
    return '<figure class="mf-debriefplate">'
      + img('debrief.jpg')
      + '<figcaption class="mf-db-cap">'
        + '<div class="k">End of season &middot; the reckoning</div>'
        + '<div class="t">' + esc(rankTitle || 'Your firm, judged') + '</div>'
      + '</figcaption>'
      + '</figure>';
  }

  function sealHTML(rankTitle, value) {
    var short = String(rankTitle || '').split(/[—\-–(]/)[0].trim();
    if (short.length > 13) short = short.slice(0, 12) + '\u2026';
    return '<div class="mf-seal" aria-hidden="true"><span class="s-d"></span><span class="s-in">'
      + '<span class="s-t">' + esc(short) + '</span>'
      + '<span class="s-s">verified &#183; season ' + esc(String(value >= 0 ? 'closed' : 'closed')) + '</span>'
      + '</span></div>';
  }

  /* ----------------------------------------------------------
     Redundant art stripping
     On beat 0 the chapter plate replaces the header art, so the
     original street strip drawn by the beat is redundant.
     ---------------------------------------------------------- */
  function stripRedundantArt(root) {
    if (!root) return;
    var first = root.querySelector(':scope > .card');
    if (!first) return;
    /* the street rendering inside the first card of a plate beat */
    var row = first.querySelector('.shoprow');
    if (row) {
      var holder = row.parentElement;
      /* keep the row itself — only remove a stray chartcard above it */
      var cc = holder && holder.querySelector(':scope > .chartcard');
      if (cc && !cc.querySelector('.shoprow')) cc.classList.add('mf-hidden');
    }
  }
  function restoreRedundantArt(root) {
    if (!root) return;
    var els = root.querySelectorAll('.mf-hidden');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('mf-hidden');
  }

  /* ----------------------------------------------------------
     Install
     ---------------------------------------------------------- */
  function wrap(sceneName, htmlFn, mountFn) {
    var scene = MF.SCENES[sceneName];
    if (!scene || scene.__v4wrapped) return false;

    var innerHTML = scene.html;
    scene.html = function () {
      var extra = '';
      try { extra = htmlFn.call(this) || ''; } catch (e) { extra = ''; }
      var body = innerHTML ? innerHTML.call(this) : '';
      return extra + body;
    };

    if (mountFn) {
      var innerMount = scene.mount;
      scene.mount = function () {
        if (innerMount) innerMount.call(this);
        try { mountFn.call(this); } catch (e) { /* dressing must never break play */ }
      };
    }
    scene.__v4wrapped = true;
    return true;
  }

  function install() {
    if (!window.MF || !MF.SCENES) return false;
    var done = 0;

    /* --- chapter: the plate, only on beat 0 --- */
    var ch = MF.SCENES.chapter;
    if (ch && !ch.__v4plated) {
      var innerChHTML = ch.html;
      ch.html = function () {
        var c = (MF.S.chs && MF.S.chs.length && MF.CHAPTERS) ? MF.CHAPTERS[MF.S.chs[MF.S.chIdx]] : null;
        var show = c && MF.S.beat === 0;
        var body = innerChHTML.call(this);
        return (show ? plateHTML(c) : '') + body;
      };
      ch.__v4plated = true;

      var innerChMount = ch.mount;
      ch.mount = function () {
        if (innerChMount) innerChMount.call(this);
        var app = document.getElementById('app');
        var onPlate = MF.S.beat === 0 && !!app && !!app.querySelector('.mf-plate');
        document.documentElement.classList.toggle('plate-beat', onPlate);
        if (onPlate) stripRedundantArt(app);
      };
      done++;
    }

    /* --- title --- */
    if (wrap('title', function () {
      document.documentElement.classList.add('mf-have-title');
      return titlePlateHTML();
    }, function () {
      document.documentElement.classList.add('mf-have-title');
    })) done++;

    /* --- setup: the shopfront plate beside the preview --- */
    if (wrap('setup', function () {
      document.documentElement.classList.add('mf-street');
      return '';
    }, function () {
      document.documentElement.classList.add('mf-street');
      var app = document.getElementById('app');
      if (app && !app.querySelector('.mf-shopfront')) {
        var host = app.querySelector('.preview');
        if (host) {
          var fig = document.createElement('figure');
          fig.className = 'mf-shopfront';
          fig.innerHTML = img('shopfront.jpg') + '<figcaption class="c">Your premises</figcaption>';
          host.parentNode.insertBefore(fig, host);
        }
      }
    })) done++;

    /* --- tour: workshop engraving heads the page ---
       Deliberately NOT hiding the live factory SVG here. The SVG is the actual
       teaching object — it redraws as K and L change — so the engraving is
       atmosphere above it, not a replacement for it. */
    if (wrap('tour', function () {
      document.documentElement.classList.add('mf-workshop');
      return workshopHeadHTML('The works', 'Fixed factors: land and capital. Everything else you can change.');
    }, function () {
      document.documentElement.classList.add('mf-workshop');
    })) done++;

    /* --- lab: graph-paper board + plate under the controls --- */
    if (wrap('lab', function () {
      document.documentElement.classList.add('mf-lab');
      return '';
    }, function () {
      document.documentElement.classList.add('mf-lab');
      var app = document.getElementById('app');
      if (app && !app.querySelector('.mf-fig')) {
        var main = app.querySelector('.labmain');
        if (main) {
          var fig = document.createElement('figure');
          fig.className = 'mf-framed mf-fig';
          fig.innerHTML = img('workshop.jpg')
            + '<figcaption class="mf-framed-cap"><span class="c-l">The floor</span>'
            + '<span class="c-r">Fixed factors drawn to scale &#183; hire more hands, not more roof</span></figcaption>';
          main.appendChild(fig);
        }
      }
    })) done++;

    /* --- debrief --- */
    if (wrap('debrief', function () {
      document.documentElement.classList.add('mf-debrief');
      var rank = (MF.rankOf ? MF.rankOf(MF.S.value) : { t: 'Your firm, judged' });
      return debriefPlateHTML(rank && rank.t);
    }, function () {
      document.documentElement.classList.add('mf-debrief');
      var app = document.getElementById('app');
      var rc = app && app.querySelector('.rankcard');
      if (rc && !rc.querySelector('.mf-seal')) {
        var rank = (MF.rankOf ? MF.rankOf(MF.S.value) : { t: 'Result' });
        rc.insertAdjacentHTML('afterbegin', sealHTML(rank && rank.t, MF.S.value));
      }
    })) done++;

    return done > 0;
  }

  /* ----------------------------------------------------------
     Boot: install now if MF is ready, else on the first repaint.
     ---------------------------------------------------------- */
  var installed = false;

  function tryInstall() {
    if (installed) return true;
    if (!window.MF || !MF.SCENES || !MF.SCENES.chapter) return false;
    installed = install();
    if (installed) {
      /* leaving a chapter clears the plate class so the next scene starts clean */
      var innerGo = MF.go;
      MF.go = function (id) {
        document.documentElement.classList.remove('plate-beat');
        var r = innerGo.call(MF, id);
        try {
          var app = document.getElementById('app');
          if (app) restoreRedundantArt(app);
        } catch (e) {}
        return r;
      };
      if (MF.repaint) MF.repaint();
    }
    return installed;
  }

  if (!tryInstall()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInstall);
    }
    window.addEventListener('load', tryInstall);
    /* last resort: poll a few times in case the boot order changes */
    var tries = 0;
    var iv = setInterval(function () {
      if (tryInstall() || ++tries > 40) clearInterval(iv);
    }, 50);
  }

  /* expose for the verification harness */
  window.MF_PLATES = {
    version: 4,
    installed: function () { return installed; },
    plates: PLATES,
    reinstall: function () { installed = false; return tryInstall(); }
  };
})();
