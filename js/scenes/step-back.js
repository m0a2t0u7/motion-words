// step back：駅のホーム。黄色い線より前にいた人が、電車が来る前に線の内側へ一歩下がる（例文 Please step back from the yellow line.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '線の外側'], [1.4, '一歩下がる'], [3.4, '線の内側']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 40, width: 400, height: 14, fill: '#C9D3E0' });
  [60, 220].forEach((x) => el('rect', { x, y: 54, width: 8, height: FY - 54, fill: '#D5DCE6' }));
  // ホーム（左）と線路（右・低い）
  el('rect', { x: 0, y: FY, width: 300, height: 64, fill: '#DADFE6' });
  el('rect', { x: 300, y: FY + 26, width: 100, height: 40, fill: '#B9A99A' });
  el('rect', { x: 296, y: FY, width: 6, height: 64, fill: '#B5BDC8' });
  el('rect', { x: 236, y: FY, width: 18, height: 64, fill: pal.yellow });
  for (let y = FY + 6; y < 300; y += 9) for (let x = 240; x < 252; x += 6) el('circle', { cx: x, cy: y, r: 1.6, fill: pal.yellowDark });
  const lamp = el('circle', { cx: 230, cy: 70, r: 7, fill: '#FFD9A8' });
  const S = 0.85;
  const b = k.buddy({ x: 276, y: FY + 14, scale: S });
  const train = g({});
  el('rect', { x: 0, y: -96, width: 200, height: 96, rx: 14, fill: '#E9EEF4', stroke: '#B9C2CF', 'stroke-width': 3 }, train);
  el('rect', { x: 0, y: -40, width: 200, height: 10, fill: pal.blue }, train);
  el('rect', { x: 14, y: -80, width: 36, height: 28, rx: 5, fill: '#9CC9EE' }, train);
  el('rect', { x: 64, y: -80, width: 36, height: 28, rx: 5, fill: '#9CC9EE' }, train);
  const xf = path([[1.0, 276], [2.0, 196]]);
  return {
    update(t) {
      lamp.setAttribute('fill', t > 0.4 && Math.floor(t * 4) % 2 ? pal.red : '#FFD9A8');
      // 前を向いたまま後ろへ下がる
      const p = walk(b, xf, t, { y: FY + 14, facing: 1, look: 0.7, mood: t < 1.0 ? 'smile' : t < 2.2 ? 'open' : 'smile' });
      b.pose({ lean: -6 * hump(seg(t, 1.0, 2.0)) + 2 * wobble(seg(t, 2.0, 2.6), 2, 6) });
      const tr = easeOut(seg(t, 2.2, 3.8));
      tf(train, lerp(420, 304, tr), FY + 30);
      void easeInOut; void p;
    }
  };
}
