// go over：ふたりでボードの計画を、指示棒で上から順にもう一度なぞって確認する（例文 Let's go over the plan one more time.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { held } from './dig.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '計画表'], [1.2, '順になぞる'], [3.8, '確認できた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // ボード（脚つき）
  el('rect', { x: 150, y: 40, width: 200, height: 136, rx: 6, fill: '#fff', stroke: '#B8C1CE', 'stroke-width': 5 });
  el('rect', { x: 170, y: 176, width: 6, height: 60, fill: '#B8C1CE' }); el('rect', { x: 324, y: 176, width: 6, height: 60, fill: '#B8C1CE' });
  k.shadow(250, 237, 96, 4);
  el('rect', { x: 166, y: 50, width: 70, height: 12, rx: 3, fill: pal.violet });
  const rows = [0, 1, 2, 3].map((i) => {
    const y = 80 + i * 24;
    el('circle', { cx: 176, cy: y, r: 7, fill: '#EEF1F5', stroke: pal.sub, 'stroke-width': 1.6 });
    k.text(176, y + 0.5, String(i + 1), { 'font-size': 9, fill: pal.sub });
    el('rect', { x: 192, y: y - 4, width: [110, 84, 120, 70][i], height: 8, rx: 4, fill: [pal.blue, pal.coral, pal.green, pal.yellowDark][i], opacity: 0.75 });
    const ck = el('path', { d: `M ${318} ${y} l 5 5 l 10 -11`, stroke: pal.green, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return { y, ck };
  });
  // もう一度（↻ 2）
  const again = g({}); tf(again, 312, 56);
  el('path', { d: 'M 8 -6 A 9 9 0 1 0 9 3', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, again);
  el('path', { d: 'M 4 -10 L 10 -5 L 3 -1 Z', fill: pal.coralDark }, again);
  k.text(26, 0, '×2', { 'font-size': 12, fill: pal.coralDark }, again);
  const S = 0.85;
  const c = k.buddy({ x: 374, y: FY, scale: S * 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 92, y: FY, scale: S });
  const stick = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: 66, stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, stick); el('circle', { cx: 0, cy: 66, r: 3, fill: pal.red }, stick);
  return {
    update(t) {
      // なぞる位置：1行目→4行目、各行で左から右へ
      const u = seg(t, 0.8, 3.7) * 4, i = Math.min(3, Math.floor(u)), f = easeInOut(u - i);
      const ty = t < 0.8 ? lerp(150, rows[0].y, easeOut(seg(t, 0.3, 0.8))) : rows[i].y + 6;
      const tx = t < 0.8 ? 192 : t > 3.7 ? lerp(300, 260, easeInOut(seg(t, 3.7, 4.1))) : lerp(194, 300, f);
      // 指示棒の先が (tx, ty) に来るよう、腕の向きを決める（棒は腕の延長）
      P(b, { x: 92, armR: 90, lean: 4, look: 0.7, mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      const ar = reach(b, S, 'R', tx, ty);
      P(b, { x: 92, armR: t < 0.3 ? lerp(10, ar, easeOut(seg(t, 0, 0.3))) : ar, lean: 4, look: 0.7, mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      held(k, b, S, stick, 'R', 0, 24);
      rows.forEach((r, j) => { const q = seg(t, 0.8 + (j + 0.85) * 0.725, 0.8 + (j + 1) * 0.725); r.ck.setAttribute('opacity', q > 0 ? 1 : 0); tf(r.ck, 0, 0, 0, 1); r.ck.setAttribute('stroke-dasharray', `${(24 * q).toFixed(1)} 30`); });
      P(c, { x: 374, facing: -1, look: 0.5, armR: 8, armL: 8, squash: 1 + 0.02 * Math.sin(t * 3), lean: 2 * Math.sin(t * 6) * (t > 0.8 && t < 3.7 ? 1 : 0), mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t, 1.2) });
    }
  };
}
