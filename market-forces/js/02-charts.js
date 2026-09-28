/* ============================================================
   MARKET FORCES — number formatting, SVG chart engine, artwork
   ============================================================ */

/* ---------- the chart palette: ONE source of truth ----------
   Every diagram in the game reads its strokes from here. Hard-coding a colour
   anywhere else means a theme change has to be hunted down across five files. */
const PAL = {
  red: '#E0494D',      // marginal cost, deadweight loss, "this is a loss"
  blue: '#2F6FE0',     // average total cost
  green: '#0F9D74',    // average variable cost, profit, anything good
  violet: '#7C5CFC',   // marginal revenue, average fixed cost
  ink: '#122036',      // the point the student is standing on
  guide: '#8595AD'     // faint vertical rules and guide lines
};
Object.assign(PAL, {
  mc: PAL.red, ac: PAL.blue, avc: PAL.green, afc: PAL.violet,
  good: PAL.green, bad: PAL.red
});

/* ---------- numbers: never show float tails ---------- */
function fmt(x, d) { d = d == null ? 1 : d; if (!isFinite(x)) return '—'; return Number(x).toFixed(d); }
function money(x, d) {
  d = d == null ? 0 : d;
  if (!isFinite(x)) return '—';
  const v = Math.abs(x);
  const s = v >= 1000 ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : v.toFixed(d);
  return (x < 0 ? '-$' : '$') + s;
}
function pct(x, d) { return fmt(x * 100, d == null ? 0 : d) + '%'; }

/* PROFIT OR LOSS — the heading has to agree with the number under it.
   Every settlement tile was labelled "Economic profit" whatever the sign, so a
   season that lost $151 read "Economic profit / -$151". `money()` has always
   carried the sign correctly; it was the heading that contradicted it. The
   optional `who` lets a tile say "Your profit" / "Your loss" instead. */
function profitLabel(v, who) {
  return (who || 'Economic') + (+v < -0.005 ? ' loss' : ' profit');
}

function niceTicks(min, max, n) {
  const span = max - min;
  if (!(span > 0)) return [min];
  const raw = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  step *= mag;
  const out = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}
function tickLabel(v, step) { return Math.abs(step) < 1 ? fmt(v, 1) : String(Math.round(v)); }

/* ============================================================
   map(): generic SVG line chart on a light surface
   cfg = {
     w,h, x:[min,max], y:[min,max], xLabel, yLabel,
     series:[{pts,color,width,dash,label,labelAt,labelDy,hideTail}],
     points:[{x,y,label,color,dy,dx,above}],
     shapes:[{type:'rect'|'poly',...}],
     hlines:[{y,color,dash,label,labelSide,width}],
     vlines:[{x,color,dash,label,labelTop}],
     bands:[{x0,x1,color,opacity}]
   }
   ============================================================ */
