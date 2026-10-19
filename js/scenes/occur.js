// occur：注意の標識が立つ道路で、急に止まった車に後ろの車がぶつかる（例文 Accidents often occur on this road.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt, car, tree } from './run-after.js';
import { reach } from './dig.js';

// 事故多発の注意標識（三角に2台の車がぶつかる絵）。原点＝根元
export function crashSign(k, x, base, parent) {
  const { el, pal } = k, s = k.g({}, parent);
  k.tf(s, x, base);
  k.shadow(0, 1, 12, 3, s);
  el('rect', { x: -3, y: -96, width: 6, height: 96, fill: '#9AA4B4' }, s);
  el('path', { d: 'M 0 -132 L 34 -76 L -34 -76 Z', fill: pal.yellow, stroke: pal.red, 'stroke-width': 5, 'stroke-linejoin': 'round' }, s);
  el('rect', { x: -20, y: -94, width: 16, height: 8, rx: 3, fill: pal.ink }, s);
  el('rect', { x: 2, y: -94, width: 16, height: 8, rx: 3, fill: pal.ink, transform: 'rotate(-18 10 -90)' }, s);
  el('path', { d: 'M -2 -106 L 0 -99 L 4 -104 L 3 -97', stroke: pal.red, 'stroke-width': 2, fill: 'none' }, s);
  return s;
}

export const meta = { duration: 4.2, beats: [[0, '危ない道'], [1.6, '急ブレーキ'], [2.4, '事故が起きた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  el('path', { d: 'M 0 150 Q 120 110 240 140 T 400 130 V 214 H 0 Z', fill: '#E3F2E0' });
  tree(k, 46, 214, 0.8); tree(k, 360, 214, 0.7);
  // 道路
  el('rect', { x: 0, y: 214, width: 400, height: 86, fill: '#6E7686' });
  for (let x = 10; x < 400; x += 60) el('rect', { x, y: 262, width: 34, height: 5, rx: 2, fill: '#fff', opacity: 0.85 });
  el('rect', { x: 0, y: 210, width: 400, height: 6, fill: '#D5DBE3' });
  crashSign(k, 330, 212);
  const me = k.buddy({ x: 376, y: 212, scale: 0.6, facing: -1 });
  const RY = 256;
  const A = car(k, pal.blue, pal.blueDark), B = car(k, pal.coral, pal.coralDark);
  const stopX = 236, hitT = 2.15;
  const fx = (t) => t < 1.7 ? lerp(-90, stopX - 4, easeOut(seg(t, 0, 1.7))) : stopX - 4;
  // 後ろの車：止まれずに追突し、少し跳ね返る
  const bx = (t) => t < hitT ? lerp(-260, stopX - 134, easeIn(seg(t, 0.5, hitT)) * 0.6 + seg(t, 0.5, hitT) * 0.4) : stopX - 134 - 10 * easeOut(seg(t, hitT, hitT + 0.4));
  const brake = g({}), boom = g({});
  el('path', { d: 'M 0 -22 L 6 -7 L 22 -10 L 10 1 L 18 15 L 2 8 L -8 20 L -8 5 L -24 0 L -9 -6 Z', fill: pal.yellow, stroke: pal.red, 'stroke-width': 3, 'stroke-linejoin': 'round' }, boom);
  [0, 1, 2].forEach((i) => el('line', { x1: -80 - i * 18, y1: -2, x2: -60 - i * 18, y2: -2, stroke: '#4A515E', 'stroke-width': 3, 'stroke-linecap': 'round' }, brake));
  return {
    update(t) {
      const hit = t > hitT ? wobble(seg(t, hitT, hitT + 0.7), 2, 5) : 0;
      const ax = fx(t) + (t > hitT ? 14 * easeOut(seg(t, hitT, hitT + 0.3)) : 0);
      const dip = hump(seg(t, 1.3, 1.9)) * 3;
      A.set(ax, (ax + 90) * 2.2, RY, dip);
      tf(A.body, 0, dip, -3 * hit);
      const bxx = bx(t);
      B.set(bxx, (bxx + 260) * 2.2, RY, 0);
      tf(B.body, 0, 0, 3 * hit);
      brake.setAttribute('opacity', t > 1.2 && t < 1.8 ? 1 : 0); tf(brake, ax, RY);
      const bp = seg(t, hitT - 0.02, hitT + 0.5);
      tf(boom, stopX - 66, RY - 34, 0, Math.max(0.001, hump(Math.min(1, bp * 1.6)) * 1.3));
      boom.setAttribute('opacity', bp > 0 && bp < 1 ? 1 : 0);
      const shock = t > hitT;
      P(me, { x: 376, y: 212, facing: -1, lift: 6 * hump(seg(t, hitT, hitT + 0.4)), lean: -8 * (shock ? 1 : 0),
        armR: shock ? lerp(8, 150, easeOut(seg(t, hitT, hitT + 0.3))) : 8, armL: shock ? 40 : 8, look: 0.5, mood: shock ? 'open' : 'flat', blink: blinkAt(t) });
    }
  };
}
