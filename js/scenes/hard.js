// hard：パンを指でたたくと、コンコンと硬くて凹まず、手のほうが痛い（例文 This bread is hard.）
import { seg, lerp, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.6, beats: [[0, 'パンをたたく'], [1.0, 'コンコン'], [2.4, '手が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 90, y: FY + 4, scale: 1 });
  const hy = FY + 4 - 56;           // 手の高さ（腕を水平に出したとき）
  const top = hy + 16;             // テーブルの天板
  el('rect', { x: 125, y: top, width: 240, height: 7, rx: 3, fill: pal.wood });
  el('rect', { x: 137, y: top + 7, width: 7, height: FY - top - 7, fill: pal.woodDark });
  el('rect', { x: 347, y: top + 7, width: 7, height: FY - top - 7, fill: pal.woodDark });
  // パン（動かない）
  const loaf = g({}); tf(loaf, 218, top);
  k.shadow(0, 0, 66, 6, loaf);
  el('path', { d: 'M -64 0 Q -66 -36 -30 -38 L 30 -38 Q 66 -36 64 0 Z', fill: '#D9A05B', stroke: '#B97C36', 'stroke-width': 3 }, loaf);
  [-34, -6, 22].forEach((x) => el('path', { d: `M ${x} -32 L ${x + 12} -14`, stroke: '#B97C36', 'stroke-width': 4, 'stroke-linecap': 'round' }, loaf));
  const hit = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 L -10 0', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      // 腕の角度：0.5s〜2.2s に3回たたく（90度で接触）。接触のたびに跳ね返る
      const cyc = (t - 0.7) / 0.5, n = Math.floor(cyc), f = cyc - n;
      const tapping = t > 0.7 && t < 2.2;
      const swing = tapping ? 90 - 34 * Math.sin(Math.min(f, 1) * Math.PI) * (f < 0.9 ? 1 : 0) - 0 : 90;
      const armR = t < 0.7 ? lerp(8, 90, easeOut(seg(t, 0.1, 0.7))) : t < 2.2 ? Math.min(90, swing) : lerp(90, 8, easeOut(seg(t, 2.2, 2.7)));
      const ouch = hump(seg(t, 2.2, 3.4));
      const shake = Math.sin(t * 30) * 10 * ouch;
      P(b, { y: FY + 4, armR: armR + shake, lean: 5 * hump(seg(t, 0.7, 2.2)) - 4 * ouch, mood: t < 2.2 ? 'flat' : 'sad', look: 0.6, blink: blinkAt(t), armL: 8 + 20 * ouch });
      hit.forEach((h, i) => {
        const on = tapping && n >= 0 && f < 0.18 ? 1 : 0;
        h.setAttribute('opacity', on);
        tf(h, 158, hy - 14 + i * 12, (i - 1) * 40 + 180);
      });
    }
  };
}
