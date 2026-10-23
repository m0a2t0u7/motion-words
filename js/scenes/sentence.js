// sentence：この単語を使って、まめがノートに1文を書く（Please write a sentence with this word.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, say } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '単語を見る'], [1.3, '文を書く'], [3.6, '一文できた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // 単語カード
  const cd = g({}); tf(cd, 330, 80);
  el('rect', { x: -48, y: -26, width: 96, height: 52, rx: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, cd);
  k.text(0, 8, 'cat', { 'font-size': 28, fill: pal.ink, 'text-anchor': 'middle' }, cd);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  desk(k, 70, 200, 200);
  // 大きく見せるノート
  const nb = g({}); tf(nb, 60, 28);
  el('rect', { x: 0, y: 0, width: 200, height: 70, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, nb);
  el('line', { x1: 14, y1: 50, x2: 186, y2: 50, stroke: '#E8D9A8', 'stroke-width': 2 }, nb);
  const S1 = 'I like my cat.';
  const tx = k.text(16, 44, '', { 'font-size': 24, fill: pal.ink, 'text-anchor': 'start' }, nb);
  const dot = el('circle', { cx: 0, cy: 0, r: 0, fill: pal.red }, nb);
  const pn = g({});
  el('line', { x1: 0, y1: 0, x2: -18, y2: -5, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pn);
  const pap = el('rect', { x: 150, y: 194, width: 60, height: 5, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  return {
    update(t) {
      const w = seg(t, 1.3, 3.5);
      tx.textContent = S1.slice(0, Math.floor(w * S1.length));
      k.set(dot, { opacity: t > 3.7 ? 1 : 0 });
      nb.setAttribute('opacity', seg(t, 1.1, 1.4));
      const writing = w > 0 && w < 1;
      P(b, { armR: lerp(20, 58, easeInOut(seg(t, 0.8, 1.3))) + (writing ? Math.sin(t * 15) * 5 : 0), armL: 20, lean: 5, look: t < 1.2 ? 0.8 : 0.1, mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(pn, h.x + 2, h.y + 2, 20);
      k.set(pap, { x: Math.min(170, h.x - 20) });
    }
  };
}
