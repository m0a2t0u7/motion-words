// word：知らない単語カードに「？」。友だちが絵で説明し、まめが分かる（例文 I don't know this word. Can you explain it?）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp, say, cloud } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '知らない'], [1.5, '説明して'], [3.2, 'わかった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const f = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const card = g({});
  el('rect', { x: -32, y: -20, width: 64, height: 40, rx: 5, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, card);
  k.text(0, 8, 'apple', { 'font-size': 18, 'font-weight': 800, fill: pal.ink }, card);
  const q = cloud(k, 58, 40, 1);
  k.text(0, 8, '?', { 'font-size': 26, 'font-weight': 900, fill: pal.violet }, q.g);
  const sb = say(k, 74, 54, 1);
  el('circle', { cx: 0, cy: 2, r: 14, fill: pal.red }, sb.g);
  el('path', { d: 'M 0 -10 Q 3 -20 10 -20', fill: 'none', stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, sb.g);
  el('ellipse', { cx: 9, cy: -17, rx: 6, ry: 3, fill: pal.green }, sb.g);
  const lamp = g({});
  el('circle', { r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, lamp);
  el('rect', { x: -4, y: 8, width: 8, height: 5, rx: 2, fill: pal.sub }, lamp);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 0.9)), ex = seg(t, 1.5, 2.1), ok = seg(t, 3.0, 3.4);
      P(b, { armR: lerp(30, 72, up) - ok * 40, armL: 8, lean: 2, mood: ok > 0 ? 'grin' : 'flat', blink: blinkAt(t), look: 4 });
      P(f, { armR: 8 + 60 * hump(seg(t, 1.5, 3.2)), armL: 8, mood: 'smile', blink: blinkAt(t, 1) });
      const h = hp(b, S, 'R');
      tf(card, lerp(190, h.x + 32, up), lerp(220, h.y - 14, up), 0, 1, 1);
      gr(h);
      q.show(seg(t, 0.8, 1.2) * (1 - seg(t, 3.0, 3.2)), 128, 128);
      sb.show(ex * (1 - seg(t, 3.5, 3.7)), 282, 130);
      tf(lamp, 124, 120, 0, backOut(ok) + 0.001, backOut(ok) + 0.001);
    }
  };
}
