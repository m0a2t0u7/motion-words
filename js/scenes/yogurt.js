// yogurt：ヨーグルトの器に、まめがイチゴ・バナナ・ブルーベリーをのせて、スプーンで食べる（例文 I eat yogurt with fruit.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { bowlG, spoonG } from './flour.js';
import { cloth, mouthOf } from './spinach.js';

export function fruitBit(k, kind, parent) {
  const g = k.g({}, parent), { el } = k;
  if (kind === 'berry') { el('path', { d: 'M 0 6 Q -7 0 -5 -4 Q 0 -7 5 -4 Q 7 0 0 6 Z', fill: '#F2685B' }, g); el('path', { d: 'M -3 -5 L 0 -8 L 3 -5', stroke: '#59A85F', 'stroke-width': 2, fill: 'none' }, g); }
  else if (kind === 'banana') { el('circle', { r: 5.5, fill: '#FFF1B8', stroke: '#F2D06B', 'stroke-width': 1.5 }, g); }
  else { el('circle', { r: 4, fill: '#5C6FD6' }, g); el('circle', { cx: 1, cy: -1, r: 1.2, fill: '#fff', opacity: 0.5 }, g); }
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'ヨーグルト'], [0.6, '果物をのせる'], [2.8, 'いただきます']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 250, y: 44, width: 110, height: 76, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 140, y: FY - 2, scale: S });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#FFFFFF', '#7FCB62');
  const B = bowlG(k, undefined, 64, '#AFD8F5', '#7FB3E8'); tf(B.g, 220, TY);
  el('ellipse', { cx: 0, cy: -27, rx: 30, ry: 6, fill: '#FFFFFF', stroke: '#E9EEF4' }, B.fill);
  // 果物の器（右）
  const fb = bowlG(k, undefined, 44, '#FFE08A', '#E9B43A'); tf(fb.g, 310, TY);
  [['berry', -8, -20], ['banana', 6, -20], ['blue', 0, -26], ['berry', 10, -26]].forEach(([kd, x, y]) => tf(fruitBit(k, kd, fb.fill), x, y));
  const kinds = ['berry', 'banana', 'blue'];
  const fly = kinds.map((kd) => fruitBit(k, kd));
  const dest = [[-10, -30], [8, -31], [0, -33]];
  const sp = spoonG(k);
  return {
    update(t) {
      const per = 0.7, t0 = 0.5;
      P(me, { x: 140, y: FY - 2, look: 0.6, mood: t > 3.1 && t < 3.8 ? (Math.sin(t * 22) > 0 ? 'open' : 'smile') : t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t), lean: 4 });
      let tg = { x: 200, y: TY - 50 };
      fly.forEach((f, i) => {
        const q = clamp((t - t0 - i * per) / per);
        const a = { x: 306, y: TY - 30 }, d = { x: 220 + dest[i][0], y: TY + dest[i][1] };
        const p = q < 0.35 ? a : { x: lerp(a.x, d.x, easeInOut((q - 0.35) / 0.65)), y: lerp(a.y, d.y, easeInOut((q - 0.35) / 0.65)) - 26 * hump((q - 0.35) / 0.65) };
        if (q > 0 && q < 1) tg = q < 0.35 ? { x: lerp(200, a.x, easeInOut(q / 0.35)), y: lerp(TY - 50, a.y, easeInOut(q / 0.35)) } : p;
        tf(f, p.x, p.y); f.setAttribute('opacity', q > 0 ? 1 : 0);
      });
      // スプーンで口へ
      const e = hump(seg(t, 2.6, 3.6));
      const mo = mouthOf(me, S);
      if (t > 2.6) tg = { x: lerp(222, mo.x + 4, e), y: lerp(TY - 30, mo.y + 2, e) };
      me.pose({ armR: reach(me, S, 'R', tg.x, tg.y) });
      const h = hp(me, S, 'R', 28);
      tf(sp.g, h.x, h.y, -30, S); sp.g.setAttribute('opacity', t > 2.4 ? 1 : 0);
      k.set(sp.load, { fill: e > 0.05 && t < 3.15 ? '#fff' : 'none' });
    }
  };
}