let __chartUid = 0;
/* Monotone-light cubic spline: smooths dense series without overshooting peaks */
function smoothPath(pts, X, Y) {
  if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ');
  const xs = pts.map(p => X(p[0])), ys = pts.map(p => Y(p[1]));
  const d = ['M' + xs[0].toFixed(1) + ' ' + ys[0].toFixed(1)];
  const slopes = [];
  for (let i = 0; i < pts.length - 1; i++) slopes.push((ys[i + 1] - ys[i]) / Math.max(1e-6, xs[i + 1] - xs[i]));
  const tang = new Array(pts.length);
  tang[0] = slopes[0];
  tang[pts.length - 1] = slopes[slopes.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = slopes[i - 1], b = slopes[i];
    tang[i] = a * b <= 0 ? 0 : (a + b) / 2;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    const c1x = xs[i] + dx / 3, c1y = ys[i] + tang[i] * dx / 3;
    const c2x = xs[i + 1] - dx / 3, c2y = ys[i + 1] - tang[i + 1] * dx / 3;
    d.push('C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + xs[i + 1].toFixed(1) + ' ' + ys[i + 1].toFixed(1));
  }
  return d.join(' ');
}
function chart(cfg) {
  const W = cfg.w || 680, H = cfg.h || 380;
  const pad = Object.assign({ l: 64, r: 92, t: 28, b: 52 }, cfg.pad || {});
  /* end-of-line labels are drawn just past the last data point: make the right
     gutter wide enough for the longest of them so nothing escapes the viewBox */
  let maxLab = 0;
  (cfg.series || []).forEach(s => {
    if (s.label && !s.labelAt && s.pts && s.pts.length) maxLab = Math.max(maxLab, String(s.label).length);
  });
  if (maxLab) pad.r = Math.max(pad.r, Math.min(210, maxLab * 0.76 * 19 * 0.60 + 18));
  pad.r = Math.min(pad.r, Math.max(70, Math.round(W * 0.30)));
  const x0 = pad.l, x1 = W - pad.r, y0 = H - pad.b, y1 = pad.t;
  const X = v => x0 + (v - cfg.x[0]) / (cfg.x[1] - cfg.x[0]) * (x1 - x0);
  const Y = v => y0 - (v - cfg.y[0]) / (cfg.y[1] - cfg.y[0]) * (y0 - y1);
  const out = [];
  const uid = ++__chartUid;
  out.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="#FFFFFF" stroke="#EDF1F8"/>`);

  const xt = niceTicks(cfg.x[0], cfg.x[1], cfg.xTicks || 6);
  const yt = niceTicks(cfg.y[0], cfg.y[1], cfg.yTicks || 5);
  const xs = xt.length > 1 ? xt[1] - xt[0] : 1, ys = yt.length > 1 ? yt[1] - yt[0] : 1;

  // gradient defs for area fills
  const defs = [];
  (cfg.series || []).forEach((s, i) => {
    if (s.area) {
      s._gid = `mfG${uid}_${i}`;
      defs.push(`<linearGradient id="${s._gid}" x1="0" y1="0" x2="0" y2="1">`
        + `<stop offset="0%" stop-color="${s.color}" stop-opacity="${s.area}"/>`
        + `<stop offset="100%" stop-color="${s.color}" stop-opacity="0.005"/></linearGradient>`);
    }
  });
  if (defs.length) out.push(`<defs>${defs.join('')}</defs>`);

  // grid
  xt.forEach(v => out.push(`<line class="gr" x1="${X(v).toFixed(1)}" y1="${y0}" x2="${X(v).toFixed(1)}" y2="${y1}"/>`));
  yt.forEach(v => out.push(`<line class="gr" x1="${x0}" y1="${Y(v).toFixed(1)}" x2="${x1}" y2="${Y(v).toFixed(1)}"/>`));

  // bands
  (cfg.bands || []).forEach(b => out.push(
    `<rect class="zone-good" x="${X(b.x0).toFixed(1)}" y="${y1}" width="${(X(b.x1) - X(b.x0)).toFixed(1)}" height="${y0 - y1}" fill="${b.color}" opacity="${b.opacity == null ? .16 : b.opacity}"/>`));

  // shapes
  (cfg.shapes || []).forEach(s => {
    if (s.type === 'rect') {
      const xa = Math.min(X(s.x0), X(s.x1)), wa = Math.abs(X(s.x1) - X(s.x0));
      const ya = Math.min(Y(s.y0), Y(s.y1)), ha = Math.abs(Y(s.y1) - Y(s.y0));
      out.push(`<rect x="${xa.toFixed(1)}" y="${ya.toFixed(1)}" width="${wa.toFixed(1)}" height="${ha.toFixed(1)}" rx="4" fill="${s.fill}" opacity="${s.opacity == null ? .18 : s.opacity}" stroke="${s.stroke || 'none'}" stroke-width="${s.sw || 1.4}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`);
    } else if (s.type === 'poly') {
      const p = s.pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
      out.push(`<polygon points="${p}" fill="${s.fill || 'none'}" opacity="${s.opacity == null ? .2 : s.opacity}" stroke="${s.stroke || 'none'}" stroke-width="${s.sw || 1.4}" stroke-linejoin="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`);
    }
  });

  // hlines
  (cfg.hlines || []).forEach(l => {
    if (l.y < cfg.y[0] || l.y > cfg.y[1]) return;
    out.push(`<line x1="${x0}" y1="${Y(l.y).toFixed(1)}" x2="${x1}" y2="${Y(l.y).toFixed(1)}" stroke="${l.color}" stroke-width="${l.width || 2.2}" ${l.dash ? `stroke-dasharray="${l.dash}"` : ''}/>`);
    if (l.label) {
      const lx = l.labelSide === 'left' ? x0 + 6 : x1 - 6;
      const anch = l.labelSide === 'left' ? 'start' : 'end';
      out.push(`<text class="cl" x="${lx}" y="${(Y(l.y) - 7).toFixed(1)}" text-anchor="${anch}" fill="${l.color}" stroke="#fff" stroke-width="3.4" paint-order="stroke">${l.label}</text>`);
    }
  });

  // vlines
  (cfg.vlines || []).forEach((l, i) => {
    if (l.x < cfg.x[0] || l.x > cfg.x[1]) return;
    out.push(`<line x1="${X(l.x).toFixed(1)}" y1="${y0}" x2="${X(l.x).toFixed(1)}" y2="${y1}" stroke="${l.color}" stroke-width="1.8" stroke-dasharray="5 4"/>`);
    if (l.label) {
      // labels sit just above the x-axis: the top of the plot is where the curve
      // labels live, and stacking there caused collisions
      const nearRight = X(l.x) > (x0 + x1) / 2;
      out.push(`<text class="cl" x="${(X(l.x) + (nearRight ? -7 : 7)).toFixed(1)}" y="${(y0 - 9 - i * 17).toFixed(1)}" text-anchor="${nearRight ? 'end' : 'start'}" fill="${l.color}" stroke="#fff" stroke-width="3.4" paint-order="stroke">${l.label}</text>`);
    }
  });

  // series
  const curveLabels = [];
  (cfg.series || []).forEach((s, si) => {
    const pts = s.pts.filter(p => p[0] >= cfg.x[0] - 1e-6 && p[0] <= cfg.x[1] + 1e-6 && isFinite(p[1]));
    if (!pts.length) return;
    const d = s.smooth === false ? pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ') : smoothPath(pts, X, Y);
    /* mf-curve / mf-area / mf-i drive the "draw the curve" animation that
       revealChart() triggers: the index only orders the strobe, it carries no
       meaning, and without .mf-draw on the wrapper these classes do nothing. */
    if (s.area && s._gid) {
      const base = `L${X(pts[pts.length - 1][0]).toFixed(1)} ${y0} L${X(pts[0][0]).toFixed(1)} ${y0} Z`;
      out.push(`<path class="mf-area" style="--mf-i:${si}" d="${d} ${base}" fill="url(#${s._gid})" stroke="none"/>`);
    }
    out.push(`<path class="mf-curve" style="--mf-i:${si}" d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.6}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`);
    if (s.label) {
      let lx, ly, anch = 'start';
      if (s.labelAt) { lx = X(s.labelAt[0]); ly = Y(s.labelAt[1]); }
      else { const last = pts[pts.length - 1]; lx = X(last[0]) + 8; ly = Y(last[1]) + 4; }
      if (s.labelAnchor) anch = s.labelAnchor;
      if (s.labelEnd && !s.labelAt) { const last = pts[pts.length - 1]; lx = X(last[0]) + 8; ly = Y(last[1]) + 4; }
      /* collected, not drawn: the labels go out after every curve is on the
         canvas, so (a) they cannot be buried by a later curve and (b) colliding
         ones can be pulled apart first. See the block below. */
      curveLabels.push({ si, s, lx, ly: ly + (s.labelDy || 0), anch,
                         w: String(s.label).length * 8.8 });
    }
    // dots on the series
    (s.dots || []).forEach(dt => {
      const q = pts.reduce((a, b) => Math.abs(b[0] - dt) < Math.abs(a[0] - dt) ? b : a);
      out.push(`<circle class="mf-dot" style="--mf-i:${si}" cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="4.5" fill="${s.color}" stroke="#fff" stroke-width="2.2"/>`);
    });
  });

  /* ---- pull overlapping curve labels apart --------------------------------
     SVG has no layout engine: a <text> lands exactly where it is put. So when
     two curves converge into the right-hand gutter their labels print on top of
     each other. It happened on the regulator page, where AC and MC both climb
     steeply into the same corner and "MC" came out printed over "AC" — and those
     are precisely the two curves the student is being asked to compare, so on a
     projector it is not a cosmetic detail.

     Any two labels whose boxes touch are pushed apart vertically, each keeping
     its own x so a label still reads as belonging to the curve it ends. The pass
     count is bounded so a pair can never chase each other, and every label is
     clamped inside the plot box afterwards. (The hline/vline labels above solve
     the same problem the other way, by stacking on index — they know their own
     order, which curve ends do not.) */
  /* THE LABEL'S LINE BOX, NOT ITS FONT SIZE.
     15.6px of type occupies about 23px of box in Chrome, so separating by the
     font size alone left an 8px overprint — svg_geom measured it and said so. */
  const LAB_H = 24;
  const labTop = pad.t + LAB_H - 4, labBot = H - pad.b - 4;
  /* Push two overlapping labels apart around their midpoint. If the lower one
     would fall out of the plot, the WHOLE PAIR slides up rather than the lower
     one being clamped — clamping it back is what put it straight on top of its
     neighbour again, which is how the MC chart's "D = AR" and "AC" survived the
     first version of this fix. */
  const separate = () => {
    let hit = false;
    for (let i = 0; i < curveLabels.length; i++) {
      for (let j = i + 1; j < curveLabels.length; j++) {
        const a = curveLabels[i], b = curveLabels[j];
        if (Math.abs(a.lx - b.lx) > (a.w + b.w) / 2 + 3) continue;
        if (Math.abs(a.ly - b.ly) > LAB_H - 4) continue;
        hit = true;
        const mid = (a.ly + b.ly) / 2;
        let up = mid - LAB_H / 2, dn = mid + LAB_H / 2, off = 0;
        if (dn > labBot) off = labBot - dn;
        if (up + off < labTop) off = labTop - up;
        const upper = a.ly <= b.ly ? a : b, lower = a.ly <= b.ly ? b : a;
        upper.ly = up + off;
        lower.ly = dn + off;
      }
    }
    return hit;
  };
  for (let pass = 0; pass < 6; pass++) if (!separate()) break;
  curveLabels.forEach(L => {
    const y = Math.max(labTop, Math.min(L.ly, labBot));
    out.push(`<text class="cl mf-clab" style="--mf-i:${L.si}" x="${L.lx.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${L.anch}" fill="${L.s.color}" stroke="#fff" stroke-width="3.6" paint-order="stroke">${L.s.label}</text>`);
  });

  // scatter points
  (cfg.points || []).forEach(p => {
    const cx = X(p.x), cy = Y(p.y);
    if (p.r === 0) {
      if (p.label) {
        out.push(`<text class="cn" x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="${p.anchor || 'start'}" fill="${p.color || PAL.ink}" stroke="#fff" stroke-width="3.6" paint-order="stroke" font-style="italic">${p.label}</text>`);
      }
      return;
    }
    out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(p.r || 5.5) + 1}" fill="#fff" opacity=".9"/>`);
    out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${p.r || 5.5}" fill="${p.color || PAL.ink}" stroke="#fff" stroke-width="2.4"/>`);
    if (p.label) {
      const dx = p.dx == null ? 9 : p.dx, dy = p.dy == null ? 5 : p.dy;
      out.push(`<text class="cn" x="${(cx + dx).toFixed(1)}" y="${(cy + dy).toFixed(1)}" text-anchor="${p.anchor || 'start'}" fill="${p.color || PAL.ink}" stroke="#fff" stroke-width="3.6" paint-order="stroke">${p.label}</text>`);
    }
  });

  // axes with arrowheads
  out.push(`<line class="ax" x1="${x0}" y1="${y0}" x2="${x1 + 6}" y2="${y0}"/>`);
  out.push(`<line class="ax" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1 - 6}"/>`);
  out.push(`<path d="M${x1 + 6} ${y0} l-7 -3.4 v6.8 Z" fill="#B9C6D9"/>`);
  out.push(`<path d="M${x0} ${y1 - 6} l-3.4 7 h6.8 Z" fill="#B9C6D9"/>`);
  xt.forEach(v => out.push(`<text class="ct" x="${X(v).toFixed(1)}" y="${y0 + 17}" text-anchor="middle">${tickLabel(v, xs)}</text>`));
  yt.forEach(v => out.push(`<text class="ct" x="${x0 - 9}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end">${tickLabel(v, ys)}</text>`));
  if (cfg.xLabel) out.push(`<text class="ca" x="${((x0 + x1) / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${cfg.xLabel}</text>`);
  if (cfg.yLabel) out.push(`<text class="ca" x="16" y="${((y0 + y1) / 2).toFixed(1)}" text-anchor="middle" transform="rotate(-90 16 ${((y0 + y1) / 2).toFixed(1)})">${cfg.yLabel}</text>`);
  if (cfg.note) out.push(`<text class="ct" x="${x1}" y="${y1 - 8}" text-anchor="end" font-style="italic">${cfg.note}</text>`);
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${out.join('')}</svg>`;
}


/* ============================================================
   ARTWORK
   ============================================================ */

/* ---- product-specific capital goods: every industry gets its own machine,
   all drawn in one metal-and-brand-colour language ---- */
function machineArt(kind, x, t, w, c) {
  const M = '#EDF3FA', M2 = '#DCE5F0', edge = '#B6C4D6', dark = '#23314B', g = [];
  const flue = () => {
    g.push(`<rect x="${x + 11}" y="52" width="9" height="10" rx="3" fill="${M2}" stroke="${edge}" stroke-width="1.1"/>`);
    g.push(`<path d="M${x + 13.5} 51 q3 -4 0 -7 M${x + 18} 51 q3 -4 0 -7" stroke="#C9D6E8" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
  };
  const body = () => g.push(`<rect x="${x}" y="${t}" width="${w}" height="56" rx="11" fill="${M}" stroke="${edge}" stroke-width="1.6"/>`);
  const knob = (kx, ky) => g.push(`<circle cx="${kx}" cy="${ky}" r="3" fill="#fff" stroke="${c}" stroke-width="2"/>`);
  const led = () => g.push(`<circle cx="${x + 50}" cy="${t + 45}" r="2.6" fill="#fff"/><circle cx="${x + 50}" cy="${t + 45}" r="1.8" fill="${c}"/>`);

  if (kind === 'oven') {
    body();
    g.push(`<rect x="${x + 3}" y="${t + 3}" width="${w - 6}" height="16" rx="8" fill="#fff" opacity=".72"/>`);
    g.push(`<circle cx="${x + 17}" cy="${t + 11}" r="4.6" fill="none" stroke="${c}" stroke-width="2.2"/>`);
    g.push(`<circle cx="${x + 32}" cy="${t + 11}" r="4.6" fill="none" stroke="${c}" stroke-width="2.2"/>`);
    g.push(`<rect x="${x + 8}" y="${t + 22}" width="46" height="26" rx="7" fill="${dark}"/>`);
    g.push(`<rect x="${x + 11}" y="${t + 25}" width="40" height="20" rx="5" fill="#F6B24E" opacity=".22"/>`);
    g.push(`<path d="M${x + 22} ${t + 38}c0-6 4-9 9-9s9 3 9 9z" fill="#F2BC63" opacity=".92"/>`);
    g.push(`<rect x="${x + 13}" y="${t + 33}" width="36" height="3.6" rx="1.8" fill="${M2}"/>`);
    knob(x + 48, t + 11); led();
  } else if (kind === 'roaster') {
    flue(); body();
    g.push(`<rect x="${x + 7}" y="${t + 11}" width="48" height="27" rx="13.5" fill="#fff" stroke="${edge}" stroke-width="1.4"/>`);
    g.push(`<circle cx="${x + 31}" cy="${t + 24.5}" r="11" fill="${dark}"/>`);
    [[26, 22], [34, 25], [30, 29]].forEach(([bx, by]) =>
      g.push(`<ellipse cx="${x + bx}" cy="${t + by}" rx="2.6" ry="3.4" fill="#A9743C" transform="rotate(24 ${x + bx} ${t + by})"/>`));
    g.push(`<path d="M${x + 39} ${t + 20}a9 9 0 1 0 2 8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`);
    g.push(`<path d="M${x + 42} ${t + 25}l3 .4l-1.6 2.6" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    g.push(`<path d="M${x + 14} ${t + 40}h34l-4 10h-26z" fill="${M2}" stroke="${edge}" stroke-width="1.2"/>`);
    g.push(`<circle cx="${x + 24}" cy="${t + 46}" r="1.6" fill="#8A5A2E"/><circle cx="${x + 31}" cy="${t + 47}" r="1.6" fill="#8A5A2E"/><circle cx="${x + 38}" cy="${t + 46}" r="1.6" fill="#8A5A2E"/>`);
    knob(x + 49, t + 11); led();
  } else if (kind === 'press') {
    body();
    g.push(`<rect x="${x + 8}" y="${t + 44}" width="46" height="10" rx="4" fill="${M2}" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<rect x="${x + 28}" y="${t + 8}" width="7" height="38" rx="2.5" fill="${M2}" stroke="${edge}" stroke-width="1.1"/>`);
    g.push(`<rect x="${x + 11}" y="${t + 9}" width="40" height="11" rx="4.5" fill="${c}"/>`);
    g.push(`<rect x="${x + 11}" y="${t + 9}" width="40" height="5" rx="2.5" fill="#fff" opacity=".22"/>`);
    g.push(`<rect x="${x + 11}" y="${t + 34}" width="40" height="9" rx="4" fill="#fff" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<path d="M${x + 26} ${t + 24}l-5-4 2-5h12l2 5-5 4v6h-6z" fill="${c}" opacity=".85"/>`);
    g.push(`<circle cx="${x + 50}" cy="${t + 14}" r="3.4" fill="#fff" stroke="${c}" stroke-width="2"/>`);
    led();
  } else if (kind === 'lathe') {
    body();
    g.push(`<rect x="${x + 5}" y="${t + 34}" width="52" height="9" rx="3.5" fill="${M2}" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<rect x="${x + 8}" y="${t + 10}" width="15" height="26" rx="3" fill="${M}" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<circle cx="${x + 22}" cy="${t + 24}" r="5" fill="#fff" stroke="${c}" stroke-width="2.2"/>`);
    g.push(`<path d="M${x + 19} ${t + 21}l6 6M${x + 28} ${t + 21}l-6 6" stroke="${c}" stroke-width="1.4"/>`);
    g.push(`<rect x="${x + 24}" y="${t + 21}" width="20" height="5" rx="2" fill="#C8945E" stroke="#A06F3C" stroke-width="1"/>`);
    g.push(`<rect x="${x + 44}" y="${t + 18}" width="10" height="16" rx="2.5" fill="${M}" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<path d="M${x + 37} ${t + 34}l4-7 4 7z" fill="${c}" opacity=".85"/>`);
    knob(x + 13, t + 15); led();
  } else if (kind === 'vat') {
    body();
    g.push(`<rect x="${x + 7}" y="${t + 14}" width="48" height="38" rx="12" fill="${M}" stroke="${edge}" stroke-width="1.6"/>`);
    g.push(`<path d="M${x + 10} ${t + 24}a14 6 0 0 0 28 0a14 6 0 0 0 14 0v16a9 9 0 0 1-9 9h-38a9 9 0 0 1-9-9z" fill="${c}" opacity=".16"/>`);
    g.push(`<ellipse cx="${x + 24}" cy="${t + 24}" rx="14" ry="5" fill="${c}" opacity=".28"/>`);
    g.push(`<circle cx="${x + 18}" cy="${t + 20}" r="1.8" fill="#fff" opacity=".75"/><circle cx="${x + 27}" cy="${t + 17}" r="1.4" fill="#fff" opacity=".75"/><circle cx="${x + 33}" cy="${t + 21}" r="1.6" fill="#fff" opacity=".75"/>`);
    g.push(`<line x1="${x + 31}" y1="${t + 2}" x2="${x + 31}" y2="${t + 30}" stroke="${edge}" stroke-width="3" stroke-linecap="round"/>`);
    g.push(`<ellipse cx="${x + 31}" cy="${t + 31}" rx="7" ry="3" fill="${c}"/>`);
    g.push(`<rect x="${x + 27}" y="${t + 46}" width="8" height="7" rx="2" fill="${M2}" stroke="${edge}" stroke-width="1.1"/>`);
    led();
  } else if (kind === 'polytunnel') {
    body();
    g.push(`<rect x="${x + 6}" y="${t + 40}" width="50" height="12" rx="4" fill="${M2}" stroke="${edge}" stroke-width="1.3"/>`);
    g.push(`<path d="M${x + 9} ${t + 40}a22 22 0 0 1 44 0z" fill="#EAF7EF" stroke="#7FC497" stroke-width="1.7"/>`);
    [0, 1, 2].forEach(i => {
      const a = x + 17 + i * 14;
      g.push(`<path d="M${a - 6} ${t + 40}a20 20 0 0 1 12-19" fill="none" stroke="#7FC497" stroke-width="1.1" opacity=".7"/>`);
      g.push(`<path d="M${a} ${t + 40}v-7" stroke="#3F9755" stroke-width="1.6" stroke-linecap="round"/>`);
      g.push(`<ellipse cx="${a - 2.6}" cy="${t + 31}" rx="3" ry="1.8" fill="#57B46A" transform="rotate(-28 ${a - 2.6} ${t + 31})"/>`);
      g.push(`<ellipse cx="${a + 2.6}" cy="${t + 31}" rx="3" ry="1.8" fill="#459E59" transform="rotate(28 ${a + 2.6} ${t + 31})"/>`);
    });
    g.push(`<line x1="${x + 31}" y1="${t + 22}" x2="${x + 31}" y2="${t + 40}" stroke="#7FC497" stroke-width="1.2" stroke-dasharray="2 2"/>`);
    led();
  } else {
    /* generic machine: gearbox */
    body();
    g.push(`<rect x="${x + 2}" y="${t + 2}" width="${w - 4}" height="17" rx="9" fill="#fff" opacity=".75"/>`);
    const gx = x + 20, gy = t + 26;
    for (let a = 0; a < 6; a++) {
      const ang = a * Math.PI / 3;
      g.push(`<line x1="${(gx + Math.cos(ang) * 10.5).toFixed(1)}" y1="${(gy + Math.sin(ang) * 10.5).toFixed(1)}" x2="${(gx + Math.cos(ang) * 14).toFixed(1)}" y2="${(gy + Math.sin(ang) * 14).toFixed(1)}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`);
    }
    g.push(`<circle cx="${gx}" cy="${gy}" r="10.5" fill="#fff" stroke="${c}" stroke-width="2.6"/>`);
    g.push(`<circle cx="${gx}" cy="${gy}" r="3.4" fill="${c}"/>`);
    g.push(`<rect x="${x + 37}" y="${t + 16}" width="18" height="18" rx="4" fill="${dark}"/>`);
    g.push(`<rect x="${x + 40.5}" y="${t + 20.5}" width="11" height="2.6" rx="1.3" fill="${c}" opacity=".95"/>`);
    g.push(`<rect x="${x + 40.5}" y="${t + 26}" width="7" height="2.6" rx="1.3" fill="${c}" opacity=".55"/>`);
    led();
  }
  return g.join('');
}

