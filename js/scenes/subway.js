// subway：地上のバスと地下の地下鉄が同時に出発し、地下鉄がずっと先に駅へ着く（例文 The subway is faster than the bus.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { auto, blinkAt, mark, popIn } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '同時に出発'], [1.4, '地下鉄は速い'], [3.0, '先に着いた']] };

export function train(k, color = '#6AA8F7', dark = '#4A8BE0', cars = 2, rider) {
  const { el, g, pal } = k, o = g({});
  let b = null;
  for (let i = 0; i < cars; i++) {
    const x = -i * 132;
    el('path', { d: `M ${x - 64} -10 L ${x - 64} -60 Q ${x - 64} -66 ${x - 58} -66 L ${x + 50} -66 Q ${x + (i ? 64 : 70)} -64 ${x + 66} -40 L ${x + 66} -10 Z`, fill: color }, o);
    el('rect', { x: x - 64, y: -32, width: 130, height: 5, fill: dark }, o);
    [x - 52, x - 22, x + 8].forEach((wx) => el('rect', { x: wx, y: -58, width: 22, height: 20, rx: 3, fill: '#E5F1F9' }, o));
    [x - 40, x + 40].forEach((wx) => el('circle', { cx: wx, cy: -8, r: 7, fill: pal.ink }, o));
  }
  el('rect', { x: 42, y: -58, width: 18, height: 20, rx: 3, fill: '#E5F1F9' }, o);
  if (rider) { const cp = k.clip((c) => el('rect', { x: 8, y: -58, width: 22, height: 20 }, c)); const w = g({ 'clip-path': cp }, o); b = k.buddy({ parent: w, x: 19, y: -24, scale: 0.36, color: rider[0], dark: rider[1] }); b.g.firstChild.setAttribute('display', 'none'); }
  return { g: o, b, set(x, y, s = 1) { k.tf(o, x, y, 0, s); } };
}
export function create(k) {
  const { el, pal } = k;
  k.backdrop({ floorY: 130 });
  el('rect', { x: 0, y: 130, width: 400, height: 170, fill: '#C9B49A' });
  el('rect', { x: 0, y: 100, width: 400, height: 30, fill: '#B9C2CF' });
  // 地下トンネル
  el('rect', { x: 0, y: 186, width: 400, height: 90, rx: 0, fill: '#4A5468' });
  el('rect', { x: 0, y: 262, width: 400, height: 6, fill: '#8A93A3' });
  // ゴールの駅（地上と地下の両方）
  el('rect', { x: 352, y: 186, width: 48, height: 76, fill: '#6B7590' });
  el('rect', { x: 340, y: 40, width: 56, height: 60, fill: '#E8E2F4' }); el('rect', { x: 352, y: 50, width: 32, height: 14, rx: 3, fill: pal.blue });
  el('rect', { x: 366, y: 100, width: 10, height: 86, fill: '#8A93A3' });
  const bus = auto(k, { kind: 'bus', color: pal.yellow, dark: pal.yellowDark, driver: { color: pal.coral, dark: pal.coralDark }, ds: 0.5 });
  const sub = train(k, pal.blue, pal.blueDark, 2, [pal.mint, pal.mintDark]);
  const star = mark(k, 'check');
  return {
    update(t) {
      const bx = lerp(-10, 150, easeInOut(seg(t, 0.3, 4.4)));
      bus.set(bx, 128, bx * 3, Math.sin(t * 20) * 0.5, 0, 0.42);
      const sx = lerp(30, 300, easeInOut(seg(t, 0.3, 2.6)));
      sub.set(sx, 262, 0.8);
      sub.b.pose({ look: 0.8, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const p = seg(t, 2.7, 3.1); k.tf(star, 300, 160, 0, popIn(p) * 2 + 0.001);
      void easeOut; void hump;
    }
  };
}
