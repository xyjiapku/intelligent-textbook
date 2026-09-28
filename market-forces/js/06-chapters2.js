/* ============================================================
   MARKET FORCES — monopolistic competition (chapter 3),
   oligopoly (chapter 4) and monopoly (chapter 2).
   File order is mc → oligo → mono; the playing order is the one in
   CHAPTERS (03_ui.js): pc → mono → mc → oligo.
   ============================================================ */

const RIVAL_NAME = 'Northwind';
function rivalColour() {
  const i = COLOURS.indexOf(S.colour);
  return COLOURS[(i + 4) % COLOURS.length];
}
function variantName() { return prod().variants[S.dec.variant || 0] || prod().variants[0]; }

/* ============================================================
   CHAPTER 2 — MONOPOLISTIC COMPETITION
   ============================================================ */
BEATS.mc = () => ([
  {
    t: 'intro',
    kicker: 'Chapter 3 \u00b7 Monopolistic Competition',
    title: 'Make something people can tell apart',
    paras: [
      'You have now seen both extremes of the same workshop. In Chapter 1 your product was identical to everyone else\u2019s and you had no power at all \u2014 you never chose a price, and competition took every dollar of profit. In Chapter 2 a licence and a patent made you the only seller in town, and the price was entirely yours.',
      `This chapter is the realistic middle, and it is where most real firms actually live. You keep the workshop, the ${cap()} and the product \u2014 but you give it a name, a look and a reason for customers to prefer it. It is still a ${prod().unit}, but it is <b>your</b> version of it. No licence protects you, and nothing at all stops anyone copying you.`,
      `Some customers will now go out of their way for it. That gives you a <b>downward-sloping demand curve of your own</b> \u2014 you get to choose a price again. But the power is limited: dozens of other ${sellers()} sell close substitutes, and the moment your idea works they will imitate it.`
    ],
    choices: () => prod().variants.map((v, i) => ({ v: i, label: v, sub: 'your version' })),
    onPick: v => { S.dec.variant = +v; },
    bullets: [
      '<b>The market:</b> many sellers, each with a product that is <i>similar but not identical</i>. Free entry, just like before.',
      '<b>Your new power:</b> you set the price. Raise it and you lose some customers \u2014 but not all of them.',
      '<b>Your new problem:</b> the moment your version sells well, everyone can copy it.'
    ],
    btn: 'Launch the rebrand \u2192'
  },
  {
    t: 'event', cls: 'good', tag: 'The rebrand',
    title: () => `${esc(S.firmName)} ${variantName()} hits the shelves`,
    paras: [
      `You repackage, rename and reprice. Your ${prod().unit} is now <b>${variantName()}</b>, sold under your own label in your own colour.`,
      'Some customers will pay a little more for it. Others will not care at all. Your demand curve now slopes downwards: at a high price you sell few units, at a low price you sell many.',
      '<b>And this changes the profit rule.</b> Because you must cut the price to sell more, marginal revenue is now <i>below</i> price. The rule is still MR = MC \u2014 but MR is no longer equal to the price.'
    ],
    art: () => artStreet(prod(), S.colour, [
      { label: S.firmName || 'You', sub: variantName(), mine: true },
      { label: 'Rival A', sub: 'plain version', colour: COLOURS[2] },
      { label: 'Rival B', sub: 'plain version', colour: COLOURS[3] },
      { label: 'Rival C', sub: 'plain version', colour: COLOURS[5] }
    ], { heading: 'You now look different from the crowd \u2014 but only slightly' }),
    btn: 'Set your price \u2192'
  },
  {
    t: 'decision', kind: 'mc', tag: 'Launch season', label: 'Launch season',
    /* no L: the crew follows from the price. See mcAutoL() in 05-chapters.js. */
    setup: () => ({ P: 40, K: 1, ad: 0, variant: S.dec.variant || 0, mult: 1.0 }),
    title: 'Set your price for the launch',
    brief: 'You choose the price now. Watch how many customers a price attracts \u2014 your plant then makes whatever that takes, up to its ceiling \u2014 and check what is left over.',
    after: r => {
      const eq = mcEquilibrium(S.dec.K, (S.dec.mult || 1) * AD_LEVELS[S.dec.ad].mult);
      return `
      <div class="narr">At <b>$${fmt(S.dec.P, 0)}</b> you sold ${fmt(r.sold, 1)} units at an average cost of ${money(r.tc / (r.qp || 1), 2)}, earning <b>${money(r.profit)}</b> of economic profit.</div>
      <div class="card tight" data-note="amber">
        <div class="small"><b>This is the moment you gained market power.</b> Compare it with Chapter 1: there, price was fixed at $40 and you took whatever the market gave you. Here, at $${fmt(S.dec.P, 0)}, you could have chosen $35 or $45 instead \u2014 and your profit would have been different. Your demand curve slopes down, so <b>MR &lt; P</b>${eq ? `, and a profit-maximising firm stops where <b>MR = MC</b> \u2014 at about <b>${fmt(eq.Q, 1)} units</b>, which this demand curve supports at <b>$${fmt(eq.P, 0)}</b>. That is the violet mark on the chart.` : '.'}</div>
      </div>
      <div class="card tight" data-note="flat"><div class="small muted">Advertising note: at launch, a local poster campaign costs ${money(140)} and lifts demand by 40%. Notice what that does to the mark: it moves the whole demand curve, so the output where MR = MC changes too. Whether the campaign pays for itself depends on your margin per unit.</div></div>`;
    }
  },
  {
    t: 'event', cls: 'warn', tag: 'Market event \u00b7 imitation',
    title: 'Everyone copies you',
    paras: [
      `Your ${variantName()} sold well \u2014 so within a season, four other ${sellers()} launched something suspiciously similar. Different name, different colour, close enough that most customers shrug and buy whichever is nearest.`,
      '<b>This is the weakness of differentiation.</b> Nothing legal stops them: your idea was not protected, and the technology is the same. Your <i>own</i> demand curve, at every price, has shrunk.',
      'Notice what has <i>not</i> changed: you are still free to set your price. What has changed is how many customers turn up at each price.'
    ],
    change: `<span class="pricetag"><span class="old">your demand</span><span class="new">\u2212 38%</span></span> <span class="delta down">at every price, fewer customers</span>`,
    art: () => artStreet(prod(), S.colour, [
      { label: S.firmName || 'You', sub: variantName(), mine: true },
      { label: 'Rival A', sub: 'copycat', colour: COLOURS[1] },
      { label: 'Rival B', sub: 'copycat', colour: COLOURS[3] },
      { label: 'Rival C', sub: 'copycat', colour: COLOURS[5] },
      { label: 'Rival D', sub: 'copycat', colour: COLOURS[6] }
    ], { heading: 'Five near-identical versions of your idea' }),
    btn: 'Fight back \u2192'
  },
  {
    t: 'decision', kind: 'mc', tag: 'Season 2', label: 'Season 2',
    setup: () => ({ P: 40, K: 1, ad: 0, variant: S.dec.variant || 0, mult: 0.62 }),
    title: 'Season two \u2014 the copies are everywhere',
    brief: 'Your demand has shrunk. You can cut your price, spend on advertising, or both. Work out which combination leaves you best off.',
    after: r => {
      /* BOTH comparisons are read from the engine. These were hard-coded
         ("$103.5 if you do not advertise, or about $113.7 with local posters")
         and the second number had drifted $12 from what the model actually
         pays. `bestMC` and `bestMCNoAd` search exactly the grid the panel
         offers, so they cannot point at a choice the student could not make. */
      const M2 = S.dec.mult || 1;
      const bestNoAd = bestMCNoAd(M2), bestAny = bestMC(M2);
      const adGain = bestAny.profit - bestNoAd.profit;
      const launchBest = bestMC(1.0);
      const share = launchBest.profit > 0 ? 1 - bestAny.profit / launchBest.profit : 0;
      return `
      <div class="narr">Best possible result with this demand: <b>${money(bestNoAd.profit)}</b> if you do not advertise, or about <b>${money(bestAny.profit)}</b> with ${bestAny.adLabel.toLowerCase()}. You ended at <b>${money(r.profit)}</b>.</div>
      <div class="narr">Read that carefully. Imitators have taken roughly <b>${fmt(share * 100, 0)}%</b> of the profit you could make at launch (${money(launchBest.profit)} then, ${money(bestAny.profit)} now), and the whole advertising menu is worth only <b>${money(adGain)}</b> to you. <b>Advertising here is almost self-cancelling</b>: it lifts demand, but it also adds a cost your rivals do not have to pay unless they copy that too.</div>
      <div class="card tight" data-note="amber"><div class="small">This is the uncomfortable centre of monopolistic competition. You have <i>some</i> power \u2014 enough to choose a price, enough to run a real business \u2014 but not enough to keep the profit, because entry and imitation keep eating it.</div></div>`;
    }
  },
  {
    t: 'check',
    title: 'Why can\u2019t you keep this profit?',
    q: 'Your firm is profitable again, but far less than at launch. What stops you restoring the launch profit?',
    opts: [
      { t: 'Nothing \u2014 you just need better advertising or a lower price.', ok: false,
        fb: () => {
          const M2 = S.dec.mult || 1;
          const noAd = bestMCNoAd(M2), best = bestMC(M2);
          return `Look at the arithmetic: even the best combination of price, advertising and plant size tops out at <b>${money(best.profit)}</b>. `
            + `Advertising the whole menu is worth ${money(best.profit - noAd.profit)} to you; the ceiling is not effort or skill \u2014 it is the demand you face, and it has shrunk.`;
        } },
      { t: 'New close substitutes have shrunk your demand curve, and there are no barriers to stop more arriving.', ok: true, fb: 'Correct. In monopolistic competition, differentiation gives you a downward-sloping demand curve \u2014 but entry and imitation keep shifting it back towards your costs. In the long run the demand curve ends up tangent to your average cost curve: P = AC > MC, and economic profit is zero.' },
      { t: 'Your costs have gone up.', ok: false, fb: 'Your cost curves are exactly the same as before. It is the demand side that changed \u2014 fewer customers at every price.' }
    ]
  },
  {
    t: 'event', cls: 'warn', tag: 'Market event \u00b7 long run',
    title: 'The profit disappears again',
    paras: [
      'More copycats arrive, and the town\u2019s tastes move on. Your demand curve keeps sliding to the left until something familiar happens.',
      `<b>At the best price you can charge, the line just touches your average cost curve.</b> Price \u2248 average cost \u2248 $33. Economic profit is zero.`,
      `But look carefully \u2014 this is <b>not</b> the same as Chapter 1. You are producing well below the output that minimises your average cost, so your ${caps()} and workers are not used at full efficiency. Economists call this <b>excess capacity</b>. And your price is still above marginal cost, so customers value an extra unit more than it costs you to make. Chapter 1 gave customers a perfectly efficient deal. This market does not.`
    ],
    change: `<span class="pricetag"><span class="old">your demand</span><span class="new">\u2212 19%</span></span> <span class="delta down">settling where D is tangent to AC</span>`,
    art: w => `<div style="max-width:980px;margin:0 auto">${chart(Object.assign(cfgMCFirm(980, {
      K: 1, mult: 0.50, P: 33,
      res: mcFirm(1, 33, 0.50, 0, 6), showProfit: true
    }), { h: 430 }))}</div>`,
    btn: 'What did you learn? \u2192'
  },
  {
    t: 'report',
    title: 'Difference buys you power \u2014 but not much of it',
    paras: [
      'You earned more freedom than in Chapter 1: you chose a price, you built a brand, and for a while it worked. What you could not buy was protection. The moment your idea worked, others copied it, and your demand curve slid back until it touched your costs.'
    ],
    listTitle: 'Three things you should be able to explain now',
    list: [
      '<b>Differentiation creates market power.</b> Because customers see your product as distinct, your demand curve slopes downwards and MR falls below price. You set the price; you are a price maker within limits.',
      '<b>Free entry destroys that power.</b> Imitation shifts your demand curve leftwards until, in the long run, it is tangent to your average cost curve: P = AC, zero economic profit \u2014 just as in perfect competition.',
      '<b>But the outcome is not the same.</b> You produce with <b>excess capacity</b> (below the AC-minimising output) and charge <b>P &gt; MC</b>, so the market is not allocatively or productively efficient. What the consumer gets in return is <b>variety</b> \u2014 a real benefit that the efficiency diagrams do not capture.'
    ],
    insight: 'Perfect competition gives customers the product at the lowest possible cost, but gives them no choice of product. Monopolistic competition gives them choice \u2014 and charges them for it through a higher price and higher average cost.',
    btn: 'Next: what if there were only two of you? \u2192'
  }
]);

