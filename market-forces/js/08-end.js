/* ============================================================
   MARKET FORCES — debrief, teacher guide, boot
   ============================================================ */

function rankOf(v) {
  const max = { short: 420, std: 2450, full: 4600 }[S.mode] || 4600;
  const r = v / max;
  if (v < 0) return { t: 'AN EXPENSIVE LESSON', c: '#A3271B', note: 'You finished with a negative firm value. Every loss in this game came from a decision you can now explain.' };
  if (r >= 0.7) return { t: 'MARKET MOGUL', c: '#1D4ED8', note: 'You found the profitable ground in every market and protected it. Outstanding.' };
  if (r >= 0.45) return { t: 'PROFIT MAKER', c: PAL.blue, note: 'You read each market well and made the most of the power you were given.' };
  if (r >= 0.2) return { t: 'STEADY OPERATOR', c: PAL.green, note: 'You survived every market structure and earned a return. Look at the analysis below to find the profit you left behind.' };
  return { t: 'SURVIVOR', c: '#BE740F', note: 'You kept the firm alive through four very different markets. The next section shows where the money was.' };
}

/* Questions are authored once; product words are filled in when the page is drawn,
   so a student who chose soap never reads about bakeries. */
function fillFirm(s) {
  return String(s)
    .replace(/~S~/g, sellers())
    .replace(/~s~/g, seller())
    .replace(/~u~/g, prod().unitPl);
}

const QUESTIONS = [
  {
    ch: 'Perfect competition', tag: 'Chapter 1', qs: [
      ['You were never asked to choose a price. Why not \u2014 and what would have happened if you had charged $45 instead of $40?', ''],
      ['Put the three seasons into one sentence that connects the price, your profit, and the number of ~S~ in town.', ''],
      ['In season two you kept producing at a loss. Explain why that was the rational decision, and state the price below which you would have shut down.', ''],
      ['In the long-run equilibrium, P = MC = minimum AC and economic profit is zero. Who gains from that outcome, and is anyone made worse off?', ''],
      ['Would you rather own a firm in a perfectly competitive market, or work for someone else? Use the idea of normal profit in your answer.', '']
    ]
  },
  {
    ch: 'Monopoly', tag: 'Chapter 2', qs: [
      ['You chose a price and the quantity followed. Why is that the exact reverse of what a perfectly competitive firm does?', ''],
      ['Explain in your own words why marginal revenue is below price for a monopolist. Your answer should contain the phrase \u201con all the units it was already selling\u201d.', ''],
      ['The profit rectangle and the deadweight loss triangle are both losses to consumers. What is the difference, and who receives each of them?', ''],
      ['You held a licence and a patent. Remove them \u2014 one at a time \u2014 and describe what would happen to your price, your output and your profit.', ''],
      ['As the town\u2019s only employer you could also push the wage down. Who gained and who lost from that, and how is it the mirror image of the price you charged your customers?', ''],
      ['The regulator put two rules to you in turn \u2014 price equals marginal cost, then price equals average cost. Which one would a real regulator use on a natural monopoly, and why is the answer different for a firm whose average cost has already stopped falling?', ''],
      ['The penalty for missing the regulator\u2019s rule was three times the profit you took above a normal return. Why three, and what would happen to the rule if the penalty were smaller than the gain?', ''],
      ['Is a monopolist always bad for society? Build the strongest argument you can on each side, using innovation, economies of scale and natural monopoly.', '']
    ]
  },
  {
    ch: 'Monopolistic competition', tag: 'Chapter 3', qs: [
      ['Your demand curve sloped downwards. What exactly gave you that market power, and how much of it did you really have?', ''],
      ['At launch you earned a solid profit. Two seasons later you earned almost nothing. Nothing about your factory had changed. Explain what happened.', ''],
      ['Advertising cost $140 and lifted demand by 40%. Did it pay for itself in your firm? Under what conditions would it?', ''],
      ['Describe two ways your outcome differed from the perfectly competitive outcome, and explain what consumers got in return.', ''],
      ['In Chapter 2 a licence made you the only seller. Here you had no such protection. Explain how the same firm ends up with so much less power when the barrier disappears.', '']
    ]
  },
  {
    ch: 'Oligopoly', tag: 'Chapter 4', qs: [
      ['Before round 1, what did you expect Northwind to do, and why? Did their behaviour match your expectation?', ''],
      ['Work out the best response for each firm in the payoff matrix. Which cell is the Nash equilibrium, and why is it worse for both firms than the cooperative outcome?', ''],
      ['Holding the price high was best for the two of you together, and best for each of you individually \u2014 as long as the other held. Explain this apparent contradiction.', ''],
      ['Was the price agreement illegal? Was it wrong? Are those the same question?', ''],
      ['Imagine the two of you could sign a binding, legally enforceable agreement to hold the price at $44. What would happen to the price and output in the town, and who would lose?', ''],
      ['In real markets like this, firms often compete on advertising or product features instead of price. Why might they prefer that?', '']
    ]
  },
  {
    ch: 'Across all four markets', tag: 'Synthesis', qs: [
      ['Rank the four market structures by the economic profit your firm earned, and by the price consumers paid. Which single factor explains your ranking?', ''],
      [`Your workshop, ${caps()} and workers were identical in every chapter. What does that tell you about where profit actually comes from?`, ''],
      ['If you were the government of this town, what would you do about markets like Northwind\u2019s, and about your own monopoly? What would you be giving up in each case?', ''],
      ['Which market structure would you choose to start a business in, and which would you choose as a consumer? Explain the difference between your two answers.', ''],
      ['Name one firm you actually buy from that you think operates in each of the four structures. Justify each choice with evidence about entry barriers and product differentiation.', '']
    ]
  }
];

