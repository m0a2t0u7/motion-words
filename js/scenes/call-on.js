// call on：帰り道、まめがおばさんの家に立ち寄ってドアをノック→おばさんが出てきて迎える（例文 I called on my aunt on the way home.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { faceAt, walkPose, reach } from './look-over.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '帰り道'], [1.8, 'ノックする'], [3.2, 'おばさんが迎える']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const FY = streetBg(k, 240, 'evening');
  // おばさんの家
  el('rect', { x: 170, y: 120, width: 140, height: 120, fill: '#FBE9DC' });
  el('path', { d: 'M 160 124 L 240 70 L 320 124 Z', fill: pal.violet });
  el('rect', { x: 260, y: 150, width: 36, height: 30, rx: 3, fill: '#FFE7A8' });
  el('rect', { x: 196, y: 154, width: 48, height: 86, fill: '#FFD98A' });
  const aunt = k.buddy({ x: 220, y: 238, scale: 0.7, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const fc = aunt.body.children[3];
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 7, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, fc));
  el('line', { x1: -3, y1: -54, x2: 3, y2: -54, stroke: pal.ink, 'stroke-width': 2 }, fc);
  el('circle', { cx: 0, cy: -84, r: 10, fill: pal.coralDark }, aunt.body);
  const door = el('rect', { x: 196, y: 154, width: 48, height: 86, fill: pal.blue });
  el('circle', { cx: 236, cy: 200, r: 3, fill: pal.yellow });
  // 家への道しるべ（右）
  el('rect', { x: 368, y: 190, width: 5, height: 50, fill: pal.woodDark });
  el('path', { d: 'M 350 176 L 384 176 L 394 186 L 384 196 L 350 196 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 2 });
  el('path', { d: 'M 360 192 L 360 184 L 367 178 L 374 184 L 374 192 Z', fill: pal.mint });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  const xf = (t) => lerp(30, 150, easeInOut(seg(t, 0.2, 1.7)));
  return {
    update(t) {
      const p = walkPose(xf, t, 30);
      const knock = t > 1.8 && t < 2.6, kp = knock ? Math.max(0, Math.sin((t - 1.8) * 16)) : 0;
      const op = easeInOut(seg(t, 2.7, 3.1));
      door.setAttribute('transform', `translate(196 0) scale(${lerp(1, 0.12, op)} 1) translate(-196 0)`);
      aunt.g.setAttribute('opacity', op > 0.2 ? 1 : 0);
      aunt.pose({ armL: 10, armR: 8 + 140 * easeOut(seg(t, 3.2, 3.5)) + 15 * Math.sin(t * 9) * seg(t, 3.4, 3.6), mood: 'grin', look: 0.6, lift: 4 * hump(seg(t, 3.1, 3.4)) });
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.m > 0.05 ? p.armR : knock ? 70 + 14 * kp : 8 + 100 * easeOut(seg(t, 3.3, 3.6)), lean: p.lean + 3 * kp, mood: t > 3.0 ? 'grin' : 'smile', look: 0.6 });
      faceAt(b, 4, 0);
    }
  };
}
