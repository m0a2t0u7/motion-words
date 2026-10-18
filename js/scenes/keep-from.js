// keep from：相手のおかしな踊りに、口を押さえて笑いをこらえようとするが、こらえきれずに吹き出す（例文 I couldn't keep from laughing.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'おかしな踊り'], [1.4, 'こらえる'], [2.8, '吹き出した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 160, y: 56, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.05;
  const C = k.buddy({ x: 290, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 相手の変な帽子とめがね
  const hat = el('path', { d: 'M -20 -80 L 0 -122 L 20 -80 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, C.body);
  el('circle', { cx: 0, cy: -124, r: 6, fill: pal.red }, C.body);
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 8, fill: 'none', stroke: pal.ink, 'stroke-width': 2.5 }, C.body.children[3]));
  const A = k.buddy({ x: 120, y: FY, scale: S });
  const fl = frontL(A, S);
  const burst = g({});
  for (let i = 0; i < 6; i++) { const a = (i * 60 - 30) * Math.PI / 180; el('line', { x1: Math.cos(a) * 14, y1: Math.sin(a) * 14, x2: Math.cos(a) * 24, y2: Math.sin(a) * 24, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, burst); }
  const tear = el('path', { d: 'M 0 -5 Q 4 0 0 4 Q -4 0 0 -5 Z', fill: pal.water });
  const cheeks = A.body.children[3].children;
  return {
    update(t) {
      const d = Math.sin(t * 9);
      C.pose({ armR: 120 + 50 * d, armL: 120 - 50 * d, lean: 10 * Math.sin(t * 4.5), lift: 8 * Math.abs(Math.sin(t * 4.5)), walk: d * 0.5, mood: 'grin', look: 0.3, squash: 1 + 0.04 * d });
      const cover = easeInOut(seg(t, 0.9, 1.3)) * (1 - easeOut(seg(t, 2.7, 2.9)));
      const strain = seg(t, 1.3, 2.7);
      const laugh = seg(t, 2.8, 4.4);
      const shake = laugh > 0 ? Math.sin(t * 28) : Math.sin(t * 40) * 0.4 * strain;
      A.pose({ armR: lerp(lerp(10, 150, cover), lerp(10, 60, laugh > 0 ? 1 : 0), laugh > 0 ? easeOut(seg(t, 2.7, 2.95)) : 0),
        armL: 10, lean: laugh > 0 ? -10 + 4 * shake : 2 * shake, squash: (laugh > 0 ? 1 + 0.05 * shake : 1 + 0.06 * strain), lift: laugh > 0 ? 4 * Math.abs(shake) : 0,
        mood: laugh > 0 ? 'grin' : cover > 0.5 ? 'flat' : 'smile', blink: laugh > 0 ? 0.85 : strain > 0.6 ? 0.5 : 0, look: 0.5 });
      fl.set(lerp(lerp(8, -40, cover), 40 + 20 * shake, laugh > 0 ? 1 : 0));
      // こらえて顔が赤くなる
      for (let i = 2; i < 4; i++) cheeks[i].setAttribute('opacity', 0.45 + 0.5 * strain * (laugh > 0 ? 0.5 : 1));
      for (let i = 2; i < 4; i++) cheeks[i].setAttribute('r', 4 + 2 * strain);
      const bq = backOut(seg(t, 2.8, 3.1));
      burst.setAttribute('opacity', laugh > 0 ? 1 : 0);
      tf(burst, 120, FY - 116 + 2 * shake, t * 20, Math.max(0.01, bq));
      const tq = seg(t, 3.2, 4.0);
      tear.setAttribute('opacity', hump(tq)); tf(tear, 134 + 6 * tq, FY - 70 + 16 * tq);
    }
  };
}
