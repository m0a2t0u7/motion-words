// chilly：10月の夕方、日が傾いて落ち葉が舞い、まめが少し肌寒くて腕をさする（例文 It gets chilly in the evening in October.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, parkBg, tree } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '昼の公園'], [1.6, '夕方になる'], [3.0, '肌寒い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  const dusk = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FF9A5C', opacity: 0 });
  const sun = el('circle', { r: 20, fill: pal.yellow });
  tree(k, 90, FY - 4, 1.1, '#F0A860', '#E58A45'); tree(k, 330, FY - 6, 0.8, '#F2B96A', '#E59A55');
  const leaves = Array.from({ length: 9 }, (_, i) => el('path', { d: 'M 0 -5 Q 6 0 0 6 Q -6 0 0 -5 Z', fill: i % 2 ? '#E58A45' : '#D9622F' }));
  // 温度計（下がる）
  const th = g({}); tf(th, 350, 40);
  el('rect', { x: -5, y: 0, width: 10, height: 50, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  el('circle', { cx: 0, cy: 54, r: 9, fill: pal.blue, stroke: pal.line, 'stroke-width': 2 }, th);
  const lv = el('rect', { x: -2.5, y: 0, width: 5, height: 50, rx: 2.5, fill: pal.blue }, th);
  const b = k.buddy({ x: 200, y: FY, scale: 1 });
  return {
    update(t) {
      const e = easeInOut(seg(t, 1.0, 2.8)), rub = easeInOut(seg(t, 2.2, 2.7));
      dusk.setAttribute('opacity', 0.22 * e);
      tf(sun, lerp(300, 330, e), lerp(70, 205, e));
      const r = Math.sin(t * 12) * 6 * rub;
      P(b, { armL: lerp(8, 50, rub) + r, armR: lerp(8, 50, rub) - r, lean: 5 * rub, squash: 1 - 0.03 * rub, mood: rub > 0.4 ? 'flat' : 'smile', look: 0.4, blink: blinkAt(t) });
      leaves.forEach((l, i) => { const u = (t * 0.22 + i * 0.113) % 1; tf(l, ((i * 47 + 20) + u * 90 + Math.sin(t * 3 + i) * 12) % 400, u * (FY - 10) + 20, t * 90 + i * 40); l.setAttribute('opacity', e > 0.1 || i < 3 ? 1 : 0); });
      const h = lerp(46, 14, e); lv.setAttribute('y', 50 - h); lv.setAttribute('height', h);
    }
  };
}
