// gasoline：ガソリンスタンドの価格表示がカタカタ上がっていき、給油ノズルを持ったまめがびっくりする（例文 The price of gasoline went up.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { auto, P, blinkAt, held, mark, popIn } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'ガソリン価格'], [1.2, '値段が上がる'], [3.0, 'えっ、高い！']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY });
  // 屋根と価格の看板
  el('rect', { x: 0, y: 30, width: 400, height: 18, fill: pal.red });
  el('rect', { x: 0, y: 48, width: 400, height: 6, fill: '#fff' });
  [60, 330].forEach((x) => el('rect', { x: x - 6, y: 54, width: 12, height: FY - 54, fill: '#E3E8EE' }));
  el('rect', { x: 268, y: 70, width: 120, height: 84, rx: 8, fill: '#2B3446', stroke: '#fff', 'stroke-width': 4 });
  // 給油機のマーク
  el('rect', { x: 280, y: 90, width: 16, height: 22, rx: 3, fill: pal.yellow }); el('path', { d: 'M 296 94 l 6 4 v 12', stroke: pal.yellow, 'stroke-width': 3, fill: 'none' });
  const price = k.text(346, 102, '1.50', { 'font-size': 26, fill: '#FFE08A', 'font-family': 'monospace' });
  const arrow = el('path', { d: 'M 0 10 L 0 -8 M -7 -1 L 0 -8 L 7 -1', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 282, y: 124, width: 92, height: 20, rx: 4, fill: '#3C4558' }); k.text(328, 135, '$ / L', { 'font-size': 11, fill: '#C9D1DC' });
  // 給油機
  el('rect', { x: 150, y: 120, width: 56, height: FY - 120, rx: 6, fill: '#F4F7FA', stroke: '#C9D1DC', 'stroke-width': 2 });
  el('rect', { x: 160, y: 134, width: 36, height: 20, rx: 3, fill: '#2B3446' });
  const car = auto(k, { color: pal.blue, dark: pal.blueDark }); car.set(80, FY + 6, 0, 0, 0, 1.05);
  const me = k.buddy({ x: 238, y: FY, scale: 0.9, facing: -1 });
  const noz = g({}); el('rect', { x: -5, y: -4, width: 10, height: 14, rx: 3, fill: pal.ink }, noz); el('path', { d: 'M 0 10 L 0 22 L -8 26', stroke: pal.sub, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, noz);
  const hose = el('path', { stroke: pal.ink, 'stroke-width': 3, fill: 'none' });
  const bang = mark(k, 'bang');
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.9, 2.6)), v = 1.5 + 0.3 * p;
      price.textContent = (Math.floor(v * 100 + 1e-6) / 100).toFixed(2);
      k.tf(arrow, 380, 82 - 4 * Math.sin(t * 8), 0, seg(t, 0.9, 1.1) + 0.001);
      const shock = seg(t, 2.6, 2.9);
      P(me, { x: 238, look: t > 1.0 ? -0.9 : 0.5, facing: -1, mood: t > 2.6 ? 'open' : 'smile', blink: blinkAt(t), lift: 10 * hump(shock), lean: -8 * hump(seg(t, 2.6, 3.4)), armR: 60, armL: 8 + 30 * hump(shock) });
      const h = held(k, me, 0.9, noz, 'R', -60);
      k.set(hose, { d: `M 200 150 Q ${(h.x + 200) / 2} ${FY - 10} ${h.x} ${h.y}` });
      k.tf(bang, 262, FY - 128, 0, popIn(seg(t, 2.6, 2.9)) * 1.8 + 0.001);
      void lerp; void easeOut;
    }
  };
}
