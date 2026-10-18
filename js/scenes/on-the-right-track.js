// on the right track：ホワイトボードの迷路に答えの線を引いていく。行き止まりでなくゴールへ続く道を進んでいて、先生が「いいね」（Your answer is on the right track.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, hp } from './dig.js';
import { P, blinkAt, talk, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '答えを書く'], [1.4, '正しい道へ'], [3.0, 'その調子']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 8, width: 400, height: 8, fill: pal.line });
  el('rect', { x: 96, y: 96, width: 270, height: 118, rx: 6, fill: '#fff', stroke: '#C4CCD8', 'stroke-width': 6 });
  el('rect', { x: 150, y: 214, width: 160, height: 6, rx: 2, fill: '#C4CCD8' });
  // 迷路：分かれ道。上は行き止まり、下はゴール
  const wall = { stroke: '#C4CCD8', 'stroke-width': 26, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  el('path', { d: 'M 124 156 H 180 V 124 H 250 M 180 156 V 192 H 320 V 160', ...wall });
  el('path', { d: 'M 124 156 H 180 V 124 H 250 M 180 156 V 192 H 320 V 160', ...wall, stroke: '#F4F6F9', 'stroke-width': 20 });
  el('rect', { x: 256, y: 110, width: 6, height: 28, fill: pal.ink });
  tf(mark(k, 'x', null, 0.8), 238, 124);
  el('line', { x1: 320, y1: 160, x2: 320, y2: 128, stroke: pal.ink, 'stroke-width': 2.5 });
  el('path', { d: 'M 320 128 L 342 135 L 320 142 Z', fill: pal.red });
  el('circle', { cx: 124, cy: 156, r: 6, fill: pal.blue });
  const D = 'M 124 156 H 180 V 192 H 270';
  const ln = el('path', { d: D, fill: 'none', stroke: pal.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const L = ln.getTotalLength ? ln.getTotalLength() : 238;
  ln.setAttribute('stroke-dasharray', L);
  const C = k.buddy({ x: 364, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.95 });
  const G = k.buddy({ x: 92, y: FY, facing: 1 });
  const pen = el('rect', { x: -2.5, y: -14, width: 5, height: 16, rx: 2, fill: pal.blueDark });
  const bub = talk(k, 'Good!', 62, 32, 1, 15);
  const at = (d) => { // 線上の点（パスの長さ d）
    if (d <= 56) return [124 + d, 156]; if (d <= 92) return [180, 156 + (d - 56)]; return [180 + (d - 92), 192];
  };
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.3, 3.1)) * 182;
      const d = p < 56 ? p : p;
      const [px, py] = at(d);
      ln.setAttribute('stroke-dashoffset', L - d);
      const gx = px - 32;
      P(G, { x: gx, facing: 1, look: 0.5, mood: t > 3.2 ? 'grin' : 'flat', lean: -2, blink: blinkAt(t), armL: 8 });
      const wig = t < 3.1 ? Math.sin(t * 30) * 0.6 : 0;
      G.pose({ armR: reach(G, 1, 'R', px, py) + wig });
      const h = hp(G, 1, 'R');
      tf(pen, h.x, h.y, -30);
      const nod = Math.max(0, Math.sin(seg(t, 1.6, 3.0) * Math.PI * 4)) * (t < 3 ? 1 : 0);
      P(C, { facing: -1, look: 0.6, lean: 8 * nod, mood: t > 1.4 ? 'grin' : 'smile', armR: t > 3.1 ? lerp(8, 150, easeOut(seg(t, 3.1, 3.5))) : 8, blink: blinkAt(t, 1) });
      bub.show(seg(t, 3.2, 3.5), 340, 104);
    }
  };
}