/* ============================================================
   CHAPTER 3 — OLIGOPOLY
   ============================================================ */
const OLIGO_H = 44, OLIGO_L = 30;
const OLIGO_PAY = {
  HH: 530, HL: -125, LH: 615, LL: 250
};
function oligoPay(me, riv) { return OLIGO_PAY[me + riv]; }
function rivalMove() {
  const o = S.oligo, r = o.mine.length;
  if (r === 0) return 'H';
  const myLast = o.mine[r - 1];
  if (o.reported && r >= 1) return Math.random() < 0.45 ? 'L' : 'H';
  if (o.collude) return Math.random() < 0.9 ? 'H' : 'L';
  if (myLast === 'L') return Math.random() < 0.8 ? 'L' : 'H';
  const rivLast = o.rival[r - 1];
  if (rivLast === 'L') return Math.random() < 0.35 ? 'L' : 'H';
  return Math.random() < 0.9 ? 'H' : 'L';
}
function oligoMatrix(o) {
  const me = o.lastMe, riv = o.lastRiv;
  const cell = (myP, rivP, hi) => {
    const you = oligoPay(myP, rivP), them = oligoPay(rivP, myP);
    const taken = (me === myP && riv === rivP) ? 'taken' : '';
    return `<td class="${hi ? 'you ' : ''}${taken}"><b class="${you >= 0 ? '' : 'bad'}">${money(you)}</b> you<small>${RIVAL_NAME}: ${money(them)}</small></td>`;
  };
  return `<table class="mx">
    <tr><th></th><th colspan="2">${RIVAL_NAME}\u2019s price</th></tr>
    <tr><th></th><th style="font-size:.8rem">High ($${OLIGO_H})</th><th style="font-size:.8rem">Cut ($${OLIGO_L})</th></tr>
    <tr><th style="text-align:right">You<br>High<br>$${OLIGO_H}</th>${cell('H', 'H', true)}${cell('H', 'L', true)}</tr>
    <tr><th style="text-align:right">You<br>Cut<br>$${OLIGO_L}</th>${cell('L', 'H', true)}${cell('L', 'L', true)}</tr>
  </table>`;
}
function oligoHistory() {
  const o = S.oligo;
  if (!o.mine.length) return '';
  const rows = o.mine.map((m, i) =>
    `<div class="scoreline"><span>Round ${i + 1} \u00b7 you ${m === 'H' ? 'kept $' + OLIGO_H : 'cut to $' + OLIGO_L} \u00b7 ${RIVAL_NAME} ${o.rival[i] === 'H' ? 'kept $' + OLIGO_H : 'cut to $' + OLIGO_L}</span><b class="${o.pay[i] >= 0 ? '' : 'bad'}">${money(o.pay[i])}</b></div>`).join('');
  return `<div class="card tight" data-note="flat"><div class="small" style="font-weight:800">Play so far</div>${rows}</div>`;
}

