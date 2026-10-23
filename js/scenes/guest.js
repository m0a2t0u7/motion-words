// guest：今夜はお客さんが来る。まめが食卓にお皿を並べていると、チャイムが鳴ってドアにお客さん2人（例文 We have guests tonight.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, plateP, keys, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '今夜'], [1.6, 'ピンポーン'], [2.8, 'お客さんが来た']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 30, winW: 80, sky: '#3B4D74', mood: 'evening' });
  el('circle', { cx: 92, cy: 64, r: 10, fill: '#FFE7A0' });
  // 玄関ドア（右）。開くと外にお客さん
  el('rect', { x: 300, y: 80, width: 80, height: 156, fill: '#2E3B57' });
  const g1 = k.buddy({ x: 326, y: FY, scale: 0.9, facing: -1, ...C(k, 'coral') });
  const g2 = k.buddy({ x: 356, y: FY, scale: 0.95, facing: -1, ...C(k, 'blue') });
  const door = el('rect', { x: 300, y: 80, width: 80, height: 156, fill: '#B07548' });
  el('rect', { x: 296, y: 76, width: 88, height: 6, fill: '#8B5E3C' });
  const ring = [0, 1, 2].map(() => el('path', { d: 'M 0 -10 Q 7 0 0 10', stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 100, y: FY, scale: 1.1 });
  dinner(k, 40, 250, 200);
  const spots = [70, 120, 170, 220];
  const pls = spots.map(() => plateP(k, undefined, 18));
  const A = arms(k, b, 1.1);
  const xb = keys([[0, 60], [1.2, 190], [2.2, 190], [2.9, 236]]);
  return {
    update(t) {
      const g = gait(xb, t, 60);
      const op = easeInOut(seg(t, 2.8, 3.3));
      P(b, { x: g.x, walk: g.walk, lean: g.lean, look: t > 1.6 && t < 2.2 ? 0.9 : 0.5, blink: blinkAt(t), mood: t > 1.6 ? 'open' : 'smile', facing: 1 });
      // 皿を順に置く（各皿の上を手が通る時に置かれる）
      pls.forEach((p, i) => { const on = g.x + 26 > spots[i] || t > 1.3; k.tf(p, spots[i], on ? 202 : -99); });
      if (t < 2.2) { A.to('R', g.x + 30, 190 + 4 * Math.sin(t * 9)); A.to('L', g.x - 22, 200); }
      else { A.to('R', lerp(g.x + 30, 302, op), lerp(196, 150, op)); A.to('L', g.x - 22, 204); }
      ring.forEach((r, i) => { const u = seg(t, 1.6, 2.4); k.tf(r, 300 - 8 - i * 9 * u, 130, 0, -1); r.setAttribute('opacity', (u > 0 && u < 1 ? 1 - u * 0.6 : 0).toFixed(2)); });
      // ドアを開ける（幅が縮む）
      k.set(door, { width: Math.max(4, 80 * (1 - op)) });
      g1.g.setAttribute('opacity', op > 0.15 ? 1 : 0); g2.g.setAttribute('opacity', op > 0.15 ? 1 : 0);
      const wave = Math.sin(t * 10) * 14;
      P(g1, { facing: -1, look: 0.4, blink: blinkAt(t, 1), mood: 'grin', armR: op > 0.8 ? 150 + wave : 10 });
      P(g2, { facing: -1, look: 0.4, blink: blinkAt(t, 1.4), mood: 'grin', armR: op > 0.8 ? 140 - wave : 10 });
    }
  };
}
