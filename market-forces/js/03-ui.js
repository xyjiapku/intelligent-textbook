
/* ============================================================
   HAND-DRAWN ICON SET
   Flat, softly-shaded SVG icons that share one visual language:
   rounded shapes, a warm shadow, a top sheen. Product icons know
   a mono mode (white) for coloured chips and dark surfaces.
   ============================================================ */
const ICONS = (() => {
  const svg = (inner, vb) => `<svg viewBox="0 0 ${vb || 48} 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const sh = (m, cx) => m ? '' : `<ellipse cx="${cx || 24}" cy="41.5" rx="14.5" ry="2.6" fill="rgba(18,32,54,.10)"/>`;

  /* ---------- the six products ---------- */
  const PROD = {
    bread(m) {
      const A = m ? '#fff' : '#E2A03F', B = m ? 'rgba(255,255,255,.78)' : '#F3BE66',
        D = m ? 'rgba(255,255,255,.5)' : '#C07C22';
      return sh(m) +
        `<path d="M10 37.2C10 25.8 16.4 19 24 19s14 6.8 14 18.2c0 2.6-2 4.6-4.6 4.6H14.6C12 41.8 10 39.8 10 37.2z" fill="${A}"/>` +
        `<path d="M13.6 36.8c0-9 4.9-14.3 10.4-14.3s10.4 5.3 10.4 14.3c0 1-.8 1.7-1.8 1.7H15.4c-1 0-1.8-.7-1.8-1.7z" fill="${B}"/>` +
        `<path d="M18.6 25.2l2.8 3.6M23.2 23.4l2.8 4M27.8 25.2l2.6 3.4" stroke="${D}" stroke-width="1.8" stroke-linecap="round" fill="none"/>` +
        `<path d="M10.2 37c.3 2.5 2.2 4.3 4.4 4.3h18.8c2.2 0 4.1-1.8 4.4-4.3" stroke="${D}" stroke-width="1.8" fill="none"/>`;
    },
    coffee(m) {
      const A = m ? '#fff' : '#AC713C', B = m ? 'rgba(255,255,255,.72)' : '#935C2E',
        D = m ? 'rgba(255,255,255,.5)' : '#6E4527', H = m ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.28)';
      return sh(m) +
        `<path d="M15 17.5h18l2.5 20c.3 2.6-1.6 4.6-4 4.6H16.5c-2.4 0-4.3-2-4-4.6z" fill="${A}"/>` +
        `<path d="M18.4 17.5h11.2l-1 13.5h-9.2z" fill="${H}"/>` +
        `<rect x="18.6" y="10" width="10.8" height="8.6" rx="2.6" fill="${B}"/>` +
        `<rect x="16.8" y="9" width="14.4" height="3.4" rx="1.7" fill="${D}"/>` +
        `<ellipse cx="24" cy="30.2" rx="5.6" ry="7.4" fill="${D}"/>` +
        `<path d="M24 23.6c-1.8 2.2 1.8 4.4 0 13" stroke="${A}" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".8"/>`;
    },
    shirt(m) {
      const A = m ? '#fff' : '#4F94D8', B = m ? 'rgba(255,255,255,.6)' : '#2F6FB0',
        H = m ? 'rgba(255,255,255,.32)' : 'rgba(255,255,255,.3)';
      return sh(m) +
        `<path d="M15 13.4 20.6 9.4c1.4 2.7 5.4 2.7 6.8 0L33 13.4l6.4 5.6-4.9 5.4-3-2.6V39H16.5V21.8l-3 2.6-6.4-5.4z" fill="${A}"/>` +
        `<path d="M20.6 9.4c1.4 2.7 5.4 2.7 6.8 0L24 12.6z" fill="${B}"/>` +
        `<path d="M31.4 14.6 36 18.6l-3.1 3.4-1.5-1.3z" fill="${H}"/>` +
        `<path d="M27 18v18h6.5V21.8l-2.1-1.8z" fill="rgba(15,40,80,.10)"/>`;
    },
    chair(m) {
      const A = m ? '#fff' : '#BC8650', B = m ? 'rgba(255,255,255,.68)' : '#9C6A38',
        D = m ? 'rgba(255,255,255,.45)' : '#7E5528';
      return sh(m) +
        `<rect x="13" y="8.5" width="22" height="5.6" rx="2.8" fill="${A}"/>` +
        `<path d="M16 14v26M32 14v26" stroke="${D}" stroke-width="3.4" stroke-linecap="round"/>` +
        `<rect x="22.1" y="16.5" width="3.8" height="11" rx="1.9" fill="${B}"/>` +
        `<rect x="11.5" y="26.8" width="25" height="6.2" rx="2.6" fill="${A}"/>` +
        `<path d="M13.6 28.4h20.8" stroke="rgba(255,255,255,.4)" stroke-width="1.4"/>` +
        `<rect x="13" y="38.4" width="22" height="3.4" rx="1.7" fill="${B}"/>`;
    },
    soap(m) {
      const A = m ? '#fff' : '#4FC0A7', B = m ? 'rgba(255,255,255,.7)' : '#91DEC9',
        D = m ? 'rgba(255,255,255,.45)' : '#2E9C83', E = m ? 'rgba(255,255,255,.6)' : '#D8F4EC';
      return sh(m) +
        `<circle cx="14.5" cy="15" r="3" fill="${E}" stroke="${B}" stroke-width="1.2"/>` +
        `<circle cx="21" cy="11" r="2.1" fill="${E}" stroke="${B}" stroke-width="1.1"/>` +
        `<circle cx="10.5" cy="19" r="1.7" fill="${E}" stroke="${B}" stroke-width="1"/>` +
        `<rect x="8" y="20" width="32" height="17.5" rx="8.7" fill="${A}"/>` +
        `<rect x="11.2" y="22.6" width="14" height="4.6" rx="2.3" fill="${B}"/>` +
        `<ellipse cx="30.4" cy="29" rx="4.6" ry="3.4" fill="${D}"/>` +
        `<ellipse cx="29" cy="27.8" rx="1.5" ry=".9" fill="${E}"/>`;
    },
    plant(m) {
      const P = m ? '#fff' : '#CB7640', R = m ? 'rgba(255,255,255,.7)' : '#E0945E',
        S = m ? 'rgba(255,255,255,.4)' : '#8A5128',
        G1 = m ? 'rgba(255,255,255,.92)' : '#57B46A', G2 = m ? 'rgba(255,255,255,.62)' : '#3F9755';
      return sh(m) +
        `<path d="M24 29.5V15.5" stroke="${G2}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path d="M24 22.5C17 21.5 13.6 16.6 14.8 11.6c5.4.4 9 4 9.2 10.9z" fill="${G1}"/>` +
        `<path d="M24 18.5C31 17.5 34.4 12.6 33.2 7.6c-5.4.4-9 4-9.2 10.9z" fill="${G2}"/>` +
        `<path d="M16 31h16l-2 11.2c-.2 1.1-1.1 1.9-2.3 1.9H20.3c-1.2 0-2.1-.8-2.3-1.9z" fill="${P}"/>` +
        `<rect x="14" y="27.8" width="20" height="5" rx="2.3" fill="${R}"/>` +
        `<rect x="15.8" y="28.6" width="16.4" height="2.2" rx="1.1" fill="${S}"/>`;
    }
  };

  /* ---------- the four market structures (read on light & dark) ---------- */
  const CH = {
    pc() {
      const unit = (x, main) => {
        const light = main === 1;
        const aw = light ? '#4F8DE0' : '#93BCF2', bd = light ? '#4F8DE0' : '#7CA9E8';
        return `<path d="M${x} 23.5 L${x + 5} 16.5 L${x + 10} 23.5 Z" fill="${aw}"/>` +
          `<rect x="${x}" y="23.5" width="10" height="12.5" rx="2" fill="${bd}" opacity="${light ? 1 : .72}"/>` +
          `<rect x="${x + 2.2}" y="26.8" width="5.6" height="4.2" rx="1" fill="#E7F0FF"/>` +
          `<rect x="${x + 4}" y="31.4" width="2" height="4.6" rx="1" fill="#E7F0FF"/>`;
      };
      return unit(5.5, 0) + unit(19, 1) + unit(32.5, 0);
    },
    mono() {
      return `<path d="M9.5 32.5 7.5 17.5 16 24 24 13.5 32 24l8.5-6.5-2 15z" fill="#F0B73E" stroke="#D3961B" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<circle cx="7.5" cy="17.5" r="2.3" fill="#F9D778"/><circle cx="24" cy="13.5" r="2.5" fill="#F9D778"/><circle cx="40.5" cy="17.5" r="2.3" fill="#F9D778"/>` +
        `<rect x="9.5" y="32" width="29" height="5.2" rx="2.6" fill="#D3961B"/>` +
        `<circle cx="24" cy="34.6" r="1.7" fill="#FFF3D0"/>`;
    },
    mc() {
      const star = (cx, cy, s, c) =>
        `<path d="M${cx} ${cy - 9 * s} C${cx + 1 * s} ${cy - 3 * s} ${cx + 3 * s} ${cy - 1 * s} ${cx + 9 * s} ${cy} C${cx + 3 * s} ${cy + 1 * s} ${cx + 1 * s} ${cy + 3 * s} ${cx} ${cy + 9 * s} C${cx - 1 * s} ${cy + 3 * s} ${cx - 3 * s} ${cy + 1 * s} ${cx - 9 * s} ${cy} C${cx - 3 * s} ${cy - 1 * s} ${cx - 1 * s} ${cy - 3 * s} ${cx} ${cy - 9 * s}z" fill="${c}"/>`;
      return star(21, 20, 1.15, '#A78BFA') + star(35.5, 15, .62, '#C9B8FD') + star(12, 33, .5, '#C9B8FD');
    },
    oligo() {
      return `<circle cx="24" cy="14.5" r="6.3" fill="#A4B5CE"/>` +
        `<circle cx="21.8" cy="12.6" r="1.8" fill="rgba(255,255,255,.4)"/>` +
        `<path d="M15.5 26.5c1.8-5.2 5-7 8.5-7s6.7 1.8 8.5 7z" fill="#A4B5CE"/>` +
        `<path d="M14.5 26.5h19l2.6 8.2H11.9z" fill="#8B9DB8"/>` +
        `<rect x="9.5" y="34.2" width="29" height="5" rx="2.5" fill="#7C8FA9"/>` +
        `<rect x="12.5" y="35.4" width="10" height="1.6" rx=".8" fill="rgba(255,255,255,.28)"/>`;
    }
  };

  /* ---------- the three counters (request #6, redrawn in round 8) --------
     Round 8: "cash / firm value / insight 的图标风格不搭，要画得更精致华丽
     一些。" The first pass was three generic 1.9px line icons — a coin stack,
     a bar chart, a lamp — which read as a modern UI kit dropped onto a
     copperplate board. They are redrawn as ENGRAVED BRASS MEDALLIONS, the
     same visual language as .tp-crest and the achievement badges:

       · a struck brass disc, lit from the upper-left, with a milled rim
       · the figure drawn in warm ink ON the brass, not as a stroke
       · a glint arc across the top-left of every disc, so the three read as
         one set struck from the same die
       · a deep outer edge so the disc sits proud of the bar

     Silhouettes stay deliberately distinct — coin / rising column / lamp —
     because telling them apart at the back of a room without reading the
     label is the entire point of having icons here at all.

     These do NOT take currentColor. A struck medal has its own metal, and
     tinting it green whenever firm value went negative looked like a bug
     rather than a signal. The value text still carries pos/neg, which is
     where that colour belongs. */
  const MEDAL = {
    coin: B => `<circle cx="15" cy="15" r="13.4" fill="url(#${B})"/>
      <circle cx="15" cy="15" r="13.4" fill="none" stroke="#6E4E16" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="11.6" fill="none" stroke="#F6E7BA" stroke-width=".9" opacity=".75"/>
      <path d="M9.6 12.4c0-2.1 2.4-3.7 5.4-3.7s5.4 1.6 5.4 3.7c0 .9-.5 1.7-1.3 2.3.8.6 1.3 1.4 1.3 2.3 0 2.1-2.4 3.7-5.4 3.7s-5.4-1.6-5.4-3.7c0-.9.5-1.7 1.3-2.3-.8-.6-1.3-1.4-1.3-2.3z" fill="#5A3E0C" opacity=".82"/>
      <path d="M9.6 12.4c0-2.1 2.4-3.7 5.4-3.7s5.4 1.6 5.4 3.7" fill="none" stroke="#FFF4CE" stroke-width="1.1"/>
      <path d="M10.4 13.1h9.2" stroke="#F7E9BE" stroke-width="1.1" opacity=".9"/>
      <ellipse cx="15" cy="9.6" rx="3.1" ry="1.15" fill="#F5E6B6" opacity=".55"/>
      <path d="M6.4 7.2A10.6 10.6 0 0 1 12 3.4" fill="none" stroke="#FFFDF0" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`,
    bars: B => `<circle cx="15" cy="15" r="13.4" fill="url(#${B})"/>
      <circle cx="15" cy="15" r="13.4" fill="none" stroke="#6E4E16" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="11.6" fill="none" stroke="#F6E7BA" stroke-width=".9" opacity=".75"/>
      <rect x="8.2" y="16.6" width="3.9" height="6.4" rx=".7" fill="#5A3E0C" opacity=".86"/>
      <rect x="13" y="13.2" width="3.9" height="9.8" rx=".7" fill="#5A3E0C" opacity=".86"/>
      <rect x="17.8" y="9.4" width="3.9" height="13.6" rx=".7" fill="#5A3E0C" opacity=".86"/>
      <path d="M8.2 16.6h3.9M13 13.2h3.9M17.8 9.4h3.9" stroke="#FFF4CE" stroke-width="1" opacity=".8"/>
      <path d="M8.4 12.6l4.2-3.5 3.4 2.3 5.1-4.6" fill="none" stroke="#FFF6D4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.2 6.2h3.2v3.1" fill="none" stroke="#FFF6D4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.4 7.2A10.6 10.6 0 0 1 12 3.4" fill="none" stroke="#FFFDF0" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`,
    lamp: B => `<circle cx="15" cy="15" r="13.4" fill="url(#${B})"/>
      <circle cx="15" cy="15" r="13.4" fill="none" stroke="#6E4E16" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="11.6" fill="none" stroke="#F6E7BA" stroke-width=".9" opacity=".75"/>
      <path d="M15 4.4c-1.5 0-2.7 1.1-2.7 2.5 0 1.5 1.2 2.6 2.7 2.6s2.7-1.1 2.7-2.6c0-1.4-1.2-2.5-2.7-2.5z" fill="#FFF6D4" opacity=".92"/>
      <path d="M10.6 15.8 12.9 9.6h4.2l2.3 6.2z" fill="#5A3E0C" opacity=".86"/>
      <path d="M12.9 9.6h4.2" stroke="#FFF4CE" stroke-width="1"/>
      <path d="M11.4 15.8h7.2" stroke="#FFF4CE" stroke-width="1.1"/>
      <path d="M12.6 18.4h4.8" stroke="#5A3E0C" stroke-width="1.6" stroke-linecap="round" opacity=".86"/>
      <path d="M15 18.4v3.2" stroke="#5A3E0C" stroke-width="1.6" stroke-linecap="round" opacity=".86"/>
      <path d="M12.3 24.4h5.4" stroke="#5A3E0C" stroke-width="2" stroke-linecap="round" opacity=".86"/>
      <path d="M6.4 7.2A10.6 10.6 0 0 1 12 3.4" fill="none" stroke="#FFFDF0" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`
  };

  /* the shared brass gradient. Every medallion gets its OWN copy under a
     unique id. Two reasons this is not one global <defs>:
       · the same id three times in a document is invalid, and with three
         medallions the bar produced three collisions. Browsers resolve
         url(#mfBrass) to the first match in document order, so the metal
         happened to look right — but it is undefined behaviour and a
         re-render that reordered the bar would have changed the result.
       · an icon is a self-contained string here; one that only renders when
         its sibling is present is a trap for the next edit.
     A counter keeps the ids unique and the fill still points at the local
     copy, so all three read as struck from the same die. */
  let brassSeq = 0;
  const DEFS = () => {
    const id = 'mfBrass' + (++brassSeq);
    return {
      id,
      svg: `<defs>
    <radialGradient id="${id}" cx="34%" cy="26%" r="82%">
      <stop offset="0%" stop-color="#FCF0C6"/>
      <stop offset="34%" stop-color="#E7CB86"/>
      <stop offset="68%" stop-color="#C9A34F"/>
      <stop offset="100%" stop-color="#96702A"/>
    </radialGradient>
  </defs>`
    };
  };

  /* ---------- small line icons, inherit text colour ---------- */
  const LINE = {
    restart: () => `<path d="M20 4.5v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.5 13.5A7.5 7.5 0 1 0 20 15.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    book: () => `<path d="M4 5.6A1.8 1.8 0 0 1 5.8 4H19v15H5.8A1.8 1.8 0 0 0 4 20.8z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M4 20.8A1.8 1.8 0 0 1 5.8 19H19v1.8" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M8 8h7M8 11h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    print: () => `<path d="M7 8V3.5h10V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="4.5" y="8" width="15" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 14.5h9V20h-9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="11" r="1" fill="currentColor"/>`,
    dice: () => `<rect x="4" y="4" width="16" height="16" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/>`,
    store: () => `<path d="M4.5 9.5 6 4.5h12l1.5 5c0 2-1.4 3.2-3 3.2-1.1 0-2-.6-2.5-1.5C13.5 12.1 12.6 12.7 11.5 12.7s-2-.6-2.5-1.5C8.5 12.1 7.6 12.7 6.5 12.7 5.4 12.7 4.5 11.5 4.5 9.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5.5 12.5V20h13v-7.5M9.5 20v-5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    trophy: () => `<path d="M7 3.8h10v5.2a5 5 0 0 1-10 0z" fill="#FFF6DA" stroke="#8A5A00" stroke-width="1.5"/><path d="M7 5.5H4.2a2.8 2.8 0 0 0 3 4M17 5.5h2.8a2.8 2.8 0 0 1-3 4" fill="none" stroke="#8A5A00" stroke-width="1.6" stroke-linecap="round"/><path d="M12 13.8v3M9 20.2h6M9.8 16.8h4.4l.8 3.4H9z" fill="#FFF6DA" stroke="#8A5A00" stroke-width="1.5" stroke-linejoin="round"/>`,
    'check-sm': () => `<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M8.1 12.3l2.5 2.5L16 9.1" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`
  };

  return {
    product(id, mono) { const f = PROD[id] || PROD.bread; return svg(f(!!mono)); },
    inner(id, mono) { const f = PROD[id] || PROD.bread; return f(!!mono); },
    chapter(id) { const f = CH[id] || CH.pc; return svg(f()); },
    ui(name) { return `<svg class="uic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${(LINE[name] || LINE.store)()}</svg>`; },
    /* the medallions need a 30-unit box and the shared brass gradient; they
       are the only icons that carry a <defs>, so they get their own entry
       point rather than being forced through the 24-unit line-icon path */
    medal(name) {
      const f = MEDAL[name] || MEDAL.coin;
      const B = DEFS();
      const body = f(B.id);
      return `<svg class="uic uic-medal" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${B.svg}${body}</svg>`;
    }
  };
})();
const picon = (id, mono) => ICONS.product(id, mono);
const chicon = id => ICONS.chapter(id);
const uicon = n => ICONS.ui(n);
/* the struck-brass medallions are a different drawing idiom from the line
   icons (own viewBox, own <defs>, own metal) so they get their own helper */
