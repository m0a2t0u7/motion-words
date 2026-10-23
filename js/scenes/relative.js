// relative：結婚式に親戚が大勢集まってくる。まめもプレゼントを持って駆けつける（例文 Many relatives came to the wedding.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, wear, heartP, pops, keys, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '結婚式'], [0.8, '親戚が集まる'], [3.6, 'おおぜい来た']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDE8C9' });
  // 式場のアーチ
  el('path', { d: 'M 150 236 V 110 Q 200 50 250 110 V 236', stroke: '#fff', 'stroke-width': 10, fill: 'none' });
  [[156, 120], [170, 90], [200, 76], [230, 90], [244, 120]].forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7, fill: i % 2 ? '#FFB3C1' : '#FFE08A' }));
  const bride = k.buddy({ x: 186, y: FY, scale: 0.95, ...C(k, 'coral') });
  wear(k, bride, (g) => el('path', { d: 'M -26 -82 Q 0 -100 26 -82 L 34 -20 L -34 -20 Z', fill: '#fff', opacity: 0.85 }, g));
  const groom = k.buddy({ x: 220, y: FY, scale: 1.0, ...C(k, 'blue') });
  wear(k, groom, (g) => el('path', { d: 'M -8 -32 L 0 -28 L 8 -32 L 8 -24 L 0 -28 L -8 -24 Z', fill: pal.ink }, g));
  // 親戚（左右から来る）
  const rel = [[-60, 64, 0.9, 'coral', 0.2], [-120, 104, 0.6, 'blue', 0.6], [460, 330, 0.95, 'blue', 0.4], [520, 372, 0.6, 'coral', 0.9], [-180, 30, 0.75, 'blue', 1.2]].map(([x0, x1, s, c, d]) => ({ b: k.buddy({ x: x0, y: FY, scale: s, facing: x1 > x0 ? 1 : -1, ...C(k, c) }), xf: keys([[d, x0], [d + 2.4, x1]]), x0, dir: x1 > x0 ? 1 : -1 }));
  const me = k.buddy({ x: 470, y: FY, scale: 1.0, facing: -1 });
  const gift = k.g({}); el('rect', { x: -12, y: -20, width: 24, height: 20, rx: 2, fill: pal.violet }, gift); el('rect', { x: -2, y: -20, width: 4, height: 20, fill: pal.yellow }, gift); el('path', { d: 'M 0 -20 q -8 -8 -10 0 M 0 -20 q 8 -8 10 0', stroke: pal.yellow, 'stroke-width': 2.5, fill: 'none' }, gift);
  const A = arms(k, me, 1.0);
  const xm = keys([[1.0, 470], [3.4, 280]]);
  const hs = [0, 1, 2].map(() => heartP(k, undefined, '#FF8FB1'));
  return {
    update(t) {
      P(bride, { look: 0.4, blink: blinkAt(t), mood: 'grin', armR: 30 }); P(groom, { look: -0.4, blink: blinkAt(t, 1), mood: 'grin', armL: 30 });
      rel.forEach((r, i) => { const g = gait(r.xf, t, r.x0); P(r.b, { x: g.x, walk: g.walk, armL: g.armL, armR: g.armR, lean: g.lean, facing: r.dir, look: 0.4, blink: blinkAt(t, i * 0.4), mood: g.m < 0.1 && t > 2 ? 'grin' : 'smile' }); });
      const g = gait(xm, t, 470);
      P(me, { x: g.x, walk: g.walk, lean: g.lean, facing: -1, look: 0.4, blink: blinkAt(t, 0.3), mood: t > 3.4 ? 'grin' : 'smile' });
      const hR = A.to('R', g.x - 30, FY - 46), hL = A.to('L', g.x - 14, FY - 44);
      k.tf(gift, (hR.x + hL.x) / 2, FY - 34);
      hs.forEach((h, i) => { const q = seg(t, 3.6 + i * 0.2, 4.2 + i * 0.2); k.tf(h, 176 + i * 24, 70 - 14 * q, 0, pops(q)); });
    }
  };
}
