// summer：夏の強い日ざしの下、2人がうき輪とパラソルを持って海辺へやって来る（例文 We go to the beach every summer.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, sunG, water, gait, hang, held, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '夏の日'], [1.2, '海へ向かう'], [3.0, '海辺に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const { FY } = scene(k, { FY: 244, top: '#7CC6F2', bot: '#DDF2FC', ground: '#F3DFB5', edge: '#E3CB9A' });
  const sun = sunG(k, 22); tf(sun.g, 330, 50);
  const sea = water(k, 176, { h: 214 });
  el('path', { d: 'M 0 214 Q 100 206 200 214 T 400 212 V 300 H 0 Z', fill: '#F3DFB5' });
  // パラソル（立っている）
  el('line', { x1: 320, y1: 150, x2: 324, y2: FY, stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: 'M 270 160 Q 320 110 372 154 Z', fill: pal.red });
  el('path', { d: 'M 295 145 Q 320 112 300 158 M 345 140 Q 322 112 344 156', stroke: '#fff', 'stroke-width': 7, fill: 'none', opacity: 0.8 });
  k.shadow(320, FY + 2, 40, 5);
  const a = k.buddy({ x: -40, y: FY, scale: S });
  const c = k.buddy({ x: -110, y: FY, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const ring = g({});
  el('circle', { cx: 0, cy: 16, r: 16, fill: 'none', stroke: '#FF8FB1', 'stroke-width': 9 }, ring);
  el('path', { d: 'M -11 5 A 16 16 0 0 1 0 0', stroke: '#fff', 'stroke-width': 9, fill: 'none' }, ring);
  const bag = g({});
  el('path', { d: 'M -6 6 Q 0 -4 6 6', stroke: pal.blueDark, 'stroke-width': 2.5, fill: 'none' }, bag);
  el('rect', { x: -12, y: 4, width: 24, height: 20, rx: 4, fill: pal.yellow }, bag);
  const fa = (t) => lerp(-40, 240, easeInOut(seg(t, 0.2, 2.8)));
  const fc = (t) => lerp(-110, 170, easeInOut(seg(t, 0.35, 3.0)));
  return {
    update(t) {
      sea(t);
      sun.rays.setAttribute('transform', `rotate(${t * 15})`);
      const wa = gait(fa, t, -40, 14, 0.12), wc = gait(fc, t, -110, 14, 0.12);
      const yay = easeOut(seg(t, 3.1, 3.5));
      P(a, { x: wa.x, walk: wa.walk, lean: wa.lean, armL: lerp(wa.armL, 150, yay), armR: wa.armR, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.4 });
      P(c, { x: wc.x, walk: wc.walk, lean: wc.lean, armL: lerp(wc.armL, 150, yay), armR: wc.armR, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t, 1), look: 0.4 });
      hang(k, a, S, ring, 'R');
      hang(k, c, S * 0.95, bag, 'R');
    }
  };
}
