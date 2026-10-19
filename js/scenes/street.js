// street：車の通らない静かな通り。まめは家の並ぶ通りを歩いて、自分の家の前で立ち止まる（例文 I live on a quiet street.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, face } from './bag.js';
import { tree } from './run-after.js';

export function house(k, x, FY, col, roof, w = 70, h = 64) {
  const { el, pal } = k, g = k.g({});
  el('rect', { x: x - w / 2, y: FY - h, width: w, height: h, fill: col }, g);
  el('path', { d: `M ${x - w / 2 - 8} ${FY - h} L ${x} ${FY - h - 34} L ${x + w / 2 + 8} ${FY - h} Z`, fill: roof }, g);
  el('rect', { x: x - 10, y: FY - 32, width: 20, height: 32, rx: 2, fill: pal.woodDark }, g);
  el('rect', { x: x - w / 2 + 8, y: FY - h + 12, width: 16, height: 14, rx: 2, fill: '#DDEFFA' }, g);
  el('rect', { x: x + w / 2 - 24, y: FY - h + 12, width: 16, height: 14, rx: 2, fill: '#DDEFFA' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '静かな通り'], [1.4, '家が並ぶ'], [3.2, 'ここに住んでいる']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.9, FY = 210;
  k.backdrop({ floorY: FY });
  house(k, 50, FY, '#F3E6DC', '#C98D5B'); tree(k, 112, FY, 0.6);
  house(k, 180, FY, '#E4EEF7', '#6A93C6'); tree(k, 245, FY, 0.6);
  house(k, 320, FY, '#FCE6D6', pal.coral, 76, 70);
  el('rect', { x: 0, y: FY, width: 400, height: 14, fill: '#E3E8EE' });
  el('rect', { x: 0, y: FY + 14, width: 400, height: 76, fill: '#C3CAD5' });
  el('rect', { x: 0, y: FY + 14, width: 400, height: 3, fill: '#AEB7C4' });
  // 寝ている猫
  const cat = k.g({}); tf(cat, 120, FY + 12);
  el('ellipse', { cx: 0, cy: -6, rx: 13, ry: 7, fill: '#C9D1DC' }, cat); el('circle', { cx: 11, cy: -9, r: 6, fill: '#C9D1DC' }, cat);
  el('path', { d: 'M 8 -14 l 2 -5 l 3 4 M 13 -14 l 3 -4 l 1 5', fill: '#C9D1DC', stroke: '#C9D1DC' }, cat);
  const zz = k.text(132, FY - 18, 'z', { 'font-size': 12, fill: pal.sub });
  const birds = [0, 1].map(() => el('path', { d: 'M -6 0 Q -3 -4 0 0 Q 3 -4 6 0', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }));
  const b = k.buddy({ x: 20, y: FY + 12, scale: S });
  const xf = (t) => lerp(10, 300, easeInOut(seg(t, 0.2, 3.2)));
  return {
    update(t) {
      const w = walkTo(xf, t, 10);
      P(b, { x: w.x, y: FY + 12, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, look: 0.5, blink: blinkAt(t), mood: t > 3.3 ? 'grin' : 'smile' });
      if (t > 3.3) b.pose({ facing: 1, armR: 8 + 120 * hump(seg(t, 3.4, 4.2)) });
      face(b, t > 3.3 ? 0 : 3, 0);
      tf(zz, 132 + 4 * Math.sin(t * 2), FY - 18 - (t * 8) % 12);
      zz.setAttribute('opacity', 1 - ((t * 8) % 12) / 12);
      birds.forEach((n, i) => tf(n, 60 + i * 24 + t * 30, 50 + i * 10 + 3 * Math.sin(t * 6 + i)));
    }
  };
}
