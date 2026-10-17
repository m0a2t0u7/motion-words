// hurry up：バス停で待つ友だちに急かされ、のんびり歩いていたまめが走り出す（例文 Hurry up, or we'll miss the bus.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'のんびり歩く'], [1.4, '急かされる'], [2.8, '走って追いつく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240 });
  // バス停とバス（静止）
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  const bus = g({});
  el('rect', { x: 232, y: 118, width: 160, height: 104, rx: 16, fill: pal.yellow }, bus);
  el('rect', { x: 232, y: 176, width: 160, height: 12, fill: pal.yellowDark }, bus);
  [[284, 52], [342, 44]].forEach(([x, w]) => el('rect', { x, y: 130, width: w, height: 34, rx: 7, fill: '#CFE9F7' }, bus));
  el('rect', { x: 240, y: 130, width: 36, height: 80, rx: 5, fill: '#56607A' }, bus);   // ドア（開いている）
  el('rect', { x: 240, y: 206, width: 36, height: 6, fill: pal.woodDark }, bus);
  [284, 360].forEach((x) => { el('circle', { cx: x, cy: 222, r: 17, fill: pal.ink }, bus); el('circle', { cx: x, cy: 222, r: 7, fill: pal.sub }, bus); });
  el('rect', { x: 232, y: 112, width: 160, height: 12, rx: 6, fill: '#fff', opacity: 0.35 }, bus);
  el('circle', { cx: 238, cy: 196, r: 4, fill: pal.red }, bus);
  // 標識
  el('rect', { x: 194, y: 120, width: 5, height: 120, fill: pal.sub });
  el('rect', { x: 180, y: 100, width: 34, height: 26, rx: 6, fill: pal.blue });
  k.text(197, 113, 'BUS', { 'font-size': 12, fill: '#fff' });
  const S = 0.95;
  const f = k.buddy({ x: 222, y: FY + 4, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const b = k.buddy({ x: 40, y: FY + 6, scale: S });
  const lines = g({});
  [0, 1, 2].forEach((i) => el('line', { x1: -10 - i * 6, y1: -20 - i * 18, x2: -34 - i * 8, y2: -20 - i * 18, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.6 }, lines));
  const bub = g({});
  el('rect', { x: -22, y: -16, width: 44, height: 28, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -4 12 L 2 22 L 8 12 Z', fill: '#fff' }, bub);
  k.text(0, -2, '!!', { 'font-size': 18, fill: pal.red }, bub);
  return {
    update(t) {
      // 歩き：0〜1.4 ゆっくり、1.4〜 から加速して走る
      const slow = seg(t, 0, 1.4), run = seg(t, 1.6, 3.1);
      const x = t < 1.6 ? lerp(40, 92, slow) : lerp(92, 160, easeInOut(run));
      const rn = easeInOut(seg(t, 1.5, 2.1));
      const stop = easeOut(seg(t, 3.0, 3.6));
      const moving = t < 3.1;
      const ph = t < 1.5 ? t * 7 : 1.5 * 7 + (t - 1.5) * lerp(8, 17, rn);
      const sw = Math.sin(ph) * lerp(16, 48, rn) * (moving ? 1 : 0);
      b.pose({ x, walk: moving ? ph : 0, armR: moving ? 8 + sw : 8, armL: moving ? 8 - sw : 8, lean: lerp(2, 16, rn) * (1 - stop) + 2 * stop, look: 0.5,
        mood: t < 1.4 ? 'flat' : t < 3.1 ? 'open' : 'grin', squash: 1 - 0.04 * hump(seg(t, 3.0, 3.6)) });
      const beck = Math.sin(t * 12) * 16 * hump(seg(t, 0.9, 3.0));
      f.pose({ armR: lerp(10, 150, easeOut(seg(t, 0.9, 1.3))) * (1 - seg(t, 3.1, 3.6)) + beck * (1 - seg(t, 3.1, 3.6)) + 10 * seg(t, 3.1, 3.6), armL: 10, look: 0.5, mood: t < 3.1 ? 'open' : 'smile' });
      tf(lines, x - 20, FY, 0, 1, 1);
      lines.setAttribute('opacity', rn * (1 - stop) * (moving ? 1 : 0));
      tf(bub, 222, FY - 96, 0, seg(t, 1.0, 1.3) * 1.2, seg(t, 1.0, 1.3) * 1.2);
      bub.setAttribute('opacity', t > 1.0 && t < 3.2 ? 1 : 0);
    }
  };
}
