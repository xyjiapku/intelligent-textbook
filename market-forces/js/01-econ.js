/* ============================================================
   MARKET FORCES — economics engine
   All numbers in this file are validated by scripts/verify.js
   ============================================================ */

/* --- the technology of the firm (short run) --------------------------
   Q = K * q(x),  x = L/K,  q(x) = A1*x + A2*x^2 - A3*x^3

   The cubic is the textbook short-run production function, and every shape the
   lesson needs falls straight out of the algebra rather than out of fitted
   constants:

      marginal product peaks at x = A2/(3*A3)      -> diminishing returns from there
      average product peaks at x = A2/(2*A3) = AP_X -> minimum AVC sits at AP_X*K
      marginal product cuts average product exactly at AP's peak
      total product peaks at x = X_TPP*K, then FALLS -> MP goes negative after it

   THE THREE COEFFICIENTS ARE DERIVED, NOT TYPED IN. They used to be three
   literals (4.8 / 0.6 / 0.075) sitting beside three shape constants that they
   were supposed to satisfy, with nothing tying one to the other; changing a
   shape constant silently left the algebra contradicting it. Now you set the
   shape and the coefficients follow:

      A3 = AP_MAX / (3*X_TPP^2 - 4*AP_X*X_TPP + AP_X^2)
      A2 = 2*A3*AP_X
      A1 = AP_MAX - A3*AP_X^2

   and they come out exact: AP_MAX 6 at AP_X 7 with X_TPP 14 gives A1 = 4.8
   exactly, A2 = 12/35, A3 = 6/245.

   WHY THE PEAK MOVED OUT. It used to be X_TPP = 8, which put a one-machine
   plant's ceiling at 38.4 units and a three-machine plant's at 115. Two things
   followed, and both were reported from play:

     · the cost curves are drawn as far as the peak of total product, so a plant
       of three or four machines ran out of range while average cost was still
       BELOW demand — the AC curve was cut off before it could turn up and meet
       demand again, and for those plants a fair-return price did not exist;
     · a monopolistically-competitive firm's own demand reached further than its
       plant could make, so cutting the price could not raise sales.

   With X_TPP = 14 the ceiling is 67.2 units per machine, and every plant size
   the monopoly chapter offers now has both crossings. The two anchors the rest
   of the game is built on are untouched: minimum AVC is still $18.00 (AP_MAX is
   still 6) and the first worker's marginal product is still 4.8.

   _tools/calibration.js prints the whole picture for a candidate before you
   commit to one. */
const AP_MAX = 6;      // output per worker at the peak of average product
const AP_X = 7;        // workers per machine at which average product peaks
const X_TPP = 14;      // workers per machine at which total product peaks
const _A3 = AP_MAX / (3 * X_TPP * X_TPP - 4 * AP_X * X_TPP + AP_X * AP_X);
const _A2 = 2 * _A3 * AP_X;
const _A1 = AP_MAX - _A3 * AP_X * AP_X;