function decOligo(b) {
  const o = S.oligo;
  if (S.locked) {
    const last = o.mine.length - 1;
    const me = o.mine[last], riv = o.rival[last], pay = o.pay[last];
    return `
    <div class="card ${pay >= 0 ? 'event good' : 'event bad'} fade">
      <div class="kicker">Round ${last + 1} result</div>
      <h2>${me === 'H' && riv === 'H' ? 'Both of you held the line' : me === 'L' && riv === 'L' ? 'A price war' : me === 'L' ? 'You undercut \u2014 and won the round' : 'You held, and lost customers'}</h2>
      <div class="tiles">
        <div class="tile"><div class="tl">Your price</div><div class="tv">$${me === 'H' ? OLIGO_H : OLIGO_L}</div><div class="ts">${me === 'H' ? 'kept high' : 'cut'}</div></div>
        <div class="tile"><div class="tl">${RIVAL_NAME}</div><div class="tv">$${riv === 'H' ? OLIGO_H : OLIGO_L}</div><div class="ts">${riv === 'H' ? 'kept high' : 'cut'}</div></div>
        <div class="tile ${pay >= 0 ? 'pos' : 'neg'}"><div class="tl">${profitLabel(pay, 'Your')}</div><div class="tv">${money(pay)}</div><div class="ts">added to firm value</div></div>
      </div>
      <div class="card tight" data-note="flat">${oligoMatrix(o)}</div>
      ${b.after ? b.after() : ''}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }
  const chosen = S.dec.choice;
  const ctl = `
    <div class="ctl" style="margin-top:0">
      <div class="clab"><span class="t">Your price this round</span><span class="v">${chosen ? (chosen === 'H' ? '$' + OLIGO_H : '$' + OLIGO_L) : 'not chosen'}</span></div>
      <div class="optrow">
        <button class="opt ${chosen === 'H' ? 'sel' : ''}" data-a="dec-oligo" data-v="H" style="flex:1 1 11rem">Keep the price high<small>$${OLIGO_H} \u00b7 high margin, if they follow</small></button>
        <button class="opt ${chosen === 'L' ? 'sel' : ''}" data-a="dec-oligo" data-v="L" style="flex:1 1 11rem">Cut the price<small>$${OLIGO_L} \u00b7 steal their customers</small></button>
      </div>
    </div>
    ${b.extra || ''}
    <div class="btnrow"><button class="btn primary wide big" data-a="dec-lock" ${chosen ? '' : 'disabled'}>Lock in the decision</button></div>`;
  const out = `
    <div class="card tight" style="background:var(--surface2);margin-top:0">
      <div class="small" style="font-weight:800;margin-bottom:.3rem">The payoff matrix &mdash; profit for the period</div>
      ${oligoMatrix(o)}
      <div class="small muted">Read the top-left cell in your row: if you both keep the price high, you each make ${money(530)}. If you cut while ${RIVAL_NAME} holds, you make ${money(615)} and they lose ${money(125)}.</div>
    </div>
    ${oligoHistory()}`;
  const foot = `
    <div class="card tight" data-note="blue">
      <div class="small" style="font-weight:800">Your market position</div>
      <div class="scoreline"><span>Firms in this market</span><b>2</b></div>
      <div class="scoreline"><span>Your rival</span><b>${RIVAL_NAME}</b></div>
      <div class="scoreline"><span>What happens next depends on</span><b>their reply, not your plan</b></div>
      <div class="scoreline" style="border:none"><span>Price above marginal cost?</span><b>Yes \u2014 both of you</b></div>
      <div class="small muted" style="margin-top:.4rem">Two big firms, close substitutes, and no new entrant on the horizon. Each of you must guess what the other will do \u2014 and each of you knows the other is guessing too.</div>
    </div>
    ${o.collude ? '<div class="card tight" style="background:var(--warnbg);border-color:#EEDBAD"><div class="small"><b>Price agreement in force.</b> You and ' + RIVAL_NAME + ' have agreed to hold the line at $' + OLIGO_H + '. The margins are excellent. Whether it is legal is another question entirely.</div></div>' : ''}`;
  return decShell(b, ctl, out, '', foot);
}
ACTS['dec-oligo'] = t => { S.dec.choice = t.dataset.v; res(); };

function lockOligo(b) {
  const o = S.oligo;
  const me = S.dec.choice || 'H';
  const riv = b.forceHigh ? 'H' : rivalMove();
  const pay = oligoPay(me, riv);
  const rivPay = oligoPay(riv, me);
  o.mine.push(me); o.rival.push(riv); o.pay = o.pay || []; o.pay.push(pay);
  o.lastMe = me; o.lastRiv = riv; o.lastRivPay = rivPay;
  /* This round only. The rival's move is a coin toss, so the perfect-play test
     has to be "did you pick the best reply to what they actually did?" — never
     "did you guess right?". Colluding when the rival held earns less than
     colluding when they cut, but both are defensible before the fact, and the
     game's own lesson is that you cannot know. Judging the choice against the
     RESULT would teach the student to read tea leaves. */
  const alt = me === 'H' ? 'L' : 'H';
  const altPay = oligoPay(alt, riv);
  const bestPay = Math.max(pay, altPay);
  scorePlay(pay, bestPay, bestPay === pay
    ? '' /* already the best reply — nothing left on the table */
    : `Against a rival who ${riv === 'H' ? 'held the price' : 'cut the price'}, ${alt === 'H' ? 'holding' : 'cutting'} would have paid ${money(altPay)} instead of ${money(pay)}.`);
  logRun('oligo', `Round ${o.mine.length}`, pay);
  addValue(pay);
}

BEATS.oligo = () => ([
  {
    t: 'intro',
    kicker: 'Chapter 4 \u00b7 Oligopoly',
    title: 'Two of you, and nobody else',
    paras: [
      'The smaller ' + sellers() + ' have gone. Through a decade of takeovers and closures, the town\u2019s market has consolidated into <b>two large producers</b>: you, and ' + RIVAL_NAME + '.',
      'Your products are close substitutes. Customers treat them as the same thing, so whatever you charge, ' + RIVAL_NAME + ' can charge something slightly different and take your customers \u2014 and you can do the same to them.',
      '<b>This changes the game completely.</b> In the first three chapters your best move depended only on the market. Here it depends on what your rival does \u2014 and their best move depends on what you do. Economists call this <b>strategic interdependence</b>.'
    ],
    art: () => artStreet(prod(), S.colour, [
      { label: S.firmName || 'You', sub: 'your brand', mine: true },
      { label: RIVAL_NAME, sub: 'close substitute', colour: rivalColour() }
    ], { heading: 'Two firms, one market' }),
    bullets: [
      `<b>Newcomers are not a threat.</b> Building a plant at this scale is beyond any small firm \u2014 the barriers to entry are real now.`,
      `<b>The decision each period:</b> hold the price at <b>$${OLIGO_H}</b>, or cut to <b>$${OLIGO_L}</b> and try to take the whole market.`,
      `<b>You move at the same time.</b> Neither of you sees the other\u2019s choice before deciding.`
    ],
    btn: 'Round 1 \u2192'
  },
  {
    t: 'decision', kind: 'oligo', tag: 'Round 1', setup: { choice: null },
    title: 'Round one \u2014 simultaneous price setting',
    brief: `${RIVAL_NAME} is announcing its price at the same moment you announce yours. You cannot see their choice. Choose carefully \u2014 and remember that they are thinking exactly the same way about you.`,
    after: () => ''
  },
  {
    t: 'decision', kind: 'oligo', tag: 'Round 2', setup: { choice: null },
    title: 'Round two \u2014 do they retaliate?',
    brief: `${RIVAL_NAME} has now seen what you did last round, and you have seen what they did. Choose again.`,
    after: () => {
      const o = S.oligo, n = o.mine.length;
      if (o.mine[n - 1] === 'H' && o.rival[n - 1] === 'H') return `<div class="narr">Both of you held the price at $${OLIGO_H}. That is the best joint outcome \u2014 and both of you know the other could break it at any moment.</div>`;
      if (o.rival[n - 1] === 'L' && o.mine[n - 1] === 'H') return `<div class="narr">${RIVAL_NAME} cut under you. Their profit jumped to ${money(615)} while yours fell to a loss. <b>Now you know what defection costs you.</b> The temptation to hit back is enormous \u2014 and completely rational.</div>`;
      if (o.mine[n - 1] === 'L' && o.rival[n - 1] === 'H') return `<div class="narr">You undercut and took the market: ${money(615)}. But ${RIVAL_NAME} knows exactly what you did \u2014 and firms in this market have long memories.</div>`;
      return `<div class="narr">Both of you cut. Prices collapsed and so did both margins \u2014 ${money(250)} each, less than half of what you make when you both hold the line.</div>`;
    }
  },
  {
    t: 'intro',
    kicker: 'An unexpected visitor',
    title: 'A quiet word from ' + RIVAL_NAME,
    paras: [
      'The owner of ' + RIVAL_NAME + ' turns up at your workshop with a proposal, and asks you not to write anything down.',
      '"This price war is destroying both of us," they say. "If we both hold the price at $' + OLIGO_H + ', we each make ' + money(530) + ' a period instead of ' + money(250) + '. Neither of us has to lose anything. Just keep your price where it is, and so will I."',
      '<b>What they are proposing is a cartel</b> \u2014 an agreement between competitors to fix prices. In most countries, including China, that is illegal, and both firms are liable for heavy fines and damages.',
      'Nothing about the economics is wrong. Both firms really would earn more. The problem is what it takes to make an agreement like that stick \u2014 and what happens when it is discovered.'
    ],
    choices: [
      { v: 'accept', label: 'Accept the arrangement', sub: 'high margins, some risk' },
      { v: 'refuse', label: 'Refuse, but say nothing', sub: 'stay independent' },
      { v: 'report', label: 'Report the approach to the regulator', sub: 'a legal and moral choice' }
    ],
    onPick: v => {
      if (v === 'accept') { S.oligo.collude = true; }
      else if (v === 'report') { S.oligo.reported = true; S.oligo.collude = false; S.insight += 15; toast('+15 Insight \u00b7 you kept your firm on the right side of the law'); }
      else { S.oligo.collude = false; }
    },
    btn: 'Continue \u2192'
  },
  {
    t: 'decision', kind: 'oligo', tag: 'Round 3', setup: { choice: null },
    title: 'Round three \u2014 with the arrangement, or without it',
    brief: () => S.oligo.collude
      ? `You and ${RIVAL_NAME} have an understanding: hold the price at $${OLIGO_H}. There is no contract, of course \u2014 only an expectation. Now decide what you actually do.`
      : `No agreement, no promises. Just two firms watching each other. What do you do this round?`,
    after: () => {
      const o = S.oligo, n = o.mine.length;
      const me = o.mine[n - 1], riv = o.rival[n - 1];
      if (o.collude && me === 'L') return `<div class="narr"><b>You broke the arrangement.</b> This is the temptation at the centre of every cartel: the agreement is best for both of you, but $${OLIGO_L} is best for you alone \u2014 if ${RIVAL_NAME} holds. They will not forget it, and neither will the regulator if it comes out.</div>`;
      if (o.collude && me === 'H' && riv === 'H') return `<div class="narr">Both of you held the line and both of you earned ${money(530)}. It works perfectly \u2014 as long as nobody blinks.</div>`;
      if (!o.collude && me === 'H' && riv === 'H') return `<div class="narr">Without any agreement at all, you both held the price high. Neither of you wanted to be the first to cut. This is <b>tacit collusion</b>: co-operation that emerges from mutual fear rather than a deal.</div>`;
      if (me === 'L' && riv === 'H') return `<div class="narr">You undercut a rival who was holding. ${money(615)} \u2014 the best single-round outcome in the whole game. The question is what they do about it next time.</div>`;
      if (me === 'H' && riv === 'L') return `<div class="narr">${RIVAL_NAME} undercut you. You held, they took the market, and you made a loss. Retaliation is now the obvious temptation \u2014 and that is exactly how price wars start.</div>`;
      return `<div class="narr">A price war. Both margins collapse and you each make ${money(250)} \u2014 less than half of what holding the price high would have earned you both.</div>`;
    }
  },
  {
    t: 'event', cls: 'bad', tag: 'Market event \u00b7 regulation',
    title: 'The regulator opens a file',
    paras: [
      'The competition authority has been reviewing the town\u2019s prices. Two large firms, identical price rises, identical dates \u2014 the pattern is hard to miss.',
      S.oligo.reported
        ? 'Your report to the regulator triggered the investigation, and you have cooperated fully. ' + RIVAL_NAME + ' is fined, and you are treated as a witness rather than a defendant.'
        : (S.oligo.collude
          ? 'You agreed to fix prices. There are records, and the authority has them. You are fined.'
          : 'You refused the arrangement, so there is nothing to find. The authority confirms that your pricing was set independently and closes the file with a warning that the market is being watched.')
    ],
    change: S.oligo.reported
      ? `<span class="pricetag"><span class="old">${RIVAL_NAME}</span><span class="new">fined $900</span></span> <span class="delta up">you are not penalised</span>`
      : (S.oligo.collude
        ? `<span class="pricetag"><span class="old">fine</span><span class="new">\u2212$800</span></span> <span class="delta down">deducted from your firm value</span>`
        : `<span class="pricetag"><span class="old">no fine</span><span class="new">$0</span></span> <span class="delta up">your pricing was independent</span>`),
    btn: 'Continue \u2192',
    onEnter: () => {
      if (S.oligo.collude && !S.oligo.finePaid) {
        S.oligo.finePaid = true;
        S.oligo.fine = 800;
        /* The fine hits firm value but it is NOT a season. It used to go through
           logRun(), which meant two things went wrong at once: the ledger grew a
           row called "Regulatory fine -$800" that no student could ever have
           earned or avoided (it fired on entry to the beat, before any choice),
           and the achievements layer — which reads losing rows out of the
           ledger — counted it as a losing season. That made "no losing season"
           mathematically unwinnable for anyone who colluded, and it made the
           oligopoly chapter's own profit summary read -$800 instead of the
           rounds the student actually played. A penalty is a penalty, not a
           period of trading. */
        S.oligo.fines = (S.oligo.fines || 0) + 800;
        MF.noteFine(800);
        addValue(-800);
      }
    }
  },
  {
    t: 'check',
    title: 'The prisoner\u2019s dilemma',
    q: 'Both firms would earn more by holding the price high. The fine is what makes the agreement illegal \u2014 but set the law aside for a moment. Why is a price agreement so hard to keep even when both firms want it?',
    opts: [
      { t: 'Because firms cannot communicate.', ok: false, fb: 'They communicate perfectly well. The problem is not talking, it is trusting.' },
      { t: 'Because each firm has an incentive to cheat, and each knows the other has that same incentive.', ok: true, fb: 'Exactly. Holding the price high is best for the pair, but cutting is best for the individual \u2014 as long as the other holds. So each firm reasons that the other will cheat, and cuts first to avoid being the victim. Both end up worse off. This is why cartels are unstable, and why they are also illegal: the temptation is precisely what makes them collapse.' },
      { t: 'Because raising prices always reduces total revenue.', ok: false, fb: 'Not here \u2014 holding the price high does raise both firms\u2019 profits. The problem is distribution and trust, not total revenue.' }
    ]
  },
  {
    t: 'report',
    title: 'When your best move depends on their move',
    paras: [
      'In the first three chapters the market told you what to do. Here, your profit depended on a guess about another human being \u2014 and they were guessing about you.'
    ],
    listTitle: 'Three things you should be able to explain now',
    list: [
      '<b>Strategic interdependence.</b> With few firms and close substitutes, each firm\u2019s best action depends on what rivals do. Price decisions become a game, not a calculation.',
      '<b>The prisoner\u2019s dilemma.</b> Co-operation (both charging high) would maximise joint profit, but each firm has a dominant incentive to undercut. The likely outcome is a price war in which both earn less than they could have.',
      '<b>Cartels are unstable \u2014 and illegal.</b> Price fixing raises prices and restricts output, which is why competition authorities treat it as a serious offence. Even without the law, the incentive to cheat tends to break agreements apart.'
    ],
    insight: 'Oligopoly is the only market structure where the outcome depends on how firms behave towards each other. The same cost and demand conditions can produce a price war or a comfortable duopoly \u2014 which is exactly why regulators watch this market so closely.',
    btn: 'Carry on \u2192'
  }
]);

/* ============================================================
   CHAPTER 4 — MONOPOLY
   ============================================================ */
function socialOpt(K) {
  let bestQ = null, bestGap = Infinity;
  for (let q = 1; q <= ECON.capacity(K) * 0.985; q += 0.25) {
    const L = ECON.labourFor(K, q);
    if (!isFinite(L)) continue;
    const gap = Math.abs(ECON.mc(K, L) - ECON.marketP(q));
    if (gap < bestGap) { bestGap = gap; bestQ = { q, L, mc: ECON.mc(K, L), pd: ECON.marketP(q) }; }
  }
  return bestQ;
}
/* THE REGULATOR'S PRICES, AND WHY THERE IS MORE THAN ONE OF THEM.
   Everything in this block is derived from the engine rather than typed in as a
   round number — the chapter used to cap the monopolist at a hard-coded $30,
   and $30 was not any of the prices below. At four machines the allocatively
   efficient price is about $31, so a $30 cap sits BELOW it and would create a
   shortage instead of removing the deadweight loss the narrator was pointing
   at. The student was being asked to admire a number that did not mean what the
   narration said it meant.

   Two of the prices answer the question "how much should be produced?", and one
   of them also answers "can the firm survive at that price?":

     · ALLOCATIVE / "no deadweight loss" — P = MC. The last unit costs society
       exactly what someone is willing to pay for it, so the triangle closes.
       Whether the firm can live on it depends entirely on where average cost is
       at that output — see `isNaturalMonopoly` below, which is the test, and
       which this engine's plants mostly fail.

     · FAIR RETURN — P = AC. The firm covers its full cost including the plant
       and earns normal profit. Price stays above marginal cost, so deadweight
       loss remains standing; that is the price of keeping the firm alive.

   Which is why there are TWO regulator pages rather than one: the hard rule and
   the compromise are different questions, and whether they collide is a fact
   about the plant, not about the regulator. */
function allocativePrice(K) {
  const so = socialOpt(K);
  if (!so) return null;
  const ac = ECON.ac(K, so.L);
  /* `profit` is carried so the pages can say what the firm would have earned at
     the efficient price without re-deriving it — that number is the whole test
     of whether a subsidy is needed, and it used to be worked out in each of the
     three places that mentioned it. */
  return { P: so.pd, Q: so.q, mc: so.mc, ac: ac, profit: (so.pd - ac) * so.q };
}
/* EVERY PRICE AT WHICH THE FIRM BREAKS EVEN.
   These are the fair-return prices this plant admits, and a U-shaped AC curve
   meeting a downward-sloping demand curve has TWO of them, not one: one while
   average cost is still coming down, and one after it has turned back up.

   Solved as a root of `f(P) = P − AC(P)`, where AC is average cost at the
   output that price calls forth. That is deliberate. The previous version
   sampled the AC curve at fixed steps of labour and looked for a sign change:
   at a three-machine plant a 0.25-worker step moves output by about 4.5 units
   near the break-even point, so the crossing it reported was up to $2 of price
   wide — enough that "price equals average cost" left the firm with a visible
   profit and the page's claim of a normal return looked false. A root-find on
   the price axis is exact, and it also sidesteps the fact that a price axis
   sweep for "the price closest to covering AC" cannot tell the two crossings
   apart: they both score a gap of zero.

   Returned in order of OUTPUT, so `[0]` is the crossing in the low-output /
   high-price corner and `[1]`, where it exists, is the far one. */
function acDemandCrossings(K) {
  const f = p => {
    const m = monoState(K, p);
    return m.feasible && isFinite(m.ac) ? p - m.ac : NaN;
  };
  /* the price axis only exists where the plant can physically serve demand:
     below that, the town wants more than the firm can make */
  const lo = ECON.marketP(ECON.capacity(K) * 0.999);
  const hi = ECON.marketP(0);
  const out = [];
  const N = 240;
  const step = (hi - lo) / N;
  let prevP = null, prevV = null;
  for (let i = 0; i <= N; i++) {
    const p = lo + i * step;
    const v = f(p);
    if (!isFinite(v)) { prevP = null; prevV = null; continue; }
    if (prevV !== null && prevV !== 0 && (prevV < 0) !== (v < 0)) {
      let a = prevP, b = p, fa = prevV;
      for (let j = 0; j < 50; j++) {
        const mid = (a + b) / 2, fm = f(mid);
        if (!isFinite(fm)) break;
        if ((fa < 0) !== (fm < 0)) b = mid; else { a = mid; fa = fm; }
      }
      const P = (a + b) / 2, st = monoState(K, P);
      if (st.feasible) out.push({ P, Q: st.Q, ac: st.ac, mc: st.mc, L: st.L });
    }
    prevP = p; prevV = v;
  }
  out.sort((x, y) => x.Q - y.Q);
  return out;
}

/* IS THIS PLANT A NATURAL MONOPOLY?
   The test is not "does average cost slope down somewhere" — every plant has a
   falling stretch. It is whether average cost is ABOVE demand at the output
   where price equals marginal cost, i.e. whether MC sits below AC at the social
   optimum. If it does, the allocatively efficient price is below cost, the firm
   loses money supplying it, and the regulator faces the textbook dilemma:
   subsidise the firm or watch it leave. If AC has already bottomed out by then,
   P = MC covers cost, the firm keeps a profit, and that dilemma never arises.

   Measured on this engine — and the three plant sizes the monopoly chapter
   offers deliberately straddle the boundary:

     K = 1·2·3  P = MC is profitable (+$1,394 / +$1,389 / +$383) → no subsidy
     K = 4·5    P = MC loses money (−$488 / −$963)             → natural monopoly

   That is what lets one chapter show both halves of the argument: at three
   machines the efficient price needs no help; at four or five it does. */
function isNaturalMonopoly(K) {
  const so = socialOpt(K);
  if (!so) return false;
  const ac = ECON.ac(K, so.L);
  return isFinite(ac) && so.mc < ac;
}

/* THE FAIR-RETURN PRICE — the break-even price a regulator actually means.

   Average cost and demand can meet twice, and which one is the regulatory
   price is not a matter of taste. The regulator's rule is P = AC and its aim is
   to get the town as much output as the firm can break even on — so the target
   is the crossing at the HIGHEST output, not the first one it meets on the way
   down. The low-output crossing is a price so high that the town barely buys
   anything; no regulator would name it, and the pages say so out loud.

   That choice is what makes the chapter's three plant sizes teach three
   different things, all of them true:

     K = 3   average cost is still below demand at the output where price meets
             marginal cost, so the firm survives on P = MC and earns a profit;
             fair-return regulation is not needed here at all, and the break-even
             price sits BELOW the efficient one — it would force the firm to
             over-produce.

     K = 4·5 the plant is large enough that P = MC sits below average cost, so
             the firm loses money serving the efficient output — a genuine
             natural monopoly. Now the three prices line up the way the textbook
             draws them: monopoly price > fair-return price > allocative price,
             with output rising at each step, and the regulator has to choose.

   `crossings` is carried along so the pages can name the other break-even point
   and explain why it is not the target. */
function fairReturnPrice(K) {
  const xs = acDemandCrossings(K);
  if (!xs.length) return null;
  const c = xs[xs.length - 1];          // the highest-output crossing
  return {
    P: c.P, Q: c.Q, ac: c.ac, mc: c.mc, L: c.L,
    profit: (c.P - c.ac) * c.Q,
    crossings: xs.length, all: xs
  };
}
/* The slider has to be able to REACH every price either page may name, or the
   student simply cannot comply with the regulator. */
function regTopPrice(K) {
  const a = allocativePrice(K), f = fairReturnPrice(K);
  return Math.ceil(Math.max(a ? a.P : 30, f ? f.P : 30, 34));
}

/* ============================================================
   THE REGULATOR'S TWO REGIMES — the verdict, read from the engine
   ------------------------------------------------------------
   The chapter runs the same firm through two different rules, one page each:

     regime 'mc'  the regulator demands the ALLOCATIVELY EFFICIENT price. Its
                  concern is the deadweight loss, and it judges the price, not
                  the profit. Where that price falls below average cost the firm
                  cannot survive on its own, and the regulator covers the
                  shortfall with a subsidy — which is why the rule is normally
                  only imposed on a genuine natural monopoly.

     regime 'ac'  the regulator settles for a FAIR RETURN: normal profit and a
                  live firm, at the cost of leaving some deadweight loss
                  standing. This is the compromise real regulators make.

   Both regimes share one penalty, which is the student's instruction: a firm
   that does not comply is fined THREE TIMES the profit it took above a normal
   return. `v.net` is the number that reaches firm value, so the outcome page,
   the run log and the score can never disagree about what the player earned. */
const REG_FINE_MULT = 3;
const REG_TOL = 1.0;      /* the slider steps by $1, so this is "hit the setting" */
/* The plant sizes the monopoly chapter offers. Named here because three separate
   things need the SAME list: the control that offers them, the regulator's price
   floor (which has to reach the lowest regulated price across all of them), and
   the tests. It used to be a literal `[3, 4, 5]` inside the control only. */
const MONO_K = [3, 4, 5];

function regVerdict(K, P, regime) {
  const m = monoState(K, P);
  const a = allocativePrice(K), f = fairReturnPrice(K);
  const target = regime === 'ac' ? f : a;
  const v = {
    regime, K, P, m, a, f, target,
    natural: isNaturalMonopoly(K),
    feasible: m.feasible && !!target,
    compliant: false, excess: 0, fine: 0, subsidy: 0, dwl: 0,
    net: m.feasible ? m.profit : -ECON.tfc(K)
  };
  if (!v.feasible) return v;
  v.dwl = dwlArea(K, m.Q, P, m.mc).area;
  /* the offence, whichever regime: profit taken above a normal return */
  v.excess = Math.max(0, (P - m.ac) * m.Q);
  v.compliant = Math.abs(P - target.P) <= REG_TOL;
  if (v.compliant) {
    /* Complying holds the firm at a normal return. Where the ordered price is
       BELOW cost that needs a transfer and the regulator pays it; where it is
       above cost the firm simply keeps the difference, and the page says so
       rather than inventing a subsidy it does not need. */
    if (m.profit < 0) v.subsidy = -m.profit;
  } else {
    v.fine = REG_FINE_MULT * v.excess;
  }
  v.net = m.profit + v.subsidy - v.fine;
  return v;
}
/* `MONO_CAP = 30` used to live here. It was the old hard-coded price cap and it
   was never either of the two regulated prices — at four machines $30 sits
   BELOW the allocatively efficient price, so a cap there would have created a
   shortage rather than removed the deadweight loss. Both prices have been
   derived from the engine for several rounds; the constant outlived its last
   reference and is gone. */
function monoState(K, P) {
  const Q = ECON.marketQ(P);
  const L = ECON.labourFor(K, Q);
  const feasible = Q > 0 && isFinite(L);
  if (!feasible) return { Q, L: Infinity, feasible: false, profit: -Infinity };
  const tc = ECON.tc(K, L);
  return { Q, L, tc, ac: tc / Q, mc: ECON.mc(K, L), tr: P * Q, profit: P * Q - tc, feasible: true, mr: ECON.mrFromQ(Q) };
}
function dwlArea(K, Qm, Pm, MCm) {
  const so = socialOpt(K);
  if (!so) return { area: 0, so };
  /* LOSS RUNS IN BOTH DIRECTIONS. The triangle below measures the value of units
     the town wanted and did not get. But a fair-return price can sit BELOW the
     efficient one — the firm then serves units that cost more to make than the
     town values them, and that is a deadweight loss too. The old version
     returned zero in that case, so the "deadweight loss left" tile read $0 for a
     price that overshot the efficient output: the loss had changed direction,
     not vanished. */
  if (Qm > so.q + 0.5) {
    return { area: 0.5 * (Qm - so.q) * Math.abs(MCm - Pm), so, over: true };
  }
  if (so.q <= Qm) return { area: 0, so };
  const A = [Qm, Pm], B = [Qm, MCm], C = [so.q, so.mc];
  const area = 0.5 * Math.abs(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  return { area, so };
}
/* WHERE AN UNREGULATED MONOPOLIST LANDS — MR = MC, read off the same two curves
   the chart draws.

   The narration used to compare the regulated outcome against a hard-coded
   "$42 / 90 units". Neither was derived from anything: 90 was the
   profit-maximising output of an earlier production function, and $42 a price
   this firm would never have chosen. Every comparison built on them described a
   plant that no longer existed — and once the production function changed they
   were simply wrong. Derived here instead, so the two can never disagree. */
function monoUnregulated(K) {
  let best = null, g = Infinity;
  const lo = ECON.marketP(ECON.capacity(K) * 0.985), hi = ECON.marketP(0);
  for (let p = lo; p <= hi; p += 0.05) {
    const Q = ECON.marketQ(p);
    const L = ECON.labourFor(K, Q);
    if (!(Q > 0) || !isFinite(L)) continue;
    const tc = ECON.tc(K, L);
    const d = Math.abs(ECON.mrFromQ(Q) - ECON.mc(K, L));
    if (d < g) { g = d; best = { P: p, Q, L, ac: tc / Q, profit: p * Q - tc }; }
  }
  return best;
}
function cfgMonopoly(w, o) {
  const K = o.K, P = o.P;
  const m = monoState(K, P);
  const yMax = 72;
  const dem = [], mr = [], mc = [], ac = [];
  for (let q = 0; q <= 300; q += 2) { dem.push([q, ECON.marketP(q)]); mr.push([q, ECON.mrFromQ(q)]); }
  /* only the rising branch of total product: past its peak the same output would
     need FEWER workers, so a cost curve drawn there would double back on itself */
  for (let l = 0.25; l <= K * ECON.X_TPP; l += 0.25) {
    const q = ECON.output(K, l);
    const mcv = ECON.mc(K, l);
    if (q <= 0) continue;
    if (mcv <= yMax) mc.push([q, mcv]);
    const acv = ECON.ac(K, l);
    if (acv <= yMax) ac.push([q, acv]);
  }
  const ser = [
    { pts: dem.filter(p => p[1] >= 0), color: PAL.green, width: 3, label: 'D = market demand', area: .07 },
    { pts: mr.filter(p => p[1] >= 0), color: PAL.violet, width: 2.4, label: 'MR', dash: '6 4' },
    { pts: mc.filter(p => p[1] <= yMax), color: PAL.red, width: 3, label: 'MC', labelDy: 13 },
    { pts: ac.filter(p => p[1] <= yMax), color: PAL.blue, width: 3, label: 'AC' }
  ];
  const shapes = [], points = [], vlines = [];
  if (m.feasible && m.Q > 0) {
    shapes.push({ type: 'rect', x0: 0, y0: Math.max(m.ac, P), x1: m.Q, y1: Math.min(m.ac, P), fill: PAL.green, opacity: .18, stroke: PAL.green, sw: 1.6, dash: '4 3' });
    points.push({ x: m.Q, y: P, color: PAL.ink, r: 6.5, label: `you: ${fmt(m.Q, 0)} units at $${fmt(P, 0)}`, dy: -12, anchor: 'middle', dx: 0 });
    vlines.push({ x: m.Q, color: PAL.guide, label: `Q = ${fmt(m.Q, 0)}` });
    points.push({ x: m.Q / 2, y: (m.ac + P) / 2, color: PAL.green, r: 0, label: 'profit', anchor: 'middle', dx: 0 });
    if (o.welfare) {
      const d = dwlArea(K, m.Q, P, m.mc);
      if (d.area > 1) {
        shapes.push({ type: 'poly', pts: [[m.Q, P], [m.Q, m.mc], [d.so.q, d.so.mc]], fill: PAL.red, opacity: .26, stroke: PAL.red, sw: 1.6 });
        points.push({ x: m.Q + (d.so.q - m.Q) * 0.3, y: (m.mc + P) / 2 - 20, color: PAL.red, r: 0, label: 'value destroyed', anchor: 'middle', dx: 0 });
        vlines.push({ x: d.so.q, color: PAL.red, label: 'where D = MC' });
      } else {
        vlines.push({ x: d.so.q, color: PAL.red, label: 'where D = MC' });
      }
    }
  }
  return {
    w, h: Math.round(Math.min(580, Math.max(360, w * 0.62))),
    x: [0, 300], y: [0, yMax],
    xLabel: 'Market output Q (units per period)', yLabel: 'Price / cost ($)',
    series: ser, shapes, points, vlines
  };
}

/* ---- the input market, when the firm is the town's only employer ---- */
function cfgMonopsony(w, o) {
  const K = o.K, W = o.W;
  const xMax = 26, yMax = 210;
  const r = ECON.buyerState(K, W);
  const comp = ECON.competitiveWage(K);

  const supply = [], mfc = [], mrp = [];
  for (let L = 0; L <= xMax; L += 0.5) {
    if (ECON.supplyWage(L) <= yMax) supply.push([L, ECON.supplyWage(L)]);
    if (ECON.mfc(L) <= yMax) mfc.push([L, ECON.mfc(L)]);
    if (L >= 0.5) { const m = ECON.mrp(K, L); if (m > 0 && m <= yMax) mrp.push([L, m]); }
  }

  const shapes = [], points = [], vlines = [], hlines = [];

  /* the value the town never gets: between the monopsony employment and the
     competitive one, each worker is worth more than they would have to be paid */
  if (o.welfare !== false && comp && comp.L > r.L + 0.4) {
    const pts = [], n = 8, clip = v => Math.min(yMax, Math.max(0, v));
    for (let i = 0; i <= n; i++) { const L = r.L + i * (comp.L - r.L) / n; pts.push([L, clip(ECON.mrp(K, L))]); }
    for (let i = n; i >= 0; i--) { const L = r.L + i * (comp.L - r.L) / n; pts.push([L, ECON.supplyWage(L)]); }
    shapes.push({ type: 'poly', pts, fill: PAL.red, opacity: .17, stroke: PAL.red, sw: 1.4, dash: '4 3' });
    points.push({ x: (r.L + comp.L) / 2, y: ECON.supplyWage(r.L) + 22, color: PAL.red, r: 0, label: 'value never created', anchor: 'middle', dx: 0 });
  }

  /* the wedge the firm keeps, drawn as a slim bar at its chosen employment.
     When the wage is already close to what a worker adds there is nothing to
     show and no room for a second label, so both are skipped. */
  const bigGap = (r.mrp - W) > 22;
  if (r.L > 0.3 && bigGap) {
    shapes.push({ type: 'poly', pts: [[r.L - 0.13, W], [r.L + 0.13, W], [r.L + 0.13, r.mrp], [r.L - 0.13, r.mrp]], fill: PAL.red, opacity: .55 });
  }

  points.push({ x: r.L, y: W, color: PAL.ink, r: 6.5, label: `you: ${fmt(r.L, 1)} workers at $${fmt(W, 0)}`, dy: -13, anchor: 'middle', dx: 0 });
  if (r.L > 0.3 && bigGap) points.push({ x: r.L, y: r.mrp, color: PAL.red, r: 5, label: `each adds $${fmt(r.mrp, 0)}`, dy: -11, anchor: 'middle', dx: 0 });
  if (comp) points.push({ x: comp.L, y: comp.W, color: PAL.green, r: 5 });

  hlines.push({ y: W, color: PAL.ink, dash: '6 4', label: `your wage $${fmt(W, 0)}`, labelSide: 'left' });
  vlines.push({ x: r.L, color: PAL.guide });
  if (comp && Math.abs(comp.L - r.L) > 1) vlines.push({ x: comp.L, color: PAL.green, label: 'competitive employment' });

  return {
    w, h: Math.round(Math.min(580, Math.max(360, w * 0.62))),
    x: [0, xMax], y: [0, yMax],
    xLabel: 'Workers employed', yLabel: 'Wage / value per worker ($)',
    series: [
      { pts: supply, color: PAL.green, width: 3, label: 'Labour supply' },
      { pts: mfc, color: PAL.violet, width: 2.6, label: 'MFC', dash: '6 4' },
      { pts: mrp, color: PAL.red, width: 3, label: 'MRP = what a worker adds' }
    ],
    shapes, points, vlines, hlines
  };
}

function decMono(b) {
  const K = S.dec.monoK, P = S.dec.P;
  /* THE SLIDER FLOOR IS DERIVED FROM THE PRICES IT HAS TO REACH.

     It was a hard-coded $20 on the two regulated pages, and that is no longer
     low enough: a five-machine plant's allocatively efficient price is about
     $18, so the student was asked to set price equal to marginal cost and could
     not physically drag the slider down to it. Reported from play as "with more
     capital the price will not go low enough — at $20 there is still deadweight
     loss and it needs to keep falling".

     Both regulated prices fall as the plant grows, so the floor is computed from
     the LOWEST of them across every plant size the chapter offers, less a small
     margin to drag into. Change the cost curves and this follows; hard-code it
     again and the same bug comes back the next time the calibration moves. */
  const reg = b.reg || null;
  const REG_FLOOR = Math.max(1, Math.floor(
    Math.min(...MONO_K.map(k => allocativePrice(k).P),
             ...MONO_K.map(k => fairReturnPrice(k).P)) - 3));
  const pMin = reg ? REG_FLOOR : Math.max(1, Math.floor(Math.min(...MONO_K.map(
    k => monoUnregulated(k).P)) - 5));
  const pMax = reg ? regTopPrice(K) : 56;
  const m = monoState(K, P);
  if (S.locked) {
    if (reg) return regOutcome(b, K, P);
    const d = m.feasible ? dwlArea(K, m.Q, P, m.mc) : { area: 0 };
    const transfer = m.feasible ? (P - m.ac) * m.Q : 0;
    let bestP = P, bestProfit = -Infinity;
    for (let p = pMin; p <= pMax; p += 0.5) {
      const rr = monoState(K, p);
      if (rr.feasible && rr.profit > bestProfit) { bestProfit = rr.profit; bestP = p; }
    }
    return `
    <div class="card event good fade">
      <div class="kicker">Result</div>
      <h2>Only one firm in this market \u2014 you</h2>
      <div class="tiles">
        <div class="tile"><div class="tl">Your price</div><div class="tv">$${fmt(P, 0)}</div><div class="ts">you set it</div></div>
        <div class="tile hi"><div class="tl">Output</div><div class="tv">${fmt(m.Q, 0)}</div><div class="ts">units sold</div></div>
        <div class="tile"><div class="tl">Revenue</div><div class="tv">${money(m.tr)}</div><div class="ts">TR</div></div>
        <div class="tile"><div class="tl">Costs</div><div class="tv">${money(m.tc)}</div><div class="ts">AC = ${money(m.ac, 2)}</div></div>
        <div class="tile ${m.feasible && m.profit < 0 ? 'neg' : 'pos'}"><div class="tl">${profitLabel(m.feasible ? m.profit : 1)}</div><div class="tv">${money(m.profit)}</div><div class="ts">added to firm value</div></div>
      </div>
      <div class="chartcard" data-view="dec-mono-chart"></div>
      ${b.after(m, bestP, transfer, d)}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }
  /* WHAT THE STUDENT IS TOLD, AND WHAT THEY ARE NOT.
     The regulated pages state the RULE ("your price must equal marginal cost")
     and deliberately do NOT print the price that satisfies it. Both numbers are
     live in the readout beside the slider, so the answer is findable by
     dragging — which is the whole exercise. The previous version printed
     "P = MC ≈ $38 · P = AC ≈ $56" in the brief and then asked the student to
     choose, which turned a pricing decision into a copying one. */
  const rule = reg === 'mc'
    ? `The rule: <b>your price must equal the marginal cost of the last unit you sell</b>. The readout shows both as you drag.`
    : reg === 'ac'
      ? `The rule: <b>your price must equal your average cost</b> \u2014 cover everything you spend, earn a normal profit and no more. The readout shows both as you drag.`
      : '';
  const ctl = `
    <div class="ctl" style="margin-top:0">
      <div class="clab"><span class="t">Your price</span><span class="v" data-slot="ctlP" data-keep-class="v">$${fmt(P, 0)}</span></div>
      ${sliderRow('dec-mp', pMin, pMax, 1, P, `<div class="ticks"><span>$${pMin}</span><span>$${(pMin + pMax) / 2}</span><span>$${pMax}</span></div>`)}
      <div class="small muted" style="margin-top:.25rem">Your plant has ${K} ${K > 1 ? caps() : cap()} \u2014 about ${fmt(ECON.capacity(K), 0)} units a period at most.${reg ? ' ' + rule : ''}</div>
    </div>
    ${reg ? `<div class="ctlpair">
      <div class="ctl">
        <div class="clab"><span class="t">${Caps()} (capital)</span><span class="v">${K}</span></div>
        <div class="optrow">${MONO_K.map(k => `<button class="opt ${K === k ? 'sel' : ''}" data-a="dec-mk" data-v="${k}">${k} ${caps()}<small>${money(ECON.MACHINE * k)} / period</small></button>`).join('')}</div>
      </div>
      <div class="ctl">
        <div class="clab"><span class="t">Show what society loses</span></div>
        <div class="optrow"><button class="opt ${S.dec.welfare ? 'sel' : ''}" data-a="dec-welfare">${S.dec.welfare ? 'Shown on the chart' : 'Hidden'}</button></div>
      </div>
    </div>` : ''}`;
  /* the numbers ride along with the sliders, pinned to the top of the screen, so
     the demand curve below can be watched while the price is dragged */
  const out = `
    <div class="readout" data-slot="out">
      <div class="ro hi"><div class="rl">Price</div><div class="rv">$${fmt(P, 0)}</div></div>
      <div class="ro"><div class="rl">Quantity demanded</div><div class="rv">${m.feasible ? fmt(m.Q, 0) : '\u2014'}</div></div>
      <div class="ro"><div class="rl">Marginal revenue</div><div class="rv">${m.feasible ? money(m.mr, 2) : '\u2014'}</div></div>
      <div class="ro ${m.feasible && Math.abs(m.mr - m.mc) < 2 ? 'pos' : ''}"><div class="rl">Marginal cost</div><div class="rv">${m.feasible ? money(m.mc, 2) : '\u2014'}</div></div>
      <div class="ro"><div class="rl">Average cost</div><div class="rv">${m.feasible ? money(m.ac, 2) : '\u2014'}</div></div>
      <div class="ro ${m.feasible ? (m.profit >= 0 ? 'pos' : 'neg') : ''}"><div class="rl">${profitLabel(m.feasible ? m.profit : 1)}</div><div class="rv">${m.feasible ? money(m.profit) : '\u2014'}</div></div>
    </div>
    <div class="small muted" data-slot="hint" data-keep-class="small muted" style="margin-top:.35rem">${regHint(reg, K, P, m)}</div>`;
  const foot = `
    <div class="card tight" data-note="flat">
      <div class="small" style="font-weight:800">Your market position</div>
      <div class="scoreline"><span>Other firms producing in town</span><b>none</b></div>
      <div class="scoreline"><span>Barriers to entry</span><b>very high</b></div>
      <div class="scoreline"><span>Can you choose the price?</span><b style="color:var(--brand-d)">Yes \u2014 completely</b></div>
      <div class="scoreline" style="border:none"><span>Demand curve you face</span><b>the whole market</b></div>
      <div class="small muted" style="margin-top:.4rem">With no rivals, the market demand curve <i>is</i> your demand curve. You sell more only by charging less \u2014 so marginal revenue falls below price.</div>
    </div>
    <div class="btnrow"><button class="btn primary wide big" data-a="dec-lock" ${m.feasible ? '' : 'disabled'}>Lock in the decision</button></div>`;
  return decShell(b, ctl, out, `<div class="chartcard" data-view="dec-mono-chart"></div>`, foot, true);
}
/* ---- live guidance under the readout ----
   On the regulated pages this reports how far the current price is from the
   rule, without ever printing the price that satisfies it: the student has to
   bring the two numbers level themselves. That is the exercise — the earlier
   version printed "P = MC ≈ $38 · P = AC ≈ $56" in the brief and turned a
   pricing decision into a copying one. */