const micon = n => ICONS.medal(n);


/* ============================================================
   MARKET FORCES — state, router, header, setup, factory tour
   ============================================================ */

const PRODUCTS = [
  { id: 'bread', icon: '\uD83C\uDF5E', name: 'Artisan Bakery', unit: 'loaf', unitPl: 'loaves', market: 'the town bakery market',
    seller: 'bakery', sellers: 'bakeries', Seller: 'Bakery',
    cap: 'oven', caps: 'ovens', Cap: 'Oven', Caps: 'Ovens',
    ideas: ['Wheat & Crumb', 'Golden Crust', 'Daily Loaf', 'The Bakehouse'],
    variants: ['Sourdough', 'Dark Rye', 'Seeded Multigrain', 'Brioche'],
    street: ['Bakery on 3rd', 'Corner Bake', 'Miller Street Oven', 'Old Town Loaf', 'Station Road Bakery', 'The Little Oven', 'Riverside Bread', 'Northgate Bakehouse'] },
  { id: 'coffee', icon: '\u2615', name: 'Coffee Roastery', unit: 'bag', unitPl: 'bags', market: 'the town coffee market',
    seller: 'roastery', sellers: 'roasteries', Seller: 'Roastery',
    cap: 'roaster', caps: 'roasters', Cap: 'Roaster', Caps: 'Roasters',
    ideas: ['Bean & Barrel', 'First Pour', 'Northside Roast', 'Ember Coffee'],
    variants: ['Single-Origin', 'Dark Roast Blend', 'Decaf Reserve', 'Cold Brew Kit'],
    street: ['Roast on 3rd', 'Corner Grind', 'Miller Street Roasters', 'Old Town Beans', 'Station Road Coffee', 'The Little Roastery', 'Riverside Roast', 'Northgate Roasters'] },
  { id: 'shirt', icon: '\uD83D\uDC55', name: 'T-Shirt Workshop', unit: 'shirt', unitPl: 'shirts', market: 'the town clothing market',
    seller: 'clothing workshop', sellers: 'clothing workshops', Seller: 'Clothing workshop',
    cap: 'press', caps: 'presses', Cap: 'Press', Caps: 'Presses',
    ideas: ['Thread & Co', 'Plain Good', 'Everyday Tee', 'Loomside'],
    variants: ['Heavyweight Cotton', 'Organic Slub', 'Vintage Wash', 'Recycled Blend'],
    street: ['Stitch on 3rd', 'Corner Threads', 'Miller Street Cotton', 'Old Town Tees', 'Station Road Apparel', 'The Little Workshop', 'Riverside Stitch', 'Northgate Clothing'] },
  { id: 'chair', icon: '\uD83E\uDE91', name: 'Chair Factory', unit: 'chair', unitPl: 'chairs', market: 'the town furniture market',
    seller: 'chair workshop', sellers: 'chair workshops', Seller: 'Chair workshop',
    cap: 'lathe', caps: 'lathes', Cap: 'Lathe', Caps: 'Lathes',
    ideas: ['Oakline', 'North Woodworks', 'Bench & Board', 'Plainframe'],
    variants: ['Solid Oak', 'Bent Plywood', 'Ash Slat', 'Stackable Beech'],
    street: ['Woodwork on 3rd', 'Corner Grain', 'Miller Street Joinery', 'Old Town Chairs', 'Station Road Furniture', 'The Little Bench', 'Riverside Oak', 'Northgate Woodworks'] },
  { id: 'soap', icon: '\uD83E\uDDF4', name: 'Soap Workshop', unit: 'bar', unitPl: 'bars', market: 'the town soap market',
    seller: 'soap workshop', sellers: 'soap workshops', Seller: 'Soap workshop',
    cap: 'vat', caps: 'vats', Cap: 'Vat', Caps: 'Vats',
    ideas: ['Pure Bar', 'Clean Slate', 'Mill & Lye', 'Simple Suds'],
    variants: ['Olive Oil Classic', 'Charcoal Detox', 'Honey Oat', 'Unscented Sensitive'],
    street: ['Soap on 3rd', 'Corner Lather', 'Miller Street Soaps', 'Old Town Bars', 'Station Road Suds', 'The Little Workshop', 'Riverside Clean', 'Northgate Soaps'] },
  { id: 'plant', icon: '\uD83C\uDF31', name: 'Plant Nursery', unit: 'plant', unitPl: 'plants', market: 'the town plant market',
    seller: 'nursery', sellers: 'nurseries', Seller: 'Nursery',
    cap: 'polytunnel', caps: 'polytunnels', Cap: 'Polytunnel', Caps: 'Polytunnels',
    ideas: ['Leaf & Pot', 'Green Corner', 'Roots', 'The Glasshouse'],
    variants: ['Hardy Ferns', 'Trailing Ivy', 'Succulent Mix', 'Flowering Shrubs'],
    street: ['Nursery on 3rd', 'Corner Green', 'Miller Street Plants', 'Old Town Pots', 'Station Road Garden', 'The Little Glasshouse', 'Riverside Ferns', 'Northgate Nursery'] }
];

