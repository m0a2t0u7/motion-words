// garage：まめが運転する車がガレージに入って止まり、まめが降りてロックする（例文 He parked the car in the garage.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt, car, tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '車で帰る'], [1.4, 'ガレージに入れる'], [3.0, '駐車した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  tree(k, 40, FY, 0.75);
  // ガレージ（手前の壁を切り取った断面）
  const GX = 176;
  el('path', { d: `M ${GX - 12} 96 L ${GX + 112} 50 L 412 96 Z`, fill: pal.coral });
  el('rect', { x: GX, y: 96, width: 230, height: FY - 96, fill: '#E9E2D6' });
  el('rect', { x: GX + 10, y: 110, width: 210, height: FY - 110, fill: '#A9A39A' });
  el('rect', { x: GX + 10, y: 110, width: 210, height: 18, fill: '#7F7A72' }); // 巻き上げたシャッター
  for (let y = 112; y < 128; y += 5) el('line', { x1: GX + 10, y1: y, x2: GX + 220, y2: y, stroke: '#6E6A63', 'stroke-width': 1 });
  el('rect', { x: GX + 150, y: 150, width: 40, height: 30, rx: 2, fill: '#C9C2B6' });
  el('rect', { x: GX + 10, y: FY - 2, width: 210, height: 6, fill: '#8A857C' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D3D8DF' });
  const S = 0.78;
  const me = k.buddy({ x: 260, y: FY, scale: S });
  const C = car(k, pal.blue, pal.blueDark, true);
  // 運転席のまめ（窓の中）
  const drv = g({}, C.body);
  el('rect', { x: 14, y: -60, width: 22, height: 26, rx: 10, fill: pal.mint }, drv);
  el('ellipse', { cx: 30, cy: -51, rx: 2, ry: 2.8, fill: pal.ink }, drv);
  el('path', { d: 'M 12 -60 L 22 -60 Q 34 -58 42 -44 L 12 -44 Z', fill: '#CFE9F7', opacity: 0.45 }, C.body);
  const lights = el('ellipse', { cx: 0, cy: 0, rx: 10, ry: 7, fill: pal.yellow, opacity: 0 });
  el('rect', { x: GX - 2, y: 96, width: 12, height: FY - 96, fill: '#D9CDBB' }); // 入口の柱（車より手前）
  const PX = 296;
  const cx = (t) => lerp(-110, PX, easeOut(seg(t, 0.1, 2.3)));
  const mx = (t) => lerp(PX - 4, 150, easeInOut(seg(t, 2.9, 3.7)));
  return {
    update(t) {
      const x = cx(t);
      const stop = wobble(seg(t, 2.2, 2.9), 1.5, 5);
      C.set(x, x * 2.2, FY, 0);
      tf(C.body, 0, 0, 1.5 * stop);
      const out = t > 2.9;
      drv.setAttribute('opacity', out ? 0 : 1);
      me.g.setAttribute('opacity', out ? 1 : 0);
      const w = gait(mx, t, PX - 4);
      const lock = easeOut(seg(t, 3.8, 4.1));
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: t < 3.75 ? -1 : 1, look: 0.4, mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (lock > 0) me.pose({ armR: lerp(8, 82, lock) });
      // 降りたあとロック：ライトが2回光る
      const bl = t > 4.0 && (Math.floor((t - 4.0) / 0.12) % 2 === 0) ? 0.9 : 0;
      lights.setAttribute('opacity', bl);
      tf(lights, x + 60, FY - 32);
    }
  };
}
