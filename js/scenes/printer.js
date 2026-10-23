// printer：印刷ボタンを押しても紙が出ない。トレイは空で、ランプが赤く点滅（例文 The printer is out of paper.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, 'ボタンを押す'], [1.1, '紙が出ない'], [2.4, '紙切れ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  desk(k, 185, 215, 200);
  const pr = g({});
  // 奥の給紙トレイ（空）
  el('path', { d: 'M 222 150 L 300 150 L 308 124 L 214 124 Z', fill: '#E7ECF3', stroke: '#C5CEDB', 'stroke-width': 2 }, pr);
  el('rect', { x: 205, y: 148, width: 110, height: 52, rx: 8, fill: '#fff', stroke: '#C5CEDB', 'stroke-width': 2 }, pr);
  el('rect', { x: 205, y: 148, width: 110, height: 10, rx: 4, fill: '#E7ECF3' }, pr);
  el('rect', { x: 222, y: 180, width: 76, height: 7, rx: 3, fill: pal.ink, opacity: 0.8 }, pr);
  const btn = g({}); tf(btn, 224, 166);
  pr.appendChild(btn);
  el('rect', { x: -7, y: -3.5, width: 14, height: 7, rx: 3.5, fill: pal.green }, btn);
  const led = el('circle', { cx: 296, cy: 165, r: 4, fill: pal.red }, pr);
  const sign = g({}); tf(sign, 262, 96, 0, 0);
  el('rect', { x: -26, y: -24, width: 52, height: 40, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sign);
  el('path', { d: 'M -10 -14 L 10 -14 L 10 10 L -10 10 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, sign);
  el('line', { x1: -14, y1: -16, x2: 14, y2: 12, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, sign);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  return {
    update(t) {
      const press = hump(seg(t, 0.4, 1.0)), shrug = easeInOut(seg(t, 1.8, 2.4));
      const o = { lean: 12 * (1 - shrug), armL: lerp(10, 60, shrug), look: 0.6, blink: blinkAt(t), mood: t < 1.3 ? 'flat' : 'sad' };
      P(b, o);
      const a = reach(b, S, 'R', 218, lerp(150, 164, press));
      P(b, { ...o, armR: lerp(lerp(25, a, easeInOut(seg(t, 0, 0.5))), 60, shrug) });
      faceAt(b, 3, shrug * -2);
      tf(btn, 224, 166 + 2 * press);
      const run = t > 0.9 && t < 1.5 ? Math.sin(t * 60) * 1 : 0;
      tf(pr, 0, run);
      const blink = t < 0.9 ? 0.3 : Math.sin(t * 9) > 0 ? 1 : 0.25;
      k.set(led, { fill: t < 0.9 ? pal.green : pal.red, opacity: blink });
      tf(sign, 262, 96 - 3 * hump(seg(t, 1.6, 2.6)), 0, Math.max(0.001, backOut(seg(t, 1.5, 2.0))));
    }
  };
}
