// count：2人で、カゴのりんごを1つずつ指さして1, 2, 3...と数える（例文 Let's count the apples in the box.）
import { seg, lerp, easeInOut, easeOut, smooth, backOut, wobble } from '../ease.js';
import { hp, room, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'りんごの箱'], [1.4, '1つずつ数える'], [3.9, '5個']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  const b = k.buddy({ x: 140, y: 236 });
  const c = k.buddy({ x: 358, y: 236, color: pal.coral, dark: pal.coralDark, facing: -1 });
  R.front();
  // りんご箱（天板の上）
  const AX = [206, 230, 254, 278, 302], AY = 190;
  el('rect', { x: 190, y: 186, width: 130, height: 16, rx: 3, fill: pal.wood });
  el('rect', { x: 190, y: 192, width: 130, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const ap = AX.map((x) => {
    const a = g({}); tf(a, x, AY);
    el('circle', { r: 9.5, fill: pal.red }, a);
    el('circle', { cx: -3, cy: -3, r: 3, fill: '#fff', opacity: 0.3 }, a);
    el('path', { d: 'M 0 -9 q 1 -5 4 -6', stroke: pal.woodDark, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, a);
    el('path', { d: 'M 3 -12 q 5 -4 8 0 q -5 3 -8 0 Z', fill: pal.green }, a);
    return a;
  });
  // 手前の板（りんごの下半分を隠す）
  el('rect', { x: 188, y: 192, width: 134, height: 14, rx: 3, fill: '#EBCB9C' });
  el('rect', { x: 190, y: 192, width: 112, height: 3, fill: '#fff', opacity: 0.4 });
  // 数字の丸
  const nums = AX.map((x, i) => { const n = g({}); tf(n, x, 134); el('circle', { r: 11, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, n); k.text(0, 1, String(i + 1), { 'font-size': 14, fill: pal.blueDark }, n); return n; });
  const T = (i) => 1.2 + 0.55 * i;
  return {
    update(t) {
      // 指さす先：そのとき数えているりんごの上
      const idx = Math.min(4, Math.max(0, Math.floor((t - 1.0) / 0.55)));
      const tx = AX[idx], phase = ((t - 1.0) / 0.55) % 1;
      const on = t > 0.9 && t < 3.9;
      const tap = on ? Math.sin(Math.PI * Math.min(1, phase * 1.4)) : 0;
      // 身体を横にずらして手がりんごの上に来るようにする
      const bx = on ? tx - 52 : 150;
      b.pose({ x: bx, armR: 55, armL: 8, lean: 3, look: 0.8, mood: 'smile', squash: 1 - 0.02 * tap, walk: 0 });
      const h0 = hp(b, 1, 'R', 28);
      const a = reach(b, 1, 'R', tx, AY - 30 + 20 * tap);
      b.pose({ armR: on ? a : 40 });
      const done = t > 3.9;
      c.pose({ x: 358, armR: done ? lerp(8, 160, smooth(seg(t, 4.0, 4.4))) : 8, armL: 8, look: -0.8, lean: 0, mood: done ? 'grin' : 'smile', squash: 1 + 0.03 * Math.sin(t * 6) * (on ? 1 : 0) });
      nums.forEach((n, i) => { const s = backOut(seg(t, T(i), T(i) + 0.25)); tf(n, AX[i], 134 - 6 * smooth(seg(t, T(i), T(i) + 0.2)), 0, Math.max(0.001, s)); });
      ap.forEach((p, i) => { const w = seg(t, T(i) - 0.05, T(i) + 0.3); tf(p, AX[i], AY - 5 * Math.sin(Math.PI * w)); });
    }
  };
}