SCENES.debrief = {
  html() {
    const rank = rankOf(S.value);
    const byCh = {};
    S.log.forEach(x => { byCh[x.ch] = (byCh[x.ch] || 0) + x.profit; });
    /* Penalties are not trading periods, so they are kept out of the ledger and
       reported on their own line. Hiding them entirely would be worse than the
       old bug: the student paid the money and must see where it went. */
    const fines = MF.finesTotal ? MF.finesTotal() : 0;
    const chRows = Object.keys(CHAPTERS).filter(id => S.chs.indexOf(id) >= 0).map(id => {
      const c = CHAPTERS[id];
      return `<div class="scoreline"><span>Chapter ${c.n} \u00b7 ${c.title}</span><b class="${(byCh[id] || 0) >= 0 ? '' : 'bad'}">${money(byCh[id] || 0, 0)}</b></div>`;
    }).join('') + (fines
      ? `<div class="scoreline"><span>Regulatory fine <span class="small muted">\u00b7 paid, not traded</span></span><b class="bad">\u2212${money(fines, 0).replace('$', '$')}</b></div>`
      : '');
    const qs = QUESTIONS.filter(g => g.qs.length).map(g => `
      <div class="card">
        <h3 style="margin-top:0"><span class="pill b">${g.tag}</span> ${g.ch}</h3>
        <ol class="clean">${g.qs.map(x => `<li style="margin:.5rem 0">${fillFirm(x[0])}</li>`).join('')}</ol>
      </div>`).join('');
    return `
    <div class="rankcard pop">
      <div class="tagline">Final result</div>
      <h2>${rank.t}</h2>
      <div class="bigscore" style="margin:.5rem 0">${money(S.value, 0)}</div>
      <div class="small" style="opacity:.95">final firm value &middot; ${S.insight} Insight points earned</div>
      <div class="small" style="opacity:.95;margin-top:.4rem">${rank.note}</div>
    </div>
    <div class="grid2" style="margin-top:1rem">
      <div>
        <div class="card">
          <h3 style="margin-top:0">Where the money came from</h3>
          ${chRows}
          <div class="scoreline" style="border:none;font-weight:800"><span>Total economic profit</span><b>${money(S.value, 0)}</b></div>
          <div class="small muted" style="margin-top:.4rem">Note how unevenly it is spread. In some markets you worked hard for a small return; in others the profit was simply there to be taken. <b>The difference was never your effort \u2014 it was the market structure you were operating in.</b></div>
        </div>
        <div class="card">
          <h3 style="margin-top:0">Your season-by-season record</h3>
          <div class="scroll" style="max-height:18rem">
            <table class="dt"><thead><tr><th>Chapter</th><th>Decision</th><th>Economic profit</th></tr></thead><tbody>
            ${S.log.map(x => `<tr><td>${CHAPTERS[x.ch] ? CHAPTERS[x.ch].n : ''}</td><td style="text-align:left">${x.label}</td><td class="${x.profit >= 0 ? 'good' : 'bad'}">${money(x.profit, 0)}</td></tr>`).join('')}
            </tbody></table>
          </div>
        </div>
      </div>
      <div>
        <div class="card" data-note="amber">
          <h3 style="margin-top:0">Now write it up</h3>
          <div class="small">The questions below are the real point of the game. Work through them in your notebook, one section at a time. Where a question asks you to explain something, use the numbers you actually saw on your own screen \u2014 not the textbook version.</div>
          <div class="btnrow">
            <button class="btn" data-a="print">${uicon('print')} Print this page</button>
            <button class="btn" data-a="guide">${uicon('book')} Teacher guide</button>
            <button class="btn" data-a="restart">${uicon('restart')} Play again</button>
          </div>
        </div>
        <div class="card tight">
          <div class="small" style="font-weight:800">Useful sentence starters for your write-up</div>
          <ul class="clean small">
            <li>\u201cBecause there were no barriers to \u2026\u201d</li>
            <li>\u201cAt that output, marginal cost was \u2026 and price was \u2026, which means \u2026\u201d</li>
            <li>\u201cThe profit was not transferred to anyone \u2014 it simply \u2026\u201d</li>
            <li>\u201cMy best response depended on \u2026, and I expected the rival to \u2026\u201d</li>
          </ul>
        </div>
      </div>
    </div>
    <div style="margin-top:1rem">${qs}</div>
    <div class="card tight" style="margin-top:1rem"><div class="small muted">That is the end of the game. Everything you did here \u2014 every price, every hire, every event \u2014 was produced by the same cost curves and the same demand conditions you will meet in the exam.</div></div>`;
  }
};
ACTS['print'] = () => window.print();

