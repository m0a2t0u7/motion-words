// road：道ばたの標識を指さすと、この道はずっと先の海辺へ続いている（例文 This road goes to the beach.）
// このファイルは道路系シーンの共有ヘルパーも書き出す（topCar：上から見た車 / rearCar：後ろから見た車 / headIn：車の中のまめ）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { reach, P, blinkAt, walkTo, face } from './bag.js';
import { sign } from './queue-up.js';
import { tree } from './run-after.js';

// 上から見た車（原点＝中心、上向きに進む）。運転するまめの頭が見える
export function topCar(k, col, dark) {
  const g = k.g({}), { el, pal } = k;
  el('rect', { x: -15, y: -24, width: 30, height: 48, rx: 9, fill: col || pal.blue }, g);
  el('rect', { x: -12, y: -14, width: 24, height: 10, rx: 3, fill: '#CFE9F7' }, g);
  el('circle', { cx: -5, cy: 2, r: 6, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 1.5 }, g);
  el('rect', { x: -12, y: 12, width: 24, height: 6, rx: 2, fill: '#CFE9F7' }, g);
  const blinkL = el('rect', { x: -15, y: -24, width: 6, height: 5, rx: 2, fill: pal.yellow, opacity: 0 }, g);
  const blinkL2 = el('rect', { x: -15, y: 19, width: 6, height: 5, rx: 2, fill: pal.yellow, opacity: 0 }, g);
  return { g, blink(on) { [blinkL, blinkL2].forEach((n) => n.setAttribute('opacity', on ? 1 : 0)); } };
}
// 後ろから見た車（原点＝地面の中央）。窓にまめの後ろ頭
export function rearCar(k, col, dark) {
  const g = k.g({}), { el, pal } = k;
  k.shadow(0, 0, 40, 5, g);
  el('path', { d: 'M -30 -40 Q -28 -62 0 -62 Q 28 -62 30 -40 Z', fill: col || pal.coral }, g);
  el('path', { d: 'M -24 -42 Q -22 -58 0 -58 Q 22 -58 24 -42 Z', fill: '#CFE9F7' }, g);
  el('circle', { cx: -9, cy: -44, r: 9, fill: pal.mint }, g);
  el('rect', { x: -38, y: -42, width: 76, height: 32, rx: 8, fill: col || pal.coral }, g);
  el('rect', { x: -34, y: -34, width: 12, height: 7, rx: 2, fill: pal.red }, g);
  el('rect', { x: 22, y: -34, width: 12, height: 7, rx: 2, fill: pal.red }, g);
  el('rect', { x: -12, y: -26, width: 24, height: 8, rx: 1, fill: '#fff' }, g);
  [-26, 26].forEach((x) => el('rect', { x: x - 7, y: -12, width: 14, height: 12, rx: 3, fill: pal.ink }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '道を歩く'], [1.8, '標識を見る'], [2.8, '海まで続く道']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.0, FY = 236;
  k.backdrop({ floorY: FY });
  // 遠くの海と砂浜（右）
  el('rect', { x: 250, y: 150, width: 150, height: 60, fill: '#8FD3F4' });
  el('path', { d: 'M 250 150 Q 330 140 400 150', stroke: '#fff', 'stroke-width': 3, fill: 'none' });
  el('path', { d: 'M 230 210 Q 300 190 400 196 V 236 H 230 Z', fill: '#F6E3B4' });
  el('line', { x1: 352, y1: 196, x2: 352, y2: 160, stroke: pal.woodDark, 'stroke-width': 2.5 });
  el('path', { d: 'M 330 166 Q 352 140 374 166 Z', fill: pal.coral });
  el('circle', { cx: 120, cy: 60, r: 18, fill: '#FFE07A' });
  el('rect', { x: 0, y: 160, width: 250, height: 50, fill: '#DCEFD9' });
  tree(k, 40, 196, 0.6); tree(k, 180, 190, 0.5);
  // 道（手前から右奥の海へ）
  el('path', { d: `M 0 ${FY} L 0 210 Q 180 206 330 200 L 360 ${FY} Z`, fill: '#AEB7C4' });
  const dash = el('path', { d: 'M 0 222 Q 180 216 345 214', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '14 12', fill: 'none' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  sign(k, 250, FY + 30, '', { w: 66, h: 30, post: 50 });
  el('path', { d: `M 226 ${FY - 35} h 30 v -6 l 12 10 l -12 10 v -6 h -30 Z`, fill: pal.blue });
  const b = k.buddy({ x: 40, y: FY + 30, scale: S });
  const xf = (t) => lerp(30, 150, easeInOut(seg(t, 0, 1.8)));
  return {
    update(t) {
      const w = walkTo(xf, t, 30);
      const pt = easeInOut(seg(t, 2.0, 2.5));
      P(b, { x: w.x, y: FY + 30, walk: w.walk, armL: w.armL, lean: w.lean, look: 0.8, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : 'smile' });
      b.pose({ armR: lerp(w.armR, t > 2.8 ? reach(b, S, 'R', 360, 170) : reach(b, S, 'R', 250, FY - 30), pt) });
      face(b, 5, -2 * pt);
      dash.setAttribute('stroke-dashoffset', -t * 10 * (t > 2.6));
    }
  };
}