/* ---- a small worker: hard hat, overalls, soft shadow ---- */
function workerArt(cx, cy, r, colour, dark) {
  const n = v => (Number(v)).toFixed(1);
  const x = cx, y = cy;
  return [
    `<ellipse cx="${n(x)}" cy="${n(y + r * 2.25)}" rx="${n(r * .98)}" ry="${n(r * .3)}" fill="rgba(18,32,54,.10)"/>`,
    /* legs */
    `<rect x="${n(x - r * .56)}" y="${n(y + r * 1.28)}" width="${n(r * .44)}" height="${n(r * .92)}" rx="${n(r * .16)}" fill="#334155"/>`,
    `<rect x="${n(x + r * .12)}" y="${n(y + r * 1.28)}" width="${n(r * .44)}" height="${n(r * .92)}" rx="${n(r * .16)}" fill="#3D4D66"/>`,
    /* arms */
    `<rect x="${n(x - r * .98)}" y="${n(y + r * .18)}" width="${n(r * .34)}" height="${n(r * 1.12)}" rx="${n(r * .17)}" fill="${dark}"/>`,
    `<rect x="${n(x + r * .64)}" y="${n(y + r * .18)}" width="${n(r * .34)}" height="${n(r * 1.12)}" rx="${n(r * .17)}" fill="${dark}"/>`,
    `<circle cx="${n(x - r * .81)}" cy="${n(y + r * 1.34)}" r="${n(r * .17)}" fill="#F4CBA6"/>`,
    `<circle cx="${n(x + r * .81)}" cy="${n(y + r * 1.34)}" r="${n(r * .17)}" fill="#EBB98E"/>`,
    /* torso overalls */
    `<rect x="${n(x - r * .82)}" y="${n(y + r * .04)}" width="${n(r * 1.64)}" height="${n(r * 1.5)}" rx="${n(r * .62)}" fill="${colour}"/>`,
    `<rect x="${n(x - r * .3)}" y="${n(y + .06 * r)}" width="${n(r * .6)}" height="${n(r * .52)}" rx="${n(r * .14)}" fill="#fff" opacity=".18"/>`,
    /* head */
    `<circle cx="${n(x)}" cy="${n(y - r * .56)}" r="${n(r * .6)}" fill="#F4CBA6"/>`,
    /* hard hat */
    `<path d="M${n(x - r * .66)} ${n(y - r * .58)} A${n(r * .66)} ${n(r * .66)} 0 0 1 ${n(x + r * .66)} ${n(y - r * .58)} Z" fill="${dark}"/>`,
    `<rect x="${n(x - r * .76)}" y="${n(y - r * .64)}" width="${n(r * 1.52)}" height="${n(r * .26)}" rx="${n(r * .13)}" fill="${dark}"/>`,
    `<rect x="${n(x - r * .42)}" y="${n(y - r * 1.02)}" width="${n(r * .4)}" height="${n(r * .16)}" rx="${n(r * .08)}" fill="#fff" opacity=".28"/>`
  ].join('');
}

