// for good：家に「売却済み」の札、窓は空っぽ。家族はスーツケースを持って手を振り、町の出口の標識を越えて去っていく（もう戻らない）（They left the town for good.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { gait, hp } from './dig.js';
import { sign } from './queue-up.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '家を引き払う'], [1.4, '町を出る'], [3.4, 'もう戻らない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E9DCCF' });
  // 家
  k.shadow(310, FY + 1, 70, 5);
  el('rect', { x: 250, y: 120, width: 120, height: FY - 120, fill: '#FBE9DC' });
  el('path', { d: 'M 238 124 L 310 70 L 382 124 Z', fill: pal.coral });
  const wins = [[264, 140], [330, 140]].map(([x, y]) => el('rect', { x, y, width: 28, height: 26, rx: 3, fill: '#FFE7A8' }));
  el('rect', { x: 296, y: FY - 50, width: 26, height: 50, fill: pal.blue });
  const sold = g({});
  k.shadow(0, 1, 12, 3, sold);
  el('rect', { x: -2, y: -44, width: 4, height: 44, fill: pal.woodDark }, sold);
  el('rect', { x: -26, y: -66, width: 52, height: 24, rx: 3, fill: pal.red }, sold);
  k.text(0, -53, 'SOLD', { 'font-size': 12, fill: '#fff' }, sold);
  // 町の出口の標識（町名に斜線）
  const s = sign(k, 60, FY, '', { w: 70, h: 30, post: 50 });
  el('rect', { x: 36, y: FY - 72, width: 48, height: 8, rx: 3, fill: pal.line });
  el('line', { x1: 32, y1: FY - 56, x2: 88, y2: FY - 78, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const mk = (c) => { const n = g({}); el('rect', { x: -10, y: 0, width: 20, height: 24, rx: 3, fill: c }, n); el('rect', { x: -4, y: -5, width: 8, height: 6, rx: 2, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, n); return n; };
  const G = k.buddy({ x: 230, y: FY, scale: 0.9, facing: -1 });
  const C = k.buddy({ x: 196, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sg = mk(pal.violet), sc = mk(pal.yellow);
  const gx = (t) => lerp(230, -60, easeInOut(seg(t, 1.3, 4.2)));
  const cx = (t) => lerp(196, -96, easeInOut(seg(t, 1.2, 4.1)));
  return {
    update(t) {
      tf(sold, 220, FY, 0, 1, Math.max(0.001, backOut(seg(t, 0.1, 0.5))));
      const dark = seg(t, 0.4, 0.9);
      wins.forEach((w) => w.setAttribute('fill', dark > 0.5 ? '#6E7896' : '#FFE7A8'));
      const a = gait(gx, t, 230), b = gait(cx, t, 196);
      const wave = t > 0.6 && t < 1.3;
      P(G, { x: a.x, walk: a.walk, facing: wave ? 1 : -1, armR: wave ? 140 + 20 * Math.sin(t * 14) : 20, armL: 8 + (a.armL - 8) * 0.5, lean: a.lean, look: 0.5, mood: wave ? 'flat' : 'smile', blink: blinkAt(t) });
      P(C, { x: b.x, walk: b.walk, facing: -1, armR: 20, armL: b.armL, lean: b.lean, look: 0.5, mood: 'smile', blink: blinkAt(t, 1) });
      const h1 = hp(G, 0.9, wave ? 'L' : 'R'), h2 = hp(C, 0.85, 'R');
      tf(sg, h1.x, h1.y - 2); tf(sc, h2.x, h2.y - 2);
    }
  };
}
