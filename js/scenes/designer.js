// designer：ファッションデザイナーのまめがマネキンに布を当ててピンで留め、新しいドレスができあがる（例文 She is a fashion designer.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, held, hp, P, blinkAt, wear, sc, pop } from './member.js';
import { sparkle } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '布を当てる'], [1.4, 'ピンで留める'], [3.2, '新しい服']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F7EEF2' });
  // 壁のデザイン画と布の棚
  [[20, '#F28CB1'], [70, '#7FB3E8']].forEach(([x, c]) => { el('rect', { x, y: 40, width: 40, height: 56, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }); el('path', { d: `M ${x + 20} 50 l -6 6 l 2 26 l 8 0 l 2 -26 Z`, fill: c }); el('circle', { cx: x + 20, cy: 48, r: 3, fill: pal.ink }); });
  [['#F28CB1', 330], ['#FFCF5C', 348], ['#7FB3E8', 366]].forEach(([c, x]) => el('rect', { x, y: 120, width: 14, height: 30, rx: 3, fill: c }));
  el('rect', { x: 320, y: 150, width: 66, height: 5, fill: pal.woodDark });
  // マネキン（原点＝足元）
  const MX = 262;
  k.shadow(MX, FY + 1, 22, 4);
  el('rect', { x: MX - 2, y: FY - 70, width: 4, height: 66, fill: pal.woodDark });
  el('path', { d: `M ${MX - 18} ${FY} L ${MX + 18} ${FY}`, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  el('path', { d: `M ${MX - 16} ${FY - 150} Q ${MX} ${FY - 158} ${MX + 16} ${FY - 150} L ${MX + 12} ${FY - 120} Q ${MX + 18} ${FY - 104} ${MX + 14} ${FY - 96} L ${MX - 14} ${FY - 96} Q ${MX - 18} ${FY - 104} ${MX - 12} ${FY - 120} Z`, fill: '#EADBC8' });
  el('rect', { x: MX - 4, y: FY - 164, width: 8, height: 14, fill: pal.woodDark });
  // ドレス（下から伸びる）
  const dress = g({ 'clip-path': k.clip((c) => { k.dressClip = el('rect', { x: MX - 60, y: FY - 160, width: 120, height: 0 }, c); }) });
  el('path', { d: `M ${MX - 16} ${FY - 148} L ${MX + 16} ${FY - 148} L ${MX + 13} ${FY - 118} L ${MX + 40} ${FY - 60} Q ${MX} ${FY - 52} ${MX - 40} ${FY - 60} L ${MX - 13} ${FY - 118} Z`, fill: '#F28CB1' }, dress);
  el('path', { d: `M ${MX - 13} ${FY - 118} L ${MX + 13} ${FY - 118}`, stroke: '#fff', 'stroke-width': 4 }, dress);
  const clipR = k.dressClip;
  // 布（まめの手に持つ）
  const cloth = el('path', { d: 'M 0 0 L 22 0 L 26 40 L -4 40 Z', fill: '#F28CB1' });
  const pins = [0, 1, 2].map(() => el('circle', { r: 2.4, fill: pal.yellowDark }));
  const b = k.buddy({ x: 186, y: FY, scale: S, facing: 1 }); wear(k, b, 'beret', '#5B4A55');
  const sp = [0, 1, 2].map(() => sparkle(k));
  return {
    update(t) {
      const hold = 1 - seg(t, 1.3, 1.5);
      const pinI = clamp(Math.floor((t - 1.5) / 0.5), -1, 2);
      const pinPts = [[MX - 10, FY - 140], [MX + 10, FY - 120], [MX - 4, FY - 90]];
      let tg;
      if (t < 1.4) tg = { x: lerp(220, MX - 14, easeInOut(seg(t, 0.2, 1.0))), y: FY - 130 };
      else if (t < 3.0) { const [x, y] = pinPts[Math.max(0, pinI)]; const q = ((t - 1.5) % 0.5) / 0.5; tg = { x: x - 8 + 6 * hump(q), y }; }
      else tg = { x: MX - 30, y: FY - 150 };
      P(b, { lean: 6, look: 0.8, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : 'flat', armL: t > 3.2 ? 8 + 150 * hump(seg(t, 3.2, 4.4)) : 14 });
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y) });
      const h = hp(b, S, 'R', 30);
      tf(cloth, h.x - 4, h.y - 6, 0, sc(hold));
      pins.forEach((p, i) => tf(p, pinPts[i][0], pinPts[i][1], 0, pop(seg(t, 1.7 + i * 0.5, 1.85 + i * 0.5))));
      const grow = easeInOut(seg(t, 1.3, 3.0));
      k.set(clipR, { height: 110 * grow });
      sp.forEach((s, i) => { const q = seg(t, 3.1 + i * 0.15, 4.0 + i * 0.1); tf(s, MX - 30 + i * 30, FY - 170 + (i % 2) * 40 - 10 * q, 0, sc(hump(q))); });
    }
  };
}