/* ============================================================
   ENGRAVING KIT
   Shared furniture for the v4 print look. Everything here returns plain SVG
   strings and is purely decorative — the geometry of the drawings, and every
   number printed on them, is untouched.
   ============================================================ */

/* A unique suffix so the <pattern> and <clipPath> ids below can never collide
   when two engravings share a page. The old artFactory hard-coded "ffWall" and
   would have produced two identical ids the moment the tour and the lab were
   on screen together. */
let __engUid = 0;
function engId(prefix) { return prefix + '-' + (++__engUid); }

/* Diagonal-line hatch, the basic shading unit of a copper plate.
   `ang` is degrees, `gap` the spacing in user units. */
function hatchDefs(id, ang, gap, colour, width, opacity) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"
      patternTransform="rotate(${ang})">
      <line x1="0" y1="0" x2="0" y2="${gap}" stroke="${colour}" stroke-width="${width || 0.8}" opacity="${opacity == null ? 0.5 : opacity}"/>
    </pattern>`;
}

/* Cross-hatch: two passes at right angles, for deeper shadow. */
function crossHatchDefs(id, gap, colour, width, opacity) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">
      <path d="M0 0 L${gap} ${gap} M${gap} 0 L0 ${gap}" stroke="${colour}"
        stroke-width="${width || 0.7}" opacity="${opacity == null ? 0.4 : opacity}" fill="none"/>
    </pattern>`;
}