function regHint(reg, K, P, m) {
  if (!reg) {
    return !m.feasible ? 'At this price the town would not buy anything, so there is nothing to make.'
      : (m.mr > m.mc + 1.5 ? 'Marginal revenue is <b>above</b> marginal cost \u2014 one more unit would add more revenue than it costs.'
        : (m.mc > m.mr + 1.5 ? 'Marginal revenue is <b>below</b> marginal cost \u2014 one fewer unit would cost you less than it loses.'
          : 'Marginal revenue and marginal cost are level \u2014 this is the profit-maximising output.'));
  }
  if (!m.feasible) {
    return 'At this price the town wants more than your plant can physically turn out. Buy more capacity, or raise your price until demand fits inside what you can make.';
  }
  if (reg === 'mc') {
    const d = P - m.mc;
    if (Math.abs(d) < 1.5) {
      return 'Price and marginal cost are level \u2014 <b>this meets the regulator\u2019s rule</b>. Every unit the town values above what it costs to make is being made.';
    }
    return d > 0
      ? `Your price is <b>$${fmt(d, 2)} above</b> the marginal cost of the last unit you sell. The units between here and the output where the two meet are worth more to the town than they cost to make \u2014 and they are not being made.`
      : `Your price is <b>$${fmt(-d, 2)} below</b> the marginal cost of the last unit you sell. You are serving more than the efficient output, and losing money on those extra units.`;
  }
  const d = P - m.ac;
  if (Math.abs(d) < 1.5) {
    return 'Price and average cost are level \u2014 <b>this meets the regulator\u2019s rule</b>: you cover everything you spend and earn exactly a normal profit.';
  }
  return d > 0
    ? `Your price is <b>$${fmt(d, 2)} above</b> your average cost, so every unit is earning you more than a normal profit.`
    : `Your price is <b>$${fmt(-d, 2)} below</b> your average cost \u2014 you do not cover your costs, and the firm loses money at this price.`;
}

