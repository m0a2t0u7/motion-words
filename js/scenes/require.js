// require：配達の仕事の募集。担当者が「運転免許が必要」と掲示を指し、まめが免許証を見せて車のかぎを受け取る（例文 This job requires a driver's license.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { desk } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { walk, path } from './queue-up.js';

// 運転免許証（中心原点）
export function license(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -16, y: -10, width: 32, height: 20, rx: 3, fill: '#E9F6EF', stroke: pal.green, 'stroke-width': 2 }, g);
  k.el('rect', { x: -12, y: -6, width: 10, height: 12, rx: 2, fill: pal.mint }, g);
  [-3, 2].forEach((y) => k.el('line', { x1: 2, x2: 12, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2 }, g));
  return g;
}
// 配達トラックの絵（中心原点）
export function truckIcon(k, parent, c) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -22, y: -14, width: 28, height: 20, rx: 2, fill: c || pal.blue }, g);
  k.el('path', { d: 'M 6 -8 L 16 -8 L 22 0 L 22 6 L 6 6 Z', fill: c || pal.blue }, g);
  k.el('rect', { x: 9, y: -5, width: 7, height: 5, fill: '#fff' }, g);
  [-13, 13].forEach((x) => k.el('circle', { cx: x, cy: 7, r: 4.5, fill: pal.ink }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '免許が必要'], [1.7, '免許を見せる'], [3.2, 'かぎを受け取る']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 1.0;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 募集の掲示：トラック＝免許証
  el('rect', { x: 176, y: 34, width: 120, height: 88, rx: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  k.text(236, 50, 'JOB', { 'font-size': 13, fill: pal.blueDark });
  tf(truckIcon(k), 208, 88);
  k.text(240, 90, '=', { 'font-size': 18 });
  const lic0 = license(k); tf(lic0, 268, 86, 0, 0.95);
  const ring = el('rect', { x: 248, y: 70, width: 40, height: 32, rx: 6, fill: 'none', stroke: pal.red, 'stroke-width': 3 });
  const boss = k.buddy({ x: 326, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  desk(k, 270, 120, FY);
  const me = k.buddy({ x: 40, y: FY, scale: S });
  const lic = license(k);
  const key = g({});
  el('circle', { cx: 0, cy: 0, r: 6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('path', { d: 'M 6 0 L 20 0 M 15 0 L 15 5 M 19 0 L 19 4', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, key);
  const xf = path([[0, 40], [1.4, 200]]);
  return {
    update(t) {
      const pt = easeInOut(seg(t, 0.4, 0.8)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const show = easeOut(seg(t, 1.8, 2.3)), give = easeInOut(seg(t, 2.9, 3.4));
      walk(me, xf, t, { look: 0.6, blink: blinkAt(t) });
      if (t > 1.4) P(me, { x: 200, look: 0.7, blink: blinkAt(t), armR: lerp(10, 112, show) * (1 - give) + lerp(0, 76, give), armL: 10, mood: t > 3.4 ? 'grin' : 'smile', lift: 8 * hump(seg(t, 3.6, 4.0)) });
      // 掲示の免許の枠が光る
      ring.setAttribute('opacity', 0.3 + 0.7 * pt + 0.7 * hump(seg(t, 2.3, 2.9)));
      // 担当者：掲示を指す→免許を見てうなずく→かぎを渡す
      P(boss, { facing: -1, look: 0.6, blink: blinkAt(t, 1), mood: t > 2.3 ? 'grin' : 'smile', armL: 10, armR: 10 });
      const aim = t < 2.4 ? reach(boss, S, 'R', 262, 92) : reach(boss, S, 'R', 236, 150);
      boss.pose({ armR: t < 2.4 ? lerp(10, aim, pt) : lerp(10, aim, give) });
      boss.body.children[3].setAttribute('transform', `translate(5 ${(t > 2.3 && t < 2.9 ? 3 * Math.abs(Math.sin((t - 2.3) * 10)) : 0).toFixed(2)})`);
      // 免許証は まめの手に
      const h = hp(me, S, 'R');
      tf(lic, h.x + 4, h.y - 6, -8 * (1 - show), show > 0 ? 1 : 0.001);
      lic.setAttribute('opacity', t > 1.8 && t < 2.95 ? 1 : 0);
      // かぎ：担当者の手 → まめの手
      const bh = hp(boss, S, 'R');
      const kx = t < 3.4 ? bh.x - 10 : h.x - 4, ky = t < 3.4 ? bh.y : h.y - 2;
      tf(key, kx, ky, t < 3.4 ? 180 : -20 + 10 * wobble(seg(t, 3.4, 4.0), 2, 4));
      key.setAttribute('opacity', t > 2.9 ? 1 : 0);
    }
  };
}
