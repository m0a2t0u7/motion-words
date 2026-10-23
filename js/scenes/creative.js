// creative：まめがイーゼルの前で筆を動かし、虹や太陽の絵を次々と描き上げていく（例文 She is very creative and loves to paint.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, aim, homeBg, sparkle } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '白いキャンバス'], [0.8, '筆で描く'], [3.4, '自分だけの絵']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 30 });
  // イーゼル
  const CX = 250, CY = FY - 150, CW = 110, CH = 90;
  el('path', { d: `M ${CX + 10} ${CY - 10} L ${CX - 20} ${FY} M ${CX + 10} ${CY - 10} L ${CX + 40} ${FY} M ${CX + 10} ${CY - 10} L ${CX + 10} ${FY}`, stroke: pal.woodDark, 'stroke-width': 6, 'stroke-linecap': 'round' });
  k.shadow(CX + 10, FY + 1, 40, 4);
  el('rect', { x: CX - 45, y: CY + CH, width: 110, height: 6, rx: 2, fill: pal.woodDark });
  el('rect', { x: CX - CW / 2 + 10, y: CY, width: CW, height: CH, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  // 描かれていく絵（ストロークを少しずつ出す）
  const art = g({ 'clip-path': k.clip((c) => el('rect', { x: CX - CW / 2 + 10, y: CY, width: CW, height: CH }, c)) });
  const C = [pal.red, pal.yellow, pal.green, pal.blue, pal.violet];
  const arcs = C.map((c, i) => el('path', { d: `M ${CX - 34 + i * 6} ${CY + 76} A ${44 - i * 6} ${44 - i * 6} 0 0 1 ${CX + 54 - i * 6} ${CY + 76}`, stroke: c, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': 160, 'stroke-dashoffset': 160 }, art));
  const sun = el('circle', { cx: CX + 42, cy: CY + 20, r: 0.01, fill: pal.yellow }, art);
  const grass = el('rect', { x: CX - 50, y: CY + 78, width: 0, height: 14, fill: '#8CCB8F' }, art);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  // 筆（原点＝握り、+y が穂先）とパレット
  const brush = g({});
  el('rect', { x: -2, y: -14, width: 4, height: 26, rx: 2, fill: pal.woodDark }, brush);
  const tip = el('path', { d: 'M -3 12 L 3 12 L 0 22 Z', fill: pal.red }, brush);
  const pal2 = g({});
  el('ellipse', { cx: 0, cy: 6, rx: 20, ry: 13, fill: '#F1D9B5', stroke: pal.woodDark, 'stroke-width': 2 }, pal2);
  C.forEach((c, i) => el('circle', { cx: -12 + i * 6, cy: 2 + (i % 2) * 6, r: 3.2, fill: c }, pal2));
  const sp = [0, 1, 2].map(() => sparkle(k));
  return {
    update(t) {
      const T0 = 0.7, dur = 0.42;
      const idx = Math.min(4, Math.floor((t - T0) / dur));
      P(b, { x: 150, lean: 6, look: 0.8, armL: 50, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t) });
      // 筆先：虹の弧をなぞる
      let tx = CX - 10, ty = CY + 50;
      arcs.forEach((a, i) => {
        const q = seg(t, T0 + i * dur, T0 + (i + 1) * dur);
        a.setAttribute('stroke-dashoffset', (160 * (1 - q)).toFixed(1));
        if (q > 0 && q < 1) { const r = 44 - i * 6, ang = Math.PI * (1 - q); tx = CX + 10 + r * Math.cos(ang); ty = CY + 76 - r * Math.sin(ang); tip.setAttribute('fill', C[i]); }
      });
      const qs = seg(t, T0 + 5 * dur, T0 + 5 * dur + 0.4), qg = seg(t, T0 + 5 * dur + 0.4, T0 + 5 * dur + 0.8);
      sun.setAttribute('r', 0.01 + 10 * easeOut(qs));
      grass.setAttribute('width', 120 * qg);
      if (qs > 0 && qs < 1) { tx = CX + 42 + 6 * Math.cos(t * 30); ty = CY + 20 + 6 * Math.sin(t * 30); tip.setAttribute('fill', pal.yellow); }
      if (qg > 0 && qg < 1) { tx = CX - 50 + 120 * qg; ty = CY + 84; tip.setAttribute('fill', pal.green); }
      if (t > T0 - 0.3 && t < T0 + 5 * dur + 0.8) aim(b, S, 'R', tx, ty + 10); else b.pose({ armR: t > 3.4 ? lerp(40, 140, easeOut(seg(t, 3.4, 3.7))) : 40 });
      hold(k, b, S, brush, 'R', 0);
      const ab = b.state.armR; brush.setAttribute('transform', brush.getAttribute('transform').replace(/rotate\([^)]*\)/, `rotate(${(-ab - 180 + 180).toFixed(1)})`));
      hold(k, b, S, pal2, 'L', 0);
      sp.forEach((s, i) => { const q = seg(t, 3.5 + i * 0.15, 4.2 + i * 0.1); tf(s, CX - 30 + i * 40, CY - 14 - 10 * q, 0, q > 0 ? hump(q) * 1.3 : 0.001); });
    }
  };
}
