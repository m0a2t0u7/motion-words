// storm：嵐の雨と風で木が大きく揺れ、何本も根元から倒れる。まめは家の窓から見てびっくり（例文 The storm knocked down several trees.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump, wobble } from '../ease.js';
import { scene, hills, treeG, cloudG, fall, P, blinkAt } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '嵐が来る'], [1.2, '木が揺れる'], [2.8, '木が倒れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const { FY } = scene(k, { FY: 240, top: '#4F5A6E', bot: '#8A94A6', ground: '#7FA486', edge: '#6E9376' });
  [[80, 30], [250, 22], [360, 44]].forEach(([x, y]) => tf(cloudG(k, 170, 56, '#3E4758', undefined, false), x, y));
  hills(k, FY, '#6F8C78', '#78977F');
  const trees = [[200, 1.0, 1.4], [270, 1.1, 1.75], [345, 0.95, 2.05]].map(([x, s, t0]) => { const tr = treeG(k, s, '#5FA872', '#55996A'); tf(tr.g, x, FY + 2); return { tr, s, t0 }; });
  // 家（左）と窓の中のまめ
  el('rect', { x: 0, y: FY - 120, width: 120, height: 120, fill: '#D9CDBE' });
  el('path', { d: `M -10 ${FY - 116} L 60 ${FY - 166} L 130 ${FY - 116} Z`, fill: '#8E6B5A' });
  const WX = 30, WY = FY - 96, WW = 64, WH = 56;
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#FFE6B0' });
  const inner = g({}); inner.setAttribute('clip-path', k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)));
  const b = k.buddy({ x: 62, y: WY + 92, scale: S, parent: inner });
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 3 });
  const rain = fall(k, { n: 46, FY: FY + 10, kind: 'rain', speed: 380 });
  const gust = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 0 h 40 q 10 0 10 -7', stroke: '#E6ECF3', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }));
  return {
    update(t) {
      rain(t);
      gust.forEach((l, i) => tf(l, ((t * 300 + i * 140) % 560) - 80, 70 + i * 40));
      trees.forEach(({ tr, t0 }, i) => {
        const sway = 8 * Math.sin(t * 7 + i) * easeOut(seg(t, 0.3, 1.0));
        const f = easeIn(seg(t, t0, t0 + 0.55)), bounce = wobble(seg(t, t0 + 0.55, t0 + 1.2), 2, 5);
        const ang = f > 0 ? lerp(sway + 10, 84, f) - 6 * bounce * (f >= 1 ? 1 : 0) : sway + 6;
        tf(tr.trunk, 0, 0, ang);
      });
      const shock = easeOut(seg(t, 1.5, 1.8));
      P(b, { y: WY + 92, x: 62, look: 0.8, armL: 8 + 120 * shock, armR: 8 + 120 * shock, lean: -5 * shock, squash: 1 + 0.04 * hump(seg(t, 1.5, 1.9)), mood: shock > 0.3 ? 'open' : 'flat', blink: blinkAt(t) });
    }
  };
}
