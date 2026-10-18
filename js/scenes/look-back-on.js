// look back on：ソファでアルバムをめくり、考え雲の中に学校へ通っていたころの自分が浮かぶ（例文 I often look back on my school days.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, cloud, faceAt, hp } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'アルバムを開く'], [1.6, '学校のころ'], [3.4, 'なつかしむ']] };

export function school(k, parent) {
  const { el, pal } = k;
  const n = k.g({}, parent);
  el('rect', { x: -30, y: -14, width: 44, height: 30, fill: '#FBE9DC' }, n);
  el('path', { d: 'M -34 -14 L -8 -28 L 18 -14 Z', fill: pal.coral }, n);
  el('rect', { x: -12, y: -26, width: 8, height: 8, rx: 4, fill: '#fff', stroke: pal.sub }, n);
  [-24, 0].forEach((x) => el('rect', { x, y: -6, width: 9, height: 8, fill: '#CFE9F7' }, n));
  el('rect', { x: -12, y: 4, width: 8, height: 12, fill: pal.blue }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 110, y: 160, width: 180, height: 44, rx: 14, fill: '#9DB8E6' });
  const b = k.buddy({ x: 200, y: 212, scale: 0.85 });
  el('rect', { x: 100, y: 200, width: 200, height: 34, rx: 10, fill: '#B5CBF0' });
  [96, 286].forEach((x) => el('rect', { x, y: 180, width: 18, height: 54, rx: 9, fill: '#9DB8E6' }));
  const alb = g({});
  el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 3, fill: pal.coffee }, alb);
  el('rect', { x: -20, y: -12, width: 19, height: 24, fill: '#fff' }, alb); el('rect', { x: 1, y: -12, width: 19, height: 24, fill: '#fff' }, alb);
  el('rect', { x: -17, y: -9, width: 13, height: 10, fill: '#CFE9F7' }, alb); el('rect', { x: 4, y: -9, width: 13, height: 10, fill: '#F8D8C8' }, alb);
  const pg2 = el('rect', { x: 1, y: -12, width: 19, height: 24, fill: '#fff', stroke: pal.line }, alb);
  const cl = cloud(k, 128, 80, 1);
  const sc = school(k, cl.g); tf(sc, -18, 8);
  const kid = k.buddy({ parent: cl.g, x: 30, y: 26, scale: 0.36 });
  const bag = el('rect', { x: -40, y: -66, width: 16, height: 28, rx: 5, fill: pal.red }, kid.body);
  return {
    update(t) {
      b.pose({ armR: 50, armL: 50, mood: t > 1.8 ? 'smile' : 'flat', look: -0.2 + 0.4 * seg(t, 1.4, 1.8), blink: t > 2.2 && t < 3.6 ? 0.6 : hump(seg(t, 0.6, 0.75)), lean: 5 });
      faceAt(b, 0, lerp(6, -5, easeInOut(seg(t, 1.3, 1.8))));
      tf(alb, 200, 186, 0);
      const fl = seg(t, 0.6, 1.1);
      k.set(pg2, { x: fl < 0.5 ? 1 : 1 - (fl - 0.5) * 2 * 20, width: 19 * Math.abs(1 - fl * 2) + 0.5 });
      cl.show(easeOut(seg(t, 1.5, 2.0)), 268, 80);
      const w = (t - 1.8) * 9;
      kid.pose({ x: 30 + Math.sin(t * 1.5) * 4, walk: t > 1.8 ? w : 0, mood: 'grin' });
    }
  };
}
