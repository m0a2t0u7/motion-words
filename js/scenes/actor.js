// actor：授賞式のステージで、俳優のまめが大きなトロフィーを受け取り、高く掲げる。紙ふぶきが舞う（例文 The actor won a big prize.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { BL, hp, reach, P, blinkAt, walkTo, path, wear, sc } from './member.js';

export const meta = { duration: 4.4, beats: [[0, '名前を呼ばれる'], [1.6, '賞を受け取る'], [2.8, '大きな賞！']] };

export function trophy(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -10, y: 0, width: 20, height: 7, rx: 2, fill: '#6D4B2E' }, g);
  el('rect', { x: -3, y: -12, width: 6, height: 12, fill: pal.yellowDark }, g);
  el('path', { d: 'M -14 -34 L 14 -34 Q 14 -14 0 -12 Q -14 -14 -14 -34 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, g);
  el('path', { d: 'M -14 -30 Q -22 -30 -20 -22 Q -18 -18 -12 -18 M 14 -30 Q 22 -30 20 -22 Q 18 -18 12 -18', stroke: pal.yellowDark, 'stroke-width': 2.5, fill: 'none' }, g);
  el('path', { d: 'M 0 -30 L 2 -26 L 6 -25 L 3 -22 L 4 -18 L 0 -20 L -4 -18 L -3 -22 L -6 -25 L -2 -26 Z', fill: '#fff', opacity: 0.8 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 226;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#40324F' });
  // 幕と舞台
  el('path', { d: 'M 0 0 L 70 0 Q 50 120 70 226 L 0 226 Z', fill: '#B8475A' });
  el('path', { d: 'M 400 0 L 330 0 Q 350 120 330 226 L 400 226 Z', fill: '#B8475A' });
  el('path', { d: 'M 0 0 H 400 V 22 Q 300 36 200 22 Q 100 36 0 22 Z', fill: '#9C3346' });
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#6D4B2E' });
  const spot = el('path', { d: `M 180 0 L 140 ${FY} L 260 ${FY} L 220 0 Z`, fill: '#FFF6D8', opacity: 0.18 });
  const pre = k.buddy({ x: 290, y: FY, scale: 0.95, facing: -1, ...BL(k) }); wear(k, pre, 'tie', pal.ink);
  const b = k.buddy({ x: 30, y: FY, scale: S, facing: 1 }); wear(k, b, 'tie', pal.ink);
  const tro = trophy(k);
  const conf = Array.from({ length: 14 }, (_, i) => el('rect', { width: 5, height: 8, rx: 1, fill: [pal.red, pal.yellow, pal.blue, pal.mint][i % 4] }));
  const bx = path([[0.2, 30], [1.3, 196]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 30, 1), give = easeInOut(seg(t, 1.3, 1.8)), got = t > 1.9, raise = easeOut(seg(t, 2.2, 2.7));
      P(pre, { armR: lerp(lerp(30, 70, give), 10, easeInOut(seg(t, 1.9, 2.3))), armL: t > 2.4 ? 8 + 60 * Math.abs(Math.sin(t * 12)) * 0.3 + 60 : 10, look: 0.5, blink: blinkAt(t, 1), mood: 'grin' });
      const ph = hp(pre, 0.95, 'R', 32);
      P(b, { x: w.x, walk: w.walk, armL: lerp(w.armL, 150, raise), armR: w.armR, lean: w.lean - 6 * raise, look: 0.4, blink: blinkAt(t), mood: t > 1.6 ? 'grin' : 'open', lift: 8 * hump(seg(t, 2.6, 3.1)) });
      if (t > 1.2) b.pose({ armR: got ? lerp(reach(b, S, 'R', ph.x, ph.y), 165, raise) : lerp(w.armR, reach(b, S, 'R', ph.x, ph.y), give) });
      const h = got ? hp(b, S, 'R', 30) : ph;
      tf(tro, h.x, h.y + 6);
      k.set(spot, { transform: `translate(${lerp(-150, w.x - 200, easeOut(seg(t, 0, 1.3)))} 0)` });
      conf.forEach((c, i) => { const q = seg(t, 2.5 + (i % 5) * 0.1, 4.4); tf(c, 80 + i * 18 + Math.sin(q * 8 + i) * 8, -10 + q * 240, q * 500 + i * 30); c.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); });
    }
  };
}
