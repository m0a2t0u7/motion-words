// headphones：電車の中、つり革を持ちながらヘッドホンで音楽を聞き、リズムに合わせて体をゆらす（例文 He listens to music on his headphones on the train.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { reach, P, blinkAt, face } from './bag.js';
import { icon } from './in-common.js';
import { tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '電車の中'], [1.2, 'ヘッドホンで'], [2.4, '音楽を聞く']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.2, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF1F6' });
  // 窓の外の景色（流れる）
  const wins = [[30, 140], [230, 140]];
  const cp = k.clip((c) => wins.forEach(([x, w]) => k.el('rect', { x, y: 60, width: w, height: 80, rx: 8 }, c)));
  wins.forEach(([x, w]) => el('rect', { x, y: 60, width: w, height: 80, rx: 8, fill: '#CFE9F7' }));
  const scen = k.g({});
  scen.setAttribute('clip-path', cp);
  const strip = k.g({}, scen);
  for (let i = 0; i < 10; i++) { el('circle', { cx: i * 90 + 20, cy: 118, r: 16, fill: '#8FD3A8' }, strip); el('rect', { x: i * 90 + 50, y: 100 + (i % 3) * 6, width: 26, height: 40, rx: 3, fill: ['#F3E6DC', '#E4EEF7', '#FCE6D6'][i % 3] }, strip); }
  wins.forEach(([x, w]) => el('rect', { x, y: 60, width: w, height: 80, rx: 8, fill: 'none', stroke: '#C9D1DC', 'stroke-width': 5 }));
  el('rect', { x: 0, y: 30, width: 400, height: 5, fill: '#B9C3D0' });
  [110, 300].forEach((x) => { el('line', { x1: x, y1: 35, x2: x, y2: 122, stroke: '#B9C3D0', 'stroke-width': 2 }); el('circle', { cx: x, cy: 128, r: 6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }); });
  el('rect', { x: 0, y: FY - 44, width: 400, height: 10, rx: 4, fill: '#7FA8D9' });
  el('rect', { x: 0, y: FY - 34, width: 400, height: 34, fill: '#6A93C6' });
  const b = k.buddy({ x: 260, y: FY, scale: S });
  // ヘッドホン（体の頭部につける）
  const hp2 = k.g({}, b.body);
  el('path', { d: 'M -28 -54 Q -28 -92 0 -92 Q 28 -92 28 -54', stroke: pal.ink, 'stroke-width': 5, fill: 'none' }, hp2);
  el('rect', { x: -34, y: -64, width: 12, height: 22, rx: 5, fill: pal.coral }, hp2);
  el('rect', { x: 22, y: -64, width: 12, height: 22, rx: 5, fill: pal.coral }, hp2);
  const notes = [0, 1, 2].map(() => icon(k, 'note'));
  return {
    update(t) {
      tf(strip, -((t * 120) % 90), 0);
      const beat = Math.sin(t * Math.PI * 2 * 1.2);
      P(b, { x: 260, look: 0.3, blink: t > 1.2 ? 0.85 : blinkAt(t), mood: 'grin', lean: 4 * beat, squash: 1 - 0.03 * Math.abs(beat) });
      face(b, 2, 0);
      b.pose({ armR: reach(b, S, 'R', 300, 128) });
      notes.forEach((n, i) => {
        const q = ((t * 0.6 + i / 3) % 1);
        tf(n, 300 + q * 40 + i * 6, 120 - q * 50, 0, 0.8 * hump(q) + 0.001);
        n.setAttribute('opacity', t > 0.8 ? hump(q) : 0);
      });
    }
  };
}
