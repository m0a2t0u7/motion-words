// scroll-down：画面を指で上へなぞり、下の写真が現れる（例文 Scroll down to see more photos.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '一番上'], [0.8, '指で上へ'], [2.7, '下が見える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 3, fill: '#EAE3D8' });
  el('rect', { x: 30, y: 38, width: 74, height: 54, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 });
  el('circle', { cx: 52, cy: 58, r: 8, fill: pal.yellow });
  el('path', { d: 'M 35 88 L 62 62 L 78 78 L 90 66 L 99 88 Z', fill: pal.mint });
  el('rect', { x: 372, y: 210, width: 20, height: 26, rx: 4, fill: pal.coral });
  [-14, 0, 14].forEach((d, i) => el('ellipse', { cx: 382 + d, cy: 198 - (i === 1 ? 10 : 0), rx: 7, ry: 17, fill: pal.green, transform: `rotate(${d * 1.5} ${382 + d} 208)` }));
  // 画面スタンド
  k.shadow(266, FY, 62, 8);
  el('rect', { x: 258, y: 218, width: 16, height: FY - 222, fill: '#AEB8C6' });
  el('ellipse', { cx: 266, cy: FY - 4, rx: 44, ry: 8, fill: '#9AA5B5' });
  el('rect', { x: 168, y: 48, width: 196, height: 172, rx: 16, fill: pal.ink });
  const SX = 177, SY = 58, SW = 178, SH = 152;
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 8, fill: '#fff' });
  const screen = g({ 'clip-path': k.clip((c) => el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 8 }, c)) });
  const content = g({}, screen);
  const cols = [['#BFE3FA', '#5FCDB8'], ['#FFE3C7', '#FF8E77'], ['#D9E7FF', '#6AA8F7'], ['#E6DBFF', '#A58BF3']];
  el('rect', { x: SX, y: SY, width: SW, height: 28, fill: '#F1F4F8' }, content);
  el('circle', { cx: SX + 18, cy: SY + 14, r: 8, fill: pal.coral }, content);
  el('rect', { x: SX + 34, y: SY + 9, width: 64, height: 10, rx: 5, fill: pal.line }, content);
  cols.forEach(([sky, hill], i) => {
    const y = SY + 36 + i * 78, x = SX + 8;
    el('rect', { x, y, width: 162, height: 70, rx: 9, fill: sky }, content);
    el('circle', { cx: x + 34 + i * 18, cy: y + 22, r: 9, fill: '#fff', opacity: 0.9 }, content);
    el('path', { d: `M ${x} ${y + 70} L ${x} ${y + 52} Q ${x + 40} ${y + 24} ${x + 80} ${y + 50} Q ${x + 120} ${y + 28} ${x + 162} ${y + 54} L ${x + 162} ${y + 70} Z`, fill: hill, opacity: 0.85 }, content);
  });
  el('rect', { x: SX + 52, y: SY + 36 + 4 * 78 + 4, width: 74, height: 12, rx: 6, fill: pal.line }, content);
  const track = el('rect', { x: SX + SW - 6, y: SY + 6, width: 3, height: SH - 12, rx: 1.5, fill: pal.line }, screen);
  const thumb = el('rect', { x: SX + SW - 7, y: SY + 6, width: 5, height: 38, rx: 2.5, fill: pal.sub }, screen);
  const MAXS = 220;

  const dot1 = el('circle', { r: 11, fill: pal.blue, opacity: 0, stroke: pal.blueDark, 'stroke-width': 2 }, screen);
  const dot2 = el('circle', { r: 11, fill: pal.blue, opacity: 0, stroke: pal.blueDark, 'stroke-width': 2 }, screen);
  const b = k.buddy({ x: 140, y: FY, scale: 0.9 });
  const finger = el('line', { stroke: pal.mintDark, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 });
  const tip = el('circle', { r: 5.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5, opacity: 0 });

  return {
    update(t) {
      const T1 = [0.7, 1.15], T2 = [1.9, 2.35];
      const A0 = 62, A1 = 128;          // 指を置く位置 → 離す位置（腕の角度）
      let a;
      if (t < T1[0]) a = lerp(20, A0, easeInOut(seg(t, 0.2, T1[0])));
      else if (t < T1[1]) a = lerp(A0, A1, easeOut(seg(t, T1[0], T1[1])));
      else if (t < T2[0]) a = lerp(A1, A0, easeInOut(seg(t, T1[1], T2[0])));
      else if (t < T2[1]) a = lerp(A0, A1, easeOut(seg(t, T2[0], T2[1])));
      else a = lerp(A1, 20, easeInOut(seg(t, 2.6, 3.2)));
      const touching = (t >= T1[0] && t < T1[1]) || (t >= T2[0] && t < T2[1]);
      const sw = 100 * easeOut(seg(t, 0.7, 1.7)) + 120 * easeOut(seg(t, 1.9, 2.9));
      const off = sw;
      tf(content, 0, -off);
      thumb.setAttribute('y', SY + 6 + (off / MAXS) * (SH - 12 - 38));
      b.pose({ armR: a, armL: 10, lean: 3, look: 0.6, mood: 'smile', blink: t > 0.1 && t < 0.2 ? 1 : 0 });
      const h = b.handPos('R');
      dot1.setAttribute('cx', h.x); dot1.setAttribute('cy', h.y);
      dot1.setAttribute('opacity', touching ? 0.45 : 0);
      dot1.setAttribute('r', touching ? 11 + 2 * Math.sin(t * 20) : 11);
    }
  };
}
