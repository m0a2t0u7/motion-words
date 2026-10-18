// crack：まめがやかんの熱湯をグラスに注ぐと、グラスにひびが走る（例文 The glass cracked when I poured hot water.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, 'やかんを持つ'], [1.5, '熱湯を注ぐ'], [3.0, 'ひびが入った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 50, width: 110, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  const S = 1.0;
  const me = k.buddy({ x: 150, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // グラス
  const GX = 226, GT = 164, GB = 200;
  k.shadow(GX, 202, 22, 3.5);
  const glass = g({}); tf(glass, GX, GB, 0, 1.35);
  const water = el('rect', { x: -12, y: 0, width: 24, height: 0, fill: '#BDE6F7', opacity: 0.9 }, glass);
  el('path', { d: `M -14 ${GT - GB} L -11 -1 Q 0 4 11 -1 L 14 ${GT - GB}`, fill: '#EAF6FC', opacity: 0.45, stroke: '#9CC3DC', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, glass);
  const cr = g({}, glass);
  const crackPaths = [
    'M 3 -36 L -2 -28 L 3 -22 L -3 -14 L 1 -6',
    'M -2 -28 L -9 -24 L -11 -17',
    'M 3 -22 L 10 -19 L 12 -12'
  ].map((d) => el('path', { d, fill: 'none', stroke: pal.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, cr));
  const shock = [0, 1, 2].map((i) => el('line', { x1: 0, y1: 0, x2: 0, y2: -8, stroke: pal.coralDark, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0 }, glass));
  // やかん（原点＝持ち手のにぎり）
  const ket = g({});
  el('path', { d: 'M 6 -18 Q -8 -30 -10 -10', fill: 'none', stroke: pal.ink, 'stroke-width': 3 }, ket);
  el('path', { d: 'M 18 -20 L 31 -26 L 33 -22 L 22 -12 Z', fill: '#8F9BAB' }, ket);
  el('rect', { x: 2, y: -26, width: 30, height: 30, rx: 10, fill: pal.coral }, ket);
  el('rect', { x: 8, y: -31, width: 18, height: 6, rx: 3, fill: pal.coralDark }, ket);
  el('ellipse', { cx: 11, cy: -14, rx: 3.6, ry: 8, fill: '#fff', opacity: 0.3 }, ket);
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const stream = el('rect', { x: 0, y: 0, width: 4, height: 0, rx: 2, fill: '#BDE6F7' });
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  const drop = el('ellipse', { rx: 2, ry: 3, fill: '#BDE6F7', opacity: 0 });

  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.3, 1.1)), tilt = easeInOut(seg(t, 1.0, 1.5)) * (1 - easeInOut(seg(t, 2.9, 3.5)));
      const startle = hump(seg(t, 2.5, 3.2));
      me.pose({ x: 150, armL: 8, lean: 3 - 3 * startle, look: 0.7, mood: t > 2.5 && t < 3.8 ? 'open' : 'smile', squash: 1 + 0.03 * startle, armR: 30 });
      const a = lerp(30, reach(me, S, 'R', 192, 168), lift * (1 - easeInOut(seg(t, 3.0, 3.8))));
      me.pose({ armR: a });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      const rot = 30 * tilt;
      tf(ket, h.x + 2, h.y + 10, rot, 1);
      // 注ぎ口の位置
      const r = rot * Math.PI / 180, lx = 31, ly = -23;
      const sx = h.x + 2 + lx * Math.cos(r) - ly * Math.sin(r), sy = h.y + 10 + lx * Math.sin(r) + ly * Math.cos(r);
      const pouring = t > 1.35 && t < 2.9;
      const lvl = easeInOut(seg(t, 1.4, 2.6)) * 24;
      const surf = GB - lvl * 1.35;
      const sOpen = pouring ? easeOut(seg(t, 1.35, 1.5)) * (1 - seg(t, 2.7, 2.9)) : 0;
      k.set(stream, { x: sx - 2 + (GX - sx) * 0 + (GX - 6 - sx) * 0, y: sy, width: 4, height: Math.max(0, surf - sy) * sOpen });
      stream.setAttribute('transform', `translate(${(GX - 4 - sx) * 0} 0)`);
      k.set(water, { y: -lvl, height: lvl });
      // 湯気
      steam.forEach((s, i) => {
        const q = ((t * 0.6 + i / 3) % 1);
        s.setAttribute('opacity', (lvl > 3 ? 0.7 : 0) * Math.sin(Math.PI * q));
        tf(s, GX - 10 + i * 10, GT - 14 - 16 * q, 0, 0.8);
      });
      // ひび：湯が少し溜まったところで走る
      const c0 = 2.55;
      crackPaths.forEach((p, i) => p.setAttribute('stroke-dashoffset', 1 - easeOut(seg(t, c0 + i * 0.15, c0 + 0.35 + i * 0.15))));
      tf(glass, GX + 2.4 * wobble(seg(t, c0, c0 + 0.7), 5, 6), GB, 0, 1.35);
      shock.forEach((s, i) => {
        const q = seg(t, c0, c0 + 0.45);
        const ang = [-60, 0, 60][i] * Math.PI / 180;
        s.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0);
        tf(s, Math.sin(ang) * (16 + 10 * q), -30 - Math.cos(ang) * (16 + 10 * q) + 10, [-60, 0, 60][i], 1);
      });
      const dq = seg(t, 3.3, 3.9);
      drop.setAttribute('opacity', dq > 0 && dq < 1 ? 1 : 0);
      k.set(drop, { cx: GX + 12, cy: lerp(GB - 12, GB + 0, dq * dq) });
    }
  };
}
