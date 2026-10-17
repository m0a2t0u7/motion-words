// serve：レストランで、店の人が新鮮な魚料理をお客のテーブルへ運んで出す（例文 They serve fresh fish at that restaurant.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '料理を運ぶ'], [2.1, '皿を置く'], [3.5, 'お客の前に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の看板（魚のマーク）と窓
  el('rect', { x: 36, y: 36, width: 86, height: 58, rx: 8, fill: '#4F7A68', stroke: pal.woodDark, 'stroke-width': 5 });
  el('path', { d: 'M 56 66 Q 78 48 98 66 Q 78 84 56 66 Z M 98 66 L 108 56 L 108 76 Z', fill: '#fff', opacity: 0.9 });
  el('circle', { cx: 68, cy: 63, r: 2.4, fill: '#4F7A68' });
  el('rect', { x: 150, y: 44, width: 60, height: 52, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  // お客（座っている）
  const cust = k.buddy({ x: 340, y: 246, facing: -1 });
  el('rect', { x: 368, y: 150, width: 10, height: 96, rx: 4, fill: pal.woodDark });
  // テーブル
  el('rect', { x: 262, y: 196, width: 120, height: 7, rx: 3, fill: '#fff' });
  el('path', { d: 'M 268 203 L 376 203 L 376 226 L 268 226 Z', fill: '#FFE3DA' });
  el('rect', { x: 316, y: 226, width: 8, height: 10, fill: pal.woodDark });
  el('rect', { x: 296, y: 235, width: 48, height: 4, rx: 2, fill: pal.woodDark });
  // 料理（皿の上の魚）
  const plate = g({});
  el('ellipse', { cx: 0, cy: 4, rx: 25, ry: 6.5, fill: '#fff', stroke: '#DDE3EA', 'stroke-width': 1.5 }, plate);
  const fish = g({}, plate); tf(fish, 0, -3);
  el('path', { d: 'M 13 0 L 23 -6 L 23 6 Z', fill: '#8FB7D6' }, fish);
  el('ellipse', { cx: 0, cy: 0, rx: 15, ry: 7, fill: '#A9CDE6' }, fish);
  el('path', { d: 'M -12 3 Q 0 8 12 2 Q 0 5 -12 3 Z', fill: '#E4F0F8' }, fish);
  el('circle', { cx: -9, cy: -1.5, r: 1.6, fill: pal.ink }, fish);
  el('ellipse', { cx: 0, cy: 6, rx: 4, ry: 2, fill: pal.green, opacity: 0.0 }, fish);
  const spk = [0, 1].map((i) => el('path', { d: 'M 0 -5 L 1.4 -1.4 L 5 0 L 1.4 1.4 L 0 5 L -1.4 1.4 L -5 0 L -1.4 -1.4 Z', fill: '#fff' }, plate));
  const w = k.buddy({ x: -30, y: 236, color: pal.coral, dark: pal.coralDark, scale: 1 });
  const xf = (t) => lerp(-40, 206, easeInOut(seg(t, 0.1, 2.1)));
  return {
    update(t) {
      const p = gait(xf, t, -40, 14);
      const put = easeInOut(seg(t, 2.1, 2.7)), back = easeInOut(seg(t, 2.9, 3.6));
      const arm = t < 2.9 ? lerp(80, 62, put) : lerp(62, 8, back);
      w.pose({ x: p.x - back * 14, y: 236, walk: p.walk + back * 0, armL: p.m > 0.1 ? p.armL : 8, armR: arm, lean: p.lean + 2 * put * (1 - back), look: 0.5, mood: 'grin', squash: 1 });
      const h = hp(w, 1, 'R', 30);
      const rest = t >= 2.75;
      const px = rest ? 286 : h.x, py = rest ? 193 : h.y - 4;
      const land = rest ? wobble(seg(t, 2.75, 3.4), 2, 5) * 1.2 : 0;
      tf(plate, rest ? 286 : h.x, rest ? 192 + land : lerp(h.y - 4, 192, put * put), 0);
      cust.pose({ look: -0.6, mood: t > 2.8 ? 'grin' : 'smile', lean: t > 2.8 ? 4 : 0, armR: t > 3.1 ? 60 : 8, armL: 8, squash: 1 - 0.0 });
      const sp = smooth(seg(t, 2.8, 3.1)) * (0.6 + 0.4 * Math.sin(t * 8));
      spk.forEach((s, i) => { tf(s, -10 + i * 20, -10 - i * 3, t * 40, 0.8 * sp + 0.1); s.setAttribute('opacity', sp); });
    }
  };
}
