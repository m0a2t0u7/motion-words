// create：画家がイーゼルの白いキャンバスに筆で絵を描き上げ、一歩下がって眺める（例文 The artist created a beautiful picture.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { hp, reach, held } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '白い画面'], [1.4, '描いていく'], [4.0, '絵の完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  el('rect', { x: 30, y: 50, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 280, cy: 252, rx: 100, ry: 12, fill: '#EBE3D8' });
  // イーゼル
  const EX = 262, EY = 120;
  k.shadow(EX, FY + 2, 48, 6);
  el('line', { x1: EX - 30, y1: FY, x2: EX - 8, y2: EY + 70, stroke: pal.woodDark, 'stroke-width': 6, 'stroke-linecap': 'round' });
  el('line', { x1: EX + 30, y1: FY, x2: EX + 8, y2: EY + 70, stroke: pal.woodDark, 'stroke-width': 6, 'stroke-linecap': 'round' });
  el('rect', { x: EX - 54, y: EY - 2, width: 108, height: 84, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  const clipId = k.clip((c) => el('rect', { x: EX - 50, y: EY + 2, width: 100, height: 76 }, c));
  const pic = g({ 'clip-path': clipId });
  const sky = el('rect', { x: EX - 50, y: EY + 2, width: 100, height: 0, fill: '#BFE3F5' }, pic);
  const sun = g({}, pic); el('circle', { r: 11, fill: pal.yellow }, sun);
  const h1 = el('path', { d: `M ${EX - 50} ${EY + 78} Q ${EX - 20} ${EY + 36} ${EX + 10} ${EY + 78} Z`, fill: '#7FD3A0' }, pic);
  const h2 = el('path', { d: `M ${EX - 14} ${EY + 78} Q ${EX + 22} ${EY + 30} ${EX + 52} ${EY + 78} Z`, fill: '#59C27A' }, pic);
  const fl = g({}, pic); tf(fl, EX + 20, EY + 62);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#3BAE98', 'stroke-width': 2 }, fl);
  [0, 72, 144, 216, 288].forEach((a) => el('circle', { cx: 0, cy: -6, r: 3.2, fill: pal.coral, transform: `rotate(${a} 0 0) translate(0 -5)` }, fl));
  el('circle', { r: 2.6, fill: pal.yellow, cy: -1 }, fl);
  const me = k.buddy({ x: 150, y: FY, color: pal.blue, dark: pal.blueDark });
  // ベレー帽
  const beret = el('path', { d: 'M -24 -83 Q -22 -98 2 -98 Q 26 -96 26 -83 Q 0 -78 -24 -83 Z', fill: pal.red });
  el('circle', { cx: 2, cy: -100, r: 2.6, fill: pal.red }, beret.parentNode);
  me.body.appendChild(beret);
  const pal2 = g({}); el('ellipse', { rx: 15, ry: 10, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, pal2);
  [[-6, -2, pal.red], [3, -4, pal.yellow], [7, 2, pal.blue], [-3, 4, pal.green]].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 2.8, fill: c }, pal2));
  const br = g({}); el('rect', { x: -1.8, y: -4, width: 3.6, height: 22, rx: 1.8, fill: pal.woodDark }, br); el('path', { d: 'M -2.4 18 L 2.4 18 L 0 28 Z', fill: pal.red }, br);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const s1 = seg(t, 1.2, 2.0), s2 = seg(t, 2.0, 2.8), s3 = seg(t, 2.8, 3.4), s4 = seg(t, 3.4, 4.0), back = easeInOut(seg(t, 4.0, 4.6));
      sky.setAttribute('height', 76 * easeOut(s1));
      tf(sun, lerp(EX + 30, EX + 30, 1), EY + 20 - 10 * (1 - easeOut(s3)), 0, easeOut(s3) + 0.001);
      h1.setAttribute('opacity', s2 > 0 ? 1 : 0); tf(h1, 0, 70 * (1 - easeOut(s2)));
      h2.setAttribute('opacity', s2 > 0.3 ? 1 : 0); tf(h2, 0, 70 * (1 - easeOut(seg(t, 2.3, 3.0))));
      const fs = backOut(s4, 1.6); tf(fl, EX + 20, EY + 62, 0, fs + 0.001);
      // 筆の動き
      const px = [EX - 36 + 70 * s1, EX - 30 + 50 * s2, EX + 30, EX + 20][t < 2.0 ? 0 : t < 2.8 ? 1 : t < 3.4 ? 2 : 3];
      const py = [EY + 12 + 30 * Math.sin(t * 9) * 0 + 6 * Math.sin(t * 14), EY + 56 + 5 * Math.sin(t * 12), EY + 24, EY + 56][t < 2.0 ? 0 : t < 2.8 ? 1 : t < 3.4 ? 2 : 3];
      const painting = t > 1.0 && t < 4.0;
      const x = lerp(150, 128, back);
      me.pose({ x, armR: painting ? reach(me, 1, 'R', px, py) : lerp(reach(me, 1, 'R', px, py), 8, seg(t, 4.0, 4.3)), armL: lerp(8, 70, seg(t, 0.4, 1.0)) * (1 - back) + 110 * back, lean: 4 * (painting ? 1 : 0) * (1 - back), mood: t > 4.0 ? 'grin' : 'smile', look: 0.6, squash: 1 });
      const hl = hp(me, 1, 'L'); tf(pal2, hl.x + 4, hl.y + 4, -10);
      const hr = hp(me, 1, 'R'); tf(br, hr.x, hr.y, 70 - (me.state.armR - 90) * 0.0, 1, 1);
      br.setAttribute('transform', `translate(${hr.x.toFixed(1)} ${hr.y.toFixed(1)}) rotate(${(200 - me.state.armR * 0.6).toFixed(1)})`);
      br.setAttribute('opacity', painting ? 1 : 0);
      sp.forEach((s, i) => { const q = seg(t, 4.1 + i * 0.12, 4.7); tf(s, EX - 50 + i * 54, EY - 14 - 14 * q + (i % 2) * 8, 0, Math.sin(q * Math.PI) + 0.001); });
    }
  };
}
