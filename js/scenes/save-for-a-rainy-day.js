// save for a rainy day：毎月少しずつ、貯金びんにコインを入れていく。外は晴れでも、雨の日（万一）に備えている（I save a little money every month for a rainy day.）
import { seg, lerp, easeOut, easeIn, easeInOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '1か月目'], [1.5, '毎月入れる'], [3.4, '雨の日に備え']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓（晴れ→やがて雨雲）
  el('rect', { x: 36, y: 34, width: 100, height: 84, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 70, cy: 62, r: 13, fill: pal.yellow });
  const cl = g({}); const cw = el('path', { d: 'M -22 10 a 12 12 0 0 1 6 -22 a 16 16 0 0 1 30 2 a 11 11 0 0 1 4 20 Z', fill: '#9AA8BC' }, cl);
  const drops = [0, 1, 2].map((i) => el('line', { x1: 0, y1: 0, x2: -3, y2: 8, stroke: pal.blueDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  el('line', { x1: 86, y1: 34, x2: 86, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 36, y1: 76, x2: 136, y2: 76, stroke: '#fff', 'stroke-width': 4 });
  // カレンダー
  el('rect', { x: 322, y: 40, width: 56, height: 62, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 322 48 a 7 7 0 0 1 7 -7 h 42 a 7 7 0 0 1 7 7 v 10 h -56 Z', fill: pal.red });
  const num = k.text(350, 82, '1', { 'font-size': 28, fill: pal.ink });
  // 机と貯金びん
  el('rect', { x: 170, y: 206, width: 200, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 178, y: 214, width: 184, height: 22, fill: pal.woodDark });
  const JX = 290;
  const stack = [0, 1, 2].map((i) => el('ellipse', { cx: JX, cy: 196 - i * 6, rx: 17, ry: 4.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.8, opacity: 0 }));
  el('path', { d: `M ${JX - 20} 156 h 40 v 4 q 6 4 6 12 v 28 q 0 6 -6 6 h -40 q -6 0 -6 -6 v -28 q 0 -8 6 -12 Z`, fill: '#CFEFF7', opacity: 0.55, stroke: pal.blueDark, 'stroke-width': 2.4 });
  el('rect', { x: JX - 22, y: 150, width: 44, height: 8, rx: 3, fill: pal.red });
  const coin = el('ellipse', { rx: 9, ry: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 });
  const me = k.buddy({ x: 214, y: 238 });
  // 使う前は「机の手前」ではなく側面に立つ
  const S = 1.4, NS = 3;
  return {
    update(t) {
      const m = Math.min(2, Math.floor(t / S));
      const p = (t - m * S) / S;
      const done = t >= NS * S;
      // 腕：コインを持ち上げ→びんの口へ
      const hx = lerp(238, JX, easeInOut(seg(p, 0.15, 0.5))), hy = lerp(176, 138, hump(seg(p, 0.15, 0.5)));
      const drop = easeIn(seg(p, 0.5, 0.78));
      const ang = Math.atan2(hx - 241, hy - 182) * 180 / Math.PI;
      const act = !done && p < 0.55;
      me.pose({
        armR: done ? 30 : act ? lerp(60, ang, easeOut(seg(p, 0, 0.2))) : lerp(ang, 40, easeOut(seg(p, 0.55, 0.8))),
        armL: 8, lean: 3, mood: done ? 'grin' : 'smile', look: 0.6, squash: 1 - 0.03 * hump(seg(p, 0.5, 0.8)) * (done ? 0 : 1)
      });
      const cy = p < 0.5 ? hy - 4 : lerp(138, 190 - m * 6, drop), cx = p < 0.5 ? hx : JX;
      k.set(coin, { cx, cy, opacity: !done && p < 0.78 ? 1 : 0 });
      stack.forEach((s, i) => s.setAttribute('opacity', i < m || (i === m && (done || p >= 0.78)) ? 1 : 0));
      // 月カレンダー
      num.textContent = String(done ? 3 : m + 1);
      // 窓：晴れ→雨雲（これから先の備え）
      const rc = easeOut(seg(t, 3.0, 3.9));
      sun.setAttribute('opacity', 1 - rc * 0.7);
      tf(cl, lerp(170, 92, rc), 56, 0, rc > 0 ? 1 : 0, 1);
      drops.forEach((d, i) => { const q = (t * 1.6 + i / 3) % 1; k.set(d, { transform: `translate(${72 + i * 18} ${70 + q * 30})`, opacity: rc > 0.9 ? 1 - q : 0 }); });
    }
  };
}
