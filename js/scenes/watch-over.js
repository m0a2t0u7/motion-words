// watch over：夜、ベビーベッドで眠る赤ちゃんに毛布をかけ直し、そばで目を離さず見守る（例文 She watched over the sleeping baby.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, faceAt, hp, reach } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '眠る赤ちゃん'], [1.4, '毛布を直す'], [3.0, 'そばで見守る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240, 'evening');
  el('ellipse', { cx: 330, cy: 70, rx: 50, ry: 30, fill: '#FFE7A8', opacity: 0.35 });
  // ベビーベッド
  const CX = 260;
  el('rect', { x: CX - 70, y: 150, width: 140, height: 8, rx: 3, fill: pal.wood });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  el('rect', { x: CX - 66, y: 186, width: 132, height: 14, rx: 4, fill: '#fff' });
  const bg2 = g({}); tf(bg2, CX - 4, 186, -90);
  const baby = k.buddy({ parent: bg2, x: 0, y: 0, scale: 0.42, color: '#FFD9C2', dark: '#F2B79A' });
  const blanket = el('path', { d: '', fill: pal.blue });
  for (let x = CX - 64; x <= CX + 64; x += 16) el('rect', { x: x - 2, y: 156, width: 4, height: 50, fill: pal.woodDark });
  el('rect', { x: CX - 70, y: 200, width: 140, height: 10, rx: 3, fill: pal.wood });
  [CX - 66, CX + 60].forEach((x) => el('rect', { x, y: 150, width: 6, height: 88, fill: pal.woodDark }));
  const zs = [0, 1, 2].map(() => k.text(0, 0, 'z', { 'font-size': 14, fill: pal.violet }));
  return {
    update(t) {
      const br = Math.sin(t * 2.4);
      baby.pose({ blink: 1, squash: 1 + 0.02 * br, mood: 'smile', armL: 30, armR: 30 });
      const cover = easeInOut(seg(t, 1.0, 2.2));
      const bx = lerp(CX + 30, CX - 18, cover);
      k.set(blanket, { d: `M ${CX + 40} 178 Q ${(CX + 40 + bx) / 2} ${168 - br} ${bx} 176 L ${bx} 188 L ${CX + 40} 188 Z` });
      const tuck = hump(seg(t, 0.8, 2.4));
      b.pose({ x: lerp(120, 156, easeInOut(seg(t, 0.2, 0.9))), walk: seg(t, 0.2, 0.9) * 6.3, lean: 22 * tuck, armR: 8, mood: 'smile', look: 0.6, blink: t > 3.4 ? 0.3 : 0 });
      const ar = reach(b, S, 'R', bx, 178);
      b.pose({ armR: tuck > 0.05 ? lerp(30, ar, Math.min(1, tuck * 1.6)) : 30 + 10 * Math.sin(t), armL: 10 });
      faceAt(b, 5, 6 + Math.sin(t * 1.2) * 1);
      zs.forEach((z, i) => { const p = (t * 0.45 + i / 3) % 1; k.set(z, { x: CX + 26 + p * 22 + Math.sin(p * 8) * 3, y: 168 - p * 46, opacity: Math.sin(p * Math.PI) }); });
    }
  };
}
