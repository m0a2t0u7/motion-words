// travel：旅行の計画。航空券・ホテル・食事のたびに財布からお金が出ていき、財布が空になってまめが困る（例文 Travel can be expensive.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, held, coin, suitcase, popIn, ticket } from './vehicle.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '旅行の準備'], [1.0, 'お金が出ていく'], [3.4, '高くつく…']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  const cs = suitcase(k, pal.blue, pal.blueDark); k.tf(cs, 60, FY - 66);
  // 出費の項目（航空券・ホテル・食事）
  const items = [[230, 'ticket'], [290, 'bed'], [350, 'pizza']].map(([x, kind]) => {
    const n = g({}); el('circle', { r: 22, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, n);
    if (kind === 'ticket') ticket(k, n, pal.yellow); else icon(k, kind, n);
    k.tf(n, x, 70); k.text(x, 108, kind === 'pizza' ? '$40' : kind === 'bed' ? '$200' : '$500', { 'font-size': 13, fill: pal.coralDark }); return n;
  });
  const me = k.buddy({ x: 140, y: FY + 4, scale: 0.95 });
  const wl = g({}); el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 4, fill: pal.coffee }, wl); el('rect', { x: 2, y: -5, width: 12, height: 10, rx: 2, fill: '#A87452' }, wl);
  const coins = [0, 1, 2, 3, 4, 5].map(() => { const c = g({}); coin(k, c, 7); return c; });
  return {
    update(t) {
      const empty = seg(t, 3.2, 3.6);
      P(me, { armR: 60 + 20 * empty, look: 0.5, mood: t > 3.2 ? 'sad' : 'flat', blink: blinkAt(t), lean: 4 * empty, squash: 1 - 0.05 * empty });
      const h = held(k, me, 0.95, wl, 'R', 90 - 70 * empty);
      // 2枚ずつ、それぞれの項目へ飛んでいく
      coins.forEach((c, i) => {
        const j = Math.floor(i / 2), a = 0.9 + j * 0.8 + (i % 2) * 0.2, p = seg(t, a, a + 0.6);
        const tx = 230 + j * 60, ty = 70;
        k.tf(c, lerp(h.x, tx, easeInOut(p)), lerp(h.y, ty, easeInOut(p)) - 50 * hump(p), 0, p >= 1 ? 0.001 : 1);
        c.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      });
      items.forEach((n, j) => { const p = seg(t, 1.5 + j * 0.8, 1.8 + j * 0.8); k.tf(n, 230 + j * 60, 70, 0, 1 + 0.2 * hump(p)); });
      void popIn; void easeOut;
    }
  };
}
