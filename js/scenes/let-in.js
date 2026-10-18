// let in：部屋の中から玄関ドアを開け、外にいる相手を中へ入れる（例文 I opened the door and let him in.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach } from './dig.js';
import { person, path, walk, door } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, 'ドアへ行く'], [1.6, 'ドアを開ける'], [3.6, '中へ入れた']] };

// 室内から見た玄関（右）。外の景色→外の人→ドア板の順に重ねる
export function entrance(k, FY, { x = 270, w = 84, h = 124, hinge = 'R', color } = {}) {
  const { el, pal } = k;
  el('rect', { x: x - 8, y: FY - h - 8, width: w + 16, height: h + 8, rx: 3, fill: pal.woodDark });
  el('rect', { x, y: FY - h, width: w, height: h, fill: '#D9EEF9' });
  el('rect', { x, y: FY - 30, width: w, height: 30, fill: '#CDEBCF' });
  el('circle', { cx: x + w * 0.7, cy: FY - 60, r: 18, fill: '#9ED9B0' });
  const mid = k.g({});
  const D = door(k, { x, y: FY - h, w, h, hinge, color: color || pal.blue });
  return { mid, D };
}

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 86, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const E = entrance(k, FY, { x: 280 });
  const S = 0.85;
  const guest = person(k, 'coral', { parent: E.mid, x: 322, y: FY, scale: S, facing: -1 });
  const me = k.buddy({ x: 120, y: FY, scale: S });
  const mxf = path([[0, 120], [1.0, 238], [1.9, 238], [2.4, 150]]);
  const gxf = path([[2.0, 322], [3.6, 222]]);
  return {
    update(t) {
      const op = easeInOut(seg(t, 1.1, 1.8));
      E.D.set(op);
      const kn = E.D.knob(op);
      const p = walk(me, mxf, t, { facing: t < 1.9 ? 1 : 1, look: 0.6, mood: t > 2.4 ? 'grin' : 'smile' });
      if (t > 0.8 && t < 1.9) {
        const a = reach(me, S, 'R', kn.x, kn.y);
        me.pose({ armR: lerp(p.armR, a, easeOut(seg(t, 0.8, 1.05))), lean: 6 - 10 * hump(seg(t, 1.1, 1.8)) });
      } else if (t > 2.4) me.pose({ armR: 100 + 12 * Math.sin((t - 2.4) * 7), armL: 10, lean: 2 });
      walk(guest, gxf, t, { facing: -1, look: -0.4, mood: t > 1.8 ? 'grin' : 'flat' });
      guest.g.setAttribute('opacity', t < 1.15 ? 0 : 1);
    }
  };
}
