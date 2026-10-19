// branch：木から横にのびた枝の上に、ねこがちょこんと座ってしっぽをゆらす。まめが見上げる（例文 A cat is sitting on the branch.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, treeG, P, blinkAt, point } from './nature.js';

// 座ったねこ（原点＝おしりの下、右向き）
export function cat(k, parent, col = '#9AA3B2', dark = '#7C8596') {
  const g = k.g({}, parent);
  const tail = k.g({}, g);
  k.el('path', { d: 'M 0 0 Q 4 16 -4 26', stroke: col, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, tail);
  k.el('ellipse', { cx: 2, cy: -12, rx: 12, ry: 13, fill: col }, g);
  const head = k.g({}, g); k.tf(head, 6, -30);
  k.el('path', { d: 'M -10 -4 L -8 -16 L -2 -9 Z M 10 -4 L 8 -16 L 2 -9 Z', fill: dark }, head);
  k.el('circle', { r: 10, fill: col }, head);
  k.el('circle', { cx: -3.5, cy: -1, r: 1.6, fill: k.pal.ink }, head); k.el('circle', { cx: 4, cy: -1, r: 1.6, fill: k.pal.ink }, head);
  k.el('path', { d: 'M -1 3 l 1.5 1.5 l 1.5 -1.5', stroke: k.pal.ink, 'stroke-width': 1.2, fill: 'none' }, head);
  k.el('path', { d: 'M -4 -2 v 12 M 8 -2 v 12', stroke: dark, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  return { g, tail, head };
}

export const meta = { duration: 4.2, beats: [[0, '木の枝'], [1.2, 'ねこがいる'], [2.6, '枝に座っている']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 240 });
  hills(k, FY);
  const tr = treeG(k, 1.6); tf(tr.g, 110, FY + 2);
  const br = g({}); tf(br, 116, 140);
  el('path', { d: 'M 0 6 Q 70 -4 160 -2 L 160 4 Q 70 6 0 16 Z', fill: '#A9845F' }, br);
  el('path', { d: 'M 150 -2 q 10 -8 18 -4', stroke: '#A9845F', 'stroke-width': 3, fill: 'none' }, br);
  el('circle', { cx: 165, cy: -8, r: 7, fill: '#7FCB92' }, br);
  const ct = cat(k, br);
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  return {
    update(t) {
      // 枝はねこの重みで少ししなる
      tf(br, 116, 140, 1.5 + 0.4 * Math.sin(t * 2));
      tf(ct.g, 120, -1);
      ct.tail.setAttribute('transform', `rotate(${(18 * Math.sin(t * 3)).toFixed(1)})`);
      tf(ct.head, 6, -30, 8 * Math.sin(t * 1.3) * seg(t, 1.0, 1.5) + (t > 2.6 ? 12 : 0));
      const pt = easeOut(seg(t, 1.2, 1.7));
      P(b, { facing: -1, look: -0.6, mood: t > 2.6 ? 'grin' : t > 1.2 ? 'open' : 'smile', blink: blinkAt(t), armL: 10 });
      b.body.children[3].setAttribute('transform', 'translate(0 -4)');
      b.pose({ armR: lerp(8, point(b, S, 'R', 238, 118), pt) });
    }
  };
}