/* A stipple field — irregular dots, the other classic engraving texture. */
function stippleDefs(id, step, colour, r, opacity) {
  /* deterministic offsets: the same plate must look the same every render */
  const dots = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < step; y += 3.4) {
    for (let x = 0; x < step; x += 3.4) {
      const px = (x + rnd() * 3).toFixed(1), py = (y + rnd() * 3).toFixed(1);
      dots.push(`<circle cx="${px}" cy="${py}" r="${((r || 0.5) * (0.6 + rnd() * 0.8)).toFixed(2)}" fill="${colour}" opacity="${((opacity == null ? 0.32 : opacity) * (0.5 + rnd() * 0.5)).toFixed(2)}"/>`);
    }
  }
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">${dots.join('')}</pattern>`;
}

/* A row of short ticks used as an engraved rule beneath text. */
function engRule(x, y, w, colour, gap) {
  gap = gap || 6;
  let d = '';
  for (let i = 0; i < w; i += gap) d += `M${(x + i).toFixed(1)} ${y} h${(gap * 0.55).toFixed(1)} `;
  return `<path d="${d}" stroke="${colour}" stroke-width="1" fill="none"/>`;
}

/* The plate's paper: a warm ground with a faint stipple, plus a ruled border
   and registration corners. `inset` keeps the furniture clear of the drawing. */
