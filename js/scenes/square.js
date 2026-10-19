// square：町の広場（噴水と時計台）に、四方から人が集まってくる（例文 People gathered in the town square.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './restaurant.js';
import { gait } from './dig.js';
import { COL } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '町の広場'], [1.2, '人が集まる'], [3.4, '集まった']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 250;
  k.backdrop({ floorY: 200, mood: 'outdoor' });
  // 町並みと時計台
  [[0, 90, '#F3E6DC'], [70, 70, '#E4EEF7'], [300, 80, '#E6F1E8'], [350, 100, '#F3E6DC']].forEach(([x, h, c]) => { el('rect', { x, y: 200 - h, width: 60, height: h, fill: c }); el('path', { d: `M ${x - 4} ${200 - h} L ${x + 30} ${180 - h} L ${x + 64} ${200 - h} Z`, fill: '#D9A08A' }); });
  el('rect', { x: 176, y: 60, width: 48, height: 140, fill: '#EADBC2' });
  el('path', { d: 'M 170 60 L 200 28 L 230 60 Z', fill: '#C97B63' });
  el('circle', { cx: 200, cy: 84, r: 15, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  el('path', { d: 'M 200 84 V 74 M 200 84 L 207 88', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  // 石畳
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#E6DCCB' });
  for (let y = 210; y < 300; y += 16) el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#D6CAB5', 'stroke-width': 1.2 });
  // 噴水
  el('ellipse', { cx: 200, cy: 222, rx: 60, ry: 12, fill: '#B8C2CE' });
  el('ellipse', { cx: 200, cy: 218, rx: 52, ry: 8, fill: pal.water });
  el('rect', { x: 196, y: 186, width: 8, height: 32, fill: '#B8C2CE' });
  const jets = [-1, 1].map((d) => el('path', { d: `M 200 186 q ${d * 16} -26 ${d * 32} 26`, stroke: pal.water, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
  // 人々：左右から歩いてきて噴水のまわりに立つ
  const spec = [['blue', -40, 108, 252], ['coral', 440, 290, 254], ['yellow', -100, 70, 266], ['violet', 480, 330, 268], ['mint', -160, 140, 280], ['coral', 520, 258, 282]];
  const ppl = spec.map(([c, x0, x1, y], i) => ({ b: k.buddy({ x: x0, y, scale: 0.62 + (y - 250) * 0.004, color: COL[c][0], dark: COL[c][1], facing: x1 > x0 ? 1 : -1 }), xf: (t) => lerp(x0, x1, easeInOut(seg(t, 0.2 + i * 0.25, 2.6 + i * 0.25))), x0, x1 }));
  return {
    update(t) {
      jets.forEach((j, i) => j.setAttribute('opacity', (0.7 + 0.3 * Math.sin(t * 6 + i)).toFixed(2)));
      ppl.forEach(({ b, xf, x0, x1 }, i) => {
        const gt = gait(xf, t, x0), arr = gt.m < 0.05 && t > 2;
        P(b, { x: gt.x, walk: gt.walk, lean: gt.lean, armL: arr && t > 3.4 ? 120 : gt.armL, armR: gt.armR, facing: t > 3.6 ? (x1 < 200 ? 1 : -1) : x1 > x0 ? 1 : -1, mood: arr ? 'grin' : 'smile', blink: blinkAt(t, i * 0.4), look: 0.4 });
      });
    }
  };
}
