// come through：嵐の中を傘を差して笑顔で歩き抜け、晴れた側へ出る（例文 She came through the hard times with a smile.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { held } from './dig.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '嵐の中'], [1.8, '笑顔で進む'], [3.8, '抜け出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 240, height: FY, fill: '#AEB8C6' });
  el('rect', { x: 0, y: FY, width: 240, height: 64, fill: '#D3D9E1' });
  el('ellipse', { cx: 150, cy: FY + 18, rx: 40, ry: 5, fill: '#B5C6D6' });
  // 晴れ側
  const sun = g({}); tf(sun, 340, 60);
  el('circle', { r: 22, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -30, x2: 0, y2: -38, stroke: pal.yellow, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, sun);
  // 雲（動かない）
  [[30, 40, 40], [90, 30, 46], [160, 40, 42], [220, 34, 30]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#7D8798' }));
  const rain = g({});
  const drops = [];
  for (let i = 0; i < 22; i++) drops.push(el('line', { x1: 0, y1: 0, x2: -4, y2: 12, stroke: '#E4EEF7', 'stroke-width': 2, 'stroke-linecap': 'round' }, rain));
  const bolt = el('path', { d: 'M 120 70 L 104 104 L 118 104 L 106 136 L 134 96 L 120 96 L 130 70 Z', fill: pal.yellow });
  const S = 0.85;
  const b = k.buddy({ x: 20, y: FY + 8, scale: S });
  const umb = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 70, stroke: pal.ink, 'stroke-width': 3 }, umb);
  const canopy = el('path', { d: 'M -40 40 Q 0 92 40 40 Q 30 46 20 40 Q 10 46 0 40 Q -10 46 -20 40 Q -30 46 -40 40 Z', fill: pal.violet }, umb);
  const xf = path([[0.2, 20], [3.4, 330]]);
  return {
    update(t) {
      drops.forEach((d, i) => {
        const x = (i * 37) % 240, ph = ((t * 2.2 + i * 0.137) % 1);
        tf(d, x + 10, lerp(70, FY, ph));
      });
      bolt.setAttribute('opacity', Math.abs(t - 1.0) < 0.08 || Math.abs(t - 2.2) < 0.06 ? 1 : 0);
      const p = walk(b, xf, t, { y: FY + 8, look: 0.5, mood: t > 3.4 ? 'grin' : 'smile' });
      const close = easeInOut(seg(t, 3.0, 3.6));
      b.pose({ armR: lerp(160, 30, close) });
      held(k, b, S, umb, 'R', 0);
      canopy.setAttribute('transform', `scale(${lerp(1, 0.25, close).toFixed(3)} 1)`);
      tf(sun, 340, 60, t * 10, 1 + 0.05 * Math.sin(t * 3));
      void p; void easeOut; void hump; void wobble;
    }
  };
}
