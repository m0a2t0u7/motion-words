// get by：手元の少ないお金を、家賃・食費・電気のびんに1枚ずつ入れると、ちょうど足りてほっとする（例文 They get by on a small income.）
import { seg, lerp, easeIn, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { person, path, walk } from './queue-up.js';

export const meta = { duration: 4.6, beats: [[0, '少ない収入'], [1.8, '1枚ずつ分ける'], [4.0, 'なんとか足りた']] };

function coin(k, parent) { const c = k.g({}, parent); k.el('circle', { r: 7, fill: k.pal.yellow, stroke: k.pal.yellowDark, 'stroke-width': 2 }, c); k.el('circle', { r: 3, fill: 'none', stroke: k.pal.yellowDark, 'stroke-width': 1.2 }, c); return c; }

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 196, width: 240, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 160, y: 204, width: 7, height: 32, fill: pal.woodDark }); el('rect', { x: 372, y: 204, width: 7, height: 32, fill: pal.woodDark });
  k.shadow(270, 237, 120, 4);
  const JX = [206, 266, 326];
  const icons = [
    (gg) => { el('path', { d: 'M -10 2 L 0 -8 L 10 2 L 10 12 L -10 12 Z', fill: pal.coral }, gg); },
    (gg) => { el('path', { d: 'M -11 10 Q -12 -6 0 -6 Q 12 -6 11 10 Z', fill: '#E2B680' }, gg); },
    (gg) => { el('circle', { cy: -1, r: 8, fill: pal.yellow }, gg); el('rect', { x: -4, y: 6, width: 8, height: 6, fill: '#9AA4B5' }, gg); }
  ];
  JX.forEach((x, i) => {
    el('rect', { x: x - 18, y: 168, width: 36, height: 28, rx: 6, fill: '#E4F3FB', stroke: '#B9D7EA', 'stroke-width': 2 });
    el('rect', { x: x - 14, y: 162, width: 28, height: 8, rx: 2, fill: '#B9D7EA' });
    const ic = g({}); tf(ic, x, 120); el('rect', { x: -16, y: -14, width: 32, height: 30, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, ic); icons[i](ic);
  });
  const S = 1;
  const partner = person(k, 'coral', { x: 50, y: FY + 6, scale: 0.9 });
  const me = k.buddy({ x: 110, y: FY + 6, scale: S });
  const coins = [0, 1, 2].map(() => coin(k));
  const sweat = el('path', { d: 'M 0 -6 Q 5 2 0 5 Q -5 2 0 -6 Z', fill: pal.water });
  const at = [1.0, 2.1, 3.2];
  // 各びんの左 46px に立つ
  const xf = path([[0.2, 110], [0.9, 166], [1.6, 166], [2.0, 226], [2.7, 226], [3.1, 286]]);
  return {
    update(t) {
      const p = walk(me, xf, t, { y: FY + 6, look: 0.5, mood: t > 3.9 ? 'smile' : 'flat' });
      let drop = 0;
      at.forEach((a) => { drop = Math.max(drop, hump(seg(t, a - 0.1, a + 0.5))); });
      const ready = t > 0.2 && t < 3.8 ? 1 : seg(t, 0, 0.2);
      me.pose({ armR: lerp(p.armR, lerp(80, 150, drop), ready) });
      const h = hp(me, S, 'R');
      coins.forEach((c, i) => {
        const a = at[i];
        let x = h.x + 2, y = h.y - 2 - (2 - i) * 4; // 手に重ねて持つ
        if (t > a + 0.25) {
          const f = easeIn(seg(t, a + 0.25, a + 0.55));
          const s2 = seg(t, a + 0.25, a + 0.45);
          x = lerp(h.x, JX[i], s2); y = lerp(h.y, 190, f) - 16 * hump(s2) * (1 - f) - 3 * wobble(seg(t, a + 0.55, a + 0.9), 2, 6);
        }
        tf(c, x, y);
      });
      const relief = seg(t, 3.9, 4.4);
      me.pose({ squash: 1 - 0.05 * hump(relief), blink: relief > 0.2 && relief < 0.6 ? 1 : 0 });
      sweat.setAttribute('opacity', t > 3.5 ? 1 - relief : 0); tf(sweat, me.state.x - 18, FY - 64 + 8 * relief);
      partner.pose({ look: 0.6, mood: t > 4.0 ? 'smile' : 'flat', armR: 10, blink: Math.abs(t - 2.4) < 0.06 ? 1 : 0 });
    }
  };
}
