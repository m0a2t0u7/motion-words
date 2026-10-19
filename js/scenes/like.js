// like：真っ赤な辛いスープ（唐辛子入り）をスプーンで食べる。顔が赤くなり汗が出ても、にっこりしてハートが出る（例文 I like spicy food.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg, heart } from './weigh.js';
import { desk } from './get-on-with.js';
import { drop } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '辛い料理'], [1.2, '食べる'], [2.8, '辛いのが好き']] };

const chili = (k, parent) => { const g = k.g({}, parent); k.el('path', { d: 'M -10 -2 Q 0 -6 10 -2 Q 14 2 8 4 Q 0 6 -10 2 Z', fill: k.pal.red }, g); k.el('path', { d: 'M 10 -2 Q 14 -6 16 -4', stroke: k.pal.green, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, g); return g; };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 236);
  const S = 1.15;
  const me = k.buddy({ x: 160, y: FY, scale: S });
  const blush = g({ opacity: 0 }, me.body.children[3]); [-17, 17].forEach((x) => el('ellipse', { cx: x, cy: -45, rx: 7, ry: 5, fill: pal.red }, blush));
  const top = desk(k, 100, 260, FY);
  // スープ（台の上に固定）
  const bw = g({}); tf(bw, 232, top);
  el('path', { d: 'M -28 -16 L 28 -16 Q 26 2 0 2 Q -26 2 -28 -16 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bw);
  el('ellipse', { cx: 0, cy: -16, rx: 28, ry: 5, fill: '#E2452F' }, bw);
  [-12, 4, 14].forEach((x, i) => el('circle', { cx: x, cy: -16 + (i % 2), r: 2.4, fill: '#FFB199' }, bw));
  const c1 = chili(k); tf(c1, 296, top - 3, -8);
  const c2 = chili(k); tf(c2, 312, top - 7, 14, 0.8);
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -5 -6 0 -12 q 5 -6 0 -12', stroke: '#E8EEF4', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  // スプーン
  const sp = g({});
  el('rect', { x: -1.5, y: -14, width: 3, height: 18, rx: 1.5, fill: '#B9C3D0' }, sp);
  el('ellipse', { cx: 0, cy: 8, rx: 4.5, ry: 6, fill: '#B9C3D0' }, sp);
  const soup = el('ellipse', { cx: 0, cy: 9, rx: 3.2, ry: 3.5, fill: '#E2452F' }, sp);
  const sw = [0, 1].map(() => drop(k, k.root));
  const hrt = heart(k, k.root, pal.red);
  return {
    update(t) {
      // 2回すくって食べる（周期1.2秒）
      const cyc = (u) => { const q = clamp(u); return q < 0.4 ? -easeInOut(q / 0.4) : q < 0.7 ? -1 + 2 * easeInOut((q - 0.4) / 0.3) : 1 - easeInOut((q - 0.7) / 0.3); };
      let a = 0; if (t > 0.4 && t < 2.8) a = cyc(((t - 0.4) % 1.2) / 1.2); // -1=ボウル, 1=口
      const bowlP = { x: 228, y: top - 18 }, mouth = { x: 168, y: FY - 62 };
      const u = (a + 1) / 2;
      const tg = t > 0.4 && t < 2.8 ? { x: lerp(bowlP.x, mouth.x, u), y: lerp(bowlP.y, mouth.y, u) } : { x: 210, y: top - 12 };
      const hot = easeOut(seg(t, 1.0, 2.4));
      const chew = a > 0.7 ? 1 : 0;
      P(me, { lean: 10 - 6 * u, look: 0.6, mood: t > 2.8 ? 'grin' : chew ? 'open' : 'smile', blink: t > 2.8 ? 0 : blinkAt(t, 0.5), squash: 1 + 0.03 * hump(seg(t, 2.8, 3.2)), lift: 6 * hump(seg(t, 2.85, 3.3)), armL: 10 + 120 * easeOut(seg(t, 2.9, 3.3)) });
      me.pose({ armR: reach(me, S, 'R', tg.x, tg.y) });
      const h = hp(me, S, 'R', 30); tf(sp, h.x + 3, h.y - 6, 30 - 30 * u);
      soup.setAttribute('opacity', a > -0.95 && a < 0.95 && u > 0.05 ? 1 : 0);
      blush.setAttribute('opacity', 0.55 * hot);
      steam.forEach((s, i) => { const q = (t * 0.8 + i / 3) % 1; tf(s, 218 + i * 14, top - 22 - 16 * q); s.setAttribute('opacity', 0.9 * hump(q)); });
      sw.forEach((d, i) => { const q = (t * 1.3 + i * 0.5) % 1; tf(d, 130 + i * 62, FY - 112 + 14 * q); d.setAttribute('opacity', hot * (1 - q)); });
      const hq = seg(t, 2.9, 3.3);
      tf(hrt, 160, 108 - 6 * Math.sin(t * 4) * (hq > 0), 0, Math.max(0.001, easeOut(hq) * 2.2 + 0.1 * Math.sin(t * 8) * hq));
    }
  };
}
