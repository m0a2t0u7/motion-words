// deal with：山積みのメールを、まめが1通ずつ取って読み、処理済みの箱へ移していく（例文 I have to deal with a lot of emails.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, win } from './run-after.js';
import { hp, reach } from './weigh.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'メールの山'], [1.2, '1通ずつ対処'], [3.8, 'まだまだ続く']] };

const env = (k, parent) => { const e = k.g({}, parent); k.el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2, fill: '#fff', stroke: k.pal.blueDark, 'stroke-width': 1.5 }, e); k.el('path', { d: 'M -12 -8 L 0 2 L 12 -8', stroke: k.pal.blueDark, 'stroke-width': 1.5, fill: 'none' }, e); return e; };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 20, 40, 84, 64); w.frame();
  // モニター（受信数）
  el('rect', { x: 232, y: 70, width: 110, height: 74, rx: 6, fill: pal.ink }); el('rect', { x: 238, y: 76, width: 98, height: 62, rx: 3, fill: '#EAF4FB' });
  el('rect', { x: 282, y: 144, width: 10, height: 16, fill: '#8F9BB0' });
  const ie = env(k); tf(ie, 266, 106, 0, 1.2);
  const badge = el('circle', { cx: 282, cy: 96, r: 11, fill: pal.red });
  const num = k.text(282, 96.5, '48', { 'font-size': 10, fill: '#fff' });
  const S = 0.9;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const L = frontL(b, S);
  // 机・左のメールの山・右の処理済み箱
  el('rect', { x: 160, y: 160, width: 230, height: 10, rx: 4, fill: pal.wood }); el('rect', { x: 372, y: 170, width: 8, height: 66, fill: pal.woodDark });
  k.shadow(280, 237, 110, 5);
  const pile = g({});
  for (let i = 0; i < 9; i++) tf(env(k, pile), 196 + (i % 2 ? 2 : -2), 152 - i * 5, (i % 3 - 1) * 4);
  el('rect', { x: 330, y: 146, width: 46, height: 14, rx: 3, fill: pal.green });
  const doneStack = [0, 1, 2].map((i) => { const e = env(k); tf(e, 353, 142 - i * 4); e.setAttribute('opacity', 0); return e; });
  el('rect', { x: 330, y: 152, width: 46, height: 8, rx: 2, fill: '#3E9C5E' });
  const cur = env(k);
  const T = [0.6, 1.7, 2.8];
  return {
    update(t) {
      let tx = 200, ty = 108, carry = false, k2 = -1;
      P(b, { x: 150, facing: 1, armR: 40, lean: 4, look: 0.7, mood: 'flat', blink: blinkAt(t) });
      T.forEach((s, i) => {
        const u = t - s; if (u < 0 || u > 1.1) return;
        k2 = i; carry = u > 0.25 && u < 0.95;
        const a = easeInOut(seg(u, 0, 0.25)), m = easeInOut(seg(u, 0.55, 0.95));
        tx = u < 0.25 ? lerp(200, 198, a) : lerp(240, 352, m); ty = u < 0.25 ? lerp(120, 108, a) : lerp(lerp(108, 120, seg(u, 0.25, 0.4)), 138, m);
      });
      const r = reach(b, S, 'R', tx, ty);
      const read = k2 >= 0 ? hump(seg(t - T[k2], 0.3, 0.6)) : 0;
      P(b, { x: 150, facing: 1, armR: lerp(8, r, easeOut(seg(t, 0.2, 0.6))), lean: 4 + 6 * read, look: 0.7, mood: t > 3.9 ? 'sad' : 'flat', squash: 1 - 0.04 * hump(seg(t, 3.9, 4.4)), blink: blinkAt(t) });
      L.set(20 + 30 * read);
      const h = hp(b, S, 'R');
      tf(cur, h.x, h.y - 2, 0); cur.setAttribute('opacity', carry ? 1 : 0);
      const done = T.filter((s) => t > s + 0.95).length;
      doneStack.forEach((e, i) => e.setAttribute('opacity', i < done ? 1 : 0));
      num.textContent = String(48 - done);
      const pop = done > 0 ? hump(seg(t, T[done - 1] + 0.95, T[done - 1] + 1.2)) : 0;
      badge.setAttribute('r', 11 + 3 * pop);
    }
  };
}