/* ============================================================
   THE OUTCOME PAGE FOR EITHER REGIME
   ------------------------------------------------------------
   Every number here is read from `regVerdict` in the same call that decides the
   fine, so what the student is shown and what was taken off firm value cannot
   drift apart. The two regimes teach opposite halves of the same argument, and
   the page says out loud which half this plant is actually in. */
function regOutcome(b, K, P) {
  const v = regVerdict(K, P, b.reg);
  const isMc = b.reg === 'mc';
  if (!v.feasible) {
    return `
    <div class="card event bad fade">
      <div class="kicker">Result &middot; regulation</div>
      <h2>That price cannot be served</h2>
      <div class="narr">At $${fmt(P, 0)} the town wants more than your plant can make. The regulator cannot accept a price you cannot deliver, and your books show a period with no trade.</div>
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }
  const m = v.m, a = v.a, f = v.f, t = v.target;
  /* the unregulated comparison, DERIVED. It used to be the literal pair
     "$42 / 90 units", which stopped describing this firm the moment the
     production function moved. */
  const un = monoUnregulated(K);
  const unP = un ? un.P : 0, unQ = un ? un.Q : 0;
  const gone = Math.max(0, unQ - m.Q);
  const mcAt = m.mc;
  /* Average cost and demand meet twice. The regulator's price is the crossing at
     the HIGHEST output — the most the town can get at a break-even price — and
     the other one is a high price at a tiny output that no regulator would name.
     Pages below use `lowCross` for that other point. */
  const lowCross = f && f.crossings > 1 ? f.all[0] : null;
  const head = isMc
    ? (v.compliant ? 'The deadweight-loss triangle is closed' : 'The deadweight-loss triangle is still open')
    : (v.compliant ? 'A normal return \u2014 and no more' : 'That is not a fair return');
  const tiles = `
      <div class="tiles">
        <div class="tile"><div class="tl">Your price</div><div class="tv">$${fmt(P, 0)}</div><div class="ts">${v.compliant ? 'meets the rule' : 'rejected'}</div></div>
        <div class="tile hi"><div class="tl">Output</div><div class="tv">${fmt(m.Q, 0)}</div><div class="ts">units served</div></div>
        <div class="tile"><div class="tl">${isMc ? 'Marginal cost' : 'Average cost'}</div><div class="tv">${money(isMc ? mcAt : m.ac, 2)}</div><div class="ts">at that output</div></div>
        <div class="tile"><div class="tl">Deadweight loss left</div><div class="tv">${money(v.dwl)}</div><div class="ts">per period</div></div>
        <div class="tile ${v.net >= 0 ? 'pos' : 'neg'}"><div class="tl">${profitLabel(v.net, 'Your')}</div><div class="tv">${money(v.net)}</div><div class="ts">after the regulator</div></div>
      </div>`;

  /* ---- the verdict card: what the regulator does about it ---- */
  let verdict;
  if (isMc && v.compliant && v.natural) {
    verdict = `
      <div class="card tight" data-note="amber"><div class="small"><b>You met the rule \u2014 and it does not cover your costs.</b>
        Average cost at ${fmt(m.Q, 0)} units is <b>${money(m.ac, 2)}</b>, above the price you are allowed to charge, so the firm loses <b>${money(-m.profit)}</b> a period supplying the market at the price society wants.
        The regulator pays you that shortfall as a <b>subsidy of ${money(v.subsidy)}</b>, which lands you at exactly a normal profit. Nothing here is your fault: it is what allocative efficiency costs when one firm has to carry the whole town's demand.
        The money has to come from somewhere \u2014 taxation \u2014 and that, not the diagram, is why regulators hesitate.</div></div>`;
  } else if (isMc && v.compliant) {
    verdict = `
      <div class="card tight" data-note="blue"><div class="small"><b>You met the rule \u2014 and no subsidy was needed.</b>
        Average cost at ${fmt(m.Q, 0)} units is <b>${money(m.ac, 2)}</b>, <i>below</i> the price you are allowed to charge, so this price covers everything you spend and still leaves you <b>${money(m.profit)}</b>.
        That is worth pausing on. At <i>this</i> plant the efficient price is not a sacrifice: selling ${fmt(m.Q, 0)} units at $${fmt(P, 0)} beats restricting output, because a bigger plant pushes average cost down faster than the lower price pulls revenue down.
        <b>A regulator only has to reach for a subsidy when average cost is still falling at the output where price meets marginal cost \u2014 a genuine natural monopoly. Your plant is not in that position, and now you know how to tell.</b></div></div>`;
  } else if (isMc) {
    verdict = `
      <div class="card tight" data-note="red"><div class="small"><b>You charged above marginal cost, so the triangle is still standing.</b>
        The last unit you sold cost ${money(mcAt, 2)} to make and the town paid $${fmt(P, 0)} for it, so you were free to sell more \u2014 yet between ${fmt(m.Q, 0)} units and the ${fmt(t.Q, 0)} the rule calls for, every unit the town valued above its cost simply <b>never got made</b>.
        That is <b>${money(v.dwl)}</b> a period of value that did not go to you, to consumers, or to anyone. It never existed. Monopoly profit is a transfer; this is destruction.</div></div>
      <div class="card tight" data-note="red"><div class="small"><b>The fine.</b>
        The regulator takes the profit you made above a normal return \u2014 <b>${money(v.excess)}</b> \u2014 and fines you three times it:
        <div class="scoreline" style="margin-top:.35rem"><span>Profit above a normal return</span><b>${money(v.excess)}</b></div>
        <div class="scoreline"><span>\u00d7 3 (the penalty)</span><b>${money(v.fine)}</b></div>
        <div class="scoreline" style="border:none"><span>Left to you this period</span><b style="color:var(--bad-d)">${money(v.net)}</b></div>
        <div style="margin-top:.4rem">The penalty is deliberately larger than the gain, which is the point: an offence that pays is not an offence, it is a price list.</div></div></div>`;
  } else if (v.compliant && v.natural) {
    verdict = `
      <div class="card tight" data-note="blue"><div class="small"><b>This is the compromise every real regulator makes.</b>
        At <b>$${fmt(P, 0)}</b> you cover your full cost and earn a normal profit, so the firm stays alive to deliver. The town gets <b>${fmt(m.Q, 0)} units</b> instead of the ${fmt(unQ, 0)} an unregulated you would have served \u2014 but fewer than the <b>${fmt(a.Q, 0)}</b> that marginal-cost pricing would have delivered, and <b>${money(v.dwl)}</b> a period of value is left uncreated.
        As a natural monopoly you cannot be made to charge less and still stay in business; the regulator chooses a live firm with some waste over a perfect diagram with no firm in it.</div></div>
      <div class="card tight" data-note="flat"><div class="small"><b>All three prices, in the order the textbook draws them.</b>
        <div class="scoreline"><span>Unregulated \u2248 $${fmt(unP, 0)}</span><b>${fmt(unQ, 0)} units \u00b7 ${money(un ? un.profit : 0)} profit</b></div>
        <div class="scoreline"><span>P = AC \u2248 $${fmt(f.P, 0)}</span><b>${fmt(f.Q, 0)} units \u00b7 normal profit</b></div>
        <div class="scoreline" style="border:none"><span>P = MC \u2248 $${fmt(a.P, 0)}</span><b>${fmt(a.Q, 0)} units \u00b7 the firm loses money</b></div>
        <div style="margin-top:.4rem">Price falls and output rises at every step, and the last step is the one the firm cannot survive. That is what a natural monopoly means.</div></div></div>`;
  } else if (v.compliant) {
    verdict = `
      <div class="card tight" data-note="amber"><div class="small"><b>Stop and look at what "fair return" did to this town.</b>
        You now earn exactly a normal profit \u2014 ${money(v.net)} \u2014 and the regulator is satisfied. You serve <b>${fmt(m.Q, 0)} units</b> at <b>$${fmt(P, 0)}</b>.
        Unregulated you were selling ${fmt(unQ, 0)} units at $${fmt(unP, 0)}, so the town is clearly better off than doing nothing: a lower price and <b>${fmt(m.Q - unQ, 0)} more units</b>.</div></div>
      <div class="card tight" data-note="red"><div class="small"><b>But this plant is not a natural monopoly, so the regulator has overshot.</b>
        Look at the efficient price: <b>P = MC is about $${fmt(a.P, 0)}</b>, and at this plant that price <i>already covers your costs</i> \u2014 it would have left you ${money(a.profit)}. No subsidy was ever needed here.
        And the fair-return price has come out <b>$${fmt(a.P - P, 2)} BELOW</b> the efficient one. At $${fmt(P, 0)} the town buys <b>${fmt(m.Q, 0)} units</b>, which is <b>${fmt(m.Q - a.Q, 0)} more</b> than the ${fmt(a.Q, 0)} where price equals marginal cost. Those extra units cost you more to make than the town values them, so value is now being destroyed from the other side \u2014 about <b>${money(v.dwl)}</b> a period.
        <b>The fair-return compromise is worth making only where the alternative is no firm at all \u2014 where average cost is still falling at the output where price equals marginal cost. Here it is not, so the efficient price is the one that covers cost and leaves the firm standing.</b>
        ${lowCross ? `Average cost also equals demand at <b>$${fmt(lowCross.P, 0)}</b> for just ${fmt(lowCross.Q, 0)} units. That is a break-even price too, but no regulator would ever name it: the town would pay far more and buy almost nothing.` : 'Your average-cost curve meets demand at this one price only at this plant size.'}</div></div>`;
  } else {
    verdict = `
      <div class="card tight" data-note="red"><div class="small"><b>That is not a fair return.</b>
        A fair return means your price equals your average cost: ${money(m.ac, 2)} at ${fmt(m.Q, 0)} units, not $${fmt(P, 0)}. At the price you named you are ${v.excess > 0 ? `taking <b>${money(v.excess)}</b> above a normal return` : `falling <b>${money(m.ac - P, 2)} short</b> on every unit and losing money`}.</div></div>
      ${v.excess > 0 ? `<div class="card tight" data-note="red"><div class="small"><b>The fine.</b>
        <div class="scoreline"><span>Profit above a normal return</span><b>${money(v.excess)}</b></div>
        <div class="scoreline"><span>\u00d7 3 (the penalty)</span><b>${money(v.fine)}</b></div>
        <div class="scoreline" style="border:none"><span>Left to you this period</span><b style="color:var(--bad-d)">${money(v.net)}</b></div></div></div>` : ''}`;
  }

  return `
    <div class="card ${v.compliant ? 'event good' : 'event bad'} fade">
      <div class="kicker">Result &middot; regulation ${isMc ? '1 of 2' : '2 of 2'}</div>
      <h2>${head}</h2>
      ${tiles}
      <div class="chartcard" data-view="dec-mono-chart"></div>
      ${verdict}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
}

ACTS['dec-mp'] = t => { S.dec.P = +t.value; res(); };
ACTS['dec-mk'] = t => { S.dec.monoK = +t.dataset.v; res(); };
VIEWS['dec-mono-chart'] = w => chart(cfgMonopoly(w, { K: S.dec.monoK, P: S.dec.P, welfare: S.dec.welfare }));
function lockMono(b) {
  const m = monoState(S.dec.monoK, S.dec.P);
  const profit = m.feasible ? m.profit : -ECON.tfc(S.dec.monoK);
  if (b.reg) {
    /* THE REGULATED PAGES. The regulator's verdict is computed once, here, and
       `v.net` — profit, plus any subsidy, less any fine — is what reaches firm
       value. The outcome page reads the same function, so the figure the
       student is shown and the figure they are charged can never disagree. */
    const v = regVerdict(S.dec.monoK, S.dec.P, b.reg);
    S.regRun = S.regRun || {};
    S.regRun[b.reg] = { P: S.dec.P, K: S.dec.monoK, net: v.net, fine: v.fine,
                        subsidy: v.subsidy, excess: v.excess, dwl: v.dwl,
                        compliant: v.compliant, Q: v.m.Q, natural: v.natural };
    /* Scored against the best reply that MEETS the rule — the rule is the
       exercise, so a student who complies and a student who chases profit are
       not being asked the same question. A compliant answer always scores. */
    if (v.compliant) {
      S.insight += 12;
      scorePlay(v.net, Math.max(v.net, profit), 'You met the regulator\u2019s rule, which is what this page is asking for.');
    } else {
      scorePlay(v.net, profit,
        `You priced at $${fmt(S.dec.P, 0)} and earned ${money(v.net)} after the regulator. `
        + `The price the rule called for was $${fmt(v.target.P, 0)}, which would have served ${fmt(v.target.Q, 0)} units.`);
    }
    logRun('mono', `${b.label || 'Regulated pricing'} \u2014 price $${fmt(S.dec.P, 0)}`
      + (v.compliant ? ' (compliant)' : ` (fined ${money(v.fine)})`), v.net);
    addValue(v.net);
    return;
  }
  /* the unregulated page: one right answer, the profit-maximising price */
  let best = -Infinity, bp = 0;
  for (let p = 36; p <= 56; p += 0.5) { const r = monoState(S.dec.monoK, p); if (r.feasible && r.profit > best) { best = r.profit; bp = p; } }
  if (Math.abs(S.dec.P - bp) <= 1) S.insight += 10;
  scorePlay(profit, best, `The profit-maximising price was about $${fmt(bp, 0)}: ${money(best)} instead of ${money(profit)}.`);
  logRun('mono', `${b.label || 'Monopoly pricing'} \u2014 price $${fmt(S.dec.P, 0)}`, profit);
  addValue(profit);
}

/* ---------------- the monopsony decision ----------------
   The firm names a wage; the town's labour supply decides how many people turn
   up. One slider, and everything downstream — employment, output, the price the
   firm can charge, its profit and the town's wage bill — follows from it. */
function decBuyer(b) {
  const K = S.dec.buyK, W = S.dec.W;
  const r = ECON.buyerState(K, W);
  const oldR = ECON.buyerState(K, ECON.WAGE);
  const comp = ECON.competitiveWage(K);

  if (S.locked) {
    const dwl = ECON.monopsonyDWL(K);
    const bill = W * r.L, oldBill = oldR.W * oldR.L;
    const gain = r.profit - oldR.profit;
    return `
    <div class="card event ${gain >= 0 ? 'good' : 'bad'} fade">
      <div class="kicker">Result</div>
      <h2>You are the town\u2019s only employer</h2>
      <div class="tiles">
        <div class="tile hi"><div class="tl">Wage you offer</div><div class="tv">$${fmt(W, 0)}</div><div class="ts">${W < ECON.WAGE ? money(ECON.WAGE - W, 0) + ' below the old wage' : W > ECON.WAGE ? money(W - ECON.WAGE, 0) + ' above the old wage' : 'the old market wage'}</div></div>
        <div class="tile"><div class="tl">People who will work</div><div class="tv">${fmt(r.L, 1)}</div><div class="ts">at $${fmt(W, 0)} an hour</div></div>
        <div class="tile"><div class="tl">Output</div><div class="tv">${fmt(r.Q, 0)}</div><div class="ts">sold at $${fmt(r.P, 2)}</div></div>
        <div class="tile"><div class="tl">Pay going into the town</div><div class="tv">${money(bill)}</div><div class="ts">${bill <= oldBill ? money(oldBill - bill, 0) + ' less than at $90' : money(bill - oldBill, 0) + ' more than at $90'}</div></div>
        <div class="tile ${gain >= 0 ? 'pos' : 'neg'}"><div class="tl">${profitLabel(r.profit)}</div><div class="tv">${money(r.profit)}</div><div class="ts">${gain >= 0 ? '+' : ''}${money(gain, 0)} against $90</div></div>
      </div>
      <div class="chartcard" data-view="dec-buyer-chart"></div>
      ${b.after(r, ECON.bestWage(K), comp, dwl, oldR)}
      <div class="btnrow right"><button class="btn primary big" data-a="next">Continue \u2192</button></div>
    </div>`;
  }

  const ctl = `
    <div class="ctl" style="margin-top:0">
      <div class="clab"><span class="t">The wage you offer</span><span class="v" data-slot="ctlW" data-keep-class="v">$${fmt(W, 0)}</span></div>
      ${sliderRow('dec-wage', 45, 115, 1, W, '<div class="ticks"><span>$45</span><span>$80</span><span>$115</span></div>')}
      <div class="small muted" style="margin-top:.25rem">You are the only employer here, so the wage is yours to set. Offer less and fewer people will take the job \u2014 there is nowhere else for them to go.</div>
    </div>
    <div class="ctl">
      <div class="clab"><span class="t">Show what the town loses</span></div>
      <div class="optrow"><button class="opt ${S.dec.welfare ? 'sel' : ''}" data-a="dec-welfare">${S.dec.welfare ? 'Shown on the chart' : 'Hidden'}</button></div>
    </div>`;

  /* pinned with the slider, so the labour-supply diagram stays in view */
  const out = `
    <div class="readout" data-slot="out">
      <div class="ro hi"><div class="rl">Wage you offer</div><div class="rv">$${fmt(W, 0)}</div></div>
      <div class="ro"><div class="rl">Workers employed</div><div class="rv">${fmt(r.L, 2)}</div></div>
      <div class="ro"><div class="rl">Output</div><div class="rv">${fmt(r.Q, 1)}</div></div>
      <div class="ro"><div class="rl">Price you can charge</div><div class="rv">$${fmt(r.P, 2)}</div></div>
      <div class="ro"><div class="rl">Marginal factor cost</div><div class="rv">${money(r.mfc, 2)}</div></div>
      <div class="ro"><div class="rl">What a worker adds</div><div class="rv">${money(r.mrp, 2)}</div></div>
      <div class="ro ${r.profit >= oldR.profit ? 'pos' : 'neg'}"><div class="rl">${profitLabel(r.profit)}</div><div class="rv">${money(r.profit)}</div></div>
    </div>`;

  const foot = `
    <div class="card tight" data-note="flat">
      <div class="small" style="font-weight:800">Your position as a buyer</div>
      <div class="scoreline"><span>Employers in this town</span><b>one \u2014 you</b></div>
      <div class="scoreline"><span>Hiring one more worker costs</span><b>${money(r.mfc, 2)}</b></div>
      <div class="scoreline"><span>...and that worker adds</span><b>${money(r.mrp, 2)}</b></div>
      <div class="scoreline" style="border:none"><span>You keep the difference</span><b class="${r.mrp - W > 0 ? 'good' : 'bad'}">${money(Math.max(0, r.mrp - W), 2)} per worker</b></div>
      <div class="small muted" style="margin-top:.4rem">Taking on one more person means paying everyone you already employ a little more, so the <i>marginal factor cost</i> (purple) sits above the wage the workers actually receive (black). You hire where that marginal cost meets what a worker adds, then pay the lowest wage the supply curve will accept at that number of workers.</div>
    </div>
    <div class="btnrow"><button class="btn primary wide big" data-a="dec-lock">Lock in the wage</button></div>`;

  return decShell(b, ctl, out, `<div class="chartcard" data-view="dec-buyer-chart"></div>`, foot, true);
}
ACTS['dec-wage'] = t => { S.dec.W = +t.value; res(); };
VIEWS['dec-buyer-chart'] = w => chart(cfgMonopsony(w, { K: S.dec.buyK, W: S.dec.W, welfare: S.dec.welfare }));

function lockBuyer(b) {
  const r = ECON.buyerState(S.dec.buyK, S.dec.W);
  const best = ECON.bestWage(S.dec.buyK);
  if (Math.abs(S.dec.W - best.W) <= 2.5) S.insight += 10;
  scorePlay(r.profit, best.profit, `The profit-maximising wage was about $${fmt(best.W, 0)}: ${money(best.profit)} instead of ${money(r.profit)}.`);
  logRun('mono', `${b.label || 'Monopsony'} \u2014 wage $${fmt(S.dec.W, 0)}`, r.profit);
  addValue(r.profit);
}

BEATS.mono = () => ([
  {
    t: 'intro',
    kicker: 'Chapter 2 \u00b7 Monopoly',
    title: 'The only firm in town',
    paras: [
      'Chapter 1 ended with a workshop that worked perfectly and earned nothing. Then two things happened in the same week. The town council, worried about how crowded the market had become, replaced the eight street licences with <b>one exclusive licence</b> \u2014 and you won it. And the new production process you had been quietly developing was finally <b>granted a patent</b>.',
      'Between them, those two pieces of paper change everything. A rival is no longer merely unlikely: it is <b>legally impossible</b>. Economists call this a <b>barrier to entry</b>, and it is the one thing that decides whether market power exists at all.',
      '<b>This is the exact opposite of Chapter 1.</b> There, eight sellers offered an identical product and nobody could influence the price. Here, one seller offers a product nobody else can legally make, and the price is entirely yours to choose.',
      'There is only one thing standing in your way, and it is your own demand curve: <b>to sell more, you must charge less.</b>'
    ],
    bullets: [
      '<b>Barriers to entry:</b> the exclusive licence and the patent. Nobody can compete with you.',
      `<b>What changed, and what did not:</b> the ${caps()}, the workers and the costs are exactly as they were in Chapter 1.`,
      '<b>You now face the whole market demand curve:</b> P = 60 \u2212 Q/5. Marginal revenue falls below price, because selling one more unit forces you to charge less on <i>all</i> the units you were already selling.'
    ],
    btn: 'Set your price \u2192'
  },
  {
    t: 'decision', kind: 'mono', tag: 'The monopoly years', label: 'Monopoly pricing',
    setup: () => ({ monoK: 3, P: 42, welfare: true }),
    title: 'What price will you charge?',
    brief: 'You are the only seller. Choose a price, watch how the quantity demanded responds, and find the price that earns the highest profit. The chart also shows what your pricing does to the town.',
    after: (m, bestP, transfer, d) => `
      <div class="narr"><b>Where is the rule here?</b> You stopped at ${fmt(m.Q, 0)} units, where <b>MR = MC</b> (${money(m.mr, 2)} \u2248 ${money(m.mc, 2)}). At that output you charge <b>$${fmt(S.dec.P, 0)}</b> \u2014 well above marginal cost of ${money(m.mc, 2)}.</div>
      <div class="card tight" data-note="flat">
        <div class="scoreline"><span>Monopoly price</span><b>$${fmt(S.dec.P, 0)}</b></div>
        <div class="scoreline"><span>Marginal cost</span><b>${money(m.mc, 2)}</b></div>
        <div class="scoreline"><span>Average cost</span><b>${money(m.ac, 2)}</b></div>
        <div class="scoreline" style="border:none"><span>Price above average cost by</span><b class="good">${money(S.dec.P - m.ac, 2)} per unit</b></div>
      </div>
      <div class="narr">Compare this with Chapter 1, where the long-run price fell to the minimum of average cost and economic profit was zero. Here, price sits far above cost and the gap is yours to keep. <b>The profit rectangle on the chart is money that consumers paid above what a competitive market would have charged \u2014 about ${money(transfer)}.</b></div>
      ${d.area > 1 ? `<div class="card tight" data-note="red"><div class="small"><b>And there is a second loss that nobody receives.</b> The red triangle on the chart covers the customers who would willingly have paid more than it costs you to make the product \u2014 but never get it, because at ${fmt(m.Q, 0)} units you have no reason to supply them. About <b>${money(d.area)}</b> of value per period is destroyed outright. Your profit is a transfer; this is pure loss.</div></div>` : ''}`
  },
  {
    t: 'intro',
    kicker: 'An opportunity',
    title: 'Some customers will pay more than others',
    paras: [
      'Your sales team brings you a discovery. The town\u2019s caf\u00e9s buy in bulk and will not pay retail; but individual customers walking past your shop will pay far more than your current price, and there are students and pensioners who would buy much more if the price were lower.',
      'Right now you charge <b>everyone the same price</b>. You could instead split the market: a higher price for those who are willing, a lower price for bulk buyers and students.',
      '<b>This is price discrimination</b> \u2014 charging different customers different prices for the same product. It is possible here only because you can identify the groups and stop them reselling to each other.'
    ],
    choices: [
      { v: 'yes', label: 'Introduce a two-tier price', sub: 'bulk and student discounts' },
      { v: 'no', label: 'Keep one price for everybody', sub: 'simple and fair' }
    ],
    onPick: v => {
      if (v === 'yes') {
        S.mono.pd = true;
        logRun('mono', 'Price discrimination gains', 230);
        addValue(230);
      }
    },
    btn: 'Continue \u2192'
  },
  {
    t: 'check',
    title: 'Why is marginal revenue below price?',
    q: 'In Chapter 1, price equalled marginal revenue. Why are they different for a monopolist?',
    opts: [
      { t: 'Because the monopolist has higher costs.', ok: false, fb: 'Costs are not the reason. The difference comes from the demand side, not the cost side.' },
      { t: 'Because to sell one more unit the monopolist must lower the price on every unit, so the extra revenue is less than the price.', ok: true, fb: 'Exactly. The firm faces the whole downward-sloping market demand curve. Cutting the price to win one more sale reduces the revenue it gets on all the units it was already selling. MR is therefore below P \u2014 and because output stops where MR = MC, price ends up above MC.' },
      { t: 'Because customers refuse to pay high prices.', ok: false, fb: 'Customers do pay high prices \u2014 that is exactly what makes monopoly profitable. The issue is what happens at the margin.' }
    ]
  },
  {
    t: 'decision', kind: 'buyer', tag: 'The other side of the market', label: 'Monopsony: setting the wage',
    taskLabel: 'Set the town\u2019s wage and lock it in.',
    taskHint: 'Watch how the wage decides how many people are willing to work for you \u2014 and what that does to output.',
    setup: () => ({ buyK: 3, W: 90, welfare: true }),
    title: 'The same power, pointed the other way',
    brief: 'Every decision so far has been about the price you <i>charge</i>. Now look at the price you <i>pay</i>. Until this chapter, labour came from a bottomless outside market and you paid the going rate of $90 whatever you did. That market is gone: your firm is now the only employer in town, and the only buyer of the labour it needs. There is nowhere else for these people to work, so how many of them turn up depends entirely on the wage you offer. Set it.',
    after: (r, best, comp, dwl, oldR) => {
      const gap = Math.max(0, r.mrp - r.W);
      const bill = r.W * r.L, oldBill = oldR.W * oldR.L;
      const gain = r.profit - oldR.profit;
      return `
      <div class="narr"><b>Here is the rule, and it is the mirror image of the last one.</b> Taking on one more worker pushes up the pay of everyone you already employ, so that worker costs you more than the wage you hand over: the <b>marginal factor cost</b> of ${money(r.mfc, 2)} sits above a wage of $${fmt(r.W, 0)}. You hire up to the point where that cost meets what a worker actually adds \u2014 <b>MFC = MRP</b> \u2014 and then you pay the lowest wage the town will accept for that many workers: <b>$${fmt(r.W, 0)}</b>, which is <b>$${fmt(gap, 0)} below</b> what each of them is worth to you.</div>
      <div class="card tight" data-note="flat">
        <div class="scoreline"><span>Wage you pay each worker</span><b>$${fmt(r.W, 0)}</b></div>
        <div class="scoreline"><span>What each worker adds</span><b>$${fmt(r.mrp, 0)}</b></div>
        <div class="scoreline"><span>Total pay going into the town</span><b>${money(bill)} a period</b></div>
        <div class="scoreline" style="border:none"><span>Paying the old $90 would have cost</span><b>${money(oldBill)}</b></div>
      </div>
      <div class="narr"><b>Now look at what you actually gained.</b> Your profit moved from about ${money(oldR.profit)} at $90 to ${money(r.profit)} \u2014 roughly <b>${money(gain, 0)} more</b>. But the town\u2019s wage bill fell by <b>${money(oldBill - bill, 0)}</b>. You kept only a fraction of it, because cheaper labour means fewer people working, less output, and less revenue. <b>Buying power moves income around; on its own it does not create any.</b></div>
      ${dwl.area > 1 ? `<div class="card tight" data-note="red"><div class="small"><b>And once again some value is destroyed outright.</b> Between your ${fmt(r.L, 1)} workers and the ${fmt(comp.L, 1)} a competitive labour market would employ, every one of them is worth more to you than they would need to be paid \u2014 and that work simply never happens. About <b>${money(dwl.area)}</b> a period, the exact mirror of the deadweight loss you created as a seller.</div></div>` : ''}
      <div class="card tight" data-note="blue"><div class="small"><b>One firm, one piece of market power, two directions.</b> As a seller you charged customers <i>above</i> your marginal cost. As a buyer you pay workers <i>below</i> what they add. Both take a surplus from somebody else, and both leave value uncreated. Remove the barrier to entry and both disappear \u2014 which is precisely what the next chapter does.</div></div>`;
    }
  },
  /* ============================================================
     PAGES 1–3 OF THE REGULATOR SEQUENCE
     ------------------------------------------------------------
     One page per rule, then a page that teaches the difference. The single
     "Under a price cap" page this replaces asked the student to weigh both
     rules at once and then presented the whole argument as one block of
     commentary — the two decisions were never actually made, and the economics
     that mattered (whether this plant is a natural monopoly) was buried in the
     narration rather than being something the student could see.
     ============================================================ */
  {
    t: 'event', cls: 'warn', tag: 'Market event \u00b7 regulation',
    title: 'The patent expires, and the regulator calls',
    paras: [
      `Your patent has run out. New producers could now enter \u2014 and the town\u2019s regulator has been reading the local paper. Consumer groups have complained that a product which costs about $${fmt(ECON.ac(3, ECON.minACL(3).L), 0)} to make is being sold for more than $40.`,
      'The regulator\u2019s case is not that you are a monopoly. It is that your price sits <b>above the cost of making one more unit</b>, so there are sales the town wants and does not get, and the value of those missing sales is destroyed \u2014 it goes to nobody. That gap has a name, the deadweight loss, and it is the regulator\u2019s first target.',
      'They will put <b>one demand</b> to you at a time. First the hard rule: a price that leaves no deadweight loss at all. Then, once that is settled, they will show you the softer rule they fall back on \u2014 and you will see for yourself whether this plant needs it.'
    ],
    change: () => `<span class="pricetag"><span class="old">$${fmt(S.dec.P, 0)}</span><span class="new">regulated</span></span> <span class="delta down">the regulator wants price = marginal cost</span>`,
    btn: 'Meet the regulator \u2192'
  },
  {
    t: 'decision', kind: 'mono', tag: 'Regulation \u00b7 1 of 3', reg: 'mc',
    label: 'The no-deadweight-loss price',
    setup: () => ({ monoK: 3, P: 42, welfare: true }),
    title: 'Name a price that leaves no deadweight loss',
    brief: () => `The regulator\u2019s demand is exact: <b>the price you charge must equal the marginal cost of the last unit you sell.</b> At that price the town buys every unit it values above what the unit costs to make, and the deadweight-loss triangle closes completely. Nothing stops you enlarging the plant if the town wants more than you can serve.`
  },
  {
    t: 'decision', kind: 'mono', tag: 'Regulation \u00b7 2 of 3', reg: 'ac',
    label: 'The fair-return price',
    /* carries the plant the student chose on the previous page forward, so the
       investment decision they made there still means something here */
    setup: () => ({ monoK: (S.regRun && S.regRun.mc ? S.regRun.mc.K : 3), P: 42, welfare: true }),
    title: 'Now the regulator allows a fair return',
    brief: () => `The hard rule has been tried and the regulator is having second thoughts about what it costs. The new rule is softer and it is the one real regulators actually use: <b>your price must equal your average cost</b>, so that you cover everything you spend and earn exactly a normal profit. Not a loss, not a fortune.`
  },
  {
    /* ---- PAGE 3 OF 3: teaching and summary ----
       `paras` must be a plain array (the report renderer maps over it), so the
       student's own numbers ride in `list` and `insight`, which may be
       functions and are therefore evaluated when the page is drawn. */
    t: 'report',
    title: 'The same firm, two rules \u2014 and the plant decides which one bites',
    paras: [
      'You have now been handed both of the prices in the regulator\u2019s toolkit. They answer two different questions and it is worth keeping them apart.',
      'The first rule asks the only question economics answers cleanly: <b>how much should be produced?</b> Charge the cost of the last unit and the town buys everything worth buying. The second rule asks the question a regulator actually has to live with: <b>can the firm survive at that price?</b> Cover your average cost and you stay in business \u2014 but the price is above the cost of one more unit, so some value is still destroyed on every unit you do not make.'
    ],
    listTitle: 'What the two pages actually decided',
    list: () => {
      const r = S.regRun || {};
      const mc = r.mc, ac = r.ac;
      const K = (mc && mc.K) || 3;
      const a = allocativePrice(K), f = fairReturnPrice(K);
      const natural = isNaturalMonopoly(K);
      const un = monoUnregulated(K);
      const unP = un ? un.P : 0;
      const out = [];
      out.push(`<b>The first rule had one answer, and it was not a matter of taste.</b> Price equals marginal cost \u2014 about <b>$${fmt(a.P, 0)}</b> at your plant \u2014 serving <b>${fmt(a.Q, 0)} units</b> with no deadweight loss left standing. Any other price either destroys value or over-produces.`
        + (mc ? ` You named $${fmt(mc.P, 0)}${mc.compliant ? ', which met it' : `, which missed it and cost you ${money(mc.fine)} in fines`}.` : ''));
      out.push(`<b>The second rule had a price too \u2014 about $${fmt(f.P, 0)}, serving ${fmt(f.Q, 0)} units.</b> Average cost and demand can meet <i>twice</i>, and which one the regulator means is not a matter of taste: it is the crossing at the <b>highest output</b>, because that is the most the town can get at a price that still covers the firm\u2019s costs.`
        + (ac ? ` You named $${fmt(ac.P, 0)}${ac.compliant ? ', which met it' : `, which missed it and cost you ${money(ac.fine)} in fines`}.` : ''));
      out.push(natural
        ? `<b>At this plant the two rules collide.</b> Average cost is still above demand where price meets marginal cost, so the efficient price is <i>below</i> cost \u2014 the firm would lose ${money(-a.profit)} a period supplying it: a regulator who insists on it must pay a subsidy out of taxation, and one who refuses must accept a higher price and some waste. That trade-off is what fair-return regulation exists to make, and it is why the three prices line up the way they do here: unregulated at $${fmt(unP, 0)}, fair return at $${fmt(f.P, 0)}, efficient at $${fmt(a.P, 0)} \u2014 with output rising at every step.`
        : `<b>At this plant they do NOT collide \u2014 and that is the lesson.</b> The efficient price <i>covers</i> your costs and still leaves a profit of ${money(a.profit)}, so no firm has to be rescued and no subsidy is warranted. Fair return is therefore not a necessary compromise here: it comes out <b>$${fmt(a.P - f.P, 0)} BELOW</b> the efficient price, which pushes the town to <b>${fmt(f.Q - a.Q, 0)} units more</b> than the ${fmt(a.Q, 0)} where price equals marginal cost \u2014 units that cost more to make than they are worth. <b>The compromise is only worth making where the alternative is no firm at all</b> \u2014 where average cost is still above demand at the output the efficient price calls for.`);
      out.push(`<b>And the penalty is the reason the rule means anything.</b> The fine is three times the profit taken above a normal return, so compliance is never the expensive option: an offence that pays is not an offence, it is a price list.`
        + (mc && !mc.compliant ? ` Your first answer cost you ${money(mc.fine)} on ${money(mc.excess)} of excess profit.` : '')
        + (ac && !ac.compliant ? ` Your second cost you ${money(ac.fine)}.` : ''));
      if (f.crossings > 1) {
        out.push(`<b>Why two crossings, and why only one of them is the price.</b> At ${K} ${K > 1 ? caps() : cap()} your average-cost curve meets demand at about <b>$${fmt(f.all[0].P, 0)}</b> for ${fmt(f.all[0].Q, 0)} units, and again at <b>$${fmt(f.P, 0)}</b> for ${fmt(f.Q, 0)}. Both are break-even points, so both satisfy the letter of the rule. The first is a price so high that the town barely buys anything \u2014 no regulator would name it. The second is the lowest price at which the firm still covers its costs, and it is the one the rule is for.`);
      }
      return out;
    },
    insight: () => {
      const r = S.regRun || {};
      const K = (r.mc && r.mc.K) || 3;
      const natural = isNaturalMonopoly(K);
      return natural
        ? `Whether the regulator should demand efficiency or settle for survival is not decided by the regulator. It is decided by the <b>shape of the firm\u2019s cost curve</b> \u2014 specifically by whether average cost is above the price the town will pay at the output where price equals marginal cost. Get that wrong and you either bankrupt a firm the town needs, or let it charge more than it ever charged before.`
        : `The question "should the regulator demand efficiency or settle for fair return?" is not a question about regulators at all. It is a question about <b>where the minimum of the average-cost curve sits relative to the output the town wants</b>. At your plant the efficient price already covers cost, so nothing needed rescuing \u2014 and the \u201cfair\u201d price would have come out <i>below</i> the efficient one and pushed the firm to over-produce. A softer rule is not automatically a kinder one.`;
    },
    btn: 'Next: what if your product were different? \u2192'
  },
  {
    t: 'report',
    title: 'One firm, two opposite worlds',
    paras: [
      `In Chapter 1 you were one of eight identical sellers and the market decided your price. In Chapter 2 you were the only seller in town and the price was yours to choose. The ${caps()}, the workers and the technology never changed \u2014 only the market around you did.`
    ],
    listTitle: 'Three things you should be able to explain now',
    list: () => [
      '<b>A monopolist is a price maker.</b> With barriers to entry protecting it, the firm faces the whole market demand curve. Marginal revenue is below price, and the firm maximises profit where MR = MC \u2014 then charges the highest price consumers will pay at that output.',
      '<b>Price exceeds marginal cost \u2014 and that is inefficient.</b> Consumers who value an extra unit above its cost do not get it. The value lost is the deadweight loss, and unlike monopoly profit it is not transferred to anybody: it simply never exists.',
      '<b>Barriers to entry are what create the power.</b> Remove the licence, the patent or the control of a key input, and the monopoly disappears. A firm protected by nothing will be competed down to normal profit, exactly as in Chapter 1.'
    ],
    insight: () => `The same workshop produced ${money(S.log.filter(x => x.ch === 'pc').reduce((a, x) => a + x.profit, 0))} of economic profit under perfect competition, but ${money(S.log.filter(x => x.ch === 'mono').reduce((a, x) => a + x.profit, 0))} under monopoly. The ${caps()}, the workers and the technology never changed. <b>Market structure, not effort, decides how much profit there is to be had.</b>`,
    btn: 'Next: what if your product were different? \u2192'
  }
]);
