// hollow：大きな木の幹をコンコンとたたくと、ほら穴のように中が空っぽで、音が響く（例文 The tree trunk was hollow inside.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, parkBg } from './run-after.js';
import { waves } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '幹をたたく'], [1.2, '音が響く'], [2.5, '中は空洞']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  k.shadow(280, FY + 2, 60, 6);
  // 木（幹は断面が見える大きなほら穴つき）
  [[250, 70, 48, '#7FD3A0'], [310, 60, 54, '#6BC48F'], [280, 30, 56, '#7FD3A0']].forEach(([x, y, r, c]) => el('circle', { cx: x, cy: y, r, fill: c }));
  el('path', { d: 'M 238 110 L 232 240 L 328 240 L 322 110 Z', fill: pal.wood });
  el('ellipse', { cx: 280, cy: 190, rx: 24, ry: 36, fill: pal.woodDark });
  const inner = el('ellipse', { cx: 280, cy: 194, rx: 18, ry: 30, fill: '#4A3524' });
  const echo = [0, 1, 2].map((i) => el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 30, fill: 'none', stroke: '#E9D3B5', 'stroke-width': 2 }));
  const b = k.buddy({ x: 190, y: FY + 8, scale: 1 });
  const w = waves(k, pal.blue);
  return {
    update(t) {
      const walkP = easeOut(seg(t, 0, 0.6)), kn = (t > 0.6 && t < 1.8) ? Math.abs(Math.sin((t - 0.6) * 5)) : 0, peek = easeInOut(seg(t, 2.2, 2.9));
      P(b, { x: lerp(140, 190, walkP) - 12 * peek, walk: walkP < 1 ? t * 9 : 0, armR: lerp(8, 95, easeOut(seg(t, 0.5, 0.8))) - kn * 14 + peek * 0, armL: 8 + peek * 40, lean: 4 + 14 * peek, look: 0.7, mood: peek > 0.4 ? 'open' : 'smile', blink: blinkAt(t) });
      const on = (t > 0.7 && t < 3.0) ? 1 : 0, ph = (t * 1.1) % 1;
      w(on * (t > 1.0 ? 1 : 0.5), ph, 238, 175, 1, 1.0);
      echo.forEach((e, i) => { const u = (seg(t, 1.0, 3.4) * 1.6 + i / 3) % 1; e.setAttribute('transform', `translate(280 194) scale(${0.4 + u * 0.6})`); e.setAttribute('opacity', t > 1.0 ? (1 - u) * 0.8 : 0); });
    }
  };
}
