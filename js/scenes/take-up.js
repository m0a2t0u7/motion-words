// take up：春（窓の外に桜）。まめがスタンドのギターを手に取り、構えて弾き始める（例文 He took up the guitar last spring.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait, hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '春、ギター'], [1.5, '手に取る'], [3.0, '弾き始めた']] };

export function guitar(k, parent) {
  const { el, g, pal } = k;
  const gt = g({}, parent);
  el('rect', { x: -3.5, y: -64, width: 7, height: 46, rx: 2, fill: '#7A5236' }, gt);
  el('rect', { x: -5.5, y: -74, width: 11, height: 12, rx: 3, fill: '#5E3E28' }, gt);
  el('circle', { cx: 0, cy: -10, r: 15, fill: '#E39B57' }, gt);
  el('circle', { cx: 0, cy: 12, r: 19, fill: '#E39B57' }, gt);
  el('circle', { cx: 0, cy: 4, r: 6, fill: '#5E3E28' }, gt);
  el('rect', { x: -8, y: 18, width: 16, height: 4, rx: 1, fill: '#5E3E28' }, gt);
  el('line', { x1: 0, y1: -70, x2: 0, y2: 20, stroke: '#fff', 'stroke-width': 1, opacity: 0.7 }, gt);
  return gt;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓の外の桜
  el('rect', { x: 230, y: 40, width: 120, height: 86, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('path', { d: 'M 252 126 Q 262 96 290 86', stroke: pal.woodDark, 'stroke-width': 5, fill: 'none' });
  [[268, 72, 18], [296, 66, 22], [324, 80, 16], [282, 96, 14]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#F8C8D4' }));
  const petals = Array.from({ length: 5 }, () => el('ellipse', { rx: 3, ry: 2, fill: '#F5A9BC' }));
  // スタンド
  el('path', { d: 'M 330 236 L 340 196 L 350 236', stroke: pal.ink, 'stroke-width': 3, fill: 'none' });
  el('line', { x1: 340, y1: 196, x2: 340, y2: 150, stroke: pal.ink, 'stroke-width': 3 });
  k.shadow(340, 237, 20, 3);
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  const gt = guitar(k);
  const notes = [0, 1, 2].map(() => { const n = g({}); el('ellipse', { rx: 5, ry: 3.8, fill: pal.ink, transform: 'rotate(-20)' }, n); el('line', { x1: 4.5, y1: -1, x2: 4.5, y2: -16, stroke: pal.ink, 'stroke-width': 2 }, n); return n; });
  const xf = (t) => lerp(90, 300, easeInOut(seg(t, 0.2, 1.3))) - lerp(0, 110, easeInOut(seg(t, 1.9, 2.6)));
  return {
    update(t) {
      petals.forEach((p, i) => { const q = (t * 0.25 + i * 0.2) % 1; k.set(p, { cx: 340 - q * 90 + Math.sin(q * 12 + i) * 6, cy: 60 + q * 60, opacity: hump(q) }); });
      const p = gait(xf, t, 90);
      const grab = easeInOut(seg(t, 1.3, 1.7)), lift = easeInOut(seg(t, 1.6, 1.9));
      const play = seg(t, 2.6, 4.2), strum = play > 0 ? Math.sin(t * 16) * 14 : 0;
      const hold = easeInOut(seg(t, 2.6, 3.0));
      b.pose({ x: p.x, walk: p.walk, facing: t > 1.85 && t < 2.6 ? -1 : 1, lean: p.lean + 4 * grab * (1 - lift), look: hold > 0.5 ? 0.3 : 0.6,
        armR: lerp(lerp(p.armR, 100, grab), lerp(40, 54 + strum, hold), lift), armL: lerp(p.armL, 110, hold),
        mood: play > 0.2 ? 'grin' : 'smile', squash: 1 - 0.03 * Math.abs(Math.sin(t * 8)) * (play > 0 ? 1 : 0) });
      // ギター：スタンド→手→体の前に構える
      const h = hp(b, 0.95);
      let gx = 340, gy = 196, gr = 0;
      if (t > 1.6) { gx = h.x; gy = h.y + 4; gr = -8 * b.state.facing; }
      if (hold > 0) { const bx = b.state.x + 4, by = FY - 40; gx = lerp(gx, bx, hold); gy = lerp(gy, by, hold); gr = lerp(gr, 58, hold); }
      tf(gt, gx, gy, gr, 0.85);
      notes.forEach((n, i) => { const q = (seg(t, 2.9, 4.2) * 2 + i / 3) % 1; tf(n, b.state.x + 40 + q * 50, 150 - q * 50 - i * 8, 0, 0.9); n.setAttribute('opacity', play > 0.15 ? hump(q) : 0); });
    }
  };
}
