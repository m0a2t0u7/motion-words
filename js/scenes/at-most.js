// at most：車で家から目的地へ。時間バーには「2時間」の上限の壁があり、着いたときもバーは壁の手前で止まる（The trip will take two hours at most.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { car, tree } from './run-after.js';
import { timeBar } from './at-least.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '出発'], [1.6, '移動中'], [3.2, '2時間以内']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 40, fill: '#D6DCE4' });
  for (let x = 10; x < 400; x += 46) el('rect', { x, y: FY + 18, width: 24, height: 4, rx: 2, fill: '#fff' });
  // 家と目的地
  el('rect', { x: 8, y: FY - 60, width: 58, height: 60, fill: '#FBE9DC' });
  el('path', { d: `M 0 ${FY - 58} L 37 ${FY - 90} L 74 ${FY - 58} Z`, fill: pal.coral });
  el('rect', { x: 28, y: FY - 34, width: 18, height: 34, fill: pal.blue });
  tree(k, 200, FY - 2, 0.6);
  el('line', { x1: 372, y1: FY, x2: 372, y2: FY - 70, stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: `M 372 ${FY - 70} L 396 ${FY - 62} L 372 ${FY - 54} Z`, fill: pal.red });
  const tb = timeBar(k, 70, 40, 260, 3);
  el('rect', { x: tb.at(2) - 3, y: 26, width: 6, height: 42, rx: 2, fill: pal.red });
  el('rect', { x: tb.at(2), y: 42, width: tb.at(3) - tb.at(2) - 2, height: 12, rx: 6, fill: pal.red, opacity: 0.15 });
  const cr = car(k, pal.yellow, pal.yellowDark);
  const head = g({}, cr.body);
  el('circle', { cx: 18, cy: -50, r: 10, fill: pal.mint }, head);
  el('circle', { cx: 22, cy: -52, r: 1.8, fill: pal.ink }, head);
  const G = k.buddy({ x: 320, y: FY, scale: 0.8 });
  G.g.setAttribute('opacity', 0);
  const ck = mark(k, 'check', null, 1.4);
  const xf = (t) => lerp(60, 250, easeInOut(seg(t, 0.4, 3.0)));
  return {
    update(t) {
      const x = xf(t);
      const v = xf(t + 0.02) - xf(t - 0.02);
      cr.set(x, (x - 60) * 4.4, FY, Math.sin(t * 30) * 0.8 * clamp(Math.abs(v) * 3) - 2 * hump(seg(t, 2.95, 3.2)));
      const h = 1.7 * easeInOut(seg(t, 0.4, 3.0));
      tb.set(h, pal.blue);
      tf(ck, tb.at(1.7), 84, 0, Math.max(0.001, 1.4 * backOut(seg(t, 3.2, 3.5))));
      const out = t > 3.3;
      head.setAttribute('opacity', out ? 0 : 1);
      G.g.setAttribute('opacity', out ? 1 : 0);
      P(G, { x: 336, facing: 1, armR: 8 + 140 * easeOut(seg(t, 3.4, 3.8)), mood: 'grin', look: 0.5, lift: 6 * hump(seg(t, 3.4, 3.8)), blink: blinkAt(t) });
    }
  };
}
