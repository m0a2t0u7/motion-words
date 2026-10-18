// on time：駅のホーム。時刻表は8:00。時計の針がちょうど8時を指した瞬間に電車が止まる（例文 The train arrived on time.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { check } from './work-on.js';

export const meta = { duration: 4.2, beats: [[0, '8時の電車'], [1.2, '入ってくる'], [2.8, 'ぴったり到着']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 線路とホーム
  el('rect', { x: 0, y: 176, width: 400, height: 8, fill: '#B9C2CF' });
  el('rect', { x: 0, y: 186, width: 400, height: 50, fill: '#E3E8EE' });
  el('rect', { x: 0, y: 186, width: 400, height: 5, fill: pal.yellow });
  // 柱・時計・時刻表
  el('rect', { x: 66, y: 20, width: 8, height: 166, fill: pal.sub });
  const C = clock(k, 70, 44, 20);
  el('rect', { x: 290, y: 24, width: 86, height: 34, rx: 4, fill: pal.ink });
  k.text(333, 42, '8:00', { 'font-size': 18, fill: '#FFD98A' });
  el('rect', { x: 330, y: 58, width: 6, height: 128, fill: pal.sub });
  // 電車（奥）
  const train = g({});
  el('rect', { x: 0, y: 0, width: 300, height: 76, rx: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, train);
  el('rect', { x: 0, y: 50, width: 300, height: 8, fill: pal.green }, train);
  [16, 70, 124, 178, 232].forEach((x) => el('rect', { x, y: 14, width: 40, height: 28, rx: 4, fill: '#BFE3F5' }, train));
  el('path', { d: 'M 0 14 Q -8 40 0 70', fill: 'none', stroke: pal.line, 'stroke-width': 3 }, train);
  const door = el('rect', { x: 118, y: 10, width: 52, height: 62, fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, train);
  const trainY = 106;
  const b = k.buddy({ x: 170, y: FY, facing: -1, scale: 1 });
  const ck = check(k, 230, 110, 1.6, pal.green);
  return {
    update(t) {
      const A = 2.8;
      const p = easeOut(seg(t, 0.6, A));
      const tx = lerp(420, 40, p) + (t > A ? 2 * wobble(seg(t, A, A + 0.6), 2, 6) : 0);
      tf(train, tx, trainY);
      const tm = lerp(7 * 60 + 58, 8 * 60, seg(t, 0.2, A));
      C.set(Math.floor(tm / 60), tm % 60);
      const turn = t > 0.8;
      P(b, { x: 170, facing: 1, look: t < 0.8 ? -0.6 : t < A ? 0.5 : 0.7, mood: t > A ? 'grin' : 'smile', blink: blinkAt(t), armR: t > A + 0.2 ? lerp(8, 140, easeOut(seg(t, A + 0.2, A + 0.6))) : 8, squash: 1 - 0.04 * hump(seg(t, A + 0.1, A + 0.5)) });
      b.body.children[3].setAttribute('transform', `translate(${(t < 0.8 ? -4 : 4).toFixed(2)} ${(t < 0.8 ? -6 : 0).toFixed(2)})`);
      ck(easeOut(seg(t, A + 0.1, A + 0.5)));
      if (!turn) b.pose({ facing: -1 });
    }
  };
}
