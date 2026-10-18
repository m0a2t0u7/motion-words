// keep back：危険な柵に近づいたまめに、係の人が手で止め、まめは黄色い線の後ろへ下がって待つ（例文 Keep back from the fence, please.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '柵に近づく'], [1.6, '止められる'], [3.4, '後ろに下がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 柵の向こう：工事の穴と機械
  el('rect', { x: 290, y: 150, width: 110, height: 86, fill: '#E9D3AE' });
  el('ellipse', { cx: 350, cy: 236, rx: 46, ry: 10, fill: '#8E7442' });
  el('rect', { x: 330, y: 120, width: 50, height: 30, rx: 5, fill: pal.yellow }); el('rect', { x: 352, y: 92, width: 8, height: 30, fill: pal.yellowDark });
  // 柵
  for (let x = 290; x <= 400; x += 22) el('rect', { x: x - 3, y: 166, width: 6, height: 70, rx: 2, fill: pal.sub });
  [176, 206].forEach((y) => el('rect', { x: 284, y, width: 120, height: 6, rx: 3, fill: '#9AA6B6' }));
  el('rect', { x: 296, y: 182, width: 44, height: 22, rx: 3, fill: pal.yellow, stroke: pal.ink, 'stroke-width': 2 });
  k.text(318, 194, '!', { 'font-size': 18 });
  // 黄色い線（床）
  el('path', { d: `M 206 ${FY + 2} L 214 ${FY + 2} L 202 ${FY + 62} L 192 ${FY + 62} Z`, fill: pal.yellow });
  el('rect', { x: 0, y: FY + 8, width: 400, height: 0, fill: 'none' });
  const G = k.buddy({ x: 260, y: FY + 34, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cap = el('path', { d: 'M -28 -76 Q 0 -100 28 -76 Z', fill: pal.blue }, G.body);
  const S = 1;
  const b = k.buddy({ x: 40, y: FY + 20, scale: S });
  const xf = (t) => t < 1.6 ? lerp(40, 240, easeOut(seg(t, 0.1, 1.5))) : lerp(240, 170, easeInOut(seg(t, 2.2, 3.2)));
  return {
    update(t) {
      const p = gait(xf, t, 40);
      const stop = easeOut(seg(t, 1.0, 1.3)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      G.pose({ armR: lerp(15, 95, stop), armL: 10, lean: 6 * stop, look: 0.5, mood: stop > 0.5 ? 'flat' : 'smile' });
      const back = t > 2.2 && t < 3.2;
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: back ? p.armR : p.armR, lean: back ? -4 : p.lean - 6 * hump(seg(t, 1.4, 1.8)), look: 0.6, mood: t > 1.5 && t < 2.2 ? 'open' : 'smile', lift: 6 * hump(seg(t, 1.5, 1.8)) });
      if (t > 3.3) b.pose({ armR: lerp(8, 30, seg(t, 3.4, 3.7)), armL: 8 });
    }
  };
}
