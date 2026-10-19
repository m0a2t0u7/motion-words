// lobby：ホテルのロビー（シャンデリア・ソファ・フロント・エレベーター）。ソファで待つまめの所へ、エレベーターから友だちが来て会う（例文 Let's meet in the hotel lobby.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, deskFront } from './vehicle.js';
import { sofaProp } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'ロビーで待つ'], [1.4, 'エレベーターから'], [3.2, '会えた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F4ECDD' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E9DCC5' });
  el('ellipse', { cx: 180, cy: 262, rx: 120, ry: 16, fill: '#D9A86A', opacity: 0.5 });
  // シャンデリア
  el('line', { x1: 180, y1: 0, x2: 180, y2: 26, stroke: pal.yellowDark, 'stroke-width': 2 });
  el('path', { d: 'M 150 30 Q 180 50 210 30 Z', fill: pal.yellow }); [154, 168, 180, 192, 206].forEach((x) => el('circle', { cx: x, cy: 40, r: 3, fill: '#FFF4C8' }));
  // エレベーター（右）
  el('rect', { x: 318, y: 92, width: 70, height: FY - 92, fill: '#C9B49A' });
  const dl = el('rect', { x: 324, y: 100, width: 29, height: FY - 100, fill: '#D9DEE6' }), dr = el('rect', { x: 353, y: 100, width: 29, height: FY - 100, fill: '#D9DEE6' });
  el('circle', { cx: 353, cy: 84, r: 5, fill: pal.yellow });
  // フロント（左奥）
  el('rect', { x: 20, y: 80, width: 90, height: 30, rx: 4, fill: '#8A5A3C' });
  deskFront(k, 20, 90, 170, FY, '#8A5A3C', '#6E4630');
  const me = k.buddy({ x: 180, y: 214, scale: 0.86 });
  const so = g({}); sofaProp(k, so, 150, '#7FB3E8', '#5C93CF'); k.tf(so, 180, FY);
  so.parentNode.insertBefore(so, me.g);
  const fr = k.buddy({ x: 353, y: FY + 4, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  const FX = path([[1.6, 353], [3.0, 240]]);
  return {
    update(t) {
      const op = easeInOut(seg(t, 0.9, 1.4)) * (1 - easeInOut(seg(t, 2.4, 2.9)));
      k.set(dl, { width: 29 * (1 - op) + 0.1 }); k.set(dr, { x: 353 + 29 * op, width: 29 * (1 - op) + 0.1 });
      walk(fr, FX, t, { facing: -1, mood: 'grin', look: -0.6, blink: blinkAt(t, 1) });
      if (t > 3.0) fr.pose({ armR: 8 + 150 * easeOut(seg(t, 3.0, 3.3)) + 12 * Math.sin(t * 14) });
      fr.g.setAttribute('opacity', seg(t, 1.2, 1.4));
      const up = easeInOut(seg(t, 2.6, 3.1));
      P(me, { x: 180 + 10 * up, y: lerp(214, FY + 6, up), look: 0.7, mood: t > 2.0 ? 'grin' : 'smile', blink: blinkAt(t), armR: t > 3.0 ? 8 + 150 * easeOut(seg(t, 3.0, 3.3)) : 8, squash: 1 - 0.06 * (1 - up) });
      void hump;
    }
  };
}