const COLOURS = ['#2563EB', '#EA7317', '#0F9D74', '#E0494D', '#7C5CFC', '#0E9AA7', '#D63384', '#D9A106'];

/* The order here IS the playing order — the student meets perfect competition,
   then monopoly (the pure opposite), then monopolistic competition (power that
   is real but unprotected), and only then oligopoly, which needs everything
   before it. Numbering follows the object's own order. */
const CHAPTERS = {
  pc: { id: 'pc', n: 1, title: 'Perfect Competition', tag: 'Price taker', icon: '\uD83C\uDFEA' },
  mono: { id: 'mono', n: 2, title: 'Monopoly', tag: 'Price maker', icon: '\uD83D\uDC51' },
  mc: { id: 'mc', n: 3, title: 'Monopolistic Competition', tag: 'Product differentiator', icon: '\u2728' },
  oligo: { id: 'oligo', n: 4, title: 'Oligopoly', tag: 'Strategic rival', icon: '\u265F\uFE0F' }
};
/* A mode is just the first N chapters. Listing ids per mode let the order drift
   out of step with the chapter table; slicing one canonical list cannot. */
const CH_ORDER = ['pc', 'mono', 'mc', 'oligo'];

/* THE PRE-MARKET STAGE (round 9).
   The ladder in the top bar used to be nothing but `S.chs` lit by `S.chIdx`,
   so on the very first frame — before the student has even named their firm —
   rung 1 ("Perfect Competition") was already drawn as "you are here". It is
   not: the market has not opened. Setting up the firm, reading the tour and
   working the factory are a distinct stage of the game, and the game already
   says so everywhere else (the tour calls itself "Step 1 · Your firm", the
   factory "Step 2", the first market "Step 3").

   So the ladder gets a leading rung of its own. `PRE` is deliberately NOT in
   `CHAPTERS`: it has no beats, no outcome and no debrief column, and giving it
   an entry there would make every `CHAPTERS[id]` lookup need a null check.
   It is a dashboard state, described once, here. */