function engPaper(W, H, ink, paper) {
  const gilt = engId('engStip');
  return `<defs>${stippleDefs(gilt, 34, ink, 0.42, 0.1)}</defs>`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="${paper || '#F6F0E1'}"/>`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${gilt})"/>`;
}
function engFrame(x, y, w, h, ink, weight) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
      stroke="${ink}" stroke-width="${weight || 1.1}" opacity=".55"/>`
    + `<rect x="${x + 3.5}" y="${y + 3.5}" width="${w - 7}" height="${h - 7}" fill="none"
      stroke="${ink}" stroke-width=".6" opacity=".3"/>`;
}
/* Short corner brackets — the printer's registration marks. */
function engCorners(x, y, w, h, ink, len) {
  len = len || 9;
  const c = (px, py, dx, dy) => `<path d="M${px} ${py + dy * len} L${px} ${py} L${px + dx * len} ${py}"
      stroke="${ink}" stroke-width="1.5" fill="none" opacity=".6"/>`;
  return c(x, y, 1, 1) + c(x + w, y, -1, 1) + c(x, y + h, 1, -1) + c(x + w, y + h, -1, -1);
}

/* ---- factory floor: fixed factors vs variable factors ---- */
function artFactory(K, L, prod, colour, opt) {
  opt = opt || {};
  const W = 680, H = 252;
  const dark = shade(colour, -0.16);
  const o = [];

  /* --- v4 print ground ---------------------------------------------------
     The plate is now a piece of paper, not a white screen: a warm stipple
     ground, a ruled double border with registration corners, and hatch
     shadow inside the rented land. The drawing itself keeps its exact
     coordinates, so every label still sits where it always did. */
  const INK = '#3A3226', PAPER = '#F6F0E1';
  const idWall = engId('ffWall'), idHatch = engId('ffHatch'), idStip = engId('ffStip');
  o.push(engPaper(W, H, INK, PAPER));
  o.push(`<defs>`
    + `<linearGradient id="${idWall}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0%" stop-color="#FBF7EC"/><stop offset="100%" stop-color="#EFE6D3"/></linearGradient>`
    + hatchDefs(idHatch, 42, 7, INK, 0.7, 0.16)
    + stippleDefs(idStip, 26, INK, 0.4, 0.09)
    + `</defs>`);
  o.push(engFrame(6, 6, W - 12, H - 12, INK, 1.2));
  o.push(engCorners(6, 6, W - 12, H - 12, INK, 10));

  // workshop interior: wall + floor
  o.push(`<rect x="10" y="10" width="${W - 20}" height="${H - 34}" rx="12" fill="url(#${idWall})" stroke="${INK}" stroke-opacity=".38" stroke-width="1.6" stroke-dasharray="7 5"/>`);
  o.push(`<rect x="10" y="10" width="${W - 20}" height="${H - 34}" rx="12" fill="url(#${idHatch})"/>`);
  // corner posts of the rented land
  [[10,10],[W-10,10],[10,H-24],[W-10,H-24]].forEach(([px,py]) =>
    o.push(`<rect x="${px-3}" y="${py-3}" width="6" height="6" rx="1.6" fill="${PAPER}" stroke="${INK}" stroke-opacity=".7" stroke-width="1.3"/>`));
  o.push(`<rect x="18" y="15" width="232" height="19" rx="9.5" fill="${PAPER}" opacity=".92"/>`);
  o.push(`<text class="ca" x="26" y="28" fill="${colour}">LAND &#183; rented workshop &#183; FIXED</text>`);

  // floor strip + conveyor belt, inked rather than coloured in
  o.push(`<rect x="14" y="194" width="${W - 28}" height="26" rx="10" fill="#E7DCC5"/>`);
  o.push(`<rect x="14" y="194" width="${W - 28}" height="26" rx="10" fill="url(#${idStip})"/>`);
  o.push(`<rect x="26" y="203" width="${W - 52}" height="12" rx="6" fill="#EFE6D3" stroke="${INK}" stroke-opacity=".5" stroke-width="1.1"/>`);
  for (let rx = 40; rx < W - 40; rx += 42) o.push(`<circle cx="${rx}" cy="209" r="2.2" fill="${INK}" opacity=".28"/>`);
  // raw-material crates travelling in
  [44, 73, 102].forEach(bx => {
    o.push(`<rect x="${bx}" y="194" width="14" height="12" rx="2" fill="#E6C08A" stroke="#8A6636" stroke-width="1.2"/>`);
    o.push(`<line x1="${bx + 7}" y1="194" x2="${bx + 7}" y2="206" stroke="#8A6636" stroke-width="1"/>`);
    o.push(`<line x1="${bx}" y1="200" x2="${bx + 14}" y2="200" stroke="#8A6636" stroke-width="1"/>`);
    o.push(`<ellipse cx="${bx + 7}" cy="193.5" rx="4.4" ry="1.8" fill="#D3A468" stroke="#8A6636" stroke-width=".7"/>`);
  });
  // finished goods going out: a parcel carrying the product itself
  const ox = W - 114;
  o.push(`<ellipse cx="${ox + 13}" cy="211" rx="13" ry="2.4" fill="rgba(58,50,38,.16)"/>`);
  o.push(`<rect x="${ox}" y="189" width="26" height="20" rx="4.5" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`);
  o.push(`<svg x="${ox + 3}" y="191.5" width="20" height="20" viewBox="0 0 48 48">${ICONS.inner(prod.id)}</svg>`);

  // machines
  const mw = 62, gap = 10;
  const mStart = 26;
  const mTop = 60;
  o.push(`<text class="ca" x="${mStart}" y="47" fill="${INK}" opacity=".72">CAPITAL &#183; fixed</text>`);
  for (let i = 0; i < K; i++) {
    const x = mStart + i * (mw + gap), cx = x + mw / 2;
    o.push(`<ellipse cx="${cx}" cy="121" rx="27" ry="5" fill="rgba(58,50,38,.14)"/>`);
    o.push(machineArt(prod.cap, x, mTop, mw, colour));
    /* engraved shadow under each machine: hatch, not a soft grey blur */
    o.push(`<ellipse cx="${cx}" cy="122" rx="26" ry="4.4" fill="url(#${idHatch})"/>`);
    // name plate (long machine names get a short tag so plates never overlap)
    const CAP_SHORT = { polytunnel: 'tunnel' };
    const plateLabel = `${CAP_SHORT[prod.cap] || prod.cap} ${i + 1}`;
    const pw = Math.max(54, Math.min(70, plateLabel.length * 6.7 + 12));
    o.push(`<rect x="${cx - pw / 2}" y="123" width="${pw}" height="15" rx="7.5" fill="${PAPER}" stroke="${INK}" stroke-opacity=".42" stroke-width="1"/>`);
    o.push(`<text class="ct" x="${cx}" y="133.5" text-anchor="middle" font-weight="700" font-size="${plateLabel.length > 8 ? 9.5 : 11}">${plateLabel}</text>`);
  }

  // workers
  const wStart = 26 + K * (mw + gap) + 16;
  const avail = W - 22 - wStart;
  const perRow = Math.max(6, Math.min(13, L || 1));
  const cw = Math.min(34, avail / perRow);
  const r = Math.max(3.4, Math.min(7, cw * 0.24));
  for (let i = 0; i < L; i++) {
    const row = Math.floor(i / perRow), col = i % perRow;
    const cx = wStart + cw * (col + 0.5);
    const cy = 84 + row * 46;
    o.push(workerArt(cx, cy, r, colour, dark));
  }
  o.push(`<text class="ca" x="${W - 22}" y="47" text-anchor="end" fill="${INK}" opacity=".72">LABOUR &#183; variable &#183; ${L} worker${L === 1 ? '' : 's'}</text>`);

  /* engraved rule separating the floor from the tally line.
     Pulled up to H-52 so the two tally lines below it keep clear of the plate
     border — at H-40 the rule and the labels sat in one another's laps. */
  o.push(engRule(26, H - 52, W - 52, INK, 7));

  // material in / output out
  const q = ECON.output(K, L);
  o.push(`<text class="ct" x="26" y="${H - 34}">RAW MATERIALS in: $${ECON.MAT} per unit</text>`);
  o.push(`<text class="ct" x="${W - 26}" y="${H - 34}" text-anchor="end">OUTPUT: <tspan class="cn" fill="${colour}">${fmt(q, 1)} units</tspan></text>`);
  /* The callout sits above the conveyor strip (y=194), so 186 is the last
     baseline that clears it. Kept as-is but restated with the paper stroke so
     it reads on the stipple ground. */
  if (opt.crowd && L > 4 * K) {
    o.push(`<text class="cl" x="26" y="184" fill="#8A5A0B" stroke="${PAPER}" stroke-width="3.8" paint-order="stroke">crowded: too many workers per ${prod.cap}</text>`);
  }
  if (opt.lazy && L < 4 * K) {
    o.push(`<text class="cl" x="26" y="184" fill="#8A5A0B" stroke="${PAPER}" stroke-width="3.8" paint-order="stroke">${prod.caps} are idle: spare capacity</text>`);
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${o.join('')}</svg>`;
}


/* ---- one shop front ----
   Redrawn as a small engraved shop: paper ground, ruled frame, a striped
   awning and a hatched shadow under it. `name` was accepted but unused in the
   original, so it is now actually set on the fascia instead of being dropped. */
function shopSVG(colour, icon, name, price, opts) {
  opts = opts || {};
  const W = opts.w || 118, H = opts.h || 118;
  const INK = '#3A3226', PAPER = '#F6F0E1';
  const idAwn = engId('shAwn'), idSide = engId('shSide');
  const o = [];
  o.push(engPaper(W, H, INK, PAPER));
  o.push(`<defs>${hatchDefs(idSide, 45, 6, INK, 0.7, 0.18)}</defs>`);
  o.push(engFrame(2, 2, W - 4, H - 4, INK, 1));

  // building body
  o.push(`<rect x="7" y="18" width="${W - 14}" height="${H - 26}" rx="3" fill="#EFE6D3" stroke="${INK}" stroke-opacity=".55" stroke-width="1.2"/>`);
  // striped awning, the classic shopfront signature
  o.push(`<rect x="5" y="17" width="${W - 10}" height="17" rx="3" fill="url(#${idAwn})"/>`);
  o.push(`<rect x="5" y="17" width="${W - 10}" height="17" rx="3" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>`);
  o.push(`<path d="M5 34 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0 q5.4 5 10.8 0"
    fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="1"/>`);
  // shop window
  o.push(`<rect x="13" y="42" width="${W - 26}" height="${H - 70}" rx="2.5" fill="#FBF7EC" stroke="${INK}" stroke-opacity=".5" stroke-width="1.1"/>`);
  o.push(`<rect x="13" y="42" width="${W - 26}" height="${H - 70}" rx="2.5" fill="url(#${idSide})"/>`);
  // glazing bars
  o.push(`<line x1="${W / 2}" y1="42" x2="${W / 2}" y2="${H - 28}" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>`);
  // the product on display
  o.push(`<text x="${W / 2}" y="${H - 42}" text-anchor="middle" font-size="${opts.iconSize || 26}">${icon}</text>`);

  if (name && opts.fascia !== false) {
    o.push(`<text class="ct" x="${W / 2}" y="${H - 57}" text-anchor="middle" font-size="7.6"
      fill="${INK}" font-variant="small-caps" letter-spacing=".14em" opacity=".8">${String(name).slice(0, 16)}</text>`);
  }
  if (price != null) {
    o.push(`<rect x="${W / 2 - 21}" y="${H - 37}" width="42" height="17" rx="2.5" fill="#3A3226"/>`
      + `<text class="cw" x="${W / 2}" y="${H - 24}" text-anchor="middle" font-size="11">$${price}</text>`);
  }
  if (opts.label) o.push(`<text class="ct" x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="10">${opts.label}</text>`);
  if (opts.closed) {
    o.push(`<g opacity=".95"><circle cx="${W / 2}" cy="${H - 49}" r="10.5" fill="${PAPER}" stroke="#9B3B32" stroke-width="2.4"/>`
      + `<line x1="${W / 2 - 7.4}" y1="${H - 56.4}" x2="${W / 2 + 7.4}" y2="${H - 41.6}" stroke="#9B3B32" stroke-width="2.4" stroke-linecap="round"/></g>`);
  }
  return `<svg viewBox="0 0 ${W} ${H}" style="width:${opts.cssW || 92}px;height:auto;display:block" role="img">${o.join('')}</svg>`;
}

/* ---- the high street: rivals wear your face (perfect competition) ---- */
/* ---- the high street: rivals wear your face (perfect competition) ---- */
function artStreet(prod, colour, entries, opt) {
  opt = opt || {};
  const cells = entries.map(e => {
    const cls = 'shop' + (e.closed ? ' closed' : '') + (e.mine ? ' mine' : '');
    const col = e.colour || colour;
    return `<div class="${cls}" style="--shop:${col}">
      <span class="e">${picon(prod.id)}</span>
      <div>${e.label || ''}</div>
      <div>${e.sub || ''}</div>
    </div>`;
  }).join('');
  const heading = opt.heading ? `<div class="small muted" style="margin:.2rem 0 .5rem;font-weight:700;letter-spacing:.01em">${opt.heading}</div>` : '';
  return `${heading}<div class="shoprow">${cells}</div>`;
}


/* ---- demand & supply schematic used in the intro cards ---- */
/* ---- demand & supply schematic used in the intro cards ---- */
function artMarketDiagram(colour) {
  const o = [];
  const W = 680, H = 250;
  const x0 = 70, x1 = 630, y0 = 210, y1 = 30;
  const X = v => x0 + v / 100 * (x1 - x0);
  const Y = v => y0 - v / 100 * (y0 - y1);
  o.push(`<rect width="${W}" height="${H}" rx="12" fill="#fff"/>`);
  // consumer & producer surplus tints
  o.push(`<polygon points="${X(10)},${Y(80)} ${X(50)},${Y(51)} ${X(10)},${Y(51)}" fill="${PAL.red}" opacity=".07"/>`);
  o.push(`<polygon points="${X(10)},${Y(20)} ${X(50)},${Y(51)} ${X(10)},${Y(51)}" fill="${PAL.green}" opacity=".07"/>`);
  // axes with arrows
  o.push(`<line class="ax" x1="${x0}" y1="${y0}" x2="${x1 + 8}" y2="${y0}"/>`);
  o.push(`<line class="ax" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1 - 8}"/>`);
  o.push(`<path d="M${x1 + 8} ${y0} l-8 -3.6 v7.2 Z" fill="#B9C6D9"/>`);
  o.push(`<path d="M${x0} ${y1 - 8} l-3.6 8 h7.2 Z" fill="#B9C6D9"/>`);
  // curves (slightly bowed, drawn as quadratic beziers)
  o.push(`<path d="M${X(10)} ${Y(80)} Q${X(48)} ${Y(56)} ${X(90)} ${Y(22)}" stroke="${PAL.red}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
  o.push(`<path d="M${X(10)} ${Y(20)} Q${X(48)} ${Y(46)} ${X(90)} ${Y(82)}" stroke="${PAL.green}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
  // equilibrium guides
  o.push(`<line x1="${x0}" y1="${Y(51)}" x2="${X(50)}" y2="${Y(51)}" stroke="#C7D2E3" stroke-dasharray="5 4" stroke-width="1.6"/>`);
  o.push(`<line x1="${X(50)}" y1="${Y(51)}" x2="${X(50)}" y2="${y0}" stroke="#C7D2E3" stroke-dasharray="5 4" stroke-width="1.6"/>`);
  o.push(`<circle cx="${X(50)}" cy="${Y(51)}" r="10" fill="${PAL.ink}" opacity=".12"/>`);
  o.push(`<circle cx="${X(50)}" cy="${Y(51)}" r="6" fill="${PAL.ink}" stroke="#fff" stroke-width="2.6"/>`);
  o.push(`<text class="cl" x="${X(88)}" y="${Y(20)}" fill="${PAL.red}" stroke="#fff" stroke-width="3.6" paint-order="stroke">Demand</text>`);
  o.push(`<text class="cl" x="${X(88)}" y="${Y(84)}" fill="${PAL.green}" stroke="#fff" stroke-width="3.6" paint-order="stroke">Supply</text>`);
  o.push(`<text class="ct" x="${X(50)}" y="${y0 + 16}" text-anchor="middle" font-weight="800">Q*</text>`);
  o.push(`<text class="ct" x="${x0 - 9}" y="${Y(51) + 4}" text-anchor="end" font-weight="800">P*</text>`);
  o.push(`<text class="ca" x="${(x0 + x1) / 2}" y="${H - 8}" text-anchor="middle">Quantity (units per period)</text>`);
  o.push(`<text class="ca" x="20" y="${(y0 + y1) / 2}" text-anchor="middle" transform="rotate(-90 20 ${(y0 + y1) / 2})">Price ($)</text>`);
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${o.join('')}</svg>`;
}
