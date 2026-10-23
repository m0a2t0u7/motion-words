// desert：かわいた砂漠。雲が来てもポツリと1滴だけで、すぐ晴れてしまう（例文 It rarely rains in the desert.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, sunG, cloudG } from './nature.js';
import { hang } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, 'かわいた砂漠'], [1.2, '雲が来た…'], [3.0, 'ほとんど降らない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 236, top: '#FFD9A0', bot: '#FFF4DE', ground: '#F0CF8E', edge: '#E2BB72' });
  const sun = sunG(k, 24); tf(sun.g, 330, 50);
  el('path', { d: `M 0 ${FY - 30} Q 80 ${FY - 70} 170 ${FY - 30} Q 260 ${FY - 76} 400 ${FY - 34} V ${FY} H 0 Z`, fill: '#F5D9A0' });
  el('path', { d: `M 0 ${FY - 6} Q 120 ${FY - 34} 260 ${FY - 8} T 400 ${FY - 10} V ${FY} H 0 Z`, fill: '#EFC983' });
  // ひび割れた地面
  el('path', { d: `M 210 ${FY + 20} l 14 6 l -4 10 l 16 4 M 224 ${FY + 26} l 18 -6 M 300 ${FY + 36} l 12 -10 l 14 4 M 60 ${FY + 30} l 16 8 l 10 -6`, stroke: '#C99A55', 'stroke-width': 2, fill: 'none' });
  // サボテン
  const cac = (x, s) => { const c = g({}); tf(c, x, FY + 4, 0, s); k.shadow(0, 0, 18, 3, c); el('rect', { x: -9, y: -70, width: 18, height: 70, rx: 9, fill: '#5DB36F' }, c); el('path', { d: 'M -9 -34 h -10 v -18', stroke: '#5DB36F', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, c); el('path', { d: 'M 9 -44 h 10 v -14', stroke: '#5DB36F', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, c); };
  cac(330, 1); cac(60, 0.7);
  const cl = g({}); el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 15, fill: '#B9C2D0' }, cl); el('circle', { cx: -12, cy: -8, r: 14, fill: '#B9C2D0' }, cl); el('circle', { cx: 10, cy: -11, r: 16, fill: '#B9C2D0' }, cl);
  const drop = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: '#6AA8F7' });
  const sizz = el('path', { d: 'M -6 0 q 3 -6 0 -10 M 2 0 q 3 -6 0 -10', stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' });
  const me = k.buddy({ x: 190, y: FY, scale: S });
  // 帽子
  const hat = g({}, me.body); el('ellipse', { cx: 0, cy: -80, rx: 40, ry: 6, fill: '#F5D78E' }, hat); el('path', { d: 'M -20 -80 Q -18 -100 0 -100 Q 18 -100 20 -80 Z', fill: '#F5D78E' }, hat); el('rect', { x: -20, y: -86, width: 40, height: 5, fill: pal.coral }, hat);
  const sweat = el('path', { d: 'M 0 -5 Q 3 0 0 3 Q -3 0 0 -5 Z', fill: '#8FD3F4' });
  return {
    update(t) {
      tf(sun.rays, 0, 0, t * 20);
      const cx = lerp(-60, 460, seg(t, 0.6, 4.4)), cy = 70;
      tf(cl, cx, cy);
      const hope = easeInOut(seg(t, 1.6, 2.0)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      P(me, { x: 190, armR: lerp(8, 70, hope), look: hope > 0.2 ? 0.4 : 0, mood: t > 3.1 ? 'sad' : hope > 0.3 ? 'open' : 'flat', blink: blinkAt(t), lean: -3 * hope });
      const h = me.handPos('R');
      const dp = seg(t, 2.0, 2.6), dx = 210, sx = lerp(dx, h.x + 2, dp);
      tf(drop, sx, lerp(cy + 14, h.y - 8, easeOut(dp) * 0 + dp * dp), 0, dp > 0 && dp < 1 ? 1 : 0.001);
      const sz = seg(t, 2.6, 3.2); tf(sizz, h.x + 2, h.y - 6 - 8 * sz); sizz.setAttribute('opacity', sz > 0 && sz < 1 ? 1 - sz : 0);
      const sw = seg((t * 0.8) % 1.4, 0, 1); tf(sweat, 190 + 24, FY - 70 + 20 * sw); sweat.setAttribute('opacity', t > 3.0 ? 1 - sw : 0.8 * (1 - sw));
    }
  };
}
