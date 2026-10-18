// pull in：電車が2番線のホームに入ってきて、減速して止まる。ホームの人が待っている（例文 The train pulled in at platform two.）
import { seg, lerp, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, 'ホームで待つ'], [1.4, '電車が入る'], [3.0, '停車した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 屋根と柱（静止）
  el('rect', { x: 0, y: 40, width: 400, height: 14, fill: '#8C96A8' });
  [60, 200, 340].forEach((x) => el('rect', { x: x - 3, y: 54, width: 6, height: 130, fill: '#A9B2C0' }));
  // 番線表示
  el('rect', { x: 176, y: 62, width: 48, height: 30, rx: 5, fill: pal.blueDark });
  k.text(200, 78, '2', { 'font-size': 22, fill: '#fff' });
  // 線路
  el('rect', { x: 0, y: 186, width: 400, height: 34, fill: '#C9C2B6' });
  el('rect', { x: 0, y: 200, width: 400, height: 4, fill: '#7A7F8C' });
  const T = g({});
  const cars = [0, 1, 2].map((i) => {
    const c = g({}, T);
    el('rect', { x: i * 214, y: 92, width: 208, height: 100, rx: 16, fill: '#F4F6F9', stroke: '#C9CED8', 'stroke-width': 2 }, c);
    el('rect', { x: i * 214, y: 162, width: 208, height: 8, fill: pal.green }, c);
    for (let j = 0; j < 4; j++) el('rect', { x: i * 214 + 18 + j * 48, y: 110, width: 34, height: 34, rx: 5, fill: '#CFE9F7' }, c);
    el('rect', { x: i * 214 + 96, y: 108, width: 16, height: 58, rx: 3, fill: '#DDE3EA' }, c);
    [30, 178].forEach((x) => el('circle', { cx: i * 214 + x, cy: 194, r: 8, fill: pal.ink }, c));
    return c;
  });
  el('path', { d: 'M 640 92 L 640 192 L 610 192 Z', fill: '#F4F6F9' }, T);
  el('rect', { x: 618, y: 120, width: 16, height: 10, rx: 2, fill: '#FFF3C4' }, T);
  // ホーム（手前）
  el('rect', { x: 0, y: 220, width: 400, height: 80, fill: '#E3E8EE' });
  el('rect', { x: 0, y: 220, width: 400, height: 6, fill: pal.yellow });
  const B = k.buddy({ x: 120, y: 268, scale: 0.75 });
  return {
    update(t) {
      // 左から入り、ブレーキで減速して停車位置へ
      const p = clamp((t - 0.4) / 2.6);
      const x = lerp(-700, -275, 1 - Math.pow(1 - p, 2.4));
      const stop = seg(t, 3.0, 3.6);
      tf(T, x + 1.5 * wobble(stop, 1.5, 5), 0);
      const look = clamp(lerp(-0.8, 0.2, p));
      B.pose({ look: t < 0.4 ? -0.8 : look, mood: t > 3.0 ? 'grin' : 'smile', armR: 10, armL: 10, squash: 1 + 0.02 * Math.sin(t * 3) });
    }
  };
}
