// fare：バスの運転席の横で、運賃表示「$2」を見て、まめが1ドル硬貨を2枚、運賃箱に入れる（例文 The bus fare is two dollars.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { P, blinkAt, held, reach, coin, deskFront } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '運賃は2ドル'], [1.2, '1枚、2枚'], [3.2, '払った']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // バス前方の車内
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F1EDE4' });
  el('rect', { x: 0, y: 30, width: 200, height: 80, rx: 8, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: 14, width: 400, height: 6, fill: pal.yellowDark });
  const drv = k.buddy({ x: 70, y: 210, scale: 0.86, color: pal.blue, dark: pal.blueDark });
  el('ellipse', { cx: 118, cy: 160, rx: 6, ry: 22, fill: pal.ink });
  deskFront(k, 20, 120, 196, FY, '#C9D1DC', '#9AA5B4');
  // 運賃箱と表示
  el('rect', { x: 170, y: 140, width: 50, height: 100, rx: 6, fill: '#5A6478' });
  el('rect', { x: 182, y: 140, width: 26, height: 5, rx: 2, fill: pal.ink });
  el('rect', { x: 150, y: 50, width: 90, height: 44, rx: 6, fill: '#2B3446' });
  k.text(195, 73, 'FARE $2', { 'font-size': 15, fill: '#FFE08A', 'font-family': 'monospace' });
  const cnt = k.text(195, 168, '', { 'font-size': 14, fill: '#9BE3B0', 'font-family': 'monospace' });
  const me = k.buddy({ x: 290, y: FY + 4, scale: 0.95, facing: -1 });
  const coins = [0, 1].map(() => { const c = g({}); coin(k, c, 8); k.text(0, 1, '1', { 'font-size': 9, fill: pal.yellowDark }, c); return c; });
  const SLOT = [195, 140];
  return {
    update(t) {
      P(drv, { x: 70, y: 210, look: 0.7, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t, 1), armR: 70 });
      let paid = 0;
      // 1枚目 1.0〜2.0、2枚目 2.0〜3.0：手を上げ → 入れる → 戻す
      const cyc = (a) => { const p = seg(t, a, a + 1.0); return { up: easeInOut(seg(p, 0, 0.5)), down: easeIn(seg(p, 0.5, 0.75)), back: easeOut(seg(p, 0.75, 1)) }; };
      let tx = 250, ty = 170;
      [1.0, 2.0].forEach((a, i) => {
        const c = cyc(a), cn = coins[i];
        if (t >= a && t < a + 1.0) {
          tx = lerp(lerp(250, SLOT[0], c.up), 250, c.back); ty = lerp(lerp(170, SLOT[1] - 22, c.up), SLOT[1] - 22, 0) + 10 * c.down + lerp(0, 40, c.back);
        }
        const inHand = t < a + 0.62;
        cn.setAttribute('opacity', t < a - 0.6 + 0.6 && i === 1 && t < 2.0 ? 0 : inHand ? 1 : 0);
        if (t >= a + 0.62) paid = i + 1;
      });
      P(me, { look: -0.4, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 });
      me.pose({ armR: t > 0.9 && t < 3.0 ? reach(me, 0.95, 'R', tx, ty) : 10 });
      coins.forEach((c, i) => { if (+c.getAttribute('opacity')) held(k, me, 0.95, c, 'R', 0, 34); });
      cnt.textContent = paid ? `$${paid}` : '';
      void hump;
    }
  };
}
