// rock：海辺の大きな岩に2人がよじ登り、並んで座って海をながめる（例文 We sat on a big rock by the sea.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { scene, sunG, water, gait, P, blinkAt } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '海辺の岩'], [1.4, 'よじ登る'], [3.0, '岩に座った']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.7;
  const { FY } = scene(k, { FY: 250, top: '#8FCBF2', bot: '#E8F6FD', ground: '#F0DDB6', edge: '#E3CB9A' });
  const sun = sunG(k, 18); tf(sun.g, 330, 50);
  const sea = water(k, 150, { h: 220 });
  el('path', { d: 'M 0 220 Q 200 210 400 222 V 300 H 0 Z', fill: '#F0DDB6' });
  // 大きな岩
  const RT = 186;
  k.shadow(200, 236, 110, 8);
  el('path', { d: `M 96 238 Q 100 ${RT + 10} 140 ${RT} Q 200 ${RT - 12} 262 ${RT} Q 300 ${RT + 10} 304 238 Z`, fill: '#9AA3AE' });
  el('path', { d: `M 140 ${RT} Q 200 ${RT - 12} 262 ${RT} Q 230 ${RT + 6} 200 ${RT + 4} Q 170 ${RT + 6} 140 ${RT} Z`, fill: '#B3BAC4' });
  el('path', { d: 'M 250 200 Q 280 214 290 236 L 304 238 Q 300 200 262 186 Z', fill: '#000', opacity: 0.08 });
  const a = k.buddy({ x: -30, y: FY, scale: S, facing: 1 });
  const c = k.buddy({ x: -90, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const go = (t, b, x0, xs, t0, off) => {
    const f = (tt) => lerp(x0, 120, easeInOut(seg(tt, 0.1 + off * 0.2, 1.4 + off * 0.2)));
    const w = gait(f, t, x0, 14, 0.14);
    const cl = easeInOut(seg(t, t0, t0 + 0.7)), sit = easeInOut(seg(t, t0 + 0.9, t0 + 1.3)), land = wobble(seg(t, t0 + 1.3, t0 + 1.9), 2, 5);
    const x = lerp(w.x, xs, cl), y = lerp(FY, RT - 2, cl) - 12 * hump(cl) + 8 * sit;
    P(b, { x, y, walk: w.walk + cl * 3, lean: w.lean + 14 * hump(cl), armL: lerp(w.armL, 100, hump(cl)) * (1 - sit) + 30 * sit, armR: lerp(w.armR, 120, hump(cl)) * (1 - sit) + 30 * sit, squash: 1 - 0.06 * sit - 0.03 * land, look: 0.5, mood: sit > 0.5 ? 'grin' : 'smile', blink: blinkAt(t, off) });
  };
  return {
    update(t) {
      sea(t);
      sun.rays.setAttribute('transform', `rotate(${t * 12})`);
      go(t, a, -30, 224, 1.4, 0);
      go(t, c, -90, 174, 1.8, 1);
    }
  };
}
