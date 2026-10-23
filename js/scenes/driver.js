// driver：バスの運転手（まめ）がブレーキをかけ、角のバス停でぴたりと止めてドアを開ける（例文 The bus driver stopped at the corner.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { CO, P, blinkAt, wear } from './member.js';
import { road, auto } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, 'バスが走る'], [1.4, 'ブレーキ'], [2.8, '角で止まった']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 196, s = 0.82;
  const GY = road(k, FY, { city: true });
  // 角：交差点の横断歩道と、角の建物の端
  el('rect', { x: 330, y: FY + 20, width: 70, height: 100, fill: '#B9C2CF' });
  for (let i = 0; i < 5; i++) el('rect', { x: 340, y: FY + 26 + i * 14, width: 56, height: 7, fill: '#fff', opacity: 0.85 });
  el('rect', { x: 320, y: FY, width: 10, height: 20, fill: '#C9D1DC' });
  // バス停
  el('line', { x1: 306, y1: FY, x2: 306, y2: FY - 74, stroke: pal.sub, 'stroke-width': 4 });
  el('circle', { cx: 306, cy: FY - 84, r: 13, fill: pal.blue, stroke: '#fff', 'stroke-width': 3 });
  k.text(306, FY - 84, 'BUS', { 'font-size': 8, fill: '#fff' });
  const w = k.buddy({ x: 334, y: FY, scale: 0.6, facing: -1, ...CO(k) });
  const bus = auto(k, { kind: 'bus', color: pal.yellow, dark: pal.yellowDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.55 });
  wear(k, bus.d, 'cap', '#3F60B5');
  const X0 = -160, X1 = 186;
  bus.door.setAttribute('fill-opacity', 0.35);
  const xf = (t) => (t < 2.4 ? lerp(X0, X1, 1 - Math.pow(1 - t / 2.4, 2)) : X1);
  return {
    update(t) {
      const x = xf(t), brake = seg(t, 1.0, 2.4), stop = seg(t, 2.4, 3.0);
      const v = t < 2.4 ? (1 - t / 2.4) : 0;
      bus.set(x, GY, (x - X0) * 2.2, 0, 1.6 * hump(brake) * (1 - stop) + 1.2 * wobble(stop, 1.5, 4), s);
      // 運転席：ハンドルを握り、止まるときに前のめり
      P(bus.d, { armR: 72, armL: 60, lean: 10 * wobble(stop, 1, 3) + 3 * v, look: 0.8, blink: blinkAt(t), mood: t > 2.8 ? 'smile' : 'flat' });
      const op = easeInOut(seg(t, 3.0, 3.5));
      bus.door.setAttribute('transform', `translate(114 0) scale(${(1 - op * 0.85).toFixed(3)} 1) translate(-114 0)`);
      P(w, { blink: blinkAt(t, 1), look: 0.7, armR: 8 + 120 * hump(seg(t, 2.6, 3.6)), mood: t > 2.6 ? 'grin' : 'smile' });
    }
  };
}
