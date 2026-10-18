// little by little：英語の本で毎日勉強する。壁の上達グラフが1段ずつ少しだけ伸び、最後はかなり高くなる（例文 Little by little, my English got better.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { desk } from './get-on-with.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '勉強する'], [1.4, '少し伸びる'], [3.4, '上達した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 上達グラフ（小さな棒が1本ずつ増える）
  el('rect', { x: 196, y: 26, width: 176, height: 116, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('line', { x1: 212, y1: 128, x2: 360, y2: 128, stroke: pal.sub, 'stroke-width': 2 });
  el('line', { x1: 212, y1: 128, x2: 212, y2: 38, stroke: pal.sub, 'stroke-width': 2 });
  k.text(236, 40, 'ABC', { 'font-size': 12, fill: pal.blueDark });
  const N = 8;
  const bars = [...Array(N)].map((_, i) => el('rect', { x: 220 + i * 17, y: 128, width: 12, height: 0, rx: 2, fill: i === N - 1 ? pal.green : pal.blue }));
  const b = k.buddy({ x: 84, y: FY - 4 });
  const top = desk(k, 40, 160, FY);
  // 開いた本
  const book = g({}); tf(book, 146, top - 2);
  el('path', { d: 'M -22 0 L -2 -4 L -2 -18 L -22 -14 Z', fill: '#fff', stroke: pal.blueDark, 'stroke-width': 2 }, book);
  el('path', { d: 'M 22 0 L 2 -4 L 2 -18 L 22 -14 Z', fill: '#fff', stroke: pal.blueDark, 'stroke-width': 2 }, book);
  [-1, 1].forEach((d) => [0, 1].forEach((j) => el('line', { x1: d * 6, y1: -9 - j * 4, x2: d * 18, y2: -7 - j * 4, stroke: pal.sub, 'stroke-width': 1.4 }, book)));
  const pen = el('rect', { x: -1.8, y: 0, width: 3.6, height: 18, rx: 1.5, fill: pal.coralDark });
  return {
    update(t) {
      const S = 0.4, step = 0.45;
      bars.forEach((r, i) => {
        const p = easeOut(seg(t, S + i * step, S + i * step + 0.3));
        const h = (14 + i * 11) * p;
        k.set(r, { y: 128 - h, height: h });
      });
      const n = Math.floor((t - S) / step);
      const q = ((t - S) % step) / step;
      const done = t > S + N * step;
      const wr = !done && t > 0.2 ? Math.sin(t * 24) * 6 : 0;
      const yes = easeOut(seg(t, S + N * step, S + N * step + 0.4));
      P(b, { x: 84, y: FY - 4, look: done ? 0.9 : 0.4, lean: done ? lerp(10, -4, yes) : 10 + 2 * hump(q), armR: done ? lerp(70, 160, yes) : 70 + wr * 0.4, armL: done ? lerp(40, 20, yes) : 40, mood: done ? 'grin' : n >= 4 ? 'smile' : 'flat', blink: blinkAt(t), squash: 1 - 0.04 * hump(seg(t, S + N * step + 0.2, S + N * step + 0.6)) });
      const h = hp(b, 1);
      tf(pen, h.x + wr * 0.3, h.y - 14, -20);
      // 目線：本⇔グラフ
      b.body.children[3].setAttribute('transform', `translate(${(done ? 6 : 3).toFixed(2)} ${(done ? -4 : 4).toFixed(2)})`);
    }
  };
}
