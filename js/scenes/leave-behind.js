// leave behind：電車の座席にかばんを置いたまま降り、ドアが閉まって電車が出てから気づく（例文 I left my bag behind on the train.）
import { seg, lerp, easeInOut, easeIn, easeOut, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '電車の中'], [1.6, '降りる'], [3.6, 'かばんを置いてきた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 30, width: 400, height: 16, fill: '#E3E8EE' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 8, fill: pal.yellow });
  for (let x = 0; x < 400; x += 16) el('rect', { x, y: FY - 4, width: 8, height: 8, fill: pal.yellowDark, opacity: 0.4 });
  el('rect', { x: 330, y: 80, width: 50, height: 22, rx: 4, fill: pal.blue });
  el('path', { d: 'M 346 91 L 364 91 M 358 85 L 364 91 L 358 97', stroke: '#fff', 'stroke-width': 3, fill: 'none' });
  // 電車（断面）。DX = 移動量
  const train = g({});
  const TX = 300;
  el('rect', { x: -400, y: 70, width: TX + 400, height: 162, rx: 14, fill: '#E9EEF3', stroke: '#B9C3D0', 'stroke-width': 4 }, train);
  el('rect', { x: -400, y: 196, width: TX + 400, height: 10, fill: pal.green }, train);
  el('rect', { x: 20, y: 88, width: 120, height: 50, rx: 6, fill: '#CFE9F7' }, train);
  // 座席とかばん
  el('rect', { x: 30, y: 180, width: 200, height: 16, rx: 6, fill: pal.blue }, train);
  el('rect', { x: 30, y: 150, width: 12, height: 34, rx: 5, fill: pal.blueDark }, train);
  const bag = g({}, train); tf(bag, 200, 180);
  el('path', { d: 'M -10 -20 Q 0 -32 10 -20', stroke: pal.coffee, 'stroke-width': 3.5, fill: 'none' }, bag);
  el('rect', { x: -16, y: -22, width: 32, height: 22, rx: 5, fill: pal.coral }, bag);
  el('rect', { x: -16, y: -14, width: 32, height: 4, fill: pal.coralDark }, bag);
  const inside = g({}, train);
  // ドア（右端）
  const dL = el('rect', { x: TX - 62, y: 86, width: 30, height: 144, fill: '#C3CBD6', stroke: '#9AA6B6', 'stroke-width': 2 }, train);
  const dR = el('rect', { x: TX - 32, y: 86, width: 30, height: 144, fill: '#C3CBD6', stroke: '#9AA6B6', 'stroke-width': 2 }, train);
  const S = 0.85;
  const b = k.buddy({ parent: inside, x: 100, y: 196, scale: S });
  const b2 = k.buddy({ x: 320, y: FY, scale: S });
  const xf = (t) => lerp(100, 330, easeInOut(seg(t, 0.9, 2.3)));
  return {
    update(t) {
      const op = easeInOut(seg(t, 0.6, 0.9)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      k.set(dL, { x: TX - 62 - 28 * op }); k.set(dR, { x: TX - 32 + 28 * op });
      const go = easeIn(seg(t, 2.8, 4.6));
      tf(train, -190 * go, 0);
      const p = gait(xf, t, 100);
      const out = p.x > TX - 30;
      const stand = easeOut(seg(t, 0.2, 0.6));
      // 中：座っている → 立って歩く
      b.pose({ x: p.x, y: lerp(184, 196, stand), walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.6, squash: lerp(0.86, 1, stand) });
      b.g.setAttribute('opacity', out ? 0 : 1);
      b2.g.setAttribute('opacity', out ? 1 : 0);
      const turn = t > 3.6;
      const shock = easeOut(seg(t, 3.6, 3.8));
      b2.pose({ x: p.x, y: lerp(196, FY, seg(p.x, TX - 30, TX + 10)), walk: p.walk, armL: lerp(p.armL, 150, shock), armR: lerp(p.armR, 150, shock), lean: p.lean - 6 * shock, facing: turn ? -1 : 1, look: turn ? 0.8 : 0.5, mood: turn ? 'open' : 'smile', lift: 8 * hump(seg(t, 3.6, 3.9)) });
    }
  };
}
