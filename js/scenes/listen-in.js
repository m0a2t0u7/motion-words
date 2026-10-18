// listen in：二人がテーブルで話していると、まめが壁のかげから耳を寄せてこっそり聞く（例文 She was listening in on our talk.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, faceAt, walkPose } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '二人の会話'], [1.4, '壁にしのび寄る'], [2.8, 'こっそり聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 270, y: 196, width: 70, height: 7, rx: 3, fill: pal.wood }); el('rect', { x: 300, y: 203, width: 8, height: 34, fill: pal.woodDark });
  el('ellipse', { cx: 296, cy: 195, rx: 10, ry: 3, fill: pal.coffee });
  const A = k.buddy({ x: 242, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const B = k.buddy({ x: 372, y: FY, scale: 0.85, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const sa = say(k, 44, 30, -1), sb = say(k, 44, 30, 1);
  [sa, sb].forEach((s) => [-5, 5].forEach((y) => el('line', { x1: -13, x2: 13, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, s.g)));
  const b = k.buddy({ x: 40, y: FY, scale: 0.85 });
  // 部屋の仕切り壁（まめの手前）
  el('rect', { x: 166, y: 30, width: 22, height: 210, fill: '#E9E2D6' });
  el('rect', { x: 186, y: 30, width: 3, height: 210, fill: '#D7CEBF' });
  const xf = (t) => lerp(40, 146, easeInOut(seg(t, 0.6, 1.9)));
  return {
    update(t) {
      const ta = Math.sin(t * 2.2) > 0;
      A.pose({ armR: 8 + 30 * Math.max(0, Math.sin(t * 4)) * ta, mood: ta && Math.sin(t * 13) > 0 ? 'open' : 'smile', look: 0.5 });
      B.pose({ armR: 8 + 30 * Math.max(0, Math.sin(t * 4)) * !ta, mood: !ta && Math.sin(t * 13) > 0 ? 'open' : 'smile', look: 0.5 });
      sa.show(ta ? 1 : 0.0, 260, 130); sb.show(!ta ? 1 : 0, 354, 126);
      const p = walkPose(xf, t, 40, 6, 0.08);
      const ear = easeOut(seg(t, 2.0, 2.4));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.m > 0.2 ? 30 : lerp(30, 150, ear), lean: 10 * ear + 14 * p.m, squash: 1 - 0.06 * p.m, lift: 0, mood: t > 2.6 ? 'grin' : 'flat', look: 0.9, blink: hump(seg(t, 3.3, 3.45)) });
      faceAt(b, 6, 0);
    }
  };
}