/* ============================================================
   TEACHER GUIDE
   ============================================================ */
function TEACHER_GUIDE() {
  /* read straight off the engine, so this reference table can never go stale */
  const K1 = 1;
  const mpPeakL = (() => { let b = 1, v = -Infinity; for (let L = 1; L <= ECON.maxL(K1); L++) if (ECON.mp(K1, L) > v) { v = ECON.mp(K1, L); b = L; } return { L: b, v }; })();
  const apPeakL = ECON.AP_X * K1, tppL = ECON.X_TPP * K1;
  let negFrom = null;
  for (let L = 2; L <= ECON.maxL(K1); L++) if (ECON.mp(K1, L) < 0) { negFrom = L; break; }
  const mac = ECON.minACL(K1), b40 = ECON.bestL(K1, 40), b27 = ECON.bestL(K1, 27);
  const bestCap = ECON.capacity(K1), qAtTop = ECON.output(K1, ECON.maxL(K1));
  const un = monoState(3, 42);
  /* The two regulated prices, read from the engine rather than typed in. The
     row that used to live here said "regulated price cap at $30", a number that
     was never either of the chapter's two prices — $30 sits BELOW the
     allocatively efficient price at four machines, so it would have created a
     shortage rather than removed the deadweight loss. */
  const regA = allocativePrice(3), regF = fairReturnPrice(3);
  const regAm = monoState(3, regA.P), regFm = monoState(3, regF.P);
  const regDwl = regFm.feasible ? dwlArea(3, regFm.Q, regF.P, regFm.mc).area : 0;
  const regNatural = isNaturalMonopoly(3);
  let bp = 0, bv = -Infinity;
  for (let p = 36; p <= 56; p += 0.5) { const r = monoState(3, p); if (r.feasible && r.profit > bv) { bv = r.profit; bp = p; } }
  const mBest = monoState(3, bp);
  const dwl = dwlArea(3, mBest.Q, bp, mBest.mc).area;
  return `
  <button class="btn close" data-a="closeSheet">Close \u2715</button>
  <div class="kicker">Teacher guide</div>
  <h2>MARKET FORCES \u2014 how to run it</h2>
  <div class="small muted">Economics role play &middot; market structure &middot; single player &middot; four chapters, four markets</div>
  <div class="btnrow no-print"><button class="btn" data-a="print">${uicon('print')} Print / save as PDF</button></div>

  <h3>1 &middot; What students do</h3>
  <div class="body">Students run one manufacturing firm through four market structures in sequence. They choose a product, a brand and a colour; run a factory to discover their own production function and cost curves; then trade in perfect competition, monopolistic competition, oligopoly and monopoly. At each step they make a decision, lock it in, and see the consequences in their profit.</div>
  <div class="body">The design target is the gap you see in most classes: students can draw the diagrams but have no instinct for what a firm owner is actually looking at when they make a choice. Here the diagrams are the interface.</div>

  <h3>2 &middot; Timing and modes</h3>
  <table class="dt">
    <thead><tr><th>Mode</th><th>Content</th><th>Class time</th></tr></thead>
    <tbody>
      <tr><td>Quick Round</td><td>Firm set-up + factory + perfect competition + debrief</td><td>20\u201325 min</td></tr>
      <tr><td>Standard</td><td>Adds monopolistic competition and oligopoly</td><td>40\u201350 min</td></tr>
      <tr><td>Full Campaign</td><td>Adds monopoly and regulation</td><td>2 lessons</td></tr>
    </tbody>
  </table>
  <div class="body"><b>Suggested sequence.</b> Students play individually on their own device \u2014 the game is deliberately single-player so that each student owns their own numbers and nobody can hide behind a group.</div>
  <ol class="clean">
    <li><b>Play (20\u201330 min).</b> No talking. Tell them to notice what they cannot control.</li>
    <li><b>Compare (10 min).</b> Put four or five students\u2019 final values on the board. Ask: you all had the same workshop and the same costs, so why are these numbers different?</li>
    <li><b>Debrief questions (20 min).</b> Work through the reflection questions by section. Insist on numbers from their own run.</li>
    <li><b>Diagram link (10 min).</b> Have each student draw the diagram for the market that gave them the most profit, and label where their firm was.</li>
  </ol>

  <h3>3 &middot; The game mechanics</h3>
  <ul class="clean">
    <li><b>Firm set-up.</b> Product (6 options), brand colour (8 options), firm name. Purely cosmetic \u2014 but do point out in perfect competition that every rival carries the student\u2019s exact icon and colour, because the product is homogeneous.</li>
    <li><b>The factory.</b> Land and capital are fixed factors; labour and raw materials are variable. Free exploration with two missions on the production function, then two more on the cost curves. The profit rule itself is then lived through in the perfect-competition chapter that follows.</li>
    <li><b>Decision rounds.</b> Every decision is locked in before the result appears. Results are calculated live from the same cost function used in the factory, so a student can check any number by hand.</li>
    <li><b>Insight points.</b> Awarded for finding the right answer in the factory (2 \u00d7 10 on production, 2 \u00d7 10 on costs), for each in-game check answered correctly (10 each, one is worth 15), and for hitting the profit-maximising price in the monopoly chapter (10).</li>
    <li><b>Firm value</b> is cumulative economic profit and is the main score.</li>
  </ul>

  <h3>4 &middot; The economic model behind the game</h3>
  <table class="dt">
    <thead><tr><th>Item</th><th>Value used in the game</th></tr></thead>
    <tbody>
      <tr><td>Production function (short run)</td><td>Q = 48KL\u00b2 / (16K\u00b2 + L\u00b2) \u2014 Cobb-Douglas-like, giving an initial rise in marginal product then diminishing returns</td></tr>
      <tr><td>Land (fixed)</td><td>$200 per period</td></tr>
      <tr><td>Capital (fixed)</td><td>$150 per ${cap()} per period</td></tr>
      <tr><td>Labour (variable)</td><td>$90 per worker per period</td></tr>
      <tr><td>Raw materials (variable)</td><td>$3 per unit of output</td></tr>
      <tr><td>Market demand</td><td>Q = 300 \u2212 5P, so P = 60 \u2212 Q/5</td></tr>
      <tr><td>Coefficients of firm demand (monopolistic competition)</td><td>q = (120 \u2212 2.2P) \u00d7 demand multiplier</td></tr>
    </tbody>
  </table>
  <table class="dt" style="margin-top:.5rem">
    <thead><tr><th>Key result (with 1 ${cap()})</th><th>Number</th></tr></thead>
    <tbody>
      <tr><td>Marginal product peaks</td><td>worker ${mpPeakL.L} (MP = ${fmt(mpPeakL.v, 2)})</td></tr>
      <tr><td>Average product peaks where AP = MP</td><td>worker ${apPeakL} (AP = ${fmt(ECON.AP_MAX, 2)})</td></tr>
      <tr><td>Minimum average variable cost = shutdown price</td><td>${money(ECON.minAVC(), 2)} (worker ${apPeakL})</td></tr>
      <tr><td>Minimum average total cost</td><td>${money(mac.ac, 2)} at ${fmt(mac.q, 1)} units (worker ${mac.L})</td></tr>
      <tr><td>Profit-maximising output at P = $40</td><td>worker ${b40.L}, Q = ${fmt(ECON.output(K1, b40.L), 1)}, profit = ${money(b40.profit)}</td></tr>
      <tr><td>Loss-minimising output at P = $27</td><td>worker ${b27.L}, Q = ${fmt(ECON.output(K1, b27.L), 1)}, loss = ${money(b27.profit)} (versus ${money(ECON.profit(K1, 0, 27))} if shut down)</td></tr>
      <tr><td>Total product peaks, then falls</td><td>worker ${tppL} (Q = ${fmt(bestCap, 1)}); marginal product is <b>negative</b> from worker ${negFrom}</td></tr>
      <tr><td>Output at the last worker on the slider</td><td>worker ${ECON.maxL(K1)}, Q = ${fmt(qAtTop, 1)} \u2014 less than the peak</td></tr>
      <tr><td>Long-run competitive price</td><td>${money(ECON.longRunP(K1))}, economic profit = ${money(ECON.bestL(K1, ECON.longRunP(K1)).profit)}</td></tr>
      <tr><td>Monopoly optimum (3 ${caps()})</td><td>P = $${fmt(bp, 0)}, Q = ${fmt(mBest.Q, 0)}, AC = ${money(mBest.ac, 2)}, MC = ${money(mBest.mc, 2)}, profit = ${money(mBest.profit)}</td></tr>
      <tr><td>Deadweight loss at the monopoly output</td><td>about ${money(dwl)} per period</td></tr>
      <tr><td>Regulated: no deadweight loss, 3 ${caps()}</td><td>P = MC = $${fmt(regA.P, 0)}, Q = ${fmt(regAm.Q, 0)}, AC = ${money(regAm.ac, 2)} \u2014 deadweight loss eliminated; ${regNatural ? 'this plant loses money at that price and needs a subsidy' : 'at this plant the price covers cost, so no subsidy is needed'}</td></tr>
      <tr><td>Regulated: fair return, 3 ${caps()}</td><td>P = AC = $${fmt(regF.P, 0)}, Q = ${fmt(regFm.Q, 0)} \u2014 normal profit, but ${money(regDwl)} a period of deadweight loss still standing and ${fmt(un.Q - regFm.Q, 0)} fewer units than no regulation at all</td></tr>
    </tbody>
  </table>
  <div class="small muted">Every number in the game is generated from these formulas at run time, so numbers may differ slightly from this table if a student chooses a different number of ${caps()}.</div>

  <h3>5 &middot; Event cards</h3>
  <table class="dt">
    <thead><tr><th>Chapter</th><th>Event</th><th>Economic mechanism</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>Word gets out \u2014 three new ${sellers()} open</td><td>No barriers to entry; supply shifts right; price $40 \u2192 $22; profit becomes loss</td></tr>
      <tr><td>1</td><td>The shake-out \u2014 two firms close, demand rises</td><td>No barriers to exit; supply shifts left; price $22 \u2192 $34</td></tr>
      <tr><td>1</td><td>The long run \u2014 entry continues</td><td>Price converges on minimum AC, $${Math.round(ECON.longRunP(K1))}; P = MC = min AC; zero economic profit</td></tr>
      <tr><td>2</td><td>An exclusive licence and a patent</td><td>Barriers to entry created by regulation and by law; the firm becomes the market and the price is its to set</td></tr>
      <tr><td>2</td><td>Some customers will pay more than others</td><td>Price discrimination; +$230 profit where groups can be identified and separated</td></tr>
      <tr><td>2</td><td>The town\u2019s only employer</td><td>Monopsony: market power on the buying side. The wage is set below marginal revenue product, so employment falls and the gap is kept by the firm</td></tr>
      <tr><td>2</td><td>Patent expires, the regulator calls \u2014 first rule</td><td>Regulation of legal monopoly; the allocatively efficient price, P = MC. Where average cost is still falling at that output the firm cannot survive on it and needs a subsidy; the penalty for missing the rule is 3\u00d7 the excess profit</td></tr>
      <tr><td>2</td><td>Then the regulator allows a fair return</td><td>P = AC \u2014 normal profit, the firm stays alive, but deadweight loss remains. Whether this is the right compromise depends on the plant, not on the regulator: it only bites where average cost is still falling at the efficient output</td></tr>
      <tr><td>3</td><td>Everyone copies you</td><td>Imitation shifts the firm\u2019s demand curve leftwards; profit falls from $318 to about $104</td></tr>
      <tr><td>3</td><td>The profit disappears again</td><td>Long-run tangency: D tangent to AC, P = AC &gt; MC, excess capacity, normal profit</td></tr>
      <tr><td>4</td><td>A quiet word from Northwind (cartel offer)</td><td>Collusion raises joint profit but is illegal and unstable</td></tr>
      <tr><td>4</td><td>The regulator opens a file</td><td>Competition law; $800 fine if the firm agreed to fix prices</td></tr>
    </tbody>
  </table>

  <h3>6 &middot; Scoring and win conditions</h3>
  <ul class="clean">
    <li><b>Firm value</b> \u2014 cumulative economic profit across every decision. This is the main score and mirrors what a real owner would care about.</li>
    <li><b>Insight points</b> \u2014 earned in the factory and in the in-game checks. A student can score poorly and still demonstrably understand the economics; reward both.</li>
    <li><b>Rank titles</b> are scaled to the mode played, so a Quick Round cannot be compared unfairly with a Full Campaign.</li>
    <li><b>There is no single winning number.</b> The pedagogically interesting comparison is <i>between</i> students: identical technology, wildly different outcomes \u2014 because of different guesses about rivals and different readings of the market.</li>
  </ul>

  <h3>7 &middot; Reflection questions and expected answers</h3>
  <div class="body">These are the questions shown on the student debrief page. The notes below are the direction a good answer should take, not a marking scheme.</div>
  <div class="q"><div class="qn">Chapter 1 &middot; Perfect competition</div><div class="ans">
    <b>Price taking.</b> Homogeneous product plus many sellers means each firm faces a horizontal demand curve at the market price; any price above it sells nothing. There is no price decision to make.
    <br><b>The three seasons.</b> $40 with three ${sellers()} and positive profit; entry pushed the price to $22 and profit to a loss; exit and rising demand restored the price to $34; continued entry drove it to $${Math.round(ECON.longRunP(K1))}, where price equals minimum AC and economic profit is zero.
    <br><b>Producing at a loss.</b> Fixed cost is payable either way. As long as P &gt; AVC, output contributes to fixed cost and reduces the loss. Shut down when P &lt; minimum AVC ($18 here).
    <br><b>Who gains.</b> Consumers gain the product at the lowest possible average cost and at a price equal to marginal cost. No one is made worse off in the allocative sense; the firms simply earn only normal profit, which is not a loss \u2014 it is the return available elsewhere.
  </div></div>
  <div class="q"><div class="qn">Chapter 2 &middot; Monopoly</div><div class="ans">
    <b>Price maker.</b> With no rivals and barriers to entry, the firm is the market: the market demand curve is its own, so quantity sold depends on the price it sets. A competitive firm faces a horizontal demand curve and quantity is its only choice.
    <br><b>MR &lt; P.</b> To sell one more unit the monopolist must lower its price, and the lower price applies to all the units it was already selling. The extra revenue is therefore the new price minus the revenue lost on the earlier units \u2014 always less than price.
    <br><b>Two losses.</b> The profit rectangle is a <i>transfer</i>: consumers pay more, the firm receives it. The deadweight loss triangle is a <i>destruction</i>: units that would have been worth more to buyers than they cost to produce are never made, and nobody receives that value.
    <br><b>Removing the barriers.</b> Take away the patent and rivals can copy the process, so the demand curve shifts left and the price falls towards cost. Take away the licence as well and entry becomes free, which is exactly the world of Chapter 1 \u2014 price competed down to minimum average cost and profit competed away to normal. The barriers, not the firm, are what create the power.
    <br><b>Monopsony.</b> The same firm, looking the other way down the market. As the town's only employer it faces an upward-sloping supply of labour, so hiring one more worker raises the wage for everyone it already employs: the marginal cost of labour is above the wage. It hires up to the point where that marginal cost equals the worker's marginal revenue product, then pays the lowest wage those workers will accept \u2014 below what they are worth to the firm. Workers lose the gap; employment is lower than it would be in a competitive labour market. Note the symmetry: in the product market the firm held price <i>above</i> marginal cost; in the input market it holds the wage <i>below</i> marginal revenue product. Both extract surplus and both shrink the quantity traded, and a deadweight loss appears either way.
    <br><b>Price cap.</b> The cap lowers price towards marginal cost, which removes the reason to restrict output. The firm keeps its licence and still earns a normal return, but the profit from restricting output disappears.
    <br><b>Both sides.</b> Against: higher prices, lower output, deadweight loss, weaker incentives to control costs ("X-inefficiency"). For: patent-protected monopoly profits can fund research that competitive firms cannot finance; large-scale production can lower average cost; and in natural monopoly a single producer is cheaper than duplicated networks. The exam answer is the balance, not a verdict.
  </div></div>
  <div class="q"><div class="qn">Chapter 3 &middot; Monopolistic competition</div><div class="ans">
    <b>Source of power.</b> Product differentiation \u2014 customers do not see the products as perfect substitutes, so the firm faces a downward-sloping demand curve and can choose price. The power is limited because close substitutes exist and entry is free.
    <br><b>The disappearing profit.</b> Imitation and entry shifted the firm\u2019s demand curve leftward. Cost curves unchanged, demand fell, so the profit-maximising price\u2013output combination moved to a point where P \u2248 AC.
    <br><b>Advertising.</b> In this model $140 of advertising costs $140 and lifts the price at which the same quantity can be sold, but only modestly: at launch it is roughly profit-neutral, after imitation it buys back about $10. Advertising pays only when the increase in demand (and the resulting margin) exceeds the cost of the campaign. Note the familiar "if it worked for everyone, it stops working for anyone" effect.
    <br><b>Versus perfect competition.</b> Price is above marginal cost and output is below the AC-minimising level (excess capacity), so the market is neither allocatively nor productively efficient. What consumers get in return is variety and choice.
    <br><b>Why the power is so much weaker than in Chapter 2.</b> In Chapter 2 a licence and a patent made entry illegal, so profit was protected. Here differentiation is the only defence and it can be copied, so the same firm ends up with a small, temporary margin instead of a durable one. This is the cleanest demonstration in the game that barriers to entry, not cleverness, decide how long profit lasts.
  </div></div>
  <div class="q"><div class="qn">Chapter 4 &middot; Oligopoly</div><div class="ans">
    <b>Best responses and Nash.</b> Whatever the rival does, cutting is the better move: if they hold, cutting earns $615 instead of $530; if they cut, cutting earns $250 instead of \u2212$125. So both cut, and the Nash equilibrium is the bottom-right cell \u2014 $250 each, worse for both than the $530 each available from mutual restraint.
    <br><b>The apparent contradiction.</b> This is the prisoner\u2019s dilemma: the joint-best outcome is not an equilibrium because each player has a unilateral incentive to deviate. Co-operation requires trust or enforcement, and neither is available.
    <br><b>Illegal versus wrong.</b> Price fixing is illegal under competition law because it restricts output and raises prices, harming consumers, and because the agreement is unstable it also wastes resources on policing it. Whether it is <i>wrong</i> is a normative question students should be able to argue both ways \u2014 the economics shows the damage, not the morality.
    <br><b>Enforceable cartel.</b> Output would fall and price rise towards the monopoly level; consumers and firms outside the agreement would lose; the two firms would split the resulting monopoly profit. This is why cartels are treated as a form of market failure.
    <br><b>Non-price competition.</b> It is legal, it can shift demand rather than merely redistribute it, and it is harder for a regulator to attack. It is also often self-cancelling, as the monopolistic competition chapter showed.
  </div></div>
  <div class="q"><div class="qn">Synthesis</div><div class="ans">
    The single factor is <b>barriers to entry</b> \u2014 which determine how much of the profit is competed away. Where entry is free, profit is competed to normal levels; where entry is blocked, the firm keeps it. The identical workshop across all four chapters is the proof that the source of profit is the market structure, not the firm.
  </div></div>

  <h3>8 &middot; Where this fits the syllabus</h3>
  <table class="dt">
    <thead><tr><th>Curriculum</th><th>Coverage</th></tr></thead>
    <tbody>
      <tr><td>AP Microeconomics</td><td>Unit 3 (Production, Cost, Perfect Competition) and Unit 4 (Imperfect Competition): production function, MP and AP, short-run costs, MC = MR, shutdown rule, long-run equilibrium and entry/exit, monopolistic competition and excess capacity, price discrimination, oligopoly and game theory, monopoly and deadweight loss. Unit 6 market failure and the role of government is touched on by the regulation episode.</td></tr>
      <tr><td>IGCSE Economics 0455</td><td>5.1 Production and costs, 5.2 The market and competition, 5.3 Monopoly, 5.4 Oligopoly, and the effects of market structure on price and output. The narrative version is deliberately usable at IGCSE level: run the Quick Round and use the first four debrief questions.</td></tr>
      <tr><td>IB Economics</td><td>Unit 1.5 Firms and market structures: perfectly competitive markets, monopoly, monopolistic competition, oligopoly and game theory, barriers to entry, profit maximisation, and the efficiency comparisons. Also links to 1.4 market failure and the role of the government.</td></tr>
      <tr><td>Business Studies</td><td>Profit maximisation, costs and breakeven, competitive strategy, branding and differentiation, business ethics and regulation.</td></tr>
    </tbody>
  </table>

  <h3>9 &middot; Common misconceptions and how the game corrects them</h3>
  <ul class="clean">
    <li><b>\u201cZero economic profit means the business is failing.\u201d</b> The long-run perfect competition chapter makes this concrete: the firm still covers every cost including the owner\u2019s labour and capital. Normal profit is a real return, not a loss.</li>
    <li><b>\u201cA monopolist can charge whatever it likes.\u201d</b> The price slider is bounded by demand: raise the price and quantity collapses. The game forces students to trade the two off.</li>
    <li><b>\u201cFirms only shut down when they make a loss.\u201d</b> Season two is designed to break this. Students lose less by producing than by stopping, and the reason is the fixed/variable cost split they met in the factory.</li>
    <li><b>\u201cIf you earned profit, you must have been skilful.\u201d</b> The comparison of Chapter 1 and Chapter 2 with identical technology is the corrective.</li>
    <li><b>\u201cMarginal revenue is just price.\u201d</b> Students meet MR = P in Chapter 1 and then watch it fall below P in Chapters 2 and 3.</li>
    <li><b>\u201cMarket power is only about what you charge.\u201d</b> The monopsony episode shows the same power applied to what you <i>pay</i>. Students who can see both sides of the firm \u2014 its customers and its suppliers \u2014 are much harder to fool.</li>
    <li><b>\u201cAdvertising always pays.\u201d</b> In the model it is close to self-cancelling. Some students find this genuinely surprising, and it is worth a short discussion of real advertising in monopolistically competitive markets.</li>
    <li><b>\u201cToo many workers is always better.\u201d</b> The production tab settles it: total product peaks, and past that point an extra worker <i>reduces</i> what the factory turns out. Marginal product goes below zero on the chart, and the table shows it as a negative number.</li>
  </ul>

  <h3>10 &middot; Practical notes</h3>
  <ul class="clean">
    <li><b>The factory does not hand over the data.</b> A row in the tables only fills in once a student has actually stopped on that crew size &mdash; and the charts are drawn through the points they have found, and no further. Finding the peak of MP, the peak of AP and the lowest point of AC is therefore real work, not reading. If you want to talk over the finished picture, <b>Reveal the whole table</b> on the production or cost tab fills everything in at once.</li>
    <li><b>The market price is never the student's to choose.</b> The factory ends once the production and cost tasks are banked; the price-taking profit rule (MC = price, with the shutdown check) is then lived through in the perfect-competition chapter, where the market gives the price and the only control is the crew size &mdash; which is the point of the chapter.</li>
    <li>Runs in any modern browser &mdash; no installation, nothing to sign in to.</li>
    <li>Progress is not saved if the tab is closed. Tell students to finish a chapter in one sitting.</li>
    <li>The A / A / A+ buttons in the top bar change the text size for projecting or for tablets.</li>
    <li>The debrief page can be printed; the Print button produces a clean write-up sheet.</li>
    <li>If you want to hide the Teacher button from students, add <code>?t=0</code> to the file path in the address bar.</li>
  </ul>
  <div class="btnrow no-print"><button class="btn primary" data-a="closeSheet">Close</button></div>`;
}
ACTS['closeSheet'] = () => closeSheet();

