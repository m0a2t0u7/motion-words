// huge：湖のそばの巨大な家。まめが家の前に歩いてきて、見上げて驚く（例文 They live in a huge house near the lake.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, parkBg } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '歩いてくる'], [1.6, '家の前'], [2.8, '見上げる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 250);
  el('ellipse', { cx: 70, cy: FY + 20, rx: 90, ry: 20, fill: pal.water });
  el('path', { d: 'M 20 ' + (FY + 20) + ' q 10 -4 20 0 M 70 ' + (FY + 26) + ' q 10 -4 20 0', stroke: '#fff', 'stroke-width': 2, fill: 'none' });
  // 巨大な家
  const h = g({}); k.shadow(270, FY, 100, 8, h);
  el('rect', { x: 190, y: 90, width: 170, height: FY - 90, fill: '#F7E3C3' }, h);
  el('path', { d: 'M 175 96 L 275 20 L 375 96 Z', fill: pal.coral }, h);
  [[210, 112], [310, 112], [210, 172], [310, 172]].forEach(([x, y]) => el('rect', { x, y, width: 36, height: 38, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 }, h));
  el('rect', { x: 258, y: FY - 74, width: 40, height: 74, rx: 4, fill: pal.woodDark }, h);
  el('circle', { cx: 290, cy: FY - 36, r: 3, fill: pal.yellow }, h);
  const b = k.buddy({ x: 30, y: FY + 4, scale: 0.6 });
  const xf = (t) => lerp(30, 150, easeInOut(seg(t, 0.2, 1.9)));
  const up = k.text(150, 70, '!', { 'font-size': 30, 'font-weight': 800, fill: pal.red, 'text-anchor': 'middle' });
  return {
    update(t) {
      const w = walkTo(xf, t, 30), a = easeInOut(seg(t, 2.0, 2.7));
      P(b, { ...w, armL: lerp(w.armL, 100, a), armR: lerp(w.armR, 100, a), lean: lerp(w.lean, -8, a), look: 0.6, mood: a > 0.3 ? 'open' : 'smile', blink: blinkAt(t) });
      up.setAttribute('opacity', a);
    }
  };
}
