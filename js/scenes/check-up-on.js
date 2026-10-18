// check up on：まめが電話をかけて、ベッドで寝ている病気の友だちの様子を確かめ、ほっとする（例文 I called to check up on my sick friend.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, bubble, heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '電話をかける'], [1.6, '具合をたずねる'], [3.4, 'ほっとする']] };

const phone = (k, c) => { const p = k.g({}); k.el('rect', { x: -5, y: -10, width: 10, height: 20, rx: 2.5, fill: c }, p); k.el('rect', { x: -3.5, y: -7, width: 7, height: 12, rx: 1, fill: '#CFE9F7' }, p); return p; };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 左右の部屋に分ける
  el('rect', { x: 200, y: 0, width: 200, height: FY, fill: '#EEF0F6' });
  el('rect', { x: 197, y: 0, width: 6, height: 300, fill: '#fff' });
  // 右：ベッド
  el('rect', { x: 236, y: 186, width: 150, height: 30, rx: 6, fill: pal.wood });
  el('rect', { x: 236, y: 160, width: 14, height: 76, rx: 4, fill: pal.woodDark });
  el('rect', { x: 372, y: 176, width: 14, height: 60, rx: 4, fill: pal.woodDark });
  el('ellipse', { cx: 262, cy: 176, rx: 22, ry: 10, fill: '#fff' });
  const S = 0.62;
  const fr = k.buddy({ x: 0, y: 0, scale: S, color: pal.coral, dark: pal.coralDark });
  const ice = el('rect', { x: -10, y: -6, width: 20, height: 9, rx: 3, fill: pal.water });
  el('path', { d: 'M 252 178 Q 320 160 376 182 L 376 196 L 252 196 Z', fill: pal.blue });
  el('path', { d: 'M 252 178 Q 270 172 290 176', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 });
  const pB = phone(k, pal.ink);
  // 左：まめ
  const b = k.buddy({ x: 110, y: FY, scale: 0.85 });
  const pA = phone(k, pal.ink);
  const waves = [0, 1, 2].map((i) => el('path', { d: `M 0 ${-6 - i * 5} q ${5 + i * 4} ${6 + i * 5} 0 ${12 + i * 10}`, stroke: pal.blue, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const q = bubble(k, 40, 32); el('path', { d: 'M -8 4 L -2 -6 L 4 4 Z M -2 -1 L -2 1', stroke: pal.coralDark, 'stroke-width': 0, fill: 'none' }, q); k.text(0, 1, '?', { 'font-size': 20, fill: pal.blueDark }, q);
  const hz = g({}); heart(k, hz);
  return {
    update(t) {
      const call = easeInOut(seg(t, 0.2, 0.7));
      P(b, { x: 110, armR: lerp(8, 150, call), armL: 8, look: 0.6, lean: 3, mood: t > 3.3 ? 'grin' : t > 1.4 ? 'flat' : 'smile', squash: 1 - 0.04 * hump(seg(t, 3.2, 3.7)), blink: blinkAt(t) });
      const h = hp(b, 0.85, 'R'); tf(pA, h.x - 2, h.y + 4, 15);
      // 呼び出し → 友だちが体を起こして電話に出る
      const ring = t > 0.8 && t < 1.6;
      waves.forEach((w, i) => { tf(w, 214 + i * 2, 120, 0, 1); w.setAttribute('opacity', ring ? (Math.floor(t * 6) % 3 >= i ? 1 : 0.15) : 0); });
      const up = easeInOut(seg(t, 1.3, 1.8));
      const nod = hump(seg(t, 2.8, 3.2));
      P(fr, { x: lerp(326, 316, up), y: 192, armR: lerp(30, 150, seg(t, 1.6, 1.9)), armL: 8, lean: lerp(-80, -10, up) + 8 * nod, look: 0.4, mood: t > 2.8 ? 'smile' : 'flat', blink: t < 1.3 ? 1 : blinkAt(t, 1) });
      const hf = hp(fr, S, 'R'); tf(pB, hf.x, hf.y + 2, -15); pB.setAttribute('opacity', t > 1.6 ? 1 : 0);
      tf(ice, 274, 160); ice.setAttribute('opacity', 1 - up);
      const qq = seg(t, 1.9, 2.2) * (1 - seg(t, 3.0, 3.2));
      tf(q, 150, 106, 0, qq); q.setAttribute('opacity', qq > 0 ? 1 : 0);
      const hq = seg(t, 3.3, 3.8);
      tf(hz, 150, 100 - 12 * easeOut(hq), 0, 1.4 * hq); hz.setAttribute('opacity', hq > 0 ? 1 : 0);
    }
  };
}