const ECON = {
  A1: _A1, A2: _A2, A3: _A3,
  X_TPP: X_TPP,
  AP_X: AP_X,
  AP_MAX: AP_MAX,

  LAND: 200,      // rent for the workshop (fixed factor: LAND) per period
  MACHINE: 150,   // lease cost of one unit of capital. Named MACHINE for history;
                  // the UI always calls it by the product's own capital good
                  // (oven, roaster, press, lathe, vat, polytunnel).
  WAGE: 90,       // wage per worker per period (variable factor: LABOUR)
  MAT: 3,         // raw material cost per unit of output (variable factor)

  /* How many workers are worth offering the student, given K machines.
     It has to reach past the point where total product turns down (x = X_TPP*K),
     or the student never sees marginal product go negative — that negative
     stretch is a whole lesson in the lab and the reason the teacher guide can
     say "too many workers is not always better". 30% past the peak leaves about
     four workers of falling output in view: enough to be obvious, not so much
     that the slider becomes a chore. 12 is the floor so one unit of capital
     still has a usable slider.

     Written in terms of X_TPP rather than as a bare constant, so this can never
     drift out of step with the production function again — the old 10.5 was
     1.3125 x 8, and moving the peak silently left it behind. */
  maxL(K) { return Math.max(12, Math.ceil(ECON.X_TPP * K * 1.3)); },

  /* the most this plant can physically turn out in a period */
  capacity(K) {
    const x = ECON.X_TPP;
    return K * (ECON.A1 * x + ECON.A2 * x * x - ECON.A3 * x * x * x);
  },

  /* output per machine q(x); never negative, the cubic is only meaningful
     up to the point where it comes back down to zero */
  qx(x) { return Math.max(0, ECON.A1 * x + ECON.A2 * x * x - ECON.A3 * x * x * x); },

  output(K, L) {
    if (L <= 0) return 0;
    return K * ECON.qx(L / K);
  },
  /* a discrete difference, on purpose: this is what makes MP turn negative and
     visible as a column in the table */
  mp(K, L) { return L <= 0 ? 0 : ECON.output(K, L) - ECON.output(K, L - 1); },
  ap(K, L) { return L <= 0 ? 0 : ECON.output(K, L) / L; },

  tfc(K) { return ECON.LAND + ECON.MACHINE * K; },
  tvc(K, L) { return ECON.WAGE * L + ECON.MAT * ECON.output(K, L); },
  tc(K, L) { return ECON.tfc(K) + ECON.tvc(K, L); },

  ac(K, L) { const q = ECON.output(K, L); return q > 0 ? ECON.tc(K, L) / q : Infinity; },
  avc(K, L) { const q = ECON.output(K, L); return q > 0 ? ECON.tvc(K, L) / q : Infinity; },
  afc(K, L) { const q = ECON.output(K, L); return q > 0 ? ECON.tfc(K) / q : Infinity; },

  /* marginal cost = extra total cost of the next worker / extra output.
     Past the peak of total product the next worker REDUCES output, so the extra
     output is negative and marginal cost is not defined: no firm would ever go
     there, and the charts must not pretend otherwise.

     THE PREVIOUS STEP MUST NOT GO BELOW ZERO LABOUR. `tc(K, L-1)` at L < 1
     evaluates total variable cost at a NEGATIVE labour input, where
     `tvc = WAGE * L + MAT * q` turns negative — so the "extra cost" of the
     first fraction of a worker came out far too large and marginal cost was
     inflated at exactly the low outputs that matter for a small plant.
     Measured at K=1, L=0.3: $63.33 before, $21.15 after.

     That artefact propagated: `socialOpt()` sweeps output from q = 1 upward, so
     it landed in the broken region and reported a one-machine plant's
     allocatively efficient output as 1.5 units with AC = $254 — a spectacular
     loss that made P = MC look like it needed a subsidy. The true figure is
     38.3 units at AC = $30, which is a profit. An achievement assertion and a
     whole branch of the regulator's narration were written against the broken
     value; both are corrected in this round. */
  mc(K, L) {
    if (L <= 0) return Infinity;
    const L0 = Math.max(0, L - 1);
    const dq = ECON.output(K, L) - ECON.output(K, L0);
    if (dq <= 0.0001) return Infinity;
    return (ECON.tc(K, L) - ECON.tc(K, L0)) / dq;
  },

  /* AVC = WAGE/AP + MAT, so its minimum is where AP peaks */
  minAVC() { return ECON.WAGE / ECON.AP_MAX + ECON.MAT; },

  /* the lowest point of the average cost curve, and the price competition
     eventually drives the market to (zero economic profit) */
  minACL(K) {
    let bestL = 1, best = Infinity;
    for (let L = 1; L <= ECON.maxL(K); L++) {
      const a = ECON.ac(K, L);
      if (a < best) { best = a; bestL = L; }
    }
    return { L: bestL, ac: best, q: ECON.output(K, bestL) };
  },
  longRunP(K) { return Math.round(ECON.minACL(K).ac); },

  profit(K, L, P, qSoldOverride) {
    const q = qSoldOverride == null ? ECON.output(K, L) : qSoldOverride;
    return P * q - ECON.tc(K, L);
  },

  /* best labour input for a price taker facing price P */
  bestL(K, P) {
    let bestL = 0, best = -Infinity;
    const top = ECON.maxL(K);
    for (let L = 0; L <= top; L++) {
      const v = ECON.profit(K, L, P);
      if (v > best + 1e-9) { best = v; bestL = L; }
    }
    return { L: bestL, profit: best };
  },

  /* ---- market demand:  Q = A - B*P  ---------------------------------- */
  A: 300, B: 5,
  marketQ(P) { return Math.max(0, ECON.A - ECON.B * P); },
  marketP(Q) { return Math.max(0, (ECON.A - Q) / ECON.B); },
  mrFromQ(Q) { return (ECON.A - 2 * Q) / ECON.B; },   // MR of a linear demand

  /* labour needed to physically produce q units with K machines.
     Bisection on the RISING branch only: beyond the peak of total product the
     same output could be "produced" with fewer workers, and that is not a
     position any firm would choose. */
  labourFor(K, q) {
    if (q <= 0) return 0;
    if (q > ECON.output(K, K * ECON.X_TPP)) return Infinity;   // beyond capacity
    let lo = 0, hi = K * ECON.X_TPP;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (ECON.output(K, mid) < q) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  },

  /* profit for a price maker who sets price P, spends ad spend A,
     and owns K machines; demand multiplier comes from the caller */
  priceMaker(K, P, demMult, adFixed) {
    const q = Math.max(0, (ECON.A - ECON.B * P) * (demMult == null ? 1 : demMult));
    const L = ECON.labourFor(K, q);
    const ad = adFixed || 0;
    if (!isFinite(L)) return { q, L: Infinity, ac: Infinity, tc: Infinity, tr: P * q, profit: -Infinity, feasible: false };
    const tc = ECON.tc(K, L) + ad;
    return { q, L, ac: tc / q, tc, tr: P * q, profit: P * q - tc, feasible: true, mr: ECON.mrFromQ(q) };
  },

  /* ============================================================
     MONOPSONY — the firm as the only buyer of labour in the town
     ------------------------------------------------------------
     Until now labour came from a bottomless outside market, so the firm paid the
     going wage $90 whatever it did: supply was perfectly elastic. As the town's
     only employer there is no outside market to hire from, so the supply of
     labour slopes upwards:

         W(L) = LS_A + LS_B * L        L(W) = (W - LS_A) / LS_B

     Calibrated so that at the employment the firm was already using in the
     monopoly chapter (about 15.7 workers) the wage is exactly the $90 it used to
     pay, which keeps the two chapters comparable.

     Because hiring one more worker pushes up the pay of everyone already
     employed, the marginal factor cost sits above the wage:

         MFC(L) = LS_A + 2 * LS_B * L
     ============================================================ */
  LS_A: 33, LS_B: 3.5,

  supplyWage(L) { return ECON.LS_A + ECON.LS_B * L; },
  labourAtWage(W) { return Math.max(0, (W - ECON.LS_A) / ECON.LS_B); },
  mfc(L) { return ECON.LS_A + 2 * ECON.LS_B * L; },
  /* what one more worker is worth: marginal revenue on their output, less the
     materials those units consume */
  mrp(K, L) {
    const q = ECON.output(K, L);
    return (ECON.mrFromQ(q) - ECON.MAT) * ECON.mp(K, L);
  },

  /* the firm names a wage; the town decides how many people will work for it */
  buyerState(K, W) {
    const L = ECON.labourAtWage(W);
    const Q = ECON.output(K, L);
    const P = ECON.marketP(Q);
    const TR = P * Q;
    const tvc = W * L + ECON.MAT * Q;
    const tc = tvc + ECON.tfc(K);
    return {
      W, L, Q, P, TR, tvc, tc,
      profit: TR - tc,
      ac: Q > 0 ? tc / Q : Infinity,
      mfc: ECON.mfc(L),
      mrp: ECON.mrp(K, Math.max(L, 0.5))
    };
  },

  /* profit-maximising wage for a monopsonist, and the wage a competitive
     labour market would settle at (where supply meets marginal revenue product) */
  bestWage(K) {
    let best = null;
    for (let W = ECON.LS_A + 1; W <= 200; W += 0.25) {
      const r = ECON.buyerState(K, W);
      if (!(r.L > 1)) continue;
      if (!best || r.profit > best.profit) best = r;
    }
    return best;
  },
  competitiveWage(K) {
    let best = null;
    for (let W = ECON.LS_A + 1; W <= 220; W += 0.25) {
      const r = ECON.buyerState(K, W);
      if (!(r.L > 1)) continue;
      const gap = Math.abs(r.W - r.mrp);
      if (!best || gap < best.gap) best = Object.assign({ gap }, r);
    }
    return best;
  },

  /* The value destroyed by buying labour monopsonistically: between the
     monopsony employment and the competitive one, each worker is worth more to
     the firm than the wage they would need to be offered. That gap is never
     produced, and nobody receives it. Integrated numerically. */
  monopsonyDWL(K) {
    const best = ECON.bestWage(K), comp = ECON.competitiveWage(K);
    if (!best || !comp || !(comp.L > best.L)) return { area: 0, from: best ? best.L : 0, to: comp ? comp.L : 0 };
    const a = best.L, b = comp.L, n = 400;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const L = a + (i + 0.5) * (b - a) / n;
      const gap = ECON.mrp(K, L) - ECON.supplyWage(L);
      if (gap > 0) area += gap * (b - a) / n;
    }
    return { area, from: a, to: b, gapAtBest: ECON.mrp(K, a) - best.W };
  }
};

if (typeof module !== 'undefined') module.exports = ECON;
