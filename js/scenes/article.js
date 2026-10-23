// article：まめが新聞を手に持って、宇宙の記事を読む（例文 I read an interesting article about space.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, held, hp, cloud, faceAt } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '新聞を開く'], [1.0, '記事を読む'], [2.8, 'おもしろい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = roomBg(k, 'home', 240);
  k.shadow(150, FY + 2, 26, 5);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const np = g({});
  el('rect', { x: -26, y: -64, width: 52, height: 68, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, np);
  el('rect', { x: -21, y: -59, width: 42, height: 8, rx: 2, fill: pal.ink }, np);
  el('rect', { x: -21, y: -46, width: 22, height: 20, rx: 2, fill: '#2B3A67' }, np);
  el('circle', { cx: -10, cy: -36, r: 6, fill: pal.yellow }, np);
  el('ellipse', { cx: -10, cy: -36, rx: 10, ry: 2.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 }, np);
  [-46, -39, -32].forEach((y) => el('line', { x1: 2, x2: 21, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, np));
  [-20, -12, -4].forEach((y) => el('line', { x1: -21, x2: 21, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, np));
  const scan = el('rect', { x: -22, y: -50, width: 44, height: 7, rx: 3, fill: pal.yellow, opacity: 0.4 }, np);
  const c = cloud(k, 100, 66, -1);
  const planet = g({}, c.g);
  el('circle', { r: 15, fill: pal.coral }, planet);
  el('ellipse', { rx: 26, ry: 6, fill: 'none', stroke: pal.yellow, 'stroke-width': 3 }, planet);
  [[-34, -14], [32, -12], [30, 16]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.6, fill: pal.yellow }, planet));
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.1, 0.8)), rd = seg(t, 1.0, 2.8), done = seg(t, 2.8, 3.2);
      P(b, { x: 150, armR: lerp(20, 78, up), armL: 8, mood: done > 0 ? 'grin' : 'flat', blink: blinkAt(t), look: 0.5 });
      faceAt(b, 4, 1 + 4 * hump(seg(t, 1.0, 2.8)));
      held(k, b, S, np, 'R', 78);
      k.set(scan, { y: -52 + rd * 38, opacity: rd > 0 && rd < 1 ? 0.5 : 0 });
      c.show(done, 270, 100);
      tf(planet, 0, -4, hump(done) * 8 + done * 10);
    }
  };
}
