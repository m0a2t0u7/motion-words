// field：さくの向こうの広い野原で、2頭の牛が頭を下げて草をもぐもぐ食べている。まめがさくにもたれて見る（例文 Cows are eating grass in the field.）
// このファイルは木のさく（rails）と草むら（grassTuft）のヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, hills, treeG, tufts, cloudG } from './nature.js';
import { beast } from './animal.js';

export function rails(k, x0, x1, y, h = 44, gap = 60, parent) {
  const g = k.g({}, parent), c = '#C9A577';
  for (let x = x0; x <= x1; x += gap) k.el('rect', { x: x - 4, y: y - h, width: 8, height: h + 4, rx: 2, fill: '#B48D5C' }, g);
  [h * 0.75, h * 0.35].forEach((d) => k.el('rect', { x: x0 - 6, y: y - d, width: x1 - x0 + 12, height: 6, rx: 2, fill: c }, g));
  return g;
}
// 草むら（原点＝根元）。set(残り 0..1)
export function grassTuft(k, parent, col = '#6BBF6F') {
  const g = k.g({}, parent), bl = k.g({}, g);
  k.el('path', { d: 'M -10 0 L -7 -14 L -4 0 M -4 0 L 0 -18 L 4 0 M 4 0 L 8 -13 L 11 0 Z', fill: col, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bl);
  return { g, set(x, y, left = 1) { k.tf(g, x, y); k.tf(bl, 0, 0, 0, 1, Math.max(0.15, left)); } };
}

export const meta = { duration: 4.2, beats: [[0, '広い野原'], [1.2, '牛が草を食べる'], [3.0, 'もぐもぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 226, top: '#CDE9FA', bot: '#F2FAFE', ground: '#A9D88F', edge: '#97CB7E' });
  tf(cloudG(k, 80, 30), 300, 50);
  hills(k, FY, '#C9E7B4', '#B7DE9E');
  tf(treeG(k, 0.6).g, 360, FY - 30);
  tufts(k, FY, 0, 400, '#8CC973', 10);
  const cows = [[180, FY + 6, 0.9, 0], [310, FY + 30, 1.0, 1.3]].map(([x, y, s, off]) => ({ c: beast(k, 'cow'), x, y, s, off, gr: [0, 1].map(() => grassTuft(k)) }));
  const me = k.buddy({ x: 50, y: 286, scale: 0.9 });
  rails(k, 0, 120, 286, 48, 56);
  return {
    update(t) {
      cows.forEach(({ c, x, y, s, off, gr }, i) => {
        const dn = easeInOut(seg(t, 0.4 + off * 0.3, 1.2 + off * 0.3)), chew = t > 1.2 + off * 0.3 ? Math.sin((t + off) * 11) : 0;
        c.set({ x, y, s, head: 20 * dn + 5 * chew * dn, drop: 26 * dn, tilt: 4 * dn, tail: Math.sin(t * 2 + i) * 10 });
        const hd = c.headAt({ x, y, s });
        gr.forEach((q, j) => q.set(hd.x + (22 + j * 12) * s, y + 2, 1 - 0.6 * seg(t, 1.4 + off * 0.3 + j * 0.6, 3.6)));
      });
      P(me, { x: 50, y: 286, armL: 60, armR: 64, lean: 6, look: 0.8, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
    }
  };
}