const PRE = { id: 'pre', n: 0, title: 'Your Firm', tag: 'Before the market opens' };
/* The scenes that belong to it. `title` is the home page and has its own
   treatment, so it is not included: on the title card there is no campaign
   under way at all and the ladder is drawn dimmed throughout. */
const PRE_SCENES = { setup: 1, tour: 1, lab: 1 };
function inPre() { return !!PRE_SCENES[S.scene]; }

const MODES = {
  short: { id: 'short', label: 'Quick Round', mins: '20-25 min', chs: CH_ORDER.slice(0, 1), note: 'Perfect Competition only, then the debrief.' },
  std: { id: 'std', label: 'Standard', mins: '40-50 min', chs: CH_ORDER.slice(0, 3), note: 'Competition, market power, then product differentiation.' },
  full: { id: 'full', label: 'Full Campaign', mins: '2 lessons', chs: CH_ORDER.slice(0, 4), note: 'All four market structures, ending in a strategic duel.' }
};

const S = {
  scene: 'title', fs: 'm', mode: 'full',
  product: null, colour: COLOURS[0], firmName: '',
  K: 1, L: 4, P: 40,
  startCash: 3000, cash: 3000, value: 0, insight: 0,
  chs: [], chIdx: 0, beat: 0, results: {},
  beats: {},            // chapterId -> array of beats
  log: [],
  lab: { tab: 'production', K: 1, L: 4, P: 40, missions: {}, found: {}, all: false },
  dec: {}, checkAns: null, pick: null, locked: false,
  oligo: { round: 0, mine: [], rival: [], collude: false, fine: 0, rivalP: 'H' },
  mono: { stage: 0, K: 3, P: 42 },
  /* the floating task panel: open/closed, and which sections have been shown */
  task: { open: false, key: '', seen: {} },
  showGuide: true
};

