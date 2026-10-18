// copy：黒板の文字を見ながら、ノートに同じ行を一行ずつ書き写す（例文 I copied the notes into my notebook.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '黒板を見る'], [1.5, '書き写す'], [4.0, '写し終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 黒板
  el('rect', { x: 196, y: 24, width: 190, height: 110, rx: 6, fill: pal.woodDark });
  el('rect', { x: 202, y: 30, width: 178, height: 98, rx: 3, fill: '#4F8C79' });
  el('rect', { x: 212, y: 130, width: 60, height: 5, rx: 2, fill: '#fff' });
  const hl = el('rect', { x: 208, y: 40, width: 166, height: 22, rx: 4, fill: pal.yellow, opacity: 0 });
  const bl = [[46, 120], [72, 140], [98, 96]].map(([y, w]) => el('rect', { x: 216, y: y + 4, width: w, height: 4, rx: 2, fill: '#fff', opacity: 0.9 }));
  // 机とノート
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  el('path', { d: 'M 176 200 L 186 181 L 264 181 L 274 200 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('line', { x1: 225, y1: 181, x2: 225, y2: 200, stroke: pal.line, 'stroke-width': 1.5 });
  const S = 1.0;
  const me = k.buddy({ x: 160, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const LY = [186, 191, 196], X0 = 202;
  const ln = LY.map((y) => el('rect', { x: X0, y: y - 1, width: 0, height: 2.4, rx: 1.2, fill: pal.ink }));
  const pen = g({});
  el('rect', { x: -1.8, y: -4, width: 3.6, height: 22, rx: 1.8, fill: pal.blue }, pen);
  el('path', { d: 'M -1.8 18 L 0 24 L 1.8 18 Z', fill: pal.ink }, pen);
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });

  return {
    update(t) {
      const W = 20;
      const go = easeInOut(seg(t, 0.7, 1.4)) * (1 - seg(t, 4.2, 4.7));
      const li = Math.max(0, Math.min(2, Math.floor((t - 1.5) / 0.85)));
      const p = seg(t, 1.5 + li * 0.85, 1.5 + li * 0.85 + 0.75);
      const glance = t >= 1.5 && t < 4.1 ? ((t - 1.5) % 0.85 < 0.3 ? 1 : 0) : (t < 1.0 ? 1 : 0);
      ln.forEach((n, i) => n.setAttribute('width', i < li ? W : i === li ? W * easeOut(p) : 0));
      const wr = t >= 1.5 && t < 4.1;
      const tx = X0 + W * (i2(li, p)), ty = LY[li] - 2;
      me.pose({ x: 160, armL: 8, lean: 3 + 3 * go, look: glance ? 1 : 0.4, mood: t > 4.2 ? 'grin' : 'smile', squash: 1, blink: 0, armR: 40 });
      const a = lerp(40, reach(me, S, 'R', tx, ty - 4), go);
      me.pose({ armR: wr ? a + 2 * Math.sin(t * 22) : a });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      tf(pen, h.x + 1, h.y - 1, 24, 0.9);
      hl.setAttribute('opacity', wr ? 0.35 : 0);
      k.set(hl, { y: [40, 66, 92][li] });
    }
  };
}
const i2 = (li, p) => easeOut(p);
