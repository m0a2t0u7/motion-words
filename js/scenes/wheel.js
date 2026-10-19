// wheel：荷物を積んだ台車を押していると、車輪が1つ外れてころころ転がり、台車が傾く（例文 One wheel came off the cart.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, blinkAt, held, reach, mark, popIn } from './vehicle.js';
import { box } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '台車を押す'], [1.5, '車輪が外れる'], [2.8, '転がっていく']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 60, width: 400, height: FY - 60, fill: '#EFE8DD' });
  [40, 120].forEach((x) => { const b = box(k, 60, 50, '#E3B77E'); k.tf(b, x, FY); });
  const me = k.buddy({ x: 110, y: FY, scale: 0.9 });
  const cart = g({});
  el('rect', { x: 0, y: -18, width: 110, height: 8, rx: 3, fill: pal.blue }, cart);
  el('path', { d: 'M 0 -14 L -6 -70', stroke: pal.blueDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, cart);
  const b1 = box(k, 48, 36, '#E3B77E', cart); k.tf(b1, 30, -18); const b2 = box(k, 40, 30, '#D9A86A', cart); k.tf(b2, 80, -18);
  const wl = g({}, cart); el('circle', { r: 9, fill: pal.ink }, wl); k.tf(wl, 12, -9);
  const wrc = g({}); el('circle', { r: 9, fill: pal.ink }, wrc); el('rect', { x: -1.5, y: -6, width: 3, height: 12, fill: pal.sub }, wrc);
  const bang = mark(k, 'bang');
  const OFF = 1.6;
  return {
    update(t) {
      const cx = 150 + 60 * easeOut(seg(t, 0, OFF)) + 10 * easeOut(seg(t, OFF, OFF + 0.4));
      const tilt = easeIn(seg(t, OFF, OFF + 0.3)) * 8 + wobble(seg(t, OFF + 0.3, OFF + 1.2), 2, 5) * 2;
      cart.setAttribute('transform', `translate(${cx.toFixed(1)} ${FY}) rotate(${tilt.toFixed(2)} 12 -9)`);
      // 外れた車輪：前輪の位置から転がって右へ
      const rp = seg(t, OFF, 4.2), wx = cx + 98 + 45 * easeOut(rp), on = t < OFF;
      const wxx = on ? cx + 98 : wx;
      k.tf(wrc, wxx, FY - 9 - (on ? 0 : 6 * hump(seg(t, OFF, OFF + 0.25))), wxx * 6.4);
      const hx = cx - 6 * Math.cos(-0.08) + 0, hy = FY - 70;
      const mx = cx - 52 + 6 * hump(seg(t, OFF, OFF + 0.5));
      P(me, { x: mx, walk: t < OFF ? (cx - 150) * 0.12 : Math.round((cx - 150) * 0.12 / Math.PI) * Math.PI, lean: t < OFF ? 10 : -8 * hump(seg(t, OFF, OFF + 0.8)), mood: t > OFF ? 'open' : 'smile', look: t > OFF + 0.3 ? 1 : 0.5, blink: blinkAt(t) });
      me.pose({ armR: reach(me, 0.9, 'R', hx, hy), armL: reach(me, 0.9, 'L', hx - 2, hy) });
      const bp = seg(t, OFF, OFF + 0.3); k.tf(bang, mx + 10, FY - 120, 0, popIn(bp) * 1.6 + 0.001);
      void held; void lerp; void easeInOut;
    }
  };
}