const ACTS = {};
const SCENES = {};

/* ---------------- sliders: drag to explore, click to land on a value -------
   Every range input in the game is wrapped in this, so the player gets a − and
   a + either side of it. One click moves exactly one step of that slider's own
   `step`, which is how you land on a precise number instead of hunting for it
   with the mouse. */
function sliderRow(attr, min, max, step, value, ticks) {
  const disc = attr.indexOf('dec-') === 0 ? ' discrete' : '';
  const ntick = Math.max(1, Math.round((max - min) / step));
  return `<div class="srow${disc}" style="--n:${ntick}">
    <button class="sbtn" data-a="step" data-i="${attr}" data-d="-1" aria-label="decrease" title="one less">\u2212</button>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-i="${attr}">
    <button class="sbtn" data-a="step" data-i="${attr}" data-d="1" aria-label="increase" title="one more">+</button>
  </div>${ticks || ''}`;
}
ACTS['step'] = t => {
  const name = t.dataset.i, dir = +t.dataset.d;
  /* target the input itself: the buttons carry the same data-i */
  const el = q('input[data-i="' + name + '"]');
  if (!el) return;
  const min = +el.min, max = +el.max, st = +(el.step || 1);
  const next = Math.min(max, Math.max(min, (+el.value) + dir * st));
  if (next === +el.value) return;              // already at the end of the range
  el.value = String(next);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  /* the same "let go" signal a drag produces, so a clicked value is recorded
     in the lab notebook too */
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

/* Discrete (decision) sliders must move one notch at a time, like the
   +/- buttons: a fast drag ticks through the values instead of gliding, so the
   student actually sees each price or wage. The native input is made inert to
   the pointer in CSS and the wrapper drives it, at most one step per event. */
function ratchetTarget(row, clientX) {
  const el = row.querySelector('input[type=range]');
  const r = el.getBoundingClientRect();
  const min = +el.min, max = +el.max, st = +(el.step || 1);
  const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  return Math.round((min + ratio * (max - min)) / st) * st;
}
function ratchetCommit(row, dir) {
  const el = row.querySelector('input[type=range]');
  if (!el) return false;
  const min = +el.min, max = +el.max, st = +(el.step || 1);
  const next = Math.min(max, Math.max(min, +el.value + dir * st));
  if (next === +el.value) return false;
  el.value = String(next);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  row.classList.remove('tickpop'); void row.offsetWidth; row.classList.add('tickpop');
  return true;
}
function bindRatchet() {
  let drag = null;
  /* decision sliders repaint the whole scene on every input, which replaces the
     DOM nodes mid-drag; so the gesture is keyed by the input's data-i name and
     re-bound to the live nodes on every pointer event. */
  const liveRow = name => {
    const el = q('input[type=range][data-i="' + name + '"]');
    const row = el && el.closest && el.closest('.srow.discrete');
    return row ? { row, el } : null;
  };
  document.addEventListener('pointerdown', e => {
    if (e.target.closest && e.target.closest('.sbtn')) return;
    const row = e.target.closest && e.target.closest('.srow.discrete');
    if (!row) return;
    e.preventDefault();
    const el = row.querySelector('input[type=range]');
    drag = { name: el.dataset.i };
    const target = ratchetTarget(row, e.clientX);
    if (+el.value < target) ratchetCommit(row, 1);
    else if (+el.value > target) ratchetCommit(row, -1);
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    const live = liveRow(drag.name);
    if (!live) return;
    const target = ratchetTarget(live.row, e.clientX);
    if (+live.el.value < target) ratchetCommit(live.row, 1);
    else if (+live.el.value > target) ratchetCommit(live.row, -1);
  });
  const release = () => {
    if (!drag) return;
    const live = liveRow(drag.name);
    drag = null;
    if (live) live.el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
}

/* ---------------- small helpers ---------------- */
const q = (s, r) => (r || document).querySelector(s);
const qa = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
function prod() { return S.product || PRODUCTS[0]; }
/* Product-aware wording: the story must talk about the business the student actually chose. */
function seller() { return prod().seller || 'firm'; }
function sellers() { return prod().sellers || 'firms'; }
function Seller() { return prod().Seller || 'Firm'; }
/* The capital good is the thing that makes the product, so it has to be named for
   the product: a bakery has ovens, a roastery has roasters, a nursery has
   polytunnels. Calling all of them "machines" made the fiction wobble. */
function cap() { return prod().cap || 'machine'; }
function caps() { return prod().caps || 'machines'; }
function Cap() { return prod().Cap || 'Machine'; }
function Caps() { return prod().Caps || 'Machines'; }
function streetName(i) { const p = prod(); const a = p.street || PRODUCTS[0].street; return a[i % a.length]; }
function chapter() { return CHAPTERS[S.chs[S.chIdx] || 'pc']; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + 255 * amt)));
  g = Math.max(0, Math.min(255, Math.round(g + 255 * amt)));
  b = Math.max(0, Math.min(255, Math.round(b + 255 * amt)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function onColour(hex) { return lum(hex) > 0.62 ? '#122036' : '#FFFFFF'; }
function toast(msg) {
  const t = q('#toast'); t.innerHTML = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function openSheet(html) { q('#sheet').innerHTML = html; q('#modal').classList.add('show'); q('#sheet').scrollTop = 0; }
function closeSheet() { q('#modal').classList.remove('show'); }
function addInsight(n, why) {
  S.insight += n;
  if (why) toast('+' + n + ' Insight \u00b7 ' + why);
  paintTop();
}
function addValue(n) { S.value += n; S.cash += n; paintTop(); }
function logRun(ch, label, profit) { S.log.push({ ch, label, profit }); }

/* Penalties are money that leaves the firm without any period of trading behind
   it. They hit value like anything else, but they are deliberately kept OUT of
   the ledger: a row in S.log means "you played a season and this is how it
   went", and a fine is neither a season nor a choice. Reporting them from their
   own counter keeps the ledger honest and lets the debrief show the cost on a
   separate line. */
function noteFine(n) { S.fines = (S.fines || 0) + Math.abs(+n || 0); }
function finesTotal() { return S.fines || 0; }

/* ---------------- top bar ----------------
   ROUND 8 — SIMPLIFY AND ORNAMENT.
   The user asked for "功能上的简化和装饰的增加" and for the Teacher button to
   appear on the game's home page only. Three things left the bar:

     · Cash / Firm value / Insight  →  they moved to the bottom HUD
       (css/48-hud-bar.css, js/12-hud.js), where they sit in the thumb zone
       next to the buttons that actually change them. The bar above is now a
       running head — identity and progress — and nothing else.
     · The A / A / A+ text-size group  →  it is a once-a-lesson setting, not a
       per-beat control, and it was three more boxes competing with the
       counters for attention. It now lives in the bottom HUD behind a small
       cog. The setting itself is unchanged (html[data-fs]).
     · The Teacher button  →  S.scene === 'title' only. On the home page the
       student is choosing and the teacher is setting up, which is exactly
       when the guide is wanted; during play it is a door out of the game in
       the middle of a decision.

   What is left carries more decoration than before: a printed double rule
   under the head, a fleuron centred on it, small upright-leaf finials either
   side of the brand, and a ruled chapter ladder instead of dot chips. */
function topbarHTML() {
  const p = prod();
  const onTitle = S.scene === 'title';
  /* THE LADDER — one rung per chapter, plus the pre-market stage in front of
     them. `at` is the cursor: while the firm is being set up it sits on rung
     0 (Your Firm) and every market rung is still to come; the moment the
     first chapter opens it advances to rung 1. Both the "done" wash and the
     progress rule read from that single number, so they cannot disagree. */
  const pre = inPre();
  const rungs = [PRE].concat(S.chs.map(id => CHAPTERS[id]));
  const at = pre ? 0 : S.chIdx + 1;
  const stepDots = rungs.map((c, i) => {
    const st = i < at ? 'done' : (i === at ? 'on' : '');
    /* the pre rung carries no chapter number — it is a stage, not a market —
       so it is drawn with its own mark instead of a digit.
       That mark is the HOUSE, the same glyph the firm chip at the left end of
       the bar already wears, so the two read as the same thing seen twice:
       the bar opens with your shop and the ladder opens with your shop. It was
       a gear (`\u2699`) for one round, which was simply wrong — a gear means
       "settings" in every interface a student has ever used, and against the
       words "Your Firm" it read as a mis-rendered chapter number rather than
       as a stage marker. */
    const num = c.n ? c.n : uicon('store');
    /* The label lives in its own <span> so it can be ellipsised. The rung is
       an inline-flex box, and `text-overflow` only applies to a BLOCK
       container's inline content — on the flex box itself the text is simply
       clipped mid-word ("PERFECT COMPETI"), which reads as a bug rather than
       as truncation. The span gives the ellipsis something to act on.
       The pre rung keeps a label of its own. It was wordless for one round on
       the theory that the running head two inches to the left already said
       "Your Firm" — but the ladder is pushed hard right by `margin-left:auto`
       and the two sit 92px apart at 1280px (204.6 -> 296.8), so the mark
       arrived with nothing to anchor it and read as a stray colour chip.
       Probed before changing: _tools/probe_topbar.py prints every rung's box,
       and the pre rung measured 35px wide against 152-239px for the others. */
    const label = `<span class="sd-t">${c.n ? c.title : 'Your Firm'}</span>`;
    return `<span class="stepdot ${st}${c.n ? '' : ' pre'}" title="${esc(c.tag)}"><i class="sd-n">${num}</i>${label}</span>`;
  }).join('');
  const prog = S.chs.length
    ? `<div class="tb-progress"><i style="width:${Math.round(Math.min(1, at / rungs.length) * 100)}%"></i></div>` : '';
  return `<div class="tb-rule" aria-hidden="true"><span class="tb-fl"></span></div>
    <div class="tb-firm">
      <span class="chip" style="background:linear-gradient(150deg,${S.colour},${shade(S.colour,-0.2)});color:${onColour(S.colour)}">${S.product ? picon(p.id, true) : uicon('store')}</span>
      <span class="tb-name">${esc(S.firmName || 'Your Firm')}</span>
    </div>
    <div class="tb-steps">${stepDots}</div>
    <div class="tb-tools">
      ${onTitle && S.showGuide ? `<button class="iconbtn" data-a="guide">${uicon('book')} Teacher</button>` : ''}
      ${!onTitle ? `<button class="iconbtn" data-a="restart" title="Start again">${uicon('restart')}</button>` : ''}
    </div>${prog}`;
}
function paintTop() {
  q('#topbar').innerHTML = topbarHTML();
  /* the top bar only has its real height once it has its content, and the sticky
     decision bar is positioned below it — so measure after filling it, not before */
  measureTopbar();
}


/* ---------------- router ---------------- */
/* ---------------- router ---------------- */
function paintRanges(root) {
  qa('input[type=range]', root || document).forEach(el => {
    const mn = +el.min || 0, mx = (+el.max || 100), v = +el.value;
    el.style.setProperty('--pct', Math.max(0, Math.min(100, (v - mn) / (mx - mn) * 100)) + '%');
  });
}

/* Sticky bars have to know how tall the top bar is, and the top bar grows when
   the student turns the text size up. Measuring beats guessing. */
function measureTopbar() {
  const tb = q('.topbar');
  if (!tb) return;
  const h = tb.getBoundingClientRect().height;
  if (h > 0) document.documentElement.style.setProperty('--topbar-h', h.toFixed(1) + 'px');
}
function go(id) {
  S.scene = id;
  const sc = SCENES[id];
  if (!sc) { console.warn('no scene', id); return; }
  paintTop();
  q('#app').innerHTML = sc.html();
  if (sc.mount) sc.mount();
  paintRanges();
  taskSync();
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
}
function repaint() {
  const sc = SCENES[S.scene];
  q('#app').innerHTML = sc.html();
  if (sc.mount) sc.mount();
  paintRanges();
  taskSync();
  /* the commit button may have moved below the fold; re-evaluate the dock
     AFTER the new scene is in the DOM, never before */
  if (window.MF_DOCK) MF_DOCK.sync();
}
function bindGlobals() {
  measureTopbar();
  bindRatchet();
  window.addEventListener('resize', measureTopbar);
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const fn = ACTS[t.dataset.a];
    if (fn) { e.preventDefault(); fn(t, e); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && q('#taskoverlay') && q('#taskoverlay').classList.contains('show')) ACTS['task-close']();
  });
  /* A crew size counts as "tested" when the student lets go of the slider, not
     while they are dragging through it — otherwise one sweep would fill the
     whole notebook and there would be nothing left to discover. */
  document.addEventListener('change', e => {
    const t = e.target.closest && e.target.closest('[data-i]');
    if (!t || t.dataset.i !== 'lab-l' || S.scene !== 'lab') return;
    discover(S.lab.K, S.lab.L);
    softLabUpdate();
  });
  document.addEventListener('input', e => {
    const t = e.target.closest('[data-i]');
    if (t && t.type === 'range') paintRanges(t.parentElement || document);
    if (!t) return;
    const fn = ACTS[t.dataset.i];
    if (fn) fn(t, e);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
}


/* ============================================================
   SCENE: title
   ============================================================ */
SCENES.title = {
  html() {
    const modeCards = Object.values(MODES).map(m => `
      <button class="opt ${S.mode === m.id ? 'sel' : ''}" data-a="mode" data-v="${m.id}">
        ${m.label}<small>${m.mins} &middot; ${m.chs.length} market${m.chs.length > 1 ? 's' : ''}</small>
      </button>`).join('');
    const journey = Object.values(CHAPTERS).map(c => {
      const on = MODES[S.mode].chs.indexOf(c.id) >= 0;
      return `<div class="jrow ${on ? '' : 'off'}">
        <span class="jdisc">${chicon(c.id)}</span>
        <span><span class="jt">${c.n}. ${c.title}</span><span class="js" style="display:block">${c.tag}</span></span>
      </div>`;
    }).join('');
    return `
    <div class="card pop" style="padding:1.8rem 1.7rem">
      <div class="herorule"><span class="kicker">Economics Role Play &middot; Market Structure</span></div>
      <h1 class="wordmark">MARKET FORCES</h1>
      <div class="lead" style="font-size:1.12rem;max-width:54rem">
        You are about to become the owner of a small manufacturing firm.
        You will hire workers, buy raw materials, set a price &mdash; and live with the consequences.
      </div>
      <div class="grid2" style="margin-top:1.1rem">
        <div>
          <h3>What you will do</h3>
          <div class="featlist">
            <div class="feat"><span class="fnum">1</span><span class="ftxt"><b>Build your firm</b> &mdash; choose the product, the brand and the colour.</span></div>
            <div class="feat"><span class="fnum">2</span><span class="ftxt"><b>Run the factory</b> &mdash; discover your production function and cost curves.</span></div>
            <div class="feat"><span class="fnum">3</span><span class="ftxt"><b>Trade in four markets</b> &mdash; from a price taker in perfect competition to a price-making monopolist.</span></div>
            <div class="feat"><span class="fnum">4</span><span class="ftxt"><b>Face the events</b> &mdash; new entrants, imitators, a rival's price cut, a regulator at your door.</span></div>
          </div>
          <h3>How you are judged</h3>
          <div class="tiles" style="grid-template-columns:1fr 1fr">
            <div class="tile hi"><div class="tl">Firm value</div><div class="ts" style="margin-top:.2rem">your accumulated economic profit, in dollars</div></div>
            <div class="tile"><div class="tl">Insight</div><div class="ts" style="margin-top:.2rem">points for spotting the economics behind what happened</div></div>
          </div>
          <h3>Choose a length</h3>
          <div class="optgrid3">${modeCards}</div>
          <div class="small muted" style="margin-top:.3rem">${MODES[S.mode].note}</div>
        </div>
        <div>
          <div class="jpanel">
            <div class="tagline">Your journey</div>
            <div style="height:.55rem"></div>
            ${journey}
          </div>
          <div class="btnrow right"><button class="btn primary big" data-a="start">Start your firm &rarr;</button></div>
          <div class="small muted" style="text-align:right;margin-top:.3rem">Single player. Progress is not saved after you close the tab.</div>
        </div>
      </div>
    </div>`;
  }
};
ACTS.mode = t =>
 { S.mode = t.dataset.v; repaint(); };
ACTS.start = () => { S.chs = MODES[S.mode].chs.slice(); go('setup'); };
ACTS.fs = t => {
  S.fs = t.dataset.v;
  document.documentElement.dataset.fs = S.fs;
  measureTopbar();
};
ACTS.restart = () => {
  if (!confirm('Start again from the beginning? Your current progress will be lost.')) return;
  location.reload();
};
ACTS.guide = () => openSheet(TEACHER_GUIDE());

/* ============================================================
   SCENE: setup — choose product, colour, name
   ============================================================ */
SCENES.setup = {
  html() {
    const p = PRODUCTS.find(x => x.id === (S.product && S.product.id));
    const prods = PRODUCTS.map(x => `
      <button class="prod ${p && p.id === x.id ? 'sel' : ''}" data-a="pick-prod" data-v="${x.id}">
        <span class="em">${picon(x.id)}</span>
        <span class="nm">${x.name}</span>
        <span class="un">per ${x.unit}</span>
      </button>`).join('');
    const sws = COLOURS.map(c => `<button class="sw ${S.colour === c ? 'sel' : ''}" data-a="pick-col" data-v="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
    const active = p || PRODUCTS[0];
    const name = S.firmName;
    return `
    <div class="steps"><span class="stepdot on">Step 1 &middot; Your firm</span><span class="stepdot">Step 2 &middot; The factory</span><span class="stepdot">Step 3 &middot; Your first market</span></div>
    <div class="card fade">
      <div class="kicker">Firm set-up</div>
      <h2>Found your firm</h2>
      <div class="body">Every business starts with a decision about <b>what to make</b>. Pick a product, give your firm a look and a name.</div>
      <div class="grid2" style="margin-top:.8rem">
        <div>
          <h3>1 &middot; What will you make?</h3>
          <div class="prodgrid">${prods}</div>
          <h3>2 &middot; Your brand colour</h3>
          <div class="swatches">${sws}</div>
          <div class="small muted">In perfect competition your rivals will copy this exactly &mdash; watch for it.</div>
          <h3>3 &middot; Your firm's name</h3>
          <input type="text" id="firmName" data-i="name" maxlength="26" placeholder="Type a name, or use a suggestion" value="${esc(name)}">
          <div class="btnrow">
            <button class="btn" data-a="suggest">${uicon('dice')} Suggest a name</button>
            ${active.ideas.map(n => `<button class="btn" data-a="usename" data-v="${esc(n)}" style="font-weight:600">${esc(n)}</button>`).join('')}
          </div>
        </div>
        <div>
          <div class="small muted" style="font-weight:800;text-transform:uppercase;letter-spacing:.06em">Live preview</div>
          <div class="preview" id="pv" style="margin-top:.4rem;background:linear-gradient(140deg,${S.colour},${shade(S.colour, -0.22)})">
            <div class="pv-in">
              <div class="tagline">Est. this term</div>
              <div class="pv-em">${picon(active.id)}</div>
              <div class="pv-nm">${esc(S.firmName || 'Your Firm')}</div>
              <div class="small" style="opacity:.95">${active.name} &middot; ${active.unitPl} per period</div>
            </div>
          </div>
          <ul class="clean small" style="margin-top:.7rem">
            <li>Fixed factors: <b>land</b> (the workshop you rent) and <b>capital</b> (${caps()}).</li>
            <li>Variable factors: <b>labour</b> (workers) and <b>raw materials</b> (per unit made).</li>
            <li>Your starting cash: <b>${money(S.startCash)}</b>.</li>
          </ul>
          <div class="btnrow right">
            <button class="btn primary big" data-a="to-tour" ${S.product ? '' : 'disabled'}>Sign the lease \u2192</button>
          </div>
          ${S.product ? '' : '<div class="small muted" style="text-align:right">Pick a product to continue.</div>'}
        </div>
      </div>
    </div>`;
  },
  mount() {
    const inp = q('#firmName');
    if (inp) inp.addEventListener('input', () => { S.firmName = inp.value; paintTop(); updatePV(); });
  }
};
function updatePV() {
  const pv = q('#pv'); if (!pv) return;
  const active = S.product || PRODUCTS[0];
  pv.style.background = `linear-gradient(140deg,${S.colour},${shade(S.colour, -0.22)})`;
  pv.innerHTML = `<div class="pv-in">
    <div class="tagline" style="color:${onColour(S.colour)}">Est. this term</div>
    <div class="pv-em">${picon(active.id)}</div>
    <div class="pv-nm" style="color:${onColour(S.colour)}">${esc(S.firmName || 'Your Firm')}</div>
    <div class="small" style="opacity:.95;color:${onColour(S.colour)}">${active.name} &middot; ${active.unitPl} per period</div>
  </div>`;
}
ACTS['pick-prod'] = t => {
  S.product = PRODUCTS.find(x => x.id === t.dataset.v);
  if (!S.firmName) S.firmName = S.product.ideas[0];
  repaint();
};
ACTS['pick-col'] = t => { S.colour = t.dataset.v; repaint(); };
ACTS['suggest'] = () => {
  const a = (S.product || PRODUCTS[0]).ideas;
  S.firmName = a[Math.floor(Math.random() * a.length)];
  repaint();
};
ACTS['usename'] = t => { S.firmName = t.dataset.v; repaint(); };
ACTS['to-tour'] = () => {
  if (!S.firmName.trim()) S.firmName = (S.product || PRODUCTS[0]).ideas[0];
  go('tour');
};

/* ============================================================
   SCENE: factory tour — fixed vs variable factors
   ============================================================ */
SCENES.tour = {
  html() {
    const p = prod();
    return `
    <div class="steps"><span class="stepdot done">Step 1 &middot; Your firm</span><span class="stepdot on">Step 2 &middot; The factory</span><span class="stepdot">Step 3 &middot; Your first market</span></div>
    <div class="card fade">
      <div class="kicker">${esc(S.firmName)} &middot; ${p.name}</div>
      <h2>Welcome to your workshop</h2>
      <div class="body">This is the whole business. Everything you spend money on falls into one of two boxes &mdash; and that difference is the key to the next hour.</div>
      <div class="chartcard" style="margin-top:.7rem">${artFactory(1, 4, p, S.colour)}</div>
      <div class="grid2">
        <div>
          <h3 style="color:var(--brand-d)">Fixed factors &mdash; you pay for them whatever you produce</h3>
          <ul class="clean">
            <li><b>Land</b> &mdash; the workshop you rent. <b>${money(ECON.LAND)}</b> per period, signed for the whole season.</li>
            <li><b>Capital</b> &mdash; each ${cap()} costs <b>${money(ECON.MACHINE)}</b> per period to lease.</li>
          </ul>
          <div class="small muted">Together these are your <b>total fixed cost (TFC)</b>. If you produce nothing, you still pay them.</div>
          <h3 style="color:var(--brand-d)">Variable factors &mdash; they rise and fall with output</h3>
          <ul class="clean">
            <li><b>Labour</b> &mdash; every worker costs <b>${money(ECON.WAGE)}</b> per period.</li>
            <li><b>Raw materials</b> &mdash; <b>${money(ECON.MAT)}</b> for every ${p.unit} you make.</li>
          </ul>
          <div class="small muted">Together these are your <b>total variable cost (TVC)</b>.</div>
        </div>
        <div>
          <div class="card tight" data-note="flat">
            <div class="small" style="font-weight:800">In the short run</div>
            <div class="small muted">You cannot change the workshop or the ${caps()} &mdash; those are your <b>fixed</b> factors. The only thing you can really change, day to day, is <b>how many workers you hire</b>. That single choice decides your output, your costs &mdash; and your profit.</div>
          </div>
          <div class="card tight" data-note="amber">
            <div class="small" style="font-weight:800">Your task before you meet the market</div>
            <div class="small">Head into the factory and find out three things:</div>
            <ol class="clean small" style="margin-left:1rem">
              <li>How output responds to hiring more workers.</li>
              <li>What your average and marginal costs look like.</li>
              <li>Which output level maximises your profit.</li>
            </ol>
            <div class="small muted">You earn <b>Insight points</b> for each one you crack.</div>
          </div>
          <div class="btnrow right"><button class="btn primary big" data-a="to-lab">Open the factory \u2192</button></div>
        </div>
      </div>
    </div>`;
  }
};
ACTS['to-lab'] = () => go('lab');