/* ============================================================
   BOOT
   ============================================================ */
(function boot() {
  try {
    if (/[?&]t=0/.test(location.search)) S.showGuide = false;
    document.documentElement.dataset.fs = S.fs;
    bindGlobals();
    go('title');
    /* logRun / addValue / paintTop / openSheet / closeSheet are exported for the
       v4 achievement layer (10-achievements.js). Every settlement in the game
       routes through logRun + addValue, so wrapping those two is the whole
       integration surface for streaks and badges. */
    window.MF = { S: S, ECON: ECON, PAL: PAL, BEATS: BEATS, beatsFor: beatsFor, ACTS: ACTS, SCENES: SCENES, PRODUCTS: PRODUCTS, COLOURS: COLOURS, CHAPTERS: CHAPTERS, MODES: MODES, VIEWS: VIEWS, go: go, repaint: repaint, taskSync: taskSync, taskBody: taskBody, openTasks: openTasks, LAB_TASKS: LAB_TASKS, labPeerL: labPeerL, discover: discover, knownLevels: knownLevels, MACHINE_CHOICES: MACHINE_CHOICES, sectionTasks: sectionTasks, gateOpen: gateOpen, gateMissing: gateMissing, enterBeat: enterBeat, advance: advance, drawViews: drawViews, mcFirm: mcFirm, mcAutoL: mcAutoL, monoState: monoState, socialOpt: socialOpt, dwlArea: dwlArea, cfgMonopoly: cfgMonopoly, cfgPCFirm: cfgPCFirm, cfgMCFirm: cfgMCFirm, cfgMonopsony: cfgMonopsony, chart: chart, artFactory: artFactory, artStreet: artStreet, AD_LEVELS: AD_LEVELS, oligoPay: oligoPay, QUESTIONS: QUESTIONS, TEACHER_GUIDE: TEACHER_GUIDE, rankOf: rankOf, seller: seller, sellers: sellers, cap: cap, caps: caps, logRun: logRun, addValue: addValue, addInsight: addInsight, paintTop: paintTop, openSheet: openSheet, closeSheet: closeSheet, noteFine: noteFine, finesTotal: finesTotal, revealCharts: revealCharts, allocativePrice: allocativePrice, fairReturnPrice: fairReturnPrice, acDemandCrossings: acDemandCrossings, isNaturalMonopoly: isNaturalMonopoly, regVerdict: regVerdict, regTopPrice: regTopPrice, REG_FINE_MULT: REG_FINE_MULT, monoUnregulated: monoUnregulated, mcEquilibrium: mcEquilibrium, mcAR: mcAR, mcMR: mcMR, bestMC: bestMC, bestMCNoAd: bestMCNoAd, MC_DEMAND: MC_DEMAND, MC_PRICE: MC_PRICE, MC_K: MC_K };
  } catch (e) {
    document.getElementById('app').innerHTML = '<div class="card"><h2>Something went wrong</h2><pre class="small">' + (e && e.message) + '</pre></div>';
  }
})();
