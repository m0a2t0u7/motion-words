// backpack：机の上のリュックに、お弁当と水筒を順に手で入れる（例文 He put his lunch and a water bottle in his backpack.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, homeBg, backTable, track, face } from './bag.js';

// リュック（原点＝底中央）。back：背面と口、front：前ポケット
export function backpackParts(k, col = '#59C27A', dark = '#3E9F5E') {
  const { el } = k;
  const back = k.g({});
  el('path', { d: 'M -26 0 L -28 -50 Q -28 -66 0 -66 Q 28 -66 28 -50 L 26 0 Z', fill: dark }, back);
  el('path', { d: 'M -12 -66 Q 0 -80 12 -66', stroke: dark, 'stroke-width': 4, fill: 'none' }, back);
  el('ellipse', { cx: 0, cy: -52, rx: 22, ry: 5, fill: '#2C6E42' }, back);
  const front = k.g({});
  el('path', { d: 'M -27 0 L -28 -48 Q 0 -40 28 -48 L 27 0 Z', fill: col }, front);
  el('rect', { x: -18, y: -28, width: 36, height: 22, rx: 6, fill: dark, opacity: 0.5 }, front);
  el('line', { x1: -14, y1: -28, x2: 14, y2: -28, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.6 }, front);
  return { back, front };
}
export function lunchBox(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -15, y: -9, width: 30, height: 18, rx: 4, fill: '#F2A65A' }, g);
  k.el('rect', { x: -15, y: -9, width: 30, height: 6, rx: 3, fill: '#E07B39' }, g);
  k.el('path', { d: 'M -3 -9 v 18 M 3 -9 v 18', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.7 }, g);
  return g;
}
export function bottle(k, parent, col = '#6AA8F7') {
  const g = k.g({}, parent);
  k.el('rect', { x: -6, y: -22, width: 12, height: 6, rx: 2, fill: k.pal.ink }, g);
  k.el('rect', { x: -8, y: -17, width: 16, height: 34, rx: 6, fill: col }, g);
  k.el('rect', { x: -5, y: -12, width: 3, height: 22, rx: 1.5, fill: '#fff', opacity: 0.45 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'お弁当を取る'], [1.5, 'リュックに入れる'], [2.4, '水筒も入れた']] };

export function create(k) {
  const { tf } = k, S = 1.2, FY = 236;
  homeBg(k, { FY, winX: 160, winW: 84 });
  const TOP = backTable(k, 70, 360, 192, FY), BPX = 120, BS = 0.9;
  k.shadow(BPX, TOP + 1, 26, 3);
  const bp = backpackParts(k);
  tf(bp.back, BPX, TOP, 0, BS);
  const L0 = { x: 278, y: TOP - 9 }, B0 = { x: 312, y: TOP - 17 }, M = TOP - 66 * BS;
  const lunch = lunchBox(k), bot = bottle(k);
  tf(bp.front, BPX, TOP, 0, BS); bp.front.parentNode.appendChild(bp.front);
  const b = k.buddy({ x: 240, y: FY, scale: S });
  // 歩く位置：お弁当の前 → リュックの前 → 水筒の前 → リュックの前
  const xs = track([[0, 240, 0], [0.4, 240, 0], [1.1, 188, 0], [1.9, 188, 0], [2.6, 272, 0], [2.9, 272, 0], [3.6, 188, 0]]);
  const xf = (t) => xs(t).x;
  return {
    update(t) {
      const w = walkTo(xf, t, 240, t < 1.5 ? 1 : (t < 2.8 ? -1 : 1));
      let f = w.facing; if (t < 0.45) f = 1; if (t > 1.1 && t < 1.95) f = -1; if (t > 2.6 && t < 2.95) f = 1; if (t > 3.6) f = -1;
      P(b, { x: w.x, walk: w.walk, facing: f, armL: w.armL, look: 0.5, blink: blinkAt(t), mood: t > 3.9 ? 'grin' : 'smile' });
      // 手を伸ばす対象
      let tx = null, ty = null;
      const g1 = seg(t, 0.05, 0.4), p1 = seg(t, 1.1, 1.75), g2 = seg(t, 2.6, 2.95), p2 = seg(t, 3.6, 4.2);
      if (t < 0.45) { tx = L0.x; ty = lerp(TOP - 30, L0.y - 4, Math.sin(g1 * Math.PI)); }
      else if (t > 1.1 && t < 1.95) { tx = BPX + 4; ty = lerp(M - 24, M + 6, Math.sin(p1 * Math.PI * 0.5)); }
      else if (t > 2.6 && t < 2.95) { tx = B0.x; ty = lerp(TOP - 34, B0.y - 12, Math.sin(g2 * Math.PI)); }
      else if (t > 3.6 && t < 4.15) { tx = BPX + 6; ty = lerp(M - 34, M - 6, Math.sin(clamp(p2 * 1.6) * Math.PI * 0.5)); }
      if (tx !== null) b.pose({ lean: 6, armR: reach(b, S, 'R', tx, ty) });
      else b.pose({ armR: t > 4.1 ? lerp(70, 10, easeOut(seg(t, 4.1, 4.4))) : 70 });
      face(b, 4, 1);
      const hh = hp(b, S, 'R');
      if (t < 0.25) tf(lunch, L0.x, L0.y);
      else if (t < 1.6) tf(lunch, hh.x, hh.y + 7);
      else tf(lunch, BPX, M + 22);
      if (t < 2.78) tf(bot, B0.x, B0.y);
      else if (t < 3.95) tf(bot, hh.x, hh.y + 16);
      else tf(bot, BPX + 8, M + 12);
      lunch.setAttribute('opacity', t > 2 ? 0 : 1);
    }
  };
}
