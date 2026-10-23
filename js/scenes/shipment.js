// shipment：カレンダーで火曜を確かめたまめのもとへ、荷物を積んだトラックが着く（例文 The shipment will arrive next Tuesday.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '火曜を確認'], [1.4, 'トラックが来る'], [3.6, '荷物が着いた']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 86, fill: '#8F9AAE' });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E7EE' });
  // 考え雲の中のカレンダー（火曜が赤丸）
  const cl = cloud(k, 128, 84, -1);
  el('rect', { x: -44, y: -26, width: 88, height: 52, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cl.g);
  el('rect', { x: -44, y: -26, width: 88, height: 12, rx: 4, fill: pal.coral }, cl.g);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) el('rect', { x: -40 + c * 12, y: -10 + r * 11, width: 8, height: 7, rx: 1.5, fill: '#E4E9F2' }, cl.g);
  const mark = el('circle', { cx: -40 + 2 * 12 + 4, cy: -10 + 11 + 3.5, r: 8, fill: 'none', stroke: pal.red, 'stroke-width': 2.6 }, cl.g);
  // トラック（左向き、原点＝前後中央の地面）
  const tr = k.g({}); k.shadow(0, 0, 70, 6, tr);
  const body = k.g({}, tr);
  el('rect', { x: -66, y: -18, width: 130, height: 8, fill: pal.blueDark }, body);
  el('path', { d: 'M -66 -18 V -50 Q -66 -58 -56 -58 H -34 L -20 -76 H -6 V -18 Z', fill: pal.coral }, body);
  el('path', { d: 'M -32 -54 L -22 -70 H -12 V -54 Z', fill: '#CFE9F7' }, body);
  [[8, '#C9A06B'], [34, '#D8B27C']].forEach(([x, c]) => el('rect', { x, y: -42, width: 24, height: 24, rx: 2, fill: c, stroke: pal.woodDark, 'stroke-width': 2 }, body));
  el('rect', { x: 20, y: -62, width: 22, height: 20, rx: 2, fill: '#C9A06B', stroke: pal.woodDark, 'stroke-width': 2 }, body);
  el('rect', { x: 62, y: -28, width: 4, height: 10, fill: pal.sub }, body);
  const wh = [-42, 36].map((wx) => { const w = k.g({}, tr); el('circle', { r: 13, fill: pal.ink }, w); el('circle', { r: 6, fill: '#C9D1DC' }, w); el('rect', { x: -1.5, y: -6, width: 3, height: 12, fill: pal.sub }, w); return [w, wx]; });
  const b = k.buddy({ x: 70, y: FY + 6, scale: 0.9 });
  const xf = (t) => lerp(480, 252, easeOut(seg(t, 1.4, 3.6)));
  return {
    update(t) {
      const x = xf(t), v = clamp((xf(t - 0.03) - xf(t + 0.03)) / 6);
      k.tf(tr, x, FY + 58); k.tf(body, 0, -0.9 * Math.sin(t * 22) * v);
      wh.forEach(([w, wx]) => k.tf(w, wx, -13, -x * 1.5));
      const q = seg(t, 0.1, 0.6) * (1 - seg(t, 1.5, 1.9));
      cl.show(q, 112, 78);
      mark.setAttribute('r', 8 + 1.2 * Math.sin(t * 8));
      const arrived = seg(t, 3.5, 3.9);
      P(b, { facing: 1, look: 0.7, armR: 8 + 150 * hump(arrived) * 0 + 140 * easeOut(arrived), mood: arrived > 0 ? 'grin' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 3.7, 4.3)) });
      if (t < 1.5) b.pose({ armR: lerp(8, 130, easeOut(seg(t, 0.5, 1.0))), mood: 'smile' });
    }
  };
}
