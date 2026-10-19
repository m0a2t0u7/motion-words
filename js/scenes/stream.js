// stream：家の裏手に、細い小川がさらさら流れている。まめが家の横から裏へ回り、小川をのぞきこむ（例文 A small stream runs behind the house.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { scene, hills, treeG, gait, P, blinkAt, point } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '家'], [1.4, '裏へ回る'], [3.0, '裏の小川']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.7;
  const { FY } = scene(k, { FY: 150, ground: '#A9DBA9', edge: '#98D098' });
  hills(k, 150);
  // 小川（家の奥＝画面上側を横切る）
  const SY = 170;
  el('path', { d: `M 0 ${SY} Q 100 ${SY - 8} 200 ${SY} T 400 ${SY - 4} L 400 ${SY + 14} Q 300 ${SY + 18} 200 ${SY + 12} T 0 ${SY + 14} Z`, fill: '#7CC8EE' });
  const flow = el('path', { d: `M 0 ${SY + 6} Q 100 ${SY - 2} 200 ${SY + 6} T 400 ${SY + 3}`, stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '10 18', opacity: 0.8 });
  [[30, SY + 20], [370, SY + 20]].forEach(([x, y]) => tf(treeG(k, 0.6).g, x, y));
  // 家（手前）
  const HX = 140, HY = 270;
  el('rect', { x: HX, y: HY - 80, width: 130, height: 80, fill: '#FFF6EA' });
  el('path', { d: `M ${HX - 12} ${HY - 76} L ${HX + 65} ${HY - 126} L ${HX + 142} ${HY - 76} Z`, fill: pal.coral });
  el('rect', { x: HX + 50, y: HY - 46, width: 28, height: 46, rx: 3, fill: pal.woodDark });
  el('rect', { x: HX + 92, y: HY - 60, width: 24, height: 20, rx: 2, fill: '#CDEBFA' });
  const b = k.buddy({ x: 100, y: 280, scale: S });
  const path = (t) => {
    const p = easeInOut(seg(t, 0.4, 2.8));
    if (p < 0.5) return { x: lerp(100, 300, p * 2), y: 280 };
    return { x: 300 + 20 * (p - 0.5) * 2, y: lerp(280, SY + 30, (p - 0.5) * 2) };
  };
  return {
    update(t) {
      flow.setAttribute('stroke-dashoffset', (-t * 30).toFixed(1));
      const q = path(t), w = gait((tt) => { const r = path(tt); return r.x + r.y; }, t, 380, 14, 0.12);
      const sc = lerp(1, 0.75, (280 - q.y) / (280 - SY - 30));
      const pt = easeOut(seg(t, 3.0, 3.4));
      P(b, { x: q.x, y: q.y, walk: w.walk, lean: w.lean + 10 * pt, armL: w.armL, armR: w.armR, look: 0.4, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t), facing: t > 2.9 ? -1 : 1 });
      tf(b.g, q.x, q.y, 0, S * sc, S * sc);
      if (pt > 0) b.pose({ armR: lerp(8, point(b, S * sc, 'R', 260, SY + 6), pt) });
      tf(b.g, q.x, q.y, 0, S * sc, S * sc);
    }
  };
}
