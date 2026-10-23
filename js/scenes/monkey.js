// monkey：木の枝に片手でぶら下がったサルが、ぶらーん、ぶらーんと揺れている。まめが下から見上げる（例文 A monkey was swinging in the tree.）
// このファイルはサルのヘルパーも書き出す（monkeyG）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, cloudG } from './nature.js';

// サル（原点＝ぶら下がる手）。set(x, y, 振れ角)
export function monkeyG(k, parent, col = '#9A6A44', face = '#F2D2AE') {
  const { el, g } = k;
  const o = g({}, parent), b = g({}, o);
  el('path', { d: 'M 6 66 Q 30 80 24 56 Q 20 46 28 44', stroke: col, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, b);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 30, stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' }, b);
  el('path', { d: 'M -4 50 Q -14 58 -10 72 M 4 52 Q 14 60 10 74', stroke: col, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, b);
  el('ellipse', { cx: 0, cy: 44, rx: 13, ry: 17, fill: col }, b);
  el('ellipse', { cx: 0, cy: 47, rx: 7, ry: 10, fill: face }, b);
  el('path', { d: 'M -4 44 Q -16 52 -16 64', stroke: col, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, b);
  const hd = g({}, b); k.tf(hd, 2, 20);
  el('circle', { cx: -12, cy: 0, r: 5, fill: face, stroke: col, 'stroke-width': 2 }, hd); el('circle', { cx: 12, cy: 0, r: 5, fill: face, stroke: col, 'stroke-width': 2 }, hd);
  el('circle', { cx: 0, cy: 0, r: 11, fill: col }, hd);
  el('path', { d: 'M -8 1 Q -8 -6 0 -4 Q 8 -6 8 1 Q 8 9 0 9 Q -8 9 -8 1 Z', fill: face }, hd);
  el('circle', { cx: -3, cy: 0, r: 1.6, fill: k.pal.ink }, hd); el('circle', { cx: 3, cy: 0, r: 1.6, fill: k.pal.ink }, hd);
  el('path', { d: 'M -3 5 Q 0 7.5 3 5', stroke: k.pal.ink, 'stroke-width': 1.3, fill: 'none' }, hd);
  el('circle', { cx: 0, cy: -1, r: 3.5, fill: col }, o);
  return { g: o, set(x, y, a = 0, s = 1) { k.tf(o, x, y, 0, s); k.tf(b, 0, 0, a); k.tf(hd, 2, 20, -a * 0.6); } };
}

export const meta = { duration: 4.2, beats: [[0, '木の上'], [0.8, 'ぶらーん'], [2.8, '揺れている']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 240, top: '#CDEBD9', bot: '#F2FAF5', ground: '#A9D88F', edge: '#97CB7E' });
  tf(cloudG(k, 70, 26), 330, 40);
  // 大きな木
  k.shadow(150, FY + 2, 50, 6);
  el('path', { d: `M 136 ${FY} Q 140 ${FY - 80} 132 ${FY - 150} L 162 ${FY - 150} Q 156 ${FY - 80} 166 ${FY} Z`, fill: '#A8794A' });
  el('path', { d: `M 150 ${FY - 130} Q 220 ${FY - 140} 300 ${FY - 134}`, stroke: '#A8794A', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' });
  [[150, FY - 180, 60], [90, FY - 150, 40], [210, FY - 170, 46], [300, FY - 150, 28]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#6BBF84' }));
  const mk = monkeyG(k);
  [[262, FY - 146, 12], [118, FY - 120, 14]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#5DB36F' }));
  const me = k.buddy({ x: 330, y: FY, scale: 0.9, facing: -1 });
  return {
    update(t) {
      const amp = lerp(10, 38, easeInOut(seg(t, 0, 1.2))), a = Math.sin(t * 3.0) * amp;
      mk.set(240, FY - 134, a, 1.1);
      P(me, { x: 330, y: FY, facing: -1, look: clamp(-0.4 + Math.sin(t * 3.0) * 0.5, -1, 1), armR: t > 2.6 ? 110 + Math.sin(t * 6) * 10 : 8, lean: -6, mood: t > 1.4 ? 'grin' : 'open', blink: blinkAt(t) });
    }
  };
}
